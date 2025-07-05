"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "../../../components/ui/button"

interface PaginationProps {
  pagination: {
    page: number
    pages: number
    total: number
    limit: number
  }
}

export default function Pagination({ pagination }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { page, pages, total, limit } = pagination

  const navigateToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    router.push(`/?${params.toString()}`)
  }

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) {
      range.push(i)
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (page + delta < pages - 1) {
      rangeWithDots.push("...", pages)
    } else if (pages > 1) {
      rangeWithDots.push(pages)
    }

    return rangeWithDots
  }

  if (pages <= 1) return null

  return (
    <div className="flex items-center justify-between bg-zinc-900 rounded-lg p-4">
      {/* Results Info */}
      <div className="text-sm text-zinc-400">
        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-2">
        {/* Previous Button */}
        <Button
          onClick={() => navigateToPage(page - 1)}
          disabled={page <= 1}
          variant="outline"
          size="sm"
          className="bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700 disabled:opacity-50"
        >
          ← Previous
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {getVisiblePages().map((pageNum, index) => (
            <div key={index}>
              {pageNum === "..." ? (
                <span className="px-3 py-2 text-zinc-400">...</span>
              ) : (
                <Button
                  onClick={() => navigateToPage(pageNum as number)}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  className={
                    page === pageNum
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700"
                  }
                >
                  {pageNum}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Next Button */}
        <Button
          onClick={() => navigateToPage(page + 1)}
          disabled={page >= pages}
          variant="outline"
          size="sm"
          className="bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700 disabled:opacity-50"
        >
          Next →
        </Button>
      </div>
    </div>
  )
} 