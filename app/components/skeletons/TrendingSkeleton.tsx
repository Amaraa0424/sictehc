export default function TrendingSkeleton() {
  return (
    <div className="sticky top-4 space-y-6">
      {/* Trending Topics Skeleton */}
      <div className="bg-zinc-900 rounded-lg p-4">
        <div className="h-4 w-28 bg-zinc-800 rounded animate-pulse mb-3"></div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between px-2 py-1">
              <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse"></div>
              <div className="h-3 w-8 bg-zinc-800 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Who to Follow Skeleton */}
      <div className="bg-zinc-900 rounded-lg p-4">
        <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse mb-3"></div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse"></div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse"></div>
                  <div className="h-3 w-8 bg-zinc-800 rounded animate-pulse"></div>
                </div>
                <div className="h-3 w-12 bg-zinc-800 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-24 bg-zinc-800 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events Skeleton */}
      <div className="bg-zinc-900 rounded-lg p-4">
        <div className="h-4 w-28 bg-zinc-800 rounded animate-pulse mb-3"></div>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="p-3 bg-zinc-800 rounded-lg">
              <div className="h-3 w-32 bg-zinc-700 rounded animate-pulse mb-1"></div>
              <div className="space-y-1">
                <div className="h-2 w-24 bg-zinc-700 rounded animate-pulse"></div>
                <div className="h-2 w-20 bg-zinc-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 