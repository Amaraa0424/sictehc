import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromCookies } from '../../../lib/auth.server'
import { getChatMessages, sendMessage } from '../../../lib/actions/messages'

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
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
    const limit = parseInt(searchParams.get('limit') || '50')

    const result = await getChatMessages(params.chatId, page, limit)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Get chat messages error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const result = await sendMessage(params.chatId, formData)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    )
  }
} 