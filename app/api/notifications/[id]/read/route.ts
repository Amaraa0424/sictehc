import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromCookies } from '@/app/lib/auth.server'
import { markNotificationAsRead } from '@/app/lib/actions/notifications'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const result = await markNotificationAsRead(params.id)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Mark notification as read error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to mark notification as read' },
      { status: 500 }
    )
  }
} 