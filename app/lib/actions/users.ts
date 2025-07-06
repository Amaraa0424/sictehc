"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "../prisma"
import { getCurrentUserFromCookies } from "../auth.server"
import { Prisma } from "@prisma/client"
import { PrismaClient } from "@prisma/client"

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username too long").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  bio: z.string().max(500, "Bio too long").optional(),
  program: z.string().optional(),
  year: z.number().min(1).max(10).optional(),
  university: z.string().optional(),
  isPrivate: z.boolean().optional(),
})

const followUserSchema = z.object({
  userId: z.string().cuid(),
})

const unfollowUserSchema = z.object({
  userId: z.string().cuid(),
})

const updateProfilePicSchema = z.object({
  profilePic: z.string().url(),
})

const addUserTagSchema = z.object({
  tag: z.string().min(1, "Tag is required").max(50, "Tag too long"),
})

const removeUserTagSchema = z.object({
  tag: z.string().min(1, "Tag is required"),
})

// Update Profile
export async function updateProfile(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      name: formData.get("name") as string,
      username: formData.get("username") as string,
      bio: formData.get("bio") as string || undefined,
      program: formData.get("program") as string || undefined,
      year: formData.get("year") ? parseInt(formData.get("year") as string) : undefined,
      university: formData.get("university") as string || undefined,
      isPrivate: formData.get("isPrivate") === "true",
    }

    const validatedData = updateProfileSchema.parse(rawData)

    // Check if username is already taken by another user
    if (validatedData.username !== user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: validatedData.username },
        select: { id: true },
      })

      if (existingUser) {
        throw new Error("Username already taken")
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        bio: true,
        program: true,
        year: true,
        university: true,
        profilePic: true,
        isPrivate: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    revalidatePath("/users")
    revalidatePath(`/users/${updatedUser.username}`)
    return { success: true, data: updatedUser }
  } catch (error) {
    console.error("Update profile error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update profile" }
  }
}

// Follow User
export async function followUser(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      userId: formData.get("userId") as string,
    }

    const validatedData = followUserSchema.parse(rawData)

    // Can't follow yourself
    if (validatedData.userId === user.id) {
      throw new Error("Cannot follow yourself")
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      select: { id: true, isPrivate: true },
    })

    if (!targetUser) {
      throw new Error("User not found")
    }

    await prisma.follow.create({
      data: {
        followerId: user.id,
        followingId: validatedData.userId,
      },
    })

    revalidatePath("/")
    revalidatePath(`/users/${user.username}`)
    revalidatePath(`/users/${targetUser.id}`)
    return { success: true }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      // Already following
      return { success: true }
    }
    console.error("Follow user error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to follow user" }
  }
}

// Unfollow User
export async function unfollowUser(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      userId: formData.get("userId") as string,
    }

    const validatedData = unfollowUserSchema.parse(rawData)

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: validatedData.userId,
        },
      },
    })

    revalidatePath("/")
    revalidatePath(`/users/${user.username}`)
    revalidatePath(`/users/${validatedData.userId}`)
    return { success: true }
  } catch (error) {
    console.error("Unfollow user error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to unfollow user" }
  }
}

// Update Profile Picture
export async function updateProfilePic(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      profilePic: formData.get("profilePic") as string,
    }

    const validatedData = updateProfilePicSchema.parse(rawData)

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { profilePic: validatedData.profilePic },
      select: {
        id: true,
        profilePic: true,
      },
    })

    revalidatePath("/users")
    revalidatePath(`/users/${user.username}`)
    return { success: true, data: updatedUser }
  } catch (error) {
    console.error("Update profile pic error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update profile picture" }
  }
}

// Add User Tag
export async function addUserTag(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      tag: formData.get("tag") as string,
    }

    const validatedData = addUserTagSchema.parse(rawData)

    await prisma.userTag.create({
      data: {
        userId: user.id,
        tag: validatedData.tag.toLowerCase(),
      },
    })

    revalidatePath("/users")
    revalidatePath(`/users/${user.username}`)
    return { success: true }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      // Tag already exists
      return { success: true }
    }
    console.error("Add user tag error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to add tag" }
  }
}

// Remove User Tag
export async function removeUserTag(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      tag: formData.get("tag") as string,
    }

    const validatedData = removeUserTagSchema.parse(rawData)

    await prisma.userTag.delete({
      where: {
        userId_tag: {
          userId: user.id,
          tag: validatedData.tag.toLowerCase(),
        },
      },
    })

    revalidatePath("/users")
    revalidatePath(`/users/${user.username}`)
    return { success: true }
  } catch (error) {
    console.error("Remove user tag error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to remove tag" }
  }
}

// Get User Profile
export async function getUserProfile(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        program: true,
        year: true,
        university: true,
        profilePic: true,
        isPrivate: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
        userTags: {
          select: {
            tag: true,
          },
        },
      },
    })

    if (!user) {
      throw new Error("User not found")
    }

    return user
  } catch (error) {
    console.error("Get user profile error:", error)
    throw new Error("Failed to fetch user profile")
  }
}

// Get User Posts
export async function getUserPosts(username: string, options: {
  page?: number
  limit?: number
} = {}) {
  try {
    const { page = 1, limit = 10 } = options
    const skip = (page - 1) * limit

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, isPrivate: true },
    })

    if (!user) {
      throw new Error("User not found")
    }

    const where: any = {
      authorId: user.id,
      isPublished: true,
    }

    // If user is private, only show posts to followers or the user themselves
    if (user.isPrivate) {
      // This would need to be implemented based on your auth logic
      // For now, we'll show all posts
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              profilePic: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              reposts: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ])

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Get user posts error:", error)
    throw new Error("Failed to fetch user posts")
  }
}

// Get Followers
export async function getFollowers(userId: string, options: {
  page?: number
  limit?: number
} = {}) {
  try {
    const { page = 1, limit = 20 } = options
    const skip = (page - 1) * limit

    const [followers, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              username: true,
              profilePic: true,
              bio: true,
            },
          },
        },
      }),
      prisma.follow.count({ where: { followingId: userId } }),
    ])

    return {
      followers: followers.map(f => f.follower),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Get followers error:", error)
    throw new Error("Failed to fetch followers")
  }
}

// Get Following
export async function getFollowing(userId: string, options: {
  page?: number
  limit?: number
} = {}) {
  try {
    const { page = 1, limit = 20 } = options
    const skip = (page - 1) * limit

    const [following, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          following: {
            select: {
              id: true,
              name: true,
              username: true,
              profilePic: true,
              bio: true,
            },
          },
        },
      }),
      prisma.follow.count({ where: { followerId: userId } }),
    ])

    return {
      following: following.map(f => f.following),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Get following error:", error)
    throw new Error("Failed to fetch following")
  }
}

// Search Users
export async function searchUsers(query: string, options: {
  page?: number
  limit?: number
} = {}) {
  try {
    const { page = 1, limit = 20 } = options
    const skip = (page - 1) * limit

    const where = {
      OR: [
        { name: { contains: query, mode: "insensitive" as const } },
        { username: { contains: query, mode: "insensitive" as const } },
        { bio: { contains: query, mode: "insensitive" as const } },
      ],
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          username: true,
          bio: true,
          profilePic: true,
          isPrivate: true,
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Search users error:", error)
    throw new Error("Failed to search users")
  }
}

// --- Friend Request System ---

// Send Friend Request
export async function sendFriendRequest(targetUserId: string) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) throw new Error("Unauthorized")
    if (user.id === targetUserId) throw new Error("Cannot friend yourself")

    // Check if already friends or request exists
    const existing = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { fromId: user.id, toId: targetUserId },
          { fromId: targetUserId, toId: user.id },
        ],
      },
    })
    if (existing) throw new Error("Friend request already exists or pending")

    // Prevent duplicate notifications
    const existingNotif = await prisma.notification.findFirst({
      where: {
        userId: targetUserId,
        type: "FOLLOW",
        data: {
          path: ["fromUserId"],
          equals: user.id,
        },
        status: { notIn: ["DECLINED", "CANCELLED"] },
      },
    })
    if (!existingNotif) {
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          type: "FOLLOW",
          title: "New Friend Request",
          message: `${user.name} (@${user.username}) sent you a friend request`,
          data: JSON.stringify({
            fromUserId: user.id,
            fromUserName: user.name,
            fromUserUsername: user.username,
          }),
          status: "PENDING",
        },
      })
    }

    await prisma.friendRequest.create({
      data: {
        fromId: user.id,
        toId: targetUserId,
        status: "PENDING",
      },
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to send friend request" }
  }
}

// Cancel Friend Request (sent by current user)
export async function cancelFriendRequest(targetUserId: string) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) throw new Error("Unauthorized")
    await prisma.friendRequest.deleteMany({
      where: {
        fromId: user.id,
        toId: targetUserId,
        status: "PENDING",
      },
    })
    // Mark the related notification as CANCELLED
    await prisma.notification.updateMany({
      where: {
        userId: targetUserId,
        type: "FOLLOW",
        status: "PENDING",
        data: {
          path: ["fromUserId"],
          equals: user.id,
        },
      },
      data: { status: "CANCELLED" },
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to cancel friend request" }
  }
}

// Accept Friend Request (received by current user)
export async function acceptFriendRequest(fromUserId: string) {
  const prismaTx = prisma as PrismaClient
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) throw new Error("Unauthorized")
    if (!fromUserId || typeof fromUserId !== 'string') {
      console.error('[acceptFriendRequest] Invalid fromUserId:', fromUserId)
      throw new Error('Invalid sender for friend request')
    }
    console.log('[acceptFriendRequest] Creating FRIEND_ACCEPTED notification for userId:', fromUserId, 'by:', user.id)
    const result = await prismaTx.$transaction(async (tx) => {
      // Update request status
      const reqUpdate = await tx.friendRequest.updateMany({
        where: {
          fromId: fromUserId,
          toId: user.id,
          status: "PENDING",
        },
        data: { status: "ACCEPTED" },
      })
      // Find all relevant FOLLOW notifications for both users
      const notifs1 = await tx.notification.findMany({
        where: {
          userId: user.id,
          type: "FOLLOW",
        },
      })
      const notifs2 = await tx.notification.findMany({
        where: {
          userId: fromUserId,
          type: "FOLLOW",
        },
      })
      // Filter by data.fromUserId
      const toUpdate = [
        ...notifs1.filter(n => n.data && (typeof n.data === 'object' ? n.data.fromUserId : JSON.parse(n.data).fromUserId) === fromUserId),
        ...notifs2.filter(n => n.data && (typeof n.data === 'object' ? n.data.fromUserId : JSON.parse(n.data).fromUserId) === user.id),
      ]
      for (const notif of toUpdate) {
        await tx.notification.update({
          where: { id: notif.id },
          data: { status: "ACCEPTED" },
        })
      }
      console.log('[acceptFriendRequest] Notifications updated:', toUpdate.length)
      // Create friendship (bi-directional)
      let friendsCreate = null
      friendsCreate = await tx.friend.createMany({
        data: [
          { userId: user.id, friendId: fromUserId },
          { userId: fromUserId, friendId: user.id },
        ],
        skipDuplicates: true,
      })
      return { reqUpdate, friendsCreate }
    })
    console.log("[acceptFriendRequest] transaction result:", result)
    return { success: true }
  } catch (error) {
    console.error("[acceptFriendRequest] error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to accept friend request" }
  }
}

// Decline Friend Request (received by current user)
export async function declineFriendRequest(fromUserId: string) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) throw new Error("Unauthorized")
    await prisma.friendRequest.updateMany({
      where: {
        fromId: fromUserId,
        toId: user.id,
        status: "PENDING",
      },
      data: { status: "DECLINED" },
    })
    // Update notification status to DECLINED
    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        type: "FOLLOW",
        status: "PENDING",
        data: {
          path: ["fromUserId"],
          equals: fromUserId,
        },
      },
      data: { status: "DECLINED" },
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to decline friend request" }
  }
}

// Remove Friend
export async function removeFriend(targetUserId: string) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) throw new Error("Unauthorized")
    await prisma.friend.deleteMany({
      where: {
        OR: [
          { userId: user.id, friendId: targetUserId },
          { userId: targetUserId, friendId: user.id },
        ],
      },
    })
    // Optionally, also delete any accepted friend requests
    await prisma.friendRequest.deleteMany({
      where: {
        OR: [
          { fromId: user.id, toId: targetUserId },
          { fromId: targetUserId, toId: user.id },
        ],
        status: "ACCEPTED",
      },
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to remove friend" }
  }
}

// Get Relationship Status
export async function getRelationshipStatus(targetUserId: string) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) return { isFollowing: false, isFriend: false, requestSent: false, requestReceived: false }
    if (user.id === targetUserId) return { isFollowing: false, isFriend: false, requestSent: false, requestReceived: false }

    // Following
    const follow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: user.id, followingId: targetUserId } },
    })
    // Friends
    const friend = await prisma.friend.findUnique({
      where: { userId_friendId: { userId: user.id, friendId: targetUserId } },
    })
    // Friend Requests
    const sentRequest = await prisma.friendRequest.findFirst({
      where: { fromId: user.id, toId: targetUserId, status: "PENDING" },
    })
    const receivedRequest = await prisma.friendRequest.findFirst({
      where: { fromId: targetUserId, toId: user.id, status: "PENDING" },
    })
    return {
      isFollowing: !!follow,
      isFriend: !!friend,
      requestSent: !!sentRequest,
      requestReceived: !!receivedRequest,
    }
  } catch (error) {
    return { isFollowing: false, isFriend: false, requestSent: false, requestReceived: false }
  }
} 