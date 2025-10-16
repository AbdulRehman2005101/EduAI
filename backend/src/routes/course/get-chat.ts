
import { Hono } from 'hono'
import { prisma } from '../../lib/prisma'
const app = new Hono()


// GET /api/course/:id/chat
app.get('/:id/chat', async (c) => {
  try {
    const courseId = c.req.param('id')

    const chatMessages = await prisma.chatMessage.findMany({
      where: { courseId },
      orderBy: { timestamp: 'asc' },
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

    const formattedMessages = chatMessages.map(message => ({
      id: message.id,
      content: message.content,
      timestamp: message.timestamp,
      author: {
        name: message.author.name,
        email: message.author.email,
        avatar: message.author.avatar
      }
    }))

    return c.json({ messages: formattedMessages }, 200)
  } catch (error: any) {
    console.error("Error fetching chat messages:", error)
    return c.json(
      { error: "Failed to fetch chat messages.", details: error.message },
      500
    )
  }
})

export default app