
import { Hono } from 'hono'
import { prisma } from '../../lib/prisma'
const app = new Hono()


// POST /api/course/:id/announcements
app.post('/:id/announcements', async (c) => {
  try {
    const courseId = c.req.param('id')
    const { title, content, authorEmail } = await c.req.json()

    if (!title || !content || !authorEmail) {
      return c.json(
        { error: "Title, content, and author email are required." },
        400
      )
    }

    // Verify user has permission to create announcement
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

    const canCreateAnnouncement = 
      user.coursesTaught.length > 0 || 
      user.coursesAsTA.length > 0

    if (!canCreateAnnouncement) {
      return c.json(
        { error: "You don't have permission to create announcements in this course." },
        403
      )
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        courseId,
        date: new Date()
      },
      include: {
        course: {
          include: {
            teacher: {
              select: { name: true }
            }
          }
        }
      }
    })

    return c.json({
      announcement: {
        ...announcement,
        author: {
          name: user.name,
          role: user.role
        }
      }
    }, 201)
  } catch (error: any) {
    console.error("Error creating announcement:", error)
    return c.json(
      { error: "Failed to create announcement.", details: error.message },
      500
    )
  }
})


export default app