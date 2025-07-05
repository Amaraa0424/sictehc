import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromCookies } from '../../../lib/auth.server'
import { getUnreadMessageCount } from '../../../lib/actions/messages'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const result = await getUnreadMessageCount()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Get unread message count error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get unread count' },
      { status: 500 }
    )
  }
} 