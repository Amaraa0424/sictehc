"use client"

import { useState } from "react"
import { Button } from "../../../components/ui/button"

interface FollowButtonProps {
  userId: string
  initialIsFollowing?: boolean
}

export default function FollowButton({ userId, initialIsFollowing = false }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFollow = async () => {
    setIsSubmitting(true)
    
    try {
      // Mock follow action
      console.log("Following user:", userId)
      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error("Follow action error:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Button
      onClick={handleFollow}
      disabled={isSubmitting}
      size="sm"
      variant={isFollowing ? "outline" : "default"}
      className={
        isFollowing
          ? "bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700 text-xs px-2 py-1 h-6"
          : "bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 h-6"
      }
    >
      {isSubmitting ? "..." : isFollowing ? "Following" : "Follow"}
    </Button>
  )
} 