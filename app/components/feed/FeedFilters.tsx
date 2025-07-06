"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"

interface FeedFiltersProps {
  search: string
  tags: string[]
  onRefresh?: () => void
}

export default function FeedFilters({ search, tags, onRefresh }: FeedFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [localSearch, setLocalSearch] = useState(search)
  const [sortBy, setSortBy] = useState("latest")

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams)
    if (localSearch.trim()) {
      params.set("search", localSearch.trim())
    } else {
      params.delete("search")
    }
    params.delete("page") // Reset to first page
    router.push(`/?${params.toString()}`)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    const params = new URLSearchParams(searchParams)
    params.set("sort", value)
    params.delete("page") // Reset to first page
    router.push(`/?${params.toString()}`)
  }

  const clearFilters = () => {
    setLocalSearch("")
    setSortBy("latest")
    router.push("/")
  }

  const hasActiveFilters = search || tags.length > 0

  return (
    <div className="flex items-center space-x-3">
      {/* Search Input */}
      <div className="relative">
        <Input
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search posts..."
          className="w-48 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-400"
        />
        <button
          onClick={handleSearch}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-100"
        >
          🔍
        </button>
      </div>

      {/* Sort Dropdown */}
      <Select value={sortBy} onValueChange={handleSortChange}>
        <SelectTrigger className="w-32 bg-zinc-800 border-zinc-700 text-zinc-100">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
          <SelectItem value="latest">Latest</SelectItem>
          <SelectItem value="popular">Popular</SelectItem>
          <SelectItem value="trending">Trending</SelectItem>
          <SelectItem value="oldest">Oldest</SelectItem>
        </SelectContent>
      </Select>

      {/* Active Tags */}
      {tags.length > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-zinc-400 text-sm">Tags:</span>
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-600 text-white"
            >
              #{tag}
              <button
                onClick={() => {
                  const newTags = tags.filter(t => t !== tag)
                  const params = new URLSearchParams(searchParams)
                  if (newTags.length > 0) {
                    params.set("tags", newTags.join(","))
                  } else {
                    params.delete("tags")
                  }
                  params.delete("page")
                  router.push(`/?${params.toString()}`)
                }}
                className="ml-1 hover:text-red-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          onClick={clearFilters}
          variant="ghost"
          size="sm"
          className="text-zinc-400 hover:text-zinc-100"
        >
          Clear
        </Button>
      )}
      {/* Refresh Button */}
      <Button
        onClick={onRefresh}
        variant="secondary"
        size="sm"
        className="flex items-center gap-1"
        aria-label="Refresh posts"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.5 19A9 9 0 1 1 19 5.5" /></svg>
        Refresh
      </Button>
    </div>
  )
} 