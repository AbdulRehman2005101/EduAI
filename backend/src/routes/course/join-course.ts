import { Hono } from 'hono'
import { prisma } from '../../lib/prisma'

const app = new Hono()

// POST /api/courses/join - Join course with class code
app.post('/join', async (c) => {
  try {
    const { classCode, studentEmail } = await c.req.json()

    if (!classCode || !studentEmail) {
      return c.json(
        { error: "Class code and student email are required." },
        400
      )
    }

    const course = await prisma.course.findUnique({
      where: { classCode: classCode.toLowerCase() },
      include: {
        teacher: {
          select: { name: true, email: true }
        }
      }
    })

    if (!course) {
      return c.json(
        { error: "Course not found. Please check the class code." },
        404
      )
    }

    // Find the student
    const student = await prisma.user.findUnique({
      where: { 
        email: studentEmail,
        role: "STUDENT"
      },
    })

    if (!student) {
      return c.json(
        { error: "Student not found." },
        404
      )
    }

    // Check if student is already enrolled
    const isAlreadyEnrolled = course.studentIds?.includes(student.id)
    
    if (isAlreadyEnrolled) {
      return c.json(
        { error: "You are already enrolled in this course." },
        400
      )
    }

    // Add student to course (both directions for your relations)
    const updatedCourse = await prisma.course.update({
      where: { id: course.id },
      data: {
        studentIds: {
          push: student.id
        }
      },
      include: {
        teacher: {
          select: { name: true, email: true }
        },
        assignments: {
          select: {
            id: true,
            title: true,
            dueDate: true
          }
        },
        announcements: {
          select: {
            id: true,
            title: true,
            date: true
          }
        }
      }
    })

    // Update student's enrolled courses
    await prisma.user.update({
      where: { id: student.id },
      data: {
        studentCourseIds: {
          push: course.id
        }
      }
    })

    return c.json(
      { 
        course: updatedCourse,
        message: `Successfully joined ${course.name}!` 
      }, 
      200
    )
  } catch (error: any) {
    console.error("Error joining course:", error)
    return c.json(
      { error: "Failed to join course.", details: error.message },
      500
    )
  }
})

export default app