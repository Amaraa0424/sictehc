"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentUserFromCookies } from "./auth.server"

// Validation schemas
const createPostSchema = z.object({
  content: z.string().min(1, "Content is required").max(10000, "Content too long"),
  title: z.string().optional(),
  abstract: z.string().optional(),
  mediaUrls: z.array(z.string().url()).optional(),
  mediaType: z.enum(["TEXT", "IMAGE", "VIDEO", "PDF", "DOCUMENT"]).default("TEXT"),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "CLUB_ONLY"]).default("PUBLIC"),
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
      throw new Error("Unauthorized")
    }

    const rawData = {
      content: formData.get("content") as string,
      title: formData.get("title") as string || undefined,
      abstract: formData.get("abstract") as string || undefined,
      mediaUrls: formData.getAll("mediaUrls") as string[],
      mediaType: formData.get("mediaType") as string || "TEXT",
      tags: formData.getAll("tags") as string[],
      visibility: formData.get("visibility") as string || "PUBLIC",
    }

    const validatedData = createPostSchema.parse(rawData)

    const post = await prisma.post.create({
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
            comments: true,
            reposts: true,
          },
        },
      },
    })

    revalidatePath("/")
    revalidatePath("/dashboard")
    return { success: true, data: post }
  } catch (error) {
    console.error("Create post error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create post" }
  }
}

// Update Post
export async function updatePost(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      id: formData.get("id") as string,
      content: formData.get("content") as string,
      title: formData.get("title") as string || undefined,
      abstract: formData.get("abstract") as string || undefined,
      mediaUrls: formData.getAll("mediaUrls") as string[],
      mediaType: formData.get("mediaType") as string || "TEXT",
      tags: formData.getAll("tags") as string[],
      visibility: formData.get("visibility") as string || "PUBLIC",
    }

    const validatedData = updatePostSchema.parse(rawData)

    // Check if user owns the post
    const existingPost = await prisma.post.findUnique({
      where: { id: validatedData.id },
      select: { authorId: true },
    })

    if (!existingPost || existingPost.authorId !== user.id) {
      throw new Error("Unauthorized to update this post")
    }

    const post = await prisma.post.update({
      where: { id: validatedData.id },
      data: validatedData,
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
    })

    revalidatePath("/")
    revalidatePath("/dashboard")
    revalidatePath(`/posts/${post.id}`)
    return { success: true, data: post }
  } catch (error) {
    console.error("Update post error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update post" }
  }
}

// Delete Post
export async function deletePost(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      id: formData.get("id") as string,
    }

    const validatedData = deletePostSchema.parse(rawData)

    // Check if user owns the post
    const existingPost = await prisma.post.findUnique({
      where: { id: validatedData.id },
      select: { authorId: true },
    })

    if (!existingPost || existingPost.authorId !== user.id) {
      throw new Error("Unauthorized to delete this post")
    }

    await prisma.post.delete({
      where: { id: validatedData.id },
    })

    revalidatePath("/")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Delete post error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete post" }
  }
}

// Like Post
export async function likePost(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      postId: formData.get("postId") as string,
    }

    const validatedData = likePostSchema.parse(rawData)

    await prisma.like.create({
      data: {
        postId: validatedData.postId,
        userId: user.id,
      },
    })

    revalidatePath("/")
    revalidatePath("/dashboard")
    revalidatePath(`/posts/${validatedData.postId}`)
    return { success: true }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      // Already liked
      return { success: true }
    }
    console.error("Like post error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to like post" }
  }
}

// Unlike Post
export async function unlikePost(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      postId: formData.get("postId") as string,
    }

    const validatedData = unlikePostSchema.parse(rawData)

    await prisma.like.delete({
      where: {
        postId_userId: {
          postId: validatedData.postId,
          userId: user.id,
        },
      },
    })

    revalidatePath("/")
    revalidatePath("/dashboard")
    revalidatePath(`/posts/${validatedData.postId}`)
    return { success: true }
  } catch (error) {
    console.error("Unlike post error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to unlike post" }
  }
}

// Repost
export async function repost(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      postId: formData.get("postId") as string,
    }

    const validatedData = repostSchema.parse(rawData)

    await prisma.repost.create({
      data: {
        postId: validatedData.postId,
        userId: user.id,
      },
    })

    revalidatePath("/")
    revalidatePath("/dashboard")
    revalidatePath(`/posts/${validatedData.postId}`)
    return { success: true }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      // Already reposted
      return { success: true }
    }
    console.error("Repost error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to repost" }
  }
}

// Unrepost
export async function unrepost(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      postId: formData.get("postId") as string,
    }

    const validatedData = unrepostSchema.parse(rawData)

    await prisma.repost.delete({
      where: {
        postId_userId: {
          postId: validatedData.postId,
          userId: user.id,
        },
      },
    })

    revalidatePath("/")
    revalidatePath("/dashboard")
    revalidatePath(`/posts/${validatedData.postId}`)
    return { success: true }
  } catch (error) {
    console.error("Unrepost error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to unrepost" }
  }
}

// Save Post
export async function savePost(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      postId: formData.get("postId") as string,
    }

    const validatedData = savePostSchema.parse(rawData)

    await prisma.savedPost.create({
      data: {
        postId: validatedData.postId,
        userId: user.id,
      },
    })

    revalidatePath("/saved")
    return { success: true }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      // Already saved
      return { success: true }
    }
    console.error("Save post error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to save post" }
  }
}

// Unsave Post
export async function unsavePost(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      postId: formData.get("postId") as string,
    }

    const validatedData = unsavePostSchema.parse(rawData)

    await prisma.savedPost.delete({
      where: {
        userId_postId: {
          userId: user.id,
          postId: validatedData.postId,
        },
      },
    })

    revalidatePath("/saved")
    return { success: true }
  } catch (error) {
    console.error("Unsave post error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to unsave post" }
  }
}

// Get Posts (for server components)
export async function getPosts(options: {
  page?: number
  limit?: number
  userId?: string
  tags?: string[]
  search?: string
} = {}) {
  try {
    const { page = 1, limit = 10, userId, tags, search } = options
    const skip = (page - 1) * limit

    const where: any = {
      isPublished: true,
      visibility: "PUBLIC",
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
    console.error("Get posts error:", error)
    throw new Error("Failed to fetch posts")
  }
}

// Get Single Post
export async function getPost(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePic: true,
            bio: true,
          },
        },
        comments: {
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
              },
            },
          },
          orderBy: { createdAt: "desc" },
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
      throw new Error("Post not found")
    }

    // Increment view count
    await prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    return post
  } catch (error) {
    console.error("Get post error:", error)
    throw new Error("Failed to fetch post")
  }
} 