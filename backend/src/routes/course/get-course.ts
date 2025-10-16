import { Hono } from 'hono'
import { prisma } from '../../lib/prisma'

const app = new Hono()

app.get('/:id', async (c) => {
  try {
    const courseId = c.req.param('id')

    if (!courseId) {
      return c.json({ error: "Course ID is required." }, 400)
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        tas: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        students: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        assignments: {
          select: {
            id: true,
            title: true,
            description: true,
            dueDate: true,
            maxScore: true,
            materials: true,
          },
        },
        announcements: {
          select: {
            id: true,
            title: true,
            content: true,
            date: true,
          },
        },
      },
    })

    if (!course) {
      return c.json({ error: "Course not found." }, 404)
    }

    return c.json(course, 200)
  } catch (error: any) {
    console.error("Error fetching course:", error)
    return c.json(
      { error: "Failed to fetch course.", details: error.message },
      500
    )
  }
})

export default app