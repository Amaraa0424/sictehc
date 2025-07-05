"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { prisma } from "../prisma"
import { getCurrentUserFromCookies } from "../auth.server"

// Validation schemas
const createPostSchema = z.object({
  content: z.string().min(1, "Content is required").max(10000, "Content too long"),
  title: z.string().optional(),
  abstract: z.string().optional(),
  mediaUrls: z.array(z.string().url()).optional(),
  mediaType: z.enum(["TEXT", "IMAGE", "VIDEO", "PDF"]).default("TEXT"),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "FOLLOWERS"]).default("PUBLIC"),
})

const updatePostSchema = createPostSchema.partial().extend({
  id: z.string().cuid(),
})

const deletePostSchema = z.object({
  id: z.string().cuid(),
})

const likePostSchema = z.object({
  postId: z.string().cuid(),
})

const unlikePostSchema = z.object({
  postId: z.string().cuid(),
})

const repostSchema = z.object({
  postId: z.string().cuid(),
})

const unrepostSchema = z.object({
  postId: z.string().cuid(),
})

const savePostSchema = z.object({
  postId: z.string().cuid(),
})

const unsavePostSchema = z.object({
  postId: z.string().cuid(),
})

// Create Post
export async function createPost(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const rawData = {
      content: formData.get("content") as string,
      title: formData.get("title") as string || undefined,
      abstract: formData.get("abstract") as string || undefined,
      mediaUrls: formData.getAll("mediaUrls") as string[] || [],
      mediaType: formData.get("mediaType") as string || "TEXT",
      tags: formData.getAll("tags") as string[] || [],
      visibility: formData.get("visibility") as string || "PUBLIC",
    }

    const validatedData = createPostSchema.parse(rawData)

    const post = await prisma.post.create({
      data: {
        authorId: user.id,
        content: validatedData.content,
        title: validatedData.title,
        abstract: validatedData.abstract,
        mediaUrls: validatedData.mediaUrls,
        mediaType: validatedData.mediaType as any,
        tags: validatedData.tags,
        visibility: validatedData.visibility as any,
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
            comments: true,
            reposts: true,
          },
        },
      },
    })

    revalidatePath("/")
    return { success: true, data: post }
  } catch (error) {
    console.error("Create post error:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Failed to create post" }
  }
}

// Update Post
export async function updatePost(postId: string, formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if user owns the post
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    })

    if (!existingPost || existingPost.authorId !== user.id) {
      return { success: false, error: "Not authorized to edit this post" }
    }

    const rawData = {
      content: formData.get("content") as string,
      title: formData.get("title") as string || undefined,
      abstract: formData.get("abstract") as string || undefined,
      mediaUrls: formData.getAll("mediaUrls") as string[] || [],
      mediaType: formData.get("mediaType") as string || "TEXT",
      tags: formData.getAll("tags") as string[] || [],
      visibility: formData.get("visibility") as string || "PUBLIC",
    }

    const validatedData = updatePostSchema.parse(rawData)

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        content: validatedData.content,
        title: validatedData.title,
        abstract: validatedData.abstract,
        mediaUrls: validatedData.mediaUrls,
        mediaType: validatedData.mediaType as any,
        tags: validatedData.tags,
        visibility: validatedData.visibility as any,
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
            comments: true,
            reposts: true,
          },
        },
      },
    })

    revalidatePath("/")
    revalidatePath(`/posts/${postId}`)
    return { success: true, data: post }
  } catch (error) {
    console.error("Update post error:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Failed to update post" }
  }
}

// Delete Post
export async function deletePost(postId: string) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if user owns the post
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    })

    if (!existingPost || existingPost.authorId !== user.id) {
      return { success: false, error: "Not authorized to delete this post" }
    }

    await prisma.post.delete({
      where: { id: postId },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Delete post error:", error)
    return { success: false, error: "Failed to delete post" }
  }
}

// Like Post
export async function likePost(postId: string) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.id,
        },
      },
    })

    if (existingLike) {
      return { success: false, error: "Already liked this post" }
    }

    await prisma.like.create({
      data: {
        postId,
        userId: user.id,
      },
    })

    revalidatePath("/")
    revalidatePath(`/posts/${postId}`)
    return { success: true }
  } catch (error) {
    console.error("Like post error:", error)
    return { success: false, error: "Failed to like post" }
  }
}

// Unlike Post
export async function unlikePost(postId: string) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    await prisma.like.delete({
      where: {
        postId_userId: {
          postId,
          userId: user.id,
        },
      },
    })

    revalidatePath("/")
    revalidatePath(`/posts/${postId}`)
    return { success: true }
  } catch (error) {
    console.error("Unlike post error:", error)
    return { success: false, error: "Failed to unlike post" }
  }
}

// Repost
export async function repost(postId: string) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if already reposted
    const existingRepost = await prisma.repost.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.id,
        },
      },
    })

    if (existingRepost) {
      return { success: false, error: "Already reposted this post" }
    }

    await prisma.repost.create({
      data: {
        postId,
        userId: user.id,
      },
    })

    revalidatePath("/")
    revalidatePath(`/posts/${postId}`)
    return { success: true }
  } catch (error) {
    console.error("Repost error:", error)
    return { success: false, error: "Failed to repost" }
  }
}

// Unrepost
export async function unrepost(postId: string) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    await prisma.repost.delete({
      where: {
        postId_userId: {
          postId,
          userId: user.id,
        },
      },
    })

    revalidatePath("/")
    revalidatePath(`/posts/${postId}`)
    return { success: true }
  } catch (error) {
    console.error("Unrepost error:", error)
    return { success: false, error: "Failed to remove repost" }
  }
}

// Save Post
export async function savePost(postId: string) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if already saved
    const existingSave = await prisma.savedPost.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.id,
        },
      },
    })

    if (existingSave) {
      return { success: false, error: "Already saved this post" }
    }

    await prisma.savedPost.create({
      data: {
        postId,
        userId: user.id,
      },
    })

    revalidatePath("/")
    revalidatePath("/saved")
    return { success: true }
  } catch (error) {
    console.error("Save post error:", error)
    return { success: false, error: "Failed to save post" }
  }
}

// Unsave Post
export async function unsavePost(postId: string) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    await prisma.savedPost.delete({
      where: {
        postId_userId: {
          postId,
          userId: user.id,
        },
      },
    })

    revalidatePath("/")
    revalidatePath("/saved")
    return { success: true }
  } catch (error) {
    console.error("Unsave post error:", error)
    return { success: false, error: "Failed to remove saved post" }
  }
}

// Get Posts (for server components)
export async function getPosts({
  page = 1,
  limit = 10,
  userId,
  tags,
  search,
}: {
  page?: number
  limit?: number
  userId?: string
  tags?: string[]
  search?: string
} = {}) {
  try {
    const user = await getCurrentUserFromCookies()
    const skip = (page - 1) * limit

    const where: any = {
      isPublished: true,
    }

    if (userId) {
      where.authorId = userId
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      }
    }

    if (search) {
      where.OR = [
        { content: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
        { abstract: { contains: search, mode: "insensitive" } },
      ]
    }

    // Handle visibility
    if (user) {
      where.OR = [
        { visibility: "PUBLIC" },
        { authorId: user.id },
        {
          AND: [
            { visibility: "CLUB_ONLY" },
            {
              author: {
                followers: {
                  some: {
                    followerId: user.id,
                  },
                },
              },
            },
          ],
        },
      ]
    } else {
      where.visibility = "PUBLIC"
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
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
              comments: true,
              reposts: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ])

    const hasNextPage = skip + limit < total
    const hasPrevPage = page > 1

    return {
      success: true,
      data: {
        posts,
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
    console.error("Get posts error:", error)
    return { success: false, error: "Failed to fetch posts" }
  }
}

// Get Single Post
export async function getPost(postId: string) {
  try {
    const user = await getCurrentUserFromCookies()

    const post = await prisma.post.findUnique({
      where: { id: postId },
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
            comments: true,
            reposts: true,
          },
        },
      },
    })

    if (!post) {
      return { success: false, error: "Post not found" }
    }

    // Check visibility
    if (post.visibility !== "PUBLIC" && (!user || post.authorId !== user.id)) {
      if (post.visibility === "CLUB_ONLY") {
        const isFollowing = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: user?.id || "",
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

    // Increment view count
    await prisma.post.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } },
    })

    return { success: true, data: post }
  } catch (error) {
    console.error("Get post error:", error)
    return { success: false, error: "Failed to fetch post" }
  }
}

// Create a comment on a post
export async function createComment(postId: string, formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const content = formData.get("content") as string
    if (!content || !content.trim()) {
      return { success: false, error: "Comment content is required" }
    }

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
      if (post.visibility === "CLUB_ONLY") {
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

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: user.id,
        content: content.trim(),
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
    return { success: false, error: "Failed to create comment" }
  }
} 