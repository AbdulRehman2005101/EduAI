import React from 'react'
import { ClerkProvider } from '@clerk/clerk-react'

// Import your Clerk publishable key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const ClerkProviderComponent = ({ children }: { children: React.ReactNode }) => {
  if (!clerkPubKey) {
    throw new Error('Missing Clerk publishable key')
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}  afterSignOutUrl="/signin">
      {children}
    </ClerkProvider>
  )
}

export default ClerkProviderComponent