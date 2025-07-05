import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromCookies } from '../../../lib/auth.server'
import { getNotifications } from '../../../lib/actions/notifications'

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
    const limit = parseInt(searchParams.get('limit') || '20')

    const result = await getNotifications(page, limit)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
} 