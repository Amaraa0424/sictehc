"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUserFromCookies } from "../auth.server"
import { prisma } from "../prisma"

// Create notification for like
export async function createLikeNotification(
  postId: string,
  likerId: string,
  postAuthorId: string
) {
  try {
    // Don't create notification if user likes their own post
    if (likerId === postAuthorId) {
      return { success: true }
    }

    // Check if notification already exists
    const existingNotification = await prisma.notification.findFirst({
      where: {
        type: "LIKE",
        postId,
        fromUserId: likerId,
        userId: postAuthorId,
      },
    })

    if (existingNotification) {
      return { success: true }
    }

    await prisma.notification.create({
      data: {
        type: "LIKE",
        postId,
        fromUserId: likerId,
        userId: postAuthorId,
      },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Create like notification error:", error)
    return { success: false, error: "Failed to create notification" }
  }
}

// Create notification for comment
export async function createCommentNotification(
  postId: string,
  commenterId: string,
  postAuthorId: string
) {
  try {
    // Don't create notification if user comments on their own post
    if (commenterId === postAuthorId) {
      return { success: true }
    }

    // Check if notification already exists for this comment
    const existingNotification = await prisma.notification.findFirst({
      where: {
        type: "COMMENT",
        postId,
        fromUserId: commenterId,
        userId: postAuthorId,
      },
    })

    if (existingNotification) {
      return { success: true }
    }

    await prisma.notification.create({
      data: {
        type: "COMMENT",
        postId,
        fromUserId: commenterId,
        userId: postAuthorId,
      },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Create comment notification error:", error)
    return { success: false, error: "Failed to create notification" }
  }
}

// Get user notifications
export async function getNotifications({
  page = 1,
  limit = 10,
}: {
  page?: number
  limit?: number
} = {}) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const skip = (page - 1) * limit

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId: user.id } }),
    ])

    const hasNextPage = skip + limit < total
    const hasPrevPage = page > 1

    return {
      success: true,
      data: {
        notifications,
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
    console.error("Get notifications error:", error)
    return { success: false, error: "Failed to fetch notifications" }
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    await prisma.notification.update({
      where: {
        id: notificationId,
        userId: user.id, // Ensure user owns the notification
      },
      data: { isRead: true, readAt: new Date() },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Mark notification as read error:", error)
    return { success: false, error: "Failed to mark notification as read" }
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: { isRead: true, readAt: new Date() },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Mark all notifications as read error:", error)
    return { success: false, error: "Failed to mark notifications as read" }
  }
}

// Get unread notification count
export async function getUnreadNotificationCount() {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const count = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    })

    return { success: true, data: count }
  } catch (error) {
    console.error("Get unread notification count error:", error)
    return { success: false, error: "Failed to get unread count" }
  }
} 