export default function SidebarSkeleton() {
  return (
    <div className="sticky top-4 space-y-6">
      {/* Navigation Skeleton */}
      <nav className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-3 px-3 py-2">
            <div className="w-6 h-6 bg-zinc-800 rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-zinc-800 rounded animate-pulse"></div>
          </div>
        ))}
      </nav>

      {/* User Profile Skeleton */}
      <div className="bg-zinc-900 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse mb-1"></div>
            <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* User Clubs Skeleton */}
      <div className="bg-zinc-900 rounded-lg p-4">
        <div className="h-4 w-20 bg-zinc-800 rounded animate-pulse mb-3"></div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-2 px-2 py-1">
              <div className="w-6 h-6 bg-zinc-800 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="bg-zinc-900 rounded-lg p-4">
        <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse mb-3"></div>
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-2 px-3 py-2">
              <div className="w-4 h-4 bg-zinc-800 rounded animate-pulse"></div>
              <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 