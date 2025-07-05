"use client"

import { useEffect, useState } from "react"
import { useRealtime } from "../components/realtime/RealtimeProvider"

interface Post {
  id: string
  content: string
  title?: string
  abstract?: string
  author: {
    id: string
    name: string
    username: string
    profilePic?: string
  }
  createdAt: string
  updatedAt: string
  visibility: string
  mediaType: string
  mediaUrls?: string[]
  tags?: string[]
  _count: {
    likes: number
    comments: number
    reposts: number
    views: number
  }
}

export function useRealtimePosts(initialPosts: Post[]) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const { subscribe } = useRealtime()

  useEffect(() => {
    // Subscribe to new post events
    const unsubscribeNewPost = subscribe("post:created", (newPost: Post) => {
      setPosts(prev => [newPost, ...prev])
    })

    // Subscribe to post update events
    const unsubscribePostUpdate = subscribe("post:updated", (updatedPost: Post) => {
      setPosts(prev => prev.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      ))
    })

    // Subscribe to post delete events
    const unsubscribePostDelete = subscribe("post:deleted", (deletedPostId: string) => {
      setPosts(prev => prev.filter(post => post.id !== deletedPostId))
    })

    // Subscribe to like events
    const unsubscribeLike = subscribe("post:liked", ({ postId, userId, action }: { postId: string; userId: string; action: "like" | "unlike" }) => {
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            _count: {
              ...post._count,
              likes: action === "like" ? post._count.likes + 1 : post._count.likes - 1
            }
          }
        }
        return post
      }))
    })

    // Subscribe to comment events
    const unsubscribeComment = subscribe("post:commented", ({ postId }: { postId: string }) => {
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            _count: {
              ...post._count,
              comments: post._count.comments + 1
            }
          }
        }
        return post
      }))
    })

    // Subscribe to repost events
    const unsubscribeRepost = subscribe("post:reposted", ({ postId, action }: { postId: string; action: "repost" | "unrepost" }) => {
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            _count: {
              ...post._count,
              reposts: action === "repost" ? post._count.reposts + 1 : post._count.reposts - 1
            }
          }
        }
        return post
      }))
    })

    return () => {
      unsubscribeNewPost()
      unsubscribePostUpdate()
      unsubscribePostDelete()
      unsubscribeLike()
      unsubscribeComment()
      unsubscribeRepost()
    }
  }, [subscribe])

  return posts
} 