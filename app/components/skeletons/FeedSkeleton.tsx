export default function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {/* Feed Header Skeleton */}
      <div className="bg-zinc-900 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-zinc-800 rounded animate-pulse"></div>
          <div className="flex items-center space-x-3">
            <div className="h-8 w-32 bg-zinc-800 rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-zinc-800 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Create Post Skeleton */}
      <div className="bg-zinc-900 rounded-lg p-4 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse mb-1"></div>
            <div className="h-3 w-32 bg-zinc-800 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="h-20 bg-zinc-800 rounded animate-pulse"></div>
        <div className="flex justify-between">
          <div className="h-8 w-24 bg-zinc-800 rounded animate-pulse"></div>
          <div className="h-8 w-16 bg-zinc-800 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Post Skeletons */}
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-zinc-900 rounded-lg p-4 space-y-4">
          {/* Post Header */}
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse"></div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse"></div>
                <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse"></div>
                <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse"></div>
              </div>
              <div className="h-3 w-32 bg-zinc-800 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Post Content */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-zinc-800 rounded animate-pulse"></div>
            <div className="h-4 w-3/4 bg-zinc-800 rounded animate-pulse"></div>
            <div className="h-4 w-1/2 bg-zinc-800 rounded animate-pulse"></div>
          </div>

          {/* Post Stats */}
          <div className="flex items-center space-x-4 pt-3 border-t border-zinc-800">
            <div className="h-3 w-12 bg-zinc-800 rounded animate-pulse"></div>
            <div className="h-3 w-12 bg-zinc-800 rounded animate-pulse"></div>
            <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse"></div>
            <div className="h-3 w-14 bg-zinc-800 rounded animate-pulse"></div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            <div className="flex items-center space-x-6">
              <div className="h-8 w-16 bg-zinc-800 rounded animate-pulse"></div>
              <div className="h-8 w-20 bg-zinc-800 rounded animate-pulse"></div>
              <div className="h-8 w-16 bg-zinc-800 rounded animate-pulse"></div>
              <div className="h-8 w-12 bg-zinc-800 rounded animate-pulse"></div>
            </div>
            <div className="h-8 w-12 bg-zinc-800 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  )
} 