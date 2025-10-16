
import { Hono } from 'hono'
import { prisma } from '../../lib/prisma'
const app = new Hono()

app.get('/:id/lectures', async (c) => {
  try {
    const courseId = c.req.param('id')

    const lectures = await prisma.lecture.findMany({
      where: { courseId },
      orderBy: { uploadDate: 'desc' },
      include: {
        author: {
          select: { name: true, role: true }
        }
      }
    })

    const formattedLectures = lectures.map(lecture => ({
      id: lecture.id,
      title: lecture.title,
      description: lecture.description,
      materials: lecture.materials,
      uploadDate: lecture.uploadDate,
      author: {
        name: lecture.author.name,
        role: lecture.author.role
      }
    }))

    return c.json({ lectures: formattedLectures }, 200)
  } catch (error: any) {
    console.error("Error fetching lectures:", error)
    return c.json(
      { error: "Failed to fetch lectures.", details: error.message },
      500
    )
  }
})

export default app
