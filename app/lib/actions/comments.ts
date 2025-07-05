"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentUserFromCookies } from "./auth.server"

// Validation schemas
const createCommentSchema = z.object({
  postId: z.string().cuid(),
  content: z.string().min(1, "Comment content is required").max(2000, "Comment too long"),
  parentId: z.string().cuid().optional(),
})

const updateCommentSchema = z.object({
  id: z.string().cuid(),
  content: z.string().min(1, "Comment content is required").max(2000, "Comment too long"),
})

const deleteCommentSchema = z.object({
  id: z.string().cuid(),
})

const likeCommentSchema = z.object({
  commentId: z.string().cuid(),
})

const unlikeCommentSchema = z.object({
  commentId: z.string().cuid(),
})

// Create Comment
export async function createComment(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      postId: formData.get("postId") as string,
      content: formData.get("content") as string,
      parentId: formData.get("parentId") as string || undefined,
    }

    const validatedData = createCommentSchema.parse(rawData)

    // Verify post exists and is public
    const post = await prisma.post.findUnique({
      where: { id: validatedData.postId },
      select: { visibility: true, isPublished: true },
    })

    if (!post || !post.isPublished) {
      throw new Error("Post not found or not published")
    }

    // If parent comment exists, verify it belongs to the same post
    if (validatedData.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: validatedData.parentId },
        select: { postId: true },
      })

      if (!parentComment || parentComment.postId !== validatedData.postId) {
        throw new Error("Invalid parent comment")
      }
    }

    const comment = await prisma.comment.create({
      data: {
        ...validatedData,
        authorId: user.id,
      },
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
            replies: true,
          },
        },
      },
    })

    revalidatePath(`/posts/${validatedData.postId}`)
    revalidatePath("/")
    return { success: true, data: comment }
  } catch (error) {
    console.error("Create comment error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create comment" }
  }
}

// Update Comment
export async function updateComment(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      id: formData.get("id") as string,
      content: formData.get("content") as string,
    }

    const validatedData = updateCommentSchema.parse(rawData)

    // Check if user owns the comment
    const existingComment = await prisma.comment.findUnique({
      where: { id: validatedData.id },
      select: { authorId: true, postId: true },
    })

    if (!existingComment || existingComment.authorId !== user.id) {
      throw new Error("Unauthorized to update this comment")
    }

    const comment = await prisma.comment.update({
      where: { id: validatedData.id },
      data: { content: validatedData.content },
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
            replies: true,
          },
        },
      },
    })

    revalidatePath(`/posts/${existingComment.postId}`)
    return { success: true, data: comment }
  } catch (error) {
    console.error("Update comment error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update comment" }
  }
}

// Delete Comment
export async function deleteComment(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      id: formData.get("id") as string,
    }

    const validatedData = deleteCommentSchema.parse(rawData)

    // Check if user owns the comment
    const existingComment = await prisma.comment.findUnique({
      where: { id: validatedData.id },
      select: { authorId: true, postId: true },
    })

    if (!existingComment || existingComment.authorId !== user.id) {
      throw new Error("Unauthorized to delete this comment")
    }

    await prisma.comment.delete({
      where: { id: validatedData.id },
    })

    revalidatePath(`/posts/${existingComment.postId}`)
    return { success: true }
  } catch (error) {
    console.error("Delete comment error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete comment" }
  }
}

// Like Comment
export async function likeComment(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      commentId: formData.get("commentId") as string,
    }

    const validatedData = likeCommentSchema.parse(rawData)

    await prisma.commentLike.create({
      data: {
        commentId: validatedData.commentId,
        userId: user.id,
      },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      // Already liked
      return { success: true }
    }
    console.error("Like comment error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to like comment" }
  }
}

// Unlike Comment
export async function unlikeComment(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      commentId: formData.get("commentId") as string,
    }

    const validatedData = unlikeCommentSchema.parse(rawData)

    await prisma.commentLike.delete({
      where: {
        commentId_userId: {
          commentId: validatedData.commentId,
          userId: user.id,
        },
      },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Unlike comment error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to unlike comment" }
  }
}

// Get Comments for a Post
export async function getComments(postId: string, options: {
  page?: number
  limit?: number
  parentId?: string
} = {}) {
  try {
    const { page = 1, limit = 20, parentId } = options
    const skip = (page - 1) * limit

    const where: any = {
      postId,
    }

    if (parentId) {
      where.parentId = parentId
    } else {
      where.parentId = null // Only top-level comments
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
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
              replies: true,
            },
          },
        },
      }),
      prisma.comment.count({ where }),
    ])

    return {
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Get comments error:", error)
    throw new Error("Failed to fetch comments")
  }
}

// Get Comment Replies
export async function getCommentReplies(commentId: string, options: {
  page?: number
  limit?: number
} = {}) {
  try {
    const { page = 1, limit = 10 } = options
    const skip = (page - 1) * limit

    const [replies, total] = await Promise.all([
      prisma.comment.findMany({
        where: { parentId: commentId },
        skip,
        take: limit,
        orderBy: { createdAt: "asc" },
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
              replies: true,
            },
          },
        },
      }),
      prisma.comment.count({ where: { parentId: commentId } }),
    ])

    return {
      replies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Get comment replies error:", error)
    throw new Error("Failed to fetch comment replies")
  }
} 