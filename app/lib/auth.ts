import bcrypt from 'bcryptjs'
import { supabase } from './supabase'
import prisma from './prisma'
import { jwtVerify, SignJWT } from 'jose'

console.log('JWT_SECRET:', process.env.JWT_SECRET)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export interface JWTPayload {
  userId: string
  email: string
  username: string
}

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

// JWT token generation and verification (Edge-compatible)
export const generateToken = async (payload: JWTPayload): Promise<string> => {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export const verifyToken = async (token: string): Promise<JWTPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

// Authentication function for API routes
export const authenticateUser = async (email: string, password: string) => {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        password: true,
        profilePic: true,
        isVerified: true
      }
    })

    if (!user) {
      return { success: false, error: 'Invalid email or password' }
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password' }
    }

    // Check if email is verified
    if (!user.isVerified) {
      return { success: false, error: 'Email not confirmed' }
    }

    // Generate JWT token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      username: user.username
    })

    console.log('Auth - Token generated:', !!token, 'User ID:', user.id)

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user
    return {
      success: true,
      user: userWithoutPassword,
      token
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

// Supabase auth helpers
export const signUpWithSupabase = async (email: string, password: string, userData: {
  name: string
  username: string
  program?: string
  year?: number
  university?: string
}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          username: userData.username,
          program: userData.program,
          year: userData.year,
          university: userData.university
        }
      }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Supabase signup error:', error)
    return { success: false, error: 'Signup failed' }
  }
}

export const signInWithSupabase = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Supabase signin error:', error)
    return { success: false, error: 'Signin failed' }
  }
}

export const signOutWithSupabase = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error('Supabase signout error:', error)
    return { success: false, error: 'Signout failed' }
  }
} 