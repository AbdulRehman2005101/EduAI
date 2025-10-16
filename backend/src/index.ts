import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

// Import routes
import userRoutes from './routes/user'
import courseRoutes from './routes/course/get-course'
import webhookRoutes from './routes/webhooks/clerk'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:5173'], // Your React app URL
  credentials: true,
}))

// Health check
app.get('/', (c) => {
  return c.json({ 
    message: 'EduAI API Server is running!',
    timestamp: new Date().toISOString()
  })
})

// Routes
app.route('/api/users', userRoutes)
app.route('/api/courses', courseRoutes)
app.route('/api/webhooks/clerk', webhookRoutes)

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Route not found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

export default app