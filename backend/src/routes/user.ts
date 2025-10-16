import { Hono } from 'hono'
import { prisma } from '../lib/prisma'

const app = new Hono()

// Sync user with our database
app.post('/sync-user', async (c) => {
  try {
    const { clerkUserId, email, name, avatar } = await c.req.json()

    // Validate required fields
    if (!clerkUserId || !email) {
      return c.json({ error: 'clerkUserId and email are required' }, 400)
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { clerkUserId },
          { email }
        ]
      }
    })

    if (existingUser) {
      // Update existing user if needed
      if (existingUser.clerkUserId !== clerkUserId) {
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: { clerkUserId }
        })
        return c.json({ message: 'User updated', user: updatedUser })
      }
      return c.json({ message: 'User already exists', user: existingUser })
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        clerkUserId,
        name: name || email.split('@')[0],
        email,
        password: 'oauth-user',
        avatar: avatar || null,
        role: 'STUDENT'
      }
    })

    return c.json({ 
      message: 'User created successfully', 
      user: newUser 
    }, 201)

  } catch (error: any) {
    console.error('Error syncing user:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get user by Clerk ID
app.get('/:clerkUserId', async (c) => {
  try {
    const clerkUserId = c.req.param('clerkUserId')
    
    const user = await prisma.user.findFirst({
      where: { clerkUserId },
      include: {
        coursesTaught: true,
        coursesAsTA: true,
        coursesEnrolled: true
      }
    })

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({ user })
  } catch (error: any) {
    console.error('Error fetching user:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default app