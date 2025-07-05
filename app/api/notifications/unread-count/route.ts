import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromCookies } from '@/app/lib/auth.server'
import { getUnreadNotificationCount } from '@/app/lib/actions/notifications'

export async function GET(request: NextRequest) {
try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const result = await getUnreadNotificationCount()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Get unread notification count error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get unread count' },
      { status: 500 }
    )
  }
} 