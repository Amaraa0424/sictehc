import { NextRequest, NextResponse } from 'next/server'
import { signOutWithSupabase } from '../../../lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Sign out from Supabase
    const supabaseResult = await signOutWithSupabase()
    
    if (!supabaseResult.success) {
      console.warn('Supabase signout failed:', supabaseResult.error)
    }

    // Clear the auth cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    })

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Signout error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 