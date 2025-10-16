import { Hono } from 'hono'
import { prisma } from '../../lib/prisma'
import { Webhook } from 'svix'

const app = new Hono()

app.post('/user-created', async (c) => {
  try {
    const svix_id = c.req.header('svix-id')
    const svix_timestamp = c.req.header('svix-timestamp')
    const svix_signature = c.req.header('svix-signature')
    const body = await c.req.text() // raw text needed for signature verification

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return c.json({ error: 'Missing webhook headers' }, 400)
    }

    const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET!) // from Clerk dashboard

    type ClerkWebhookEvent = {
      type: string
      data: {
        id: string
        first_name?: string
        last_name?: string
        image_url?: string
        email_addresses?: { email_address: string }[]
      }
    }

    let webhookData: ClerkWebhookEvent

    try {
      // 👇 Correctly cast the verified payload to our type
      webhookData = webhook.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature
      }) as ClerkWebhookEvent
    } catch (err) {
      console.error('Invalid Clerk signature:', err)
      return c.json({ error: 'Invalid signature' }, 400)
    }

    // ----- now safe to use webhookData -----
    if (webhookData.type === 'user.created') {
      const userData = webhookData.data
      const email = userData.email_addresses?.[0]?.email_address
      const name =
        `${userData.first_name || ''} ${userData.last_name || ''}`.trim() ||
        email?.split('@')[0] ||
        'User'

      if (!email) return c.json({ error: 'Email is required' }, 400)

      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ clerkUserId: userData.id }, { email }] }
      })

      if (existingUser)
        return c.json({ message: 'User already exists', user: existingUser }, 200)

      const newUser = await prisma.user.create({
        data: {
          clerkUserId: userData.id,
          name,
          email,
          password: 'oauth-user',
          avatar: userData.image_url,
          role: 'STUDENT'
        }
      })

      return c.json({ message: 'User created via webhook', user: newUser }, 201)
    }

    return c.json({ message: 'Non-user event ignored' }, 200)
  } catch (error) {
    console.error('Webhook error:', error)
    return c.json({ error: 'Webhook processing failed' }, 500)
  }
})

export default app
