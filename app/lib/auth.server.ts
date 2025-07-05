import { cookies } from 'next/headers'
import prisma from './prisma'
import { verifyToken } from './auth'

// Get current user from token (for server-side use)
export const getCurrentUser = async (token: string) => {
  try {
    const payload = await verifyToken(token)
    if (!payload) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        profilePic: true,
        program: true,
        year: true,
        university: true,
        bio: true,
        isVerified: true,
        isPrivate: true,
        createdAt: true
      }
    })

    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Get current user from cookies (for server-side use)
export const getCurrentUserFromCookies = async () => {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth-token')
    
    if (!authToken?.value) {
      return null
    }

    return await getCurrentUser(authToken.value)
  } catch (error) {
    console.error('Error getting current user from cookies:', error)
    return null
  }
} 