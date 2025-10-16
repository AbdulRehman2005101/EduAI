
import { Hono } from 'hono'
import { prisma } from '../../lib/prisma'
const app = new Hono()



// DELETE /api/course/:id/people/:userId
app.delete('/:id/people/:userId', async (c) => {
  try {
    const courseId = c.req.param('id')
    const userId = c.req.param('userId')
    const requesterEmail = c.req.query("requesterEmail")

    if (!requesterEmail) {
      return c.json(
        { error: "Requester email is required." },
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
        { error: "Only the course teacher can remove people." },
        403
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

    // Remove from TAs if present
    const updatedTaIds = course.taIds.filter(id => id !== userId)
    const updatedStudentIds = course.studentIds.filter(id => id !== userId)

    await prisma.course.update({
      where: { id: courseId },
      data: {
        taIds: updatedTaIds,
        studentIds: updatedStudentIds
      }
    })

    // Remove course from user's arrays
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (user) {
      const updatedTaCourseIds = user.taCourseIds.filter(id => id !== courseId)
      const updatedStudentCourseIds = user.studentCourseIds.filter(id => id !== courseId)

      await prisma.user.update({
        where: { id: userId },
        data: {
          taCourseIds: updatedTaCourseIds,
          studentCourseIds: updatedStudentCourseIds
        }
      })
    }

    return c.json(
      { message: "User removed successfully." },
      200
    )
  } catch (error: any) {
    console.error("Error removing person:", error)
    return c.json(
      { error: "Failed to remove person.", details: error.message },
      500
    )
  }
})


export default app