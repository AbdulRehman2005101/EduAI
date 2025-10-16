import { Hono } from 'hono'
import { prisma } from '../../lib/prisma'
import { generateClassCode } from '../../lib/classCodeGenerator'

const app = new Hono()

app.post('/add-course', async (c) => {
  try {
    const { name, description, teacherEmail } = await c.req.json()

    if (!name || !description || !teacherEmail) {
      return c.json(
        { error: "All fields are required." },
        400
      )
    }

    // Find teacher by email
    const teacher = await prisma.user.findUnique({
      where: { 
        email: teacherEmail,
      },
    })

    if (!teacher) {
      return c.json(
        { error: "Teacher not found." },
        404
      )
    }

    // Generate unique class code
    let classCode = generateClassCode()
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      const existingCourse = await prisma.course.findUnique({
        where: { classCode }
      })

      if (!existingCourse) {
        break
      }

      classCode = generateClassCode()
      attempts++
    }

    if (attempts === maxAttempts) {
      return c.json(
        { error: "Unable to generate unique class code" },
        500
      )
    }

    // Create course with class code
    const course = await prisma.course.create({
      data: {
        name,
        description,
        classCode, // Add the generated class code
        teacherId: teacher.id,
        taIds: [], // Add empty arrays for relations
        studentIds: []
      },
      include: {
        teacher: {
          select: {
            name: true,
            email: true
          }
        },
        assignments: true,
        announcements: true
      }
    })

    return c.json(
      { 
        course,
        message: "Course created successfully!" 
      }, 
      201
    )
  } catch (error: any) {
    console.error("Error creating course:", error)
    return c.json(
      { error: "Failed to create course.", details: error.message },
      500
    )
  }
})

export default app