import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { getCurrentUser } from "@/app/lib/auth.server"
import { getUserProfile } from "@/app/lib/actions/users"
import { getPosts } from "@/app/lib/actions/posts"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import PostCard from "@/app/components/feed/PostCard"

interface UserPageProps {
  params: { username: string }
}

export default async function UserPage({ params }: UserPageProps) {
  const currentUser = await getCurrentUser(cookies().toString())
  const profileUser = await getUserProfile(params.username)
  if (!profileUser) return notFound()
  const { data } = await getPosts({ userId: profileUser.id })
  const posts = data?.posts || []
  const isOwner = currentUser && currentUser.id === profileUser.id

  return (
    <div className="bg-zinc-900 min-h-screen">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="flex items-center gap-6 mb-8">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profileUser.profilePic || undefined} alt={profileUser.name} />
            <AvatarFallback>{profileUser.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-zinc-100 truncate">{profileUser.name}</h1>
              {profileUser.isVerified && <Badge className="bg-blue-600 text-white">Verified</Badge>}
            </div>
            <div className="text-zinc-400 text-sm">@{profileUser.username}</div>
            <div className="mt-2 text-zinc-300 text-sm">
              {profileUser.program && <span>{profileUser.program} </span>}
              {profileUser.university && <span>· {profileUser.university} </span>}
              {profileUser.year && <span>· Year {profileUser.year}</span>}
            </div>
            {profileUser.bio && <div className="mt-2 text-zinc-200 text-sm">{profileUser.bio}</div>}
          </div>
          {isOwner && (
            <Button variant="outline" className="h-10">Edit Profile</Button>
          )}
        </div>
        {/* Posts List */}
        <div className="grid gap-6">
          {posts.length === 0 ? (
            <div className="text-zinc-400 text-center py-12">No posts yet.</div>
          ) : (
            posts.map((post: any) => (
              <PostCard key={post.id} post={post} user={currentUser} />
            ))
          )}
        </div>
      </div>
    </div>
  )
} 