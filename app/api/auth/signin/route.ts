import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, signInWithSupabase } from '../../../lib/auth'
import { validateEmail } from '../../../utils'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = signInSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data

    // Additional validation
    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Authenticate user
    const authResult = await authenticateUser(email, password)
    
    console.log('Signin - Auth result:', authResult.success, 'Token exists:', !!authResult.token)
    
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      )
    }

    // Sign in with Supabase (optional - for additional auth features)
    const supabaseResult = await signInWithSupabase(email, password)
    
    if (!supabaseResult.success) {
      console.warn('Supabase signin failed:', supabaseResult.error)
      // Don't fail the signin if Supabase fails, as we have authenticated the user
    }

    // Set HTTP-only cookie with JWT token
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: authResult.user
    })

    // Set secure cookie with JWT token
    response.cookies.set('auth-token', authResult.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    console.log('Signin - Cookie set successfully')

    return response

  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 