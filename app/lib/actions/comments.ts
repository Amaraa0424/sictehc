"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "../prisma"
import { getCurrentUserFromCookies } from "../auth.server"

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
export async function createComment(postId: string, formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const rawData = {
      content: formData.get("content") as string,
      parentId: formData.get("parentId") as string || undefined,
    }

    const validatedData = createCommentSchema.parse(rawData)

    // Check if post exists and is accessible
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { 
        id: true, 
        visibility: true, 
        authorId: true,
        isPublished: true 
      },
    })

    if (!post || !post.isPublished) {
      return { success: false, error: "Post not found" }
    }

    // Check visibility
    if (post.visibility !== "PUBLIC" && post.authorId !== user.id) {
      if (post.visibility === "FOLLOWERS") {
        const isFollowing = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: user.id,
              followingId: post.authorId,
            },
          },
        })
        if (!isFollowing) {
          return { success: false, error: "Post not accessible" }
        }
      } else {
        return { success: false, error: "Post not accessible" }
      }
    }

    // If this is a reply, check if parent comment exists
    if (validatedData.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: validatedData.parentId },
        select: { id: true, postId: true },
      })

      if (!parentComment || parentComment.postId !== postId) {
        return { success: false, error: "Invalid parent comment" }
      }
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: user.id,
        content: validatedData.content,
        parentId: validatedData.parentId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePic: true,
            isVerified: true,
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

    revalidatePath("/")
    revalidatePath(`/posts/${postId}`)
    return { success: true, data: comment }
  } catch (error) {
    console.error("Create comment error:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Failed to create comment" }
  }
}

// Update Comment
export async function updateComment(commentId: string, formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if user owns the comment
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, postId: true },
    })

    if (!existingComment || existingComment.authorId !== user.id) {
      return { success: false, error: "Not authorized to edit this comment" }
    }

    const rawData = {
      content: formData.get("content") as string,
    }

    const validatedData = updateCommentSchema.parse(rawData)

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: validatedData.content,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePic: true,
            isVerified: true,
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

    revalidatePath("/")
    revalidatePath(`/posts/${existingComment.postId}`)
    return { success: true, data: comment }
  } catch (error) {
    console.error("Update comment error:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Failed to update comment" }
  }
}

// Delete Comment
export async function deleteComment(commentId: string) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if user owns the comment
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, postId: true },
    })

    if (!existingComment || existingComment.authorId !== user.id) {
      return { success: false, error: "Not authorized to delete this comment" }
    }

    await prisma.comment.delete({
      where: { id: commentId },
    })

    revalidatePath("/")
    revalidatePath(`/posts/${existingComment.postId}`)
    return { success: true }
  } catch (error) {
    console.error("Delete comment error:", error)
    return { success: false, error: "Failed to delete comment" }
  }
}

// Like Comment
export async function likeComment(commentId: string) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, postId: true },
    })

    if (!comment) {
      return { success: false, error: "Comment not found" }
    }

    // Check if already liked
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId: user.id,
        },
      },
    })

    if (existingLike) {
      return { success: false, error: "Already liked this comment" }
    }

    await prisma.commentLike.create({
      data: {
        commentId,
        userId: user.id,
      },
    })

    revalidatePath("/")
    revalidatePath(`/posts/${comment.postId}`)
    return { success: true }
  } catch (error) {
    console.error("Like comment error:", error)
    return { success: false, error: "Failed to like comment" }
  }
}

// Unlike Comment
export async function unlikeComment(commentId: string) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, postId: true },
    })

    if (!comment) {
      return { success: false, error: "Comment not found" }
    }

    await prisma.commentLike.delete({
      where: {
        commentId_userId: {
          commentId,
          userId: user.id,
        },
      },
    })

    revalidatePath("/")
    revalidatePath(`/posts/${comment.postId}`)
    return { success: true }
  } catch (error) {
    console.error("Unlike comment error:", error)
    return { success: false, error: "Failed to unlike comment" }
  }
}

// Get Comments for a Post
export async function getComments(postId: string, page = 1, limit = 10) {
  try {
    const user = await getCurrentUserFromCookies()
    const skip = (page - 1) * limit

    // Check if post exists and is accessible
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { 
        id: true, 
        visibility: true, 
        authorId: true,
        isPublished: true 
      },
    })

    if (!post || !post.isPublished) {
      return { success: false, error: "Post not found" }
    }

    // Check visibility
    if (post.visibility !== "PUBLIC" && (!user || post.authorId !== user.id)) {
      if (post.visibility === "FOLLOWERS" && user) {
        const isFollowing = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: user.id,
              followingId: post.authorId,
            },
          },
        })
        if (!isFollowing) {
          return { success: false, error: "Post not accessible" }
        }
      } else {
        return { success: false, error: "Post not accessible" }
      }
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          postId,
          parentId: null, // Only top-level comments
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              profilePic: true,
              isVerified: true,
            },
          },
          _count: {
            select: {
              likes: true,
              replies: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.comment.count({
        where: {
          postId,
          parentId: null,
        },
      }),
    ])

    const hasNextPage = skip + limit < total
    const hasPrevPage = page > 1

    return {
      success: true,
      data: {
        comments,
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
    console.error("Get comments error:", error)
    return { success: false, error: "Failed to fetch comments" }
  }
}

// Get Comment Replies
export async function getCommentReplies(commentId: string, page = 1, limit = 10) {
  try {
    const user = await getCurrentUserFromCookies()
    const skip = (page - 1) * limit

    // Check if parent comment exists
    const parentComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { 
        id: true, 
        postId: true,
        post: {
          select: {
            visibility: true,
            authorId: true,
            isPublished: true,
          },
        },
      },
    })

    if (!parentComment || !parentComment.post.isPublished) {
      return { success: false, error: "Comment not found" }
    }

    // Check post visibility
    const post = parentComment.post
    if (post.visibility !== "PUBLIC" && (!user || post.authorId !== user.id)) {
      if (post.visibility === "FOLLOWERS" && user) {
        const isFollowing = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: user.id,
              followingId: post.authorId,
            },
          },
        })
        if (!isFollowing) {
          return { success: false, error: "Post not accessible" }
        }
      } else {
        return { success: false, error: "Post not accessible" }
      }
    }

    const [replies, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          parentId: commentId,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              profilePic: true,
              isVerified: true,
            },
          },
          _count: {
            select: {
              likes: true,
              replies: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
      }),
      prisma.comment.count({
        where: {
          parentId: commentId,
        },
      }),
    ])

    const hasNextPage = skip + limit < total
    const hasPrevPage = page > 1

    return {
      success: true,
      data: {
        replies,
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
    console.error("Get comment replies error:", error)
    return { success: false, error: "Failed to fetch replies" }
  }
} 