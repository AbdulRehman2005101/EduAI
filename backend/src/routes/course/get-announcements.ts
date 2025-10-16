import { Hono } from 'hono'
import { prisma } from '../../lib/prisma'

const app = new Hono()

app.get('/:id/announcements', async (c) => {
  try {
    const courseId = c.req.param('id')

    const announcements = await prisma.announcement.findMany({
      where: { courseId },
      orderBy: { date: 'desc' },
      include: {
        course: {
          include: {
            teacher: {
              select: { name: true, role: true }
            }
          }
        }
      }
    })

    // Format the response to include author info
    const formattedAnnouncements = announcements.map(announcement => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      date: announcement.date,
      author: {
        name: announcement.course.teacher.name,
        role: "TEACHER"
      }
    }))

    return c.json({ announcements: formattedAnnouncements }, 200)
  } catch (error: any) {
    console.error("Error fetching announcements:", error)
    return c.json(
      { error: "Failed to fetch announcements.", details: error.message },
      500
    )
  }
})

export default app