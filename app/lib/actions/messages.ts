"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "../prisma"
import { getCurrentUserFromCookies } from "../auth.server"

// Create message schema
const createMessageSchema = z.object({
  content: z.string().min(1, "Message is required").max(2000, "Message too long"),
  mediaUrl: z.string().url().optional(),
  mediaType: z.enum(["TEXT", "IMAGE", "VIDEO", "FILE"]).default("TEXT"),
})

// Create or get existing chat between two users
export async function getOrCreateChat(otherUserId: string) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    if (user.id === otherUserId) {
      return { success: false, error: "Cannot create chat with yourself" }
    }

    // Check if other user exists
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: { id: true, name: true, username: true },
    })

    if (!otherUser) {
      return { success: false, error: "User not found" }
    }

    // Find existing chat
    let chat = await prisma.chat.findFirst({
      where: {
        participants: {
          every: {
            userId: {
              in: [user.id, otherUserId],
            },
          },
        },
        type: "DIRECT",
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                profilePic: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })

    // Create new chat if doesn't exist
    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          type: "DIRECT",
          participants: {
            create: [
              { userId: user.id },
              { userId: otherUserId },
            ],
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  profilePic: true,
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      })
    }

    return { success: true, data: chat }
  } catch (error) {
    console.error("Get or create chat error:", error)
    return { success: false, error: "Failed to get or create chat" }
  }
}

// Send a message
export async function sendMessage(chatId: string, formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if user is participant in the chat
    const chatParticipant = await prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId: user.id,
        },
      },
    })

    if (!chatParticipant) {
      return { success: false, error: "Not authorized to send message in this chat" }
    }

    const rawData = {
      content: formData.get("content") as string,
      mediaUrl: formData.get("mediaUrl") as string || undefined,
      mediaType: formData.get("mediaType") as string || "TEXT",
    }

    const validatedData = createMessageSchema.parse(rawData)

    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: user.id,
        content: validatedData.content,
        mediaUrl: validatedData.mediaUrl,
        mediaType: validatedData.mediaType as any,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePic: true,
          },
        },
      },
    })

    revalidatePath("/messages")
    revalidatePath(`/messages/${chatId}`)
    return { success: true, data: message }
  } catch (error) {
    console.error("Send message error:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Failed to send message" }
  }
}

// Get user's chats
export async function getUserChats() {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                profilePic: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: user.id },
              },
            },
          },
        },
      },
      orderBy: {
        messages: {
          _max: {
            createdAt: "desc",
          },
        },
      },
    })

    return { success: true, data: chats }
  } catch (error) {
    console.error("Get user chats error:", error)
    return { success: false, error: "Failed to fetch chats" }
  }
}

// Get chat messages
export async function getChatMessages(chatId: string, page = 1, limit = 50) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if user is participant in the chat
    const chatParticipant = await prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId: user.id,
        },
      },
    })

    if (!chatParticipant) {
      return { success: false, error: "Not authorized to access this chat" }
    }

    const skip = (page - 1) * limit

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { chatId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              username: true,
              profilePic: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.message.count({
        where: { chatId },
      }),
    ])

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        chatId,
        senderId: { not: user.id },
        isRead: false,
      },
      data: { isRead: true },
    })

    const hasNextPage = skip + limit < total
    const hasPrevPage = page > 1

    return {
      success: true,
      data: {
        messages: messages.reverse(), // Show oldest first
        pagination: {
          page,
          limit,
          total,
          hasNextPage,
          hasPrevPage,
          totalPages: Math.ceil(total / limit),
        },
      },
    }
  } catch (error) {
    console.error("Get chat messages error:", error)
    return { success: false, error: "Failed to fetch messages" }
  }
}

// Create group chat
export async function createGroupChat(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const participantIds = formData.getAll("participantIds") as string[]

    if (!name || name.trim().length === 0) {
      return { success: false, error: "Group name is required" }
    }

    if (participantIds.length === 0) {
      return { success: false, error: "At least one participant is required" }
    }

    // Verify all participants exist
    const participants = await prisma.user.findMany({
      where: {
        id: {
          in: [...participantIds, user.id], // Include current user
        },
      },
      select: { id: true },
    })

    if (participants.length !== participantIds.length + 1) {
      return { success: false, error: "Some participants not found" }
    }

    const chat = await prisma.chat.create({
      data: {
        name,
        description,
        type: "GROUP",
        participants: {
          create: participants.map((p) => ({
            userId: p.id,
            role: p.id === user.id ? "ADMIN" : "MEMBER",
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                profilePic: true,
              },
            },
          },
        },
      },
    })

    revalidatePath("/messages")
    return { success: true, data: chat }
  } catch (error) {
    console.error("Create group chat error:", error)
    return { success: false, error: "Failed to create group chat" }
  }
}

// Get unread message count
export async function getUnreadMessageCount() {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const count = await prisma.message.count({
      where: {
        chat: {
          participants: {
            some: {
              userId: user.id,
            },
          },
        },
        senderId: { not: user.id },
        isRead: false,
      },
    })

    return { success: true, data: { count } }
  } catch (error) {
    console.error("Get unread message count error:", error)
    return { success: false, error: "Failed to get message count" }
  }
} 