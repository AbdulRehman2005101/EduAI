
import { Hono } from 'hono'
import { prisma } from '../../lib/prisma'
const app = new Hono()


// POST /api/course/:id/people
app.post('/:id/people', async (c) => {
  try {
    const courseId = c.req.param('id')
    const { email, role, requesterEmail } = await c.req.json()

    if (!email || !role || !requesterEmail) {
      return c.json(
        { error: "Email, role, and requester email are required." },
        400
      )
    }

    // Verify requester is the teacher
    const requester = await prisma.user.findUnique({
      where: { email: requesterEmail },
      include: {
        coursesTaught: { where: { id: courseId } }
      }
    })

    if (!requester || requester.coursesTaught.length === 0) {
      return c.json(
        { error: "Only the course teacher can add people." },
        403
      )
    }

    // Find user to add
    const userToAdd = await prisma.user.findUnique({
      where: { email }
    })

    if (!userToAdd) {
      return c.json(
        { error: "User not found." },
        404
      )
    }

    // Get current course data
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return c.json(
        { error: "Course not found." },
        404
      )
    }

    // Check if user is already in the course
    const isAlreadyStudent = course.studentIds.includes(userToAdd.id)
    const isAlreadyTA = course.taIds.includes(userToAdd.id)

    if (isAlreadyStudent || isAlreadyTA) {
      return c.json(
        { error: "User is already in this course." },
        409
      )
    }

    // Update course and user based on role
    if (role === "STUDENT") {
      await prisma.course.update({
        where: { id: courseId },
        data: {
          studentIds: { push: userToAdd.id }
        }
      })

      await prisma.user.update({
        where: { id: userToAdd.id },
        data: {
          studentCourseIds: { push: courseId }
        }
      })
    } else if (role === "TA") {
      await prisma.course.update({
        where: { id: courseId },
        data: {
          taIds: { push: userToAdd.id }
        }
      })

      await prisma.user.update({
        where: { id: userToAdd.id },
        data: {
          taCourseIds: { push: courseId }
        }
      })
    }

    return c.json(
      { message: "User added successfully." },
      200
    )
  } catch (error: any) {
    console.error("Error adding person:", error)
    return c.json(
      { error: "Failed to add person.", details: error.message },
      500
    )
  }
})

export default app