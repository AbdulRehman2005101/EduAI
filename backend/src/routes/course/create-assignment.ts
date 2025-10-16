
import { Hono } from 'hono'
import { prisma } from '../../lib/prisma'
const app = new Hono()



// POST /api/course/:id/assignments
app.post('/:id/assignments', async (c) => {
  try {
    const courseId = c.req.param('id')
    const { title, description, dueDate, maxScore, authorEmail } = await c.req.json()

    if (!title || !description || !dueDate || !maxScore || !authorEmail) {
      return c.json(
        { error: "All fields are required." },
        400
      )
    }

    // Verify user has permission
    const user = await prisma.user.findUnique({
      where: { email: authorEmail },
      include: {
        coursesTaught: { where: { id: courseId } },
        coursesAsTA: { where: { id: courseId } }
      }
    })

    if (!user) {
      return c.json(
        { error: "User not found." },
        404
      )
    }

    const canCreateAssignment = 
      user.coursesTaught.length > 0 || 
      user.coursesAsTA.length > 0

    if (!canCreateAssignment) {
      return c.json(
        { error: "You don't have permission to create assignments in this course." },
        403
      )
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        maxScore: parseInt(maxScore),
        materials: [], // Will be handled separately for file uploads
        courseId
      }
    })

    return c.json({
      assignment: {
        ...assignment,
        author: {
          name: user.name,
          role: user.role
        }
      }
    }, 201)
  } catch (error: any) {
    console.error("Error creating assignment:", error)
    return c.json(
      { error: "Failed to create assignment.", details: error.message },
      500
    )
  }
})

export default app