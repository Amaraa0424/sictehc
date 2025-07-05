"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "../prisma"
import { getCurrentUserFromCookies } from "../auth.server"

// Validation schemas
const createClubSchema = z.object({
  name: z.string().min(1, "Club name is required").max(100, "Club name too long"),
  description: z.string().min(1, "Description is required").max(2000, "Description too long"),
  category: z.string().min(1, "Category is required"),
  logo: z.string().url().optional(),
  banner: z.string().url().optional(),
  isPrivate: z.boolean().default(false),
})

const updateClubSchema = createClubSchema.partial().extend({
  id: z.string().cuid(),
})

const deleteClubSchema = z.object({
  id: z.string().cuid(),
})

const joinClubSchema = z.object({
  clubId: z.string().cuid(),
})

const leaveClubSchema = z.object({
  clubId: z.string().cuid(),
})

const createClubPostSchema = z.object({
  clubId: z.string().cuid(),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(1, "Content is required").max(10000, "Content too long"),
  mediaUrls: z.array(z.string().url()).optional(),
  isAnnouncement: z.boolean().default(false),
})

const createClubEventSchema = z.object({
  clubId: z.string().cuid(),
  title: z.string().min(1, "Event title is required").max(200, "Event title too long"),
  description: z.string().min(1, "Description is required").max(2000, "Description too long"),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  location: z.string().optional(),
  isOnline: z.boolean().default(false),
  meetingUrl: z.string().url().optional(),
})

// Create Club
export async function createClub(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      logo: formData.get("logo") as string || undefined,
      banner: formData.get("banner") as string || undefined,
      isPrivate: formData.get("isPrivate") === "true",
    }

    const validatedData = createClubSchema.parse(rawData)

    const club = await prisma.club.create({
      data: {
        ...validatedData,
        members: {
          create: {
            userId: user.id,
            role: "PRESIDENT",
          },
        },
        roles: {
          create: {
            userId: user.id,
            role: "PRESIDENT",
          },
        },
      },
      include: {
        members: {
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
        _count: {
          select: {
            members: true,
            posts: true,
            events: true,
          },
        },
      },
    })

    revalidatePath("/clubs")
    revalidatePath(`/clubs/${club.id}`)
    return { success: true, data: club }
  } catch (error) {
    console.error("Create club error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create club" }
  }
}

// Update Club
export async function updateClub(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      id: formData.get("id") as string,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      logo: formData.get("logo") as string || undefined,
      banner: formData.get("banner") as string || undefined,
      isPrivate: formData.get("isPrivate") === "true",
    }

    const validatedData = updateClubSchema.parse(rawData)

    // Check if user is club admin
    const clubRole = await prisma.clubRole.findUnique({
      where: {
        clubId_userId_role: {
          clubId: validatedData.id,
          userId: user.id,
          role: "PRESIDENT",
        },
      },
    })

    if (!clubRole) {
      throw new Error("Unauthorized to update this club")
    }

    const club = await prisma.club.update({
      where: { id: validatedData.id },
      data: validatedData,
      include: {
        members: {
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
        _count: {
          select: {
            members: true,
            posts: true,
            events: true,
          },
        },
      },
    })

    revalidatePath("/clubs")
    revalidatePath(`/clubs/${club.id}`)
    return { success: true, data: club }
  } catch (error) {
    console.error("Update club error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update club" }
  }
}

// Delete Club
export async function deleteClub(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      id: formData.get("id") as string,
    }

    const validatedData = deleteClubSchema.parse(rawData)

    // Check if user is club president
    const clubRole = await prisma.clubRole.findUnique({
      where: {
        clubId_userId_role: {
          clubId: validatedData.id,
          userId: user.id,
          role: "PRESIDENT",
        },
      },
    })

    if (!clubRole) {
      throw new Error("Unauthorized to delete this club")
    }

    await prisma.club.delete({
      where: { id: validatedData.id },
    })

    revalidatePath("/clubs")
    return { success: true }
  } catch (error) {
    console.error("Delete club error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete club" }
  }
}

// Join Club
export async function joinClub(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      clubId: formData.get("clubId") as string,
    }

    const validatedData = joinClubSchema.parse(rawData)

    // Check if club exists and is active
    const club = await prisma.club.findUnique({
      where: { id: validatedData.clubId },
      select: { isActive: true, isPrivate: true },
    })

    if (!club || !club.isActive) {
      throw new Error("Club not found or inactive")
    }

    await prisma.clubMember.create({
      data: {
        clubId: validatedData.clubId,
        userId: user.id,
        role: "MEMBER",
      },
    })

    await prisma.clubRole.create({
      data: {
        clubId: validatedData.clubId,
        userId: user.id,
        role: "MEMBER",
      },
    })

    revalidatePath("/clubs")
    revalidatePath(`/clubs/${validatedData.clubId}`)
    return { success: true }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      // Already a member
      return { success: true }
    }
    console.error("Join club error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to join club" }
  }
}

// Leave Club
export async function leaveClub(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      clubId: formData.get("clubId") as string,
    }

    const validatedData = leaveClubSchema.parse(rawData)

    // Check if user is president (presidents can't leave)
    const clubRole = await prisma.clubRole.findUnique({
      where: {
        clubId_userId_role: {
          clubId: validatedData.clubId,
          userId: user.id,
          role: "PRESIDENT",
        },
      },
    })

    if (clubRole) {
      throw new Error("Club presidents cannot leave the club")
    }

    await Promise.all([
      prisma.clubMember.delete({
        where: {
          clubId_userId: {
            clubId: validatedData.clubId,
            userId: user.id,
          },
        },
      }),
      prisma.clubRole.deleteMany({
        where: {
          clubId: validatedData.clubId,
          userId: user.id,
        },
      }),
    ])

    revalidatePath("/clubs")
    revalidatePath(`/clubs/${validatedData.clubId}`)
    return { success: true }
  } catch (error) {
    console.error("Leave club error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to leave club" }
  }
}

// Create Club Post
export async function createClubPost(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      clubId: formData.get("clubId") as string,
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      mediaUrls: formData.getAll("mediaUrls") as string[],
      isAnnouncement: formData.get("isAnnouncement") === "true",
    }

    const validatedData = createClubPostSchema.parse(rawData)

    // Check if user is club member
    const membership = await prisma.clubMember.findUnique({
      where: {
        clubId_userId: {
          clubId: validatedData.clubId,
          userId: user.id,
        },
      },
    })

    if (!membership) {
      throw new Error("You must be a club member to post")
    }

    const post = await prisma.clubPost.create({
      data: {
        ...validatedData,
        authorId: user.id,
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    revalidatePath(`/clubs/${validatedData.clubId}`)
    return { success: true, data: post }
  } catch (error) {
    console.error("Create club post error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create club post" }
  }
}

// Create Club Event
export async function createClubEvent(formData: FormData) {
  try {
    const user = await getCurrentUserFromCookies()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const rawData = {
      clubId: formData.get("clubId") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      location: formData.get("location") as string || undefined,
      isOnline: formData.get("isOnline") === "true",
      meetingUrl: formData.get("meetingUrl") as string || undefined,
    }

    const validatedData = createClubEventSchema.parse(rawData)

    // Check if user is club admin
    const clubRole = await prisma.clubRole.findFirst({
      where: {
        clubId: validatedData.clubId,
        userId: user.id,
        role: { in: ["PRESIDENT", "SECRETARY"] },
      },
    })

    if (!clubRole) {
      throw new Error("Only club admins can create events")
    }

    const event = await prisma.clubEvent.create({
      data: {
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    revalidatePath(`/clubs/${validatedData.clubId}`)
    return { success: true, data: event }
  } catch (error) {
    console.error("Create club event error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create club event" }
  }
}

// Get Clubs
export async function getClubs(options: {
  page?: number
  limit?: number
  category?: string
  search?: string
} = {}) {
  try {
    const { page = 1, limit = 12, category, search } = options
    const skip = (page - 1) * limit

    const where: any = {
      isActive: true,
    }

    if (category) {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const [clubs, total] = await Promise.all([
      prisma.club.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              members: true,
              posts: true,
              events: true,
            },
          },
        },
      }),
      prisma.club.count({ where }),
    ])

    return {
      clubs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Get clubs error:", error)
    throw new Error("Failed to fetch clubs")
  }
}

// Get Single Club
export async function getClub(id: string) {
  try {
    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        members: {
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
        posts: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        events: {
          where: {
            endDate: { gte: new Date() },
          },
          orderBy: { startDate: "asc" },
          take: 5,
        },
        _count: {
          select: {
            members: true,
            posts: true,
            events: true,
          },
        },
      },
    })

    if (!club) {
      throw new Error("Club not found")
    }

    return club
  } catch (error) {
    console.error("Get club error:", error)
    throw new Error("Failed to fetch club")
  }
}

// Get User's Clubs
export async function getUserClubs(userId: string) {
  try {
    const clubs = await prisma.clubMember.findMany({
      where: { userId },
      include: {
        club: {
          include: {
            _count: {
              select: {
                members: true,
                posts: true,
                events: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    })

    return clubs.map(member => member.club)
  } catch (error) {
    console.error("Get user clubs error:", error)
    throw new Error("Failed to fetch user clubs")
  }
} 