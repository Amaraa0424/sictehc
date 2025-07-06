"use client"

import { useState, useEffect } from "react"
import { useSession } from "./components/providers/SessionProvider"
import FeedLayout from "./components/layout/FeedLayout"
import FeedSkeleton from "./components/skeletons/FeedSkeleton"
import FeedFilters from "./components/feed/FeedFilters"
import CreatePostCard from "./components/feed/CreatePostCard"
import PostCard from "./components/feed/PostCard"
import Pagination from "./components/feed/Pagination"
import LoginForm from "./components/auth/LoginForm"
import RegisterForm from "./components/auth/RegisterForm"
import { Card } from "../components/ui/card"

export default function HomePage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const { user, loading } = useSession()
  const [posts, setPosts] = useState<any[]>([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [postsError, setPostsError] = useState("")

  const fetchPosts = () => {
    if (user) {
      setPostsLoading(true)
      fetch("/api/posts?page=1&limit=10")
        .then(res => res.json())
        .then(result => {
          if (result.success && result.data) {
            setPosts(result.data.posts)
          } else {
            setPostsError(result.error || "Failed to fetch posts")
          }
        })
        .catch(() => setPostsError("Failed to fetch posts"))
        .finally(() => setPostsLoading(false))
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <FeedSkeleton />
      </div>
    )
  }

  if (user) {
    // Render main feed/dashboard for authenticated users
    return (
      <FeedLayout user={user}>
        <div className="flex-1 space-y-6">
          <CreatePostCard user={user} />
          <FeedFilters search="" tags={[]} onRefresh={fetchPosts} />
          {postsLoading ? (
            <FeedSkeleton />
          ) : postsError ? (
            <div className="text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-4">{postsError}</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">No posts yet. Be the first to share your research!</div>
          ) : (
            posts.map(post => <PostCard key={post.id} post={post} user={user} />)
          )}
        </div>
      </FeedLayout>
    )
  }

  // Not logged in: show login/register
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <Card className="w-full max-w-md p-0 shadow-2xl border border-zinc-800 bg-zinc-900 rounded-2xl">
        <div className="flex justify-center pt-6 pb-2 gap-2">
          <button
            className={`px-6 py-2 rounded-full font-semibold transition-colors focus:outline-none text-sm ${tab === 'login' ? 'bg-blue-600 text-white shadow' : 'bg-zinc-800 text-blue-400 hover:bg-zinc-700'}`}
            onClick={() => setTab('login')}
            type="button"
          >
            Login
          </button>
          <button
            className={`px-6 py-2 rounded-full font-semibold transition-colors focus:outline-none text-sm ${tab === 'register' ? 'bg-blue-600 text-white shadow' : 'bg-zinc-800 text-blue-400 hover:bg-zinc-700'}`}
            onClick={() => setTab('register')}
            type="button"
          >
            Register
          </button>
        </div>
        <div className="px-8 pb-8 pt-2">
          {tab === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>
      </Card>
    </div>
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
          {/* <UserSuggestion 
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
          /> */}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-zinc-900 rounded-lg p-4">
        <h3 className="text-zinc-100 font-semibold mb-3">Upcoming Events</h3>
        <div className="space-y-3">
          {/* <EventCard 
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
          /> */}
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
      className="flex items-center space-x-2 px-2 py-1 rounded text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
    >
      <span className="text-sm font-medium">#{tag.replace(/-/g, ' ')}</span>
      <span className="ml-auto text-xs bg-zinc-800 rounded px-2 py-0.5 text-zinc-400">{count}</span>
    </a>
  )
}