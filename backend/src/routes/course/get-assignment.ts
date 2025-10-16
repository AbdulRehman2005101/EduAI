
import { Hono } from 'hono'
import { prisma } from '../../lib/prisma'
const app = new Hono()


// GET /api/course/:id/assignments
app.get('/:id/assignments', async (c) => {
  try {
    const courseId = c.req.param('id')

    const assignments = await prisma.assignment.findMany({
      where: { courseId },
      orderBy: { dueDate: 'asc' },
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

    const formattedAssignments = assignments.map(assignment => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      maxScore: assignment.maxScore,
      materials: assignment.materials,
      author: {
        name: assignment.course.teacher.name,
        role: "TEACHER"
      }
    }))

    return c.json({ assignments: formattedAssignments }, 200)
  } catch (error: any) {
    console.error("Error fetching assignments:", error)
    return c.json(
      { error: "Failed to fetch assignments.", details: error.message },
      500
    )
  }
})


export default app