"use client"

import { useEffect, useState, use as usePromise } from "react"
import { notFound } from "next/navigation"
import { getUserProfile, getRelationshipStatus, followUser, unfollowUser, sendFriendRequest, cancelFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend } from "@/app/lib/actions/users"
import { getPosts } from "@/app/lib/actions/posts"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import PostCard from "@/app/components/feed/PostCard"
import FeedLayout from "@/app/components/layout/FeedLayout"
import { useNotifications } from "@/app/components/providers/NotificationProvider"

interface UserPageProps {
  params: { username: string }
}

export default function UserPage({ params }: UserPageProps) {
  // Unwrap params if it's a Promise (Next.js App Router)
  const resolvedParams = typeof params.then === 'function' ? usePromise(params) : params;
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [profileUser, setProfileUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [relationship, setRelationship] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { notifications } = useNotifications();

  useEffect(() => {
    async function fetchData() {
      try {
        setError(null)
        // Fetch current user from API route
        const userRes = await fetch('/api/auth/me')
        const userJson = await userRes.json()
        setCurrentUser(userJson.success ? userJson.data : null)
        
        const profile = await getUserProfile(resolvedParams.username)
        if (!profile) {
          notFound()
          return
        }
        setProfileUser(profile)
        
        const postsResult = await getPosts({ userId: profile.id })
        if (postsResult.success && postsResult.data) {
          setPosts(postsResult.data.posts || [])
        } else {
          setError(postsResult.error || "Failed to fetch posts")
        }
        
        if (userJson.success && profile) {
          const rel = await getRelationshipStatus(profile.id)
          setRelationship(rel)
        }
      } catch (err) {
        console.error("Error fetching profile data:", err)
        setError("Failed to load profile data")
      }
    }
    fetchData()
  }, [resolvedParams.username])

  useEffect(() => {
    if (!profileUser || !currentUser) return;
    // Listen for relevant notification changes
    const relevant = notifications.some(n =>
      (n.type === "FOLLOW" || n.type === "FRIEND_ACCEPTED") &&
      (n.data?.fromUserId === profileUser.id || n.data?.toUserId === profileUser.id)
    );
    if (relevant) {
      getRelationshipStatus(profileUser.id).then(setRelationship);
    }
  }, [notifications, profileUser, currentUser]);

  if (!profileUser) {
    return (
      <div className="bg-zinc-900 min-h-screen flex items-center justify-center">
        <div className="text-zinc-400">Loading profile...</div>
      </div>
    )
  }

  const isOwner = currentUser && currentUser.id === profileUser.id

  // Button handlers
  const handleFollow = async () => {
    if (!currentUser || !profileUser) return
    
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("userId", profileUser.id)
      
      if (relationship?.isFollowing) {
        await unfollowUser(formData)
      } else {
        await followUser(formData)
      }
      
      const rel = await getRelationshipStatus(profileUser.id)
      setRelationship(rel)
    } catch (err) {
      console.error("Error handling follow:", err)
      setError("Failed to update follow status")
    } finally {
      setLoading(false)
    }
  }

  const handleFriend = async () => {
    if (!currentUser || !profileUser) return
    
    setLoading(true)
    try {
      if (relationship?.isFriend) {
        await removeFriend(profileUser.id)
      } else if (relationship?.requestSent) {
        await cancelFriendRequest(profileUser.id)
      } else {
        await sendFriendRequest(profileUser.id)
      }
      
      const rel = await getRelationshipStatus(profileUser.id)
      setRelationship(rel)
    } catch (err) {
      console.error("Error handling friend request:", err)
      setError("Failed to update friend status")
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!currentUser || !profileUser) return
    setLoading(true)
    // Optimistic update
    setRelationship({ ...relationship, isFriend: true, requestSent: false, requestReceived: false })
    try {
      await acceptFriendRequest(profileUser.id)
      const rel = await getRelationshipStatus(profileUser.id)
      setRelationship(rel)
    } catch (err) {
      console.error("Error accepting friend request:", err)
      setError("Failed to accept friend request")
    } finally {
      setLoading(false)
    }
  }

  const handleDecline = async () => {
    if (!currentUser || !profileUser) return
    setLoading(true)
    // Optimistic update
    setRelationship({ ...relationship, isFriend: false, requestSent: false, requestReceived: false })
    try {
      await declineFriendRequest(profileUser.id)
      const rel = await getRelationshipStatus(profileUser.id)
      setRelationship(rel)
    } catch (err) {
      console.error("Error declining friend request:", err)
      setError("Failed to decline friend request")
    } finally {
      setLoading(false)
    }
  }

  const handleUnfriend = async () => {
    if (!currentUser || !profileUser) return
    setLoading(true)
    try {
      await removeFriend(profileUser.id)
      setRelationship({ ...relationship, isFriend: false })
    } catch (err) {
      setError("Failed to unfriend")
    } finally {
      setLoading(false)
    }
  }

  const handleChat = () => {
    // Navigate to chat page (implement actual chat creation if needed)
    window.location.href = `/messages/${profileUser.username}`
  }

  return (
    <FeedLayout user={currentUser}>
      <div className="max-w-3xl mx-auto py-8 px-4">
        {error && (
          <div className="mb-6 text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-4">
            {error}
          </div>
        )}
        
        <div className="flex items-center gap-6 mb-8">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profileUser.profilePic || undefined} alt={profileUser.name} />
            <AvatarFallback>{profileUser.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-zinc-100 truncate">{profileUser.name}</h1>
              {profileUser.isVerified && <Badge className="bg-blue-600 text-white">Verified</Badge>}
            </div>
            <div className="text-zinc-400 text-sm">@{profileUser.username}</div>
            <div className="mt-2 text-zinc-300 text-sm">
              {profileUser.program && <span>{profileUser.program} </span>}
              {profileUser.university && <span>· {profileUser.university} </span>}
              {profileUser.year && <span>· Year {profileUser.year}</span>}
            </div>
            {profileUser.bio && <div className="mt-2 text-zinc-200 text-sm">{profileUser.bio}</div>}
            
            {/* Stats */}
            <div className="mt-4 flex gap-6 text-sm text-zinc-400">
              <span>{profileUser._count?.posts || 0} posts</span>
              <span>{profileUser._count?.followers || 0} followers</span>
              <span>{profileUser._count?.following || 0} following</span>
            </div>
          </div>
          
          {currentUser && !isOwner && relationship && (
            <div className="flex gap-2">
              {/* Follow/Unfollow */}
              <Button variant="secondary" className="h-10" onClick={handleFollow} disabled={loading}>
                {relationship.isFollowing ? "Unfollow" : "Follow"}
              </Button>
              {/* Friend logic */}
              {relationship.isFriend ? (
                <Button
                  variant="destructive"
                  className="h-10 flex items-center gap-2"
                  onClick={handleUnfriend}
                  disabled={loading}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  Unfriend
                </Button>
              ) : relationship.requestSent ? (
                <Button variant="secondary" className="h-10" onClick={handleFriend} disabled={loading}>Cancel Request</Button>
              ) : relationship.requestReceived ? (
                <>
                  <Button variant="success" className="h-10" onClick={handleAccept} disabled={loading}>Accept</Button>
                  <Button variant="destructive" className="h-10" onClick={handleDecline} disabled={loading}>Decline</Button>
                </>
              ) : (
                <Button variant="secondary" className="h-10" onClick={handleFriend} disabled={loading}>Add Friend</Button>
              )}
              {/* Chat */}
              <Button variant="secondary" className="h-10" onClick={handleChat} disabled={!relationship.isFriend}>Chat</Button>
            </div>
          )}
          {currentUser && isOwner && (
            <Button variant="outline" className="h-10">Edit Profile</Button>
          )}
        </div>
        
        {/* Posts List */}
        <div className="grid gap-6">
          {posts.length === 0 ? (
            <div className="text-zinc-400 text-center py-12">No posts yet.</div>
          ) : (
            posts.map((post: any) => (
              <PostCard key={post.id} post={post} user={currentUser} />
            ))
          )}
        </div>
      </div>
    </FeedLayout>
  )
} 