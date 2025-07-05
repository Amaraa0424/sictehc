"use client"

import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Textarea } from "../../../components/ui/textarea"
import { formatDistanceToNow } from "date-fns"

interface PostCardProps {
  post: any
  user: any
}

export default function PostCard({ post, user }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false) // This would be determined from server data
  const [isReposted, setIsReposted] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)

  const handleLike = async () => {
    if (!user) return
    setIsSubmittingAction(true)
    
    try {
      // Mock like action
      console.log("Liking post:", post.id)
      setIsLiked(!isLiked)
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
      // Mock repost action
      console.log("Reposting:", post.id)
      setIsReposted(!isReposted)
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
      // Mock save action
      console.log("Saving post:", post.id)
      setIsSaved(!isSaved)
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
      // Mock comment creation
      console.log("Adding comment to post:", post.id, commentText)
      setCommentText("")
      alert("Comment added! (Mock)")
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
          <span>{post._count.views || 0} views</span>
          <span>{post._count.likes} likes</span>
          <span>{post._count.comments} comments</span>
          <span>{post._count.reposts} reposts</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
        <div className="flex items-center space-x-6">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={isSubmittingAction}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isLiked 
                ? "text-red-400 bg-red-900/20" 
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            }`}
          >
            <span className="text-lg">{isLiked ? "❤️" : "🤍"}</span>
            <span className="text-sm">Like</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <span className="text-lg">💬</span>
            <span className="text-sm">Comment</span>
          </button>

          {/* Repost Button */}
          <button
            onClick={handleRepost}
            disabled={isSubmittingAction}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isReposted 
                ? "text-green-400 bg-green-900/20" 
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            }`}
          >
            <span className="text-lg">{isReposted ? "🔄" : "📤"}</span>
            <span className="text-sm">Repost</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSubmittingAction}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isSaved 
                ? "text-yellow-400 bg-yellow-900/20" 
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            }`}
          >
            <span className="text-lg">{isSaved ? "🔖" : "📌"}</span>
            <span className="text-sm">Save</span>
          </button>
        </div>

        {/* Share Button */}
        <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
          <span className="text-lg">📤</span>
          <span className="text-sm">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-zinc-800 pt-4 space-y-4">
          {/* Comment Form */}
          {user && (
            <form onSubmit={handleComment} className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                  {user.profilePic ? (
                    <img 
                      src={user.profilePic} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-zinc-300 text-xs font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-400 resize-none"
                    rows={2}
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      type="submit"
                      disabled={isSubmittingComment || !commentText.trim()}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSubmittingComment ? "Posting..." : "Comment"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-3">
            {/* This would be populated with actual comments */}
            <div className="text-center text-zinc-400 text-sm py-4">
              No comments yet. Be the first to comment!
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 