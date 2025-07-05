import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, signUpWithSupabase } from '../../../lib/auth'
import prisma from '../../../lib/prisma'
import { validateEmail, validateUsername, validatePassword } from '../../../utils'
import { z } from 'zod'

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().optional(),
  program: z.string().optional(),
  year: z.number().min(1).max(10).optional(),
  university: z.string().optional()
}).refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = signUpSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { name, email, username, password, program, year, university } = validationResult.data

    // Additional validation
    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    if (!validateUsername(username)) {
      return NextResponse.json(
        { success: false, error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' },
        { status: 400 }
      )
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Password validation failed', details: passwordValidation.errors },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email or username already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        program,
        year,
        university
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        program: true,
        year: true,
        university: true,
        profilePic: true,
        isVerified: true,
        createdAt: true
      }
    })

    // Create user in Supabase Auth (optional - for additional auth features)
    const supabaseResult = await signUpWithSupabase(email, password, {
      name,
      username,
      program,
      year,
      university
    })

    if (!supabaseResult.success) {
      console.warn('Supabase signup failed:', supabaseResult.error)
      // Don't fail the signup if Supabase fails, as we have the user in our database
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: user
    }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 