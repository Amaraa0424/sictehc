"use client"

import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Textarea } from "../../../components/ui/textarea"
import { formatDistanceToNow } from "date-fns"
import { 
  likePost, 
  unlikePost, 
  repost, 
  unrepost, 
  savePost, 
  unsavePost,
  createComment
} from "../../lib/actions/posts"
import { createLikeNotification, createCommentNotification } from "../../lib/actions/notifications"

interface PostCardProps {
  post: any
  user: any
}

export default function PostCard({ post, user }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isReposted, setIsReposted] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0)
  const [repostCount, setRepostCount] = useState(post._count?.reposts || 0)
  const [commentCount, setCommentCount] = useState(post._count?.comments || 0)

  // Check initial state from post data
  useEffect(() => {
    // In a real app, you'd check if the current user has liked/reposted/saved this post
    // For now, we'll assume they haven't
    setIsLiked(false)
    setIsReposted(false)
    setIsSaved(false)
  }, [post.id])

  const handleLike = async () => {
    if (!user) return
    setIsSubmittingAction(true)
    
    try {
      if (isLiked) {
        const result = await unlikePost(post.id)
        if (result.success) {
          setIsLiked(false)
          setLikeCount((prev: number) => Math.max(0, prev - 1))
        }
      } else {
        const result = await likePost(post.id)
        if (result.success) {
          setIsLiked(true)
          setLikeCount((prev: number) => prev + 1)
          
          // Create notification for the post author
          if (post.author.id !== user.id) {
            await createLikeNotification(post.id, post.author.id, user.id)
          }
        }
      }
    } catch (error) {
      console.error("Like action error:", error)
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const handleRepost = async () => {
    if (!user) return
    setIsSubmittingAction(true)
    
    try {
      if (isReposted) {
        const result = await unrepost(post.id)
        if (result.success) {
          setIsReposted(false)
          setRepostCount((prev: number) => Math.max(0, prev - 1))
        }
      } else {
        const result = await repost(post.id)
        if (result.success) {
          setIsReposted(true)
          setRepostCount((prev: number) => prev + 1)
        }
      }
    } catch (error) {
      console.error("Repost action error:", error)
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    setIsSubmittingAction(true)
    
    try {
      if (isSaved) {
        const result = await unsavePost(post.id)
        if (result.success) {
          setIsSaved(false)
        }
      } else {
        const result = await savePost(post.id)
        if (result.success) {
          setIsSaved(true)
        }
      }
    } catch (error) {
      console.error("Save action error:", error)
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !commentText.trim()) return
    
    setIsSubmittingComment(true)
    
    try {
      const formData = new FormData()
      formData.append("content", commentText)
      
      const result = await createComment(post.id, formData)
      if (result.success) {
        setCommentText("")
        setCommentCount((prev: number) => prev + 1)
        
        // Create notification for the post author
        if (post.author.id !== user.id) {
          await createCommentNotification(post.id, post.author.id, user.id)
        }
      }
    } catch (error) {
      console.error("Comment error:", error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  return (
    <div className="bg-zinc-900 rounded-lg p-4 space-y-4">
      {/* Post Header */}
      <div className="flex items-start space-x-3">
        <a href={`/users/${post.author.username}`} className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
            {post.author.profilePic ? (
              <img 
                src={post.author.profilePic} 
                alt={post.author.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-zinc-300 font-semibold">
                {post.author.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </a>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <a href={`/users/${post.author.username}`} className="text-zinc-100 font-medium hover:underline">
              {post.author.name}
            </a>
            <span className="text-zinc-400">@{post.author.username}</span>
            {post.author.isVerified && (
              <span className="text-blue-400">✓</span>
            )}
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400 text-sm">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
          
          {/* Visibility Badge */}
          {post.visibility !== "PUBLIC" && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-zinc-700 text-zinc-300 mt-1">
              {post.visibility === "PRIVATE" ? "🔒 Private" : "🏛️ Club Only"}
            </span>
          )}
        </div>

        {/* Post Actions Menu */}
        <div className="relative">
          <button className="p-1 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100">
            <span className="text-lg">⋯</span>
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="space-y-3">
        {post.title && (
          <h3 className="text-zinc-100 font-semibold text-lg">{post.title}</h3>
        )}
        
        {post.abstract && (
          <p className="text-zinc-300 text-sm italic border-l-2 border-zinc-700 pl-3">
            {post.abstract}
          </p>
        )}
        
        <p className="text-zinc-100 whitespace-pre-wrap">{post.content}</p>

        {/* Media */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="space-y-2">
            {post.mediaUrls.map((url: string, index: number) => (
              <div key={index} className="rounded-lg overflow-hidden bg-zinc-800">
                {post.mediaType === "IMAGE" ? (
                  <img src={url} alt="Post media" className="w-full h-auto" />
                ) : post.mediaType === "VIDEO" ? (
                  <video src={url} controls className="w-full h-auto" />
                ) : (
                  <div className="p-4 flex items-center space-x-2">
                    <span className="text-2xl">📄</span>
                    <span className="text-zinc-300">Document attached</span>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      View
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: string, index: number) => (
              <a
                key={index}
                href={`/?tags=${tag}`}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                #{tag}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Post Stats */}
      <div className="flex items-center justify-between text-sm text-zinc-400 border-t border-zinc-800 pt-3">
        <div className="flex items-center space-x-4">
          <span>{post.viewCount || 0} views</span>
          <span>{likeCount} likes</span>
          <span>{commentCount} comments</span>
          <span>{repostCount} reposts</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
        <div className="flex items-center space-x-6">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={isSubmittingAction}
            className={`flex items-center space-x-2 transition-colors ${
              isLiked 
                ? "text-red-500 hover:text-red-400" 
                : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            <span className="text-xl">{isLiked ? "❤️" : "🤍"}</span>
            <span className="text-sm">Like</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <span className="text-xl">💬</span>
            <span className="text-sm">Comment</span>
          </button>

          {/* Repost Button */}
          <button
            onClick={handleRepost}
            disabled={isSubmittingAction}
            className={`flex items-center space-x-2 transition-colors ${
              isReposted 
                ? "text-green-500 hover:text-green-400" 
                : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            <span className="text-xl">{isReposted ? "🔄" : "📤"}</span>
            <span className="text-sm">Repost</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSubmittingAction}
            className={`flex items-center space-x-2 transition-colors ${
              isSaved 
                ? "text-yellow-500 hover:text-yellow-400" 
                : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            <span className="text-xl">{isSaved ? "⭐" : "☆"}</span>
            <span className="text-sm">Save</span>
          </button>
        </div>

        {/* Share Button */}
        <button className="text-zinc-400 hover:text-zinc-100 transition-colors">
          <span className="text-xl">📤</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-zinc-800 pt-4 space-y-4">
          <h4 className="text-zinc-100 font-medium">Comments</h4>
          
          {/* Comment Form */}
          <form onSubmit={handleComment} className="space-y-3">
            <Textarea
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-400"
              rows={2}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!commentText.trim() || isSubmittingComment}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmittingComment ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            <p className="text-zinc-400 text-sm">
              Comments will appear here when implemented
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 