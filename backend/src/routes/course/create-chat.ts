
import { Hono } from 'hono'
import { prisma } from '../../lib/prisma'
const app = new Hono()


// POST /api/course/:id/chat
app.post('/:id/chat', async (c) => {
  try {
    const courseId = c.req.param('id')
    const { content, authorEmail } = await c.req.json()

    if (!content || !authorEmail) {
      return c.json(
        { error: "Content and author email are required." },
        400
      )
    }

    // Verify user is enrolled in the course
    const user = await prisma.user.findUnique({
      where: { email: authorEmail },
      include: {
        coursesTaught: { where: { id: courseId } },
        coursesAsTA: { where: { id: courseId } },
        coursesEnrolled: { where: { id: courseId } }
      }
    })

    if (!user) {
      return c.json(
        { error: "User not found." },
        404
      )
    }

    const canSendMessage = 
      user.coursesTaught.length > 0 || 
      user.coursesAsTA.length > 0 ||
      user.coursesEnrolled.length > 0

    if (!canSendMessage) {
      return c.json(
        { error: "You are not enrolled in this course." },
        403
      )
    }

    const message = await prisma.chatMessage.create({
      data: {
        content,
        courseId,
        authorId: user.id,
        timestamp: new Date()
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    })

    return c.json({
      message: {
        id: message.id,
        content: message.content,
        timestamp: message.timestamp,
        author: {
          name: message.author.name,
          email: message.author.email,
          avatar: message.author.avatar
        }
      }
    }, 201)
  } catch (error: any) {
    console.error("Error sending message:", error)
    return c.json(
      { error: "Failed to send message.", details: error.message },
      500
    )
  }
})

export default app