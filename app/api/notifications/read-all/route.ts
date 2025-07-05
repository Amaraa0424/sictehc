import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromCookies } from '../../../../lib/auth.server'
import { markAllNotificationsAsRead } from '../../../../lib/actions/notifications'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const result = await markAllNotificationsAsRead()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Mark all notifications as read error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to mark notifications as read' },
      { status: 500 }
    )
  }
} 