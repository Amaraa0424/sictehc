"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "./components/providers/SessionProvider"
import FeedLayout from "./components/layout/FeedLayout"
import FeedSkeleton from "./components/skeletons/FeedSkeleton"
import SidebarSkeleton from "./components/skeletons/SidebarSkeleton"
import TrendingSkeleton from "./components/skeletons/TrendingSkeleton"
import FeedFilters from "./components/feed/FeedFilters"
import CreatePostCard from "./components/feed/CreatePostCard"
import PostCard from "./components/feed/PostCard"
import Pagination from "./components/feed/Pagination"
import FollowButton from "./components/feed/FollowButton"

export default function HomePage() {
  const { user, loading } = useSession()
  const searchParams = useSearchParams()
  
  console.log('HomePage - User:', user ? 'Found' : 'Not found', 'Loading:', loading)
  
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-100">Loading...</div>
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-100">Please log in to continue.</div>
      </div>
    )
  }

  const page = parseInt(searchParams.get('page') || "1")
  const search = searchParams.get('search') || ""
  const tags = searchParams.get('tags') ? searchParams.get('tags')!.split(",") : []

  // Mock posts data
  const posts = [
    {
      id: "1",
      content: "Just published my research on machine learning algorithms for natural language processing. The results show significant improvements in accuracy compared to existing methods.",
      title: "Advances in NLP: A Comparative Study",
      abstract: "This paper presents a comprehensive analysis of modern NLP techniques and their applications in real-world scenarios.",
      author: {
        id: "1",
        name: "John Doe",
        username: "johndoe",
        profilePic: null
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      visibility: "PUBLIC",
      mediaType: "TEXT",
      mediaUrls: [],
      tags: ["machine-learning", "nlp", "research"],
      _count: {
        likes: 42,
        comments: 8,
        reposts: 12,
        views: 156
      }
    },
    {
      id: "2",
      content: "Excited to share our findings on blockchain technology in academic environments. The potential for secure, transparent record-keeping is enormous!",
      title: "Blockchain in Academia",
      abstract: "Exploring the applications of blockchain technology for academic credential verification and research collaboration.",
      author: {
        id: "2",
        name: "Jane Smith",
        username: "janesmith",
        profilePic: null
      },
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      visibility: "PUBLIC",
      mediaType: "TEXT",
      mediaUrls: [],
      tags: ["blockchain", "academia", "technology"],
      _count: {
        likes: 28,
        comments: 15,
        reposts: 7,
        views: 89
      }
    }
  ]

  const pagination = {
    page,
    pages: 1,
    total: posts.length,
    limit: 10
  }

  return (
    <FeedLayout user={user}>
      {/* Left Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <Suspense fallback={<SidebarSkeleton />}>
          <Sidebar user={user} />
        </Suspense>
      </aside>

      {/* Main Feed */}
      <main className="flex-1 max-w-2xl mx-auto">
        <Suspense fallback={<FeedSkeleton />}>
          <Feed 
            user={user}
            posts={posts}
            pagination={pagination}
            page={page}
            search={search}
            tags={tags}
          />
        </Suspense>
      </main>

      {/* Right Sidebar - Trending */}
      <aside className="hidden xl:block w-80 shrink-0">
        <Suspense fallback={<TrendingSkeleton />}>
          <TrendingSidebar user={user} />
        </Suspense>
      </aside>
    </FeedLayout>
  )
}

// Sidebar Component
function Sidebar({ user }: { user: any }) {
  const userClubs: any[] = [] // Mock data

  return (
    <div className="sticky top-4 space-y-6">
      {/* Navigation */}
      <nav className="space-y-2">
        <SidebarLink href="/" icon="🏠" label="Home" active />
        <SidebarLink href="/explore" icon="🔍" label="Explore" />
        <SidebarLink href="/notifications" icon="🔔" label="Notifications" />
        <SidebarLink href="/messages" icon="💬" label="Messages" />
        <SidebarLink href="/saved" icon="🔖" label="Saved" />
      </nav>

      {/* User Profile */}
      {user && (
        <div className="bg-zinc-900 rounded-lg p-4">
          <div className="flex items-center space-x-3">
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
            <div className="flex-1 min-w-0">
              <p className="text-zinc-100 font-medium truncate">{user.name}</p>
              <p className="text-zinc-400 text-sm truncate">@{user.username}</p>
            </div>
          </div>
        </div>
      )}

      {/* User Clubs */}
      {userClubs.length > 0 && (
        <div className="bg-zinc-900 rounded-lg p-4">
          <h3 className="text-zinc-100 font-semibold mb-3">Your Clubs</h3>
          <div className="space-y-2">
            {userClubs.slice(0, 5).map((club: any) => (
              <ClubLink key={club.id} club={club} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-zinc-900 rounded-lg p-4">
        <h3 className="text-zinc-100 font-semibold mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <QuickActionButton 
            href="/posts/new" 
            icon="✏️" 
            label="Create Post" 
            primary 
          />
          <QuickActionButton 
            href="/clubs/new" 
            icon="🏛️" 
            label="Create Club" 
          />
        </div>
      </div>
    </div>
  )
}

// Feed Component
function Feed({ 
  user, 
  posts,
  pagination,
  page, 
  search, 
  tags 
}: { 
  user: any
  posts: any[]
  pagination: any
  page: number
  search: string
  tags: string[]
}) {
  return (
    <div className="space-y-6">
      {/* Feed Header */}
      <div className="bg-zinc-900 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-100">Academic Feed</h1>
          <FeedFilters search={search} tags={tags} />
        </div>
      </div>

      {/* Create Post */}
      {user && (
        <CreatePostCard user={user} />
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post: any) => (
          <PostCard key={post.id} post={post} user={user} />
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Pagination pagination={pagination} />
      )}
    </div>
  )
}

// Trending Sidebar Component
function TrendingSidebar({ user }: { user: any }) {
  return (
    <div className="sticky top-4 space-y-6">
      {/* Trending Topics */}
      <div className="bg-zinc-900 rounded-lg p-4">
        <h3 className="text-zinc-100 font-semibold mb-3">Trending Topics</h3>
        <div className="space-y-2">
          <TrendingTopic tag="machine-learning" count={1234} />
          <TrendingTopic tag="blockchain" count={856} />
          <TrendingTopic tag="artificial-intelligence" count={2341} />
          <TrendingTopic tag="cybersecurity" count={567} />
          <TrendingTopic tag="data-science" count={1892} />
        </div>
      </div>

      {/* Who to Follow */}
      <div className="bg-zinc-900 rounded-lg p-4">
        <h3 className="text-zinc-100 font-semibold mb-3">Who to Follow</h3>
        <div className="space-y-3">
          <UserSuggestion 
            id="1"
            name="Dr. Sarah Chen"
            username="sarahchen"
            bio="AI Researcher at Stanford"
            profilePic=""
          />
          <UserSuggestion 
            id="2"
            name="Prof. Michael Rodriguez"
            username="mrodriguez"
            bio="Computer Science Professor"
            profilePic=""
          />
          <UserSuggestion 
            id="3"
            name="Alex Thompson"
            username="alexthompson"
            bio="PhD Student in ML"
            profilePic=""
          />
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-zinc-900 rounded-lg p-4">
        <h3 className="text-zinc-100 font-semibold mb-3">Upcoming Events</h3>
        <div className="space-y-3">
          <EventCard 
            title="AI Research Symposium"
            date="Dec 15, 2024"
            time="2:00 PM"
            location="Virtual"
          />
          <EventCard 
            title="Blockchain Workshop"
            date="Dec 18, 2024"
            time="10:00 AM"
            location="Room 301"
          />
        </div>
      </div>
    </div>
  )
}

// Reusable Components
function SidebarLink({ 
  href, 
  icon, 
  label, 
  active = false 
}: { 
  href: string
  icon: string
  label: string
  active?: boolean
}) {
  return (
    <a
      href={href}
      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
        active 
          ? "bg-zinc-800 text-zinc-100" 
          : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
    </a>
  )
}

function ClubLink({ club }: { club: any }) {
  return (
    <a
      href={`/clubs/${club.id}`}
      className="flex items-center space-x-2 px-2 py-1 rounded text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
    >
      <div className="w-6 h-6 rounded bg-zinc-700 flex items-center justify-center text-xs">
        {club.logo ? (
          <img src={club.logo} alt={club.name} className="w-6 h-6 rounded object-cover" />
        ) : (
          <span>🏛️</span>
        )}
      </div>
      <span className="text-sm truncate">{club.name}</span>
    </a>
  )
}

function QuickActionButton({ 
  href, 
  icon, 
  label, 
  primary = false 
}: { 
  href: string
  icon: string
  label: string
  primary?: boolean
}) {
  return (
    <a
      href={href}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
        primary
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
      }`}
    >
      <span>{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </a>
  )
}

function TrendingTopic({ tag, count }: { tag: string; count: number }) {
  return (
    <a
      href={`/?tags=${tag}`}
      className="flex items-center justify-between px-2 py-1 rounded text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
    >
      <span className="text-sm">#{tag}</span>
      <span className="text-xs text-zinc-500">{count.toLocaleString()}</span>
    </a>
  )
}

function UserSuggestion({ 
  id, 
  name, 
  username, 
  bio, 
  profilePic 
}: { 
  id: string
  name: string
  username: string
  bio: string
  profilePic: string
}) {
  return (
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-300">
        {profilePic ? (
          <img src={profilePic} alt={name} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <span>{name.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <a href={`/users/${username}`} className="text-zinc-100 font-medium text-sm hover:underline">
            {name}
          </a>
          <FollowButton userId={id} />
        </div>
        <p className="text-zinc-400 text-xs truncate">@{username}</p>
        <p className="text-zinc-400 text-xs mt-1 line-clamp-2">{bio}</p>
      </div>
    </div>
  )
}

function EventCard({ 
  title, 
  date, 
  time, 
  location 
}: { 
  title: string
  date: string
  time: string
  location: string
}) {
  return (
    <div className="p-3 bg-zinc-800 rounded-lg">
      <h4 className="text-zinc-100 font-medium text-sm mb-1">{title}</h4>
      <div className="text-zinc-400 text-xs space-y-1">
        <p>📅 {date} at {time}</p>
        <p>📍 {location}</p>
      </div>
    </div>
  )
}