"use client"

import { useState, useRef } from "react"
import { Button } from "../../../components/ui/button"
import { Textarea } from "../../../components/ui/textarea"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"

interface CreatePostCardProps {
  user: any
}

export default function CreatePostCard({ user }: CreatePostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    content: "",
    title: "",
    abstract: "",
    mediaType: "TEXT",
    visibility: "PUBLIC",
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState("")
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Mock post creation for now
      console.log("Creating post:", formData)
      
      // Reset form
      setFormData({
        content: "",
        title: "",
        abstract: "",
        mediaType: "TEXT",
        visibility: "PUBLIC",
        tags: [],
      })
      setIsExpanded(false)
      setTagInput("")
      
      alert("Post created successfully! (Mock)")
    } catch (error) {
      console.error("Create post error:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="bg-zinc-900 rounded-lg p-4">
      {/* User Info */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
          {user.profilePic ? (
            <img 
              src={user.profilePic} 
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-zinc-300 font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-zinc-100 font-medium">{user.name}</p>
          <p className="text-zinc-400 text-sm">@{user.username}</p>
        </div>
      </div>

      {/* Post Form */}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Content */}
        <div>
          <Textarea
            placeholder="Share your research, thoughts, or academic insights..."
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-400 resize-none"
            rows={3}
            required
          />
        </div>

        {/* Expandable Advanced Options */}
        {isExpanded && (
          <div className="space-y-4 border-t border-zinc-800 pt-4">
            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-zinc-300">Title (optional)</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                placeholder="Post title..."
              />
            </div>

            {/* Abstract */}
            <div>
              <Label htmlFor="abstract" className="text-zinc-300">Abstract (optional)</Label>
              <Textarea
                id="abstract"
                value={formData.abstract}
                onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 resize-none"
                rows={2}
                placeholder="Brief summary..."
              />
            </div>

            {/* Media Type */}
            <div>
              <Label htmlFor="mediaType" className="text-zinc-300">Media Type</Label>
              <Select 
                value={formData.mediaType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, mediaType: value }))}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
                  <SelectItem value="TEXT">Text Only</SelectItem>
                  <SelectItem value="IMAGE">Image</SelectItem>
                  <SelectItem value="VIDEO">Video</SelectItem>
                  <SelectItem value="PDF">PDF Document</SelectItem>
                  <SelectItem value="DOCUMENT">Other Document</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Visibility */}
            <div>
              <Label htmlFor="visibility" className="text-zinc-300">Visibility</Label>
              <Select 
                value={formData.visibility} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value }))}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="PRIVATE">Private</SelectItem>
                  <SelectItem value="CLUB_ONLY">Club Members Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags" className="text-zinc-300">Tags</Label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    placeholder="Add tags..."
                  />
                  <Button 
                    type="button" 
                    onClick={addTag}
                    variant="outline"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700"
                  >
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-600 text-white"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-zinc-400 hover:text-zinc-100"
            >
              {isExpanded ? "Hide Options" : "Advanced Options"}
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsExpanded(false)}
              className="text-zinc-400 hover:text-zinc-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.content.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
} 