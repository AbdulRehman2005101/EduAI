
import { Hono } from 'hono'
import { prisma } from '../../lib/prisma'
const app = new Hono()


// POST /api/course/:id/lectures
app.post('/:id/lectures', async (c) => {
  try {
    const courseId = c.req.param('id')
    const { title, description, materials, authorEmail } = await c.req.json()

    if (!title || !description || !authorEmail) {
      return c.json(
        { error: "Title, description, and author email are required." },
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

    const canCreateLecture = 
      user.coursesTaught.length > 0 || 
      user.coursesAsTA.length > 0

    if (!canCreateLecture) {
      return c.json(
        { error: "You don't have permission to upload lectures in this course." },
        403
      )
    }

    const lecture = await prisma.lecture.create({
      data: {
        title,
        description,
        materials: materials || [],
        courseId,
        authorId: user.id,
        uploadDate: new Date()
      },
      include: {
        author: {
          select: { name: true, role: true }
        }
      }
    })

    return c.json({
      lecture: {
        ...lecture,
        author: {
          name: lecture.author.name,
          role: lecture.author.role
        }
      }
    }, 201)
  } catch (error: any) {
    console.error("Error creating lecture:", error)
    return c.json(
      { error: "Failed to create lecture.", details: error.message },
      500
    )
  }
})


export default app