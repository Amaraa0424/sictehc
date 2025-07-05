import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromCookies } from '@/app/lib/auth.server'
import { getPosts } from '@/app/lib/actions/posts'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const tags = searchParams.get('tags') ? searchParams.get('tags')!.split(',') : []
    const userId = searchParams.get('userId') || undefined

    const result = await getPosts({
      page,
      limit,
      userId,
      tags,
      search,
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Get posts error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
} 