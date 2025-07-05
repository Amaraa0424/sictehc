"use client"

import { useState } from "react"
import { useSession } from "../providers/SessionProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Settings, 
  LogOut, 
  Bookmark, 
  Users, 
  MessageSquare,
  Bell,
  X
} from "lucide-react"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, signOut } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
      onClose()
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md mx-4">
        <Card className="w-full">
          <CardHeader className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-8 w-8 p-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            <CardTitle className="text-center">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.profilePic || ""} alt={user.name} />
                <AvatarFallback>
                  {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
                {user.isVerified && (
                  <Badge variant="secondary" className="mt-1">
                    Verified
                  </Badge>
                )}
              </div>
            </div>

            {/* Academic Info */}
            {(user.program || user.university || user.year) && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Academic Info</h4>
                <div className="space-y-1 text-sm">
                  {user.program && <p>{user.program}</p>}
                  {user.university && <p>{user.university}</p>}
                  {user.year && <p>Year {user.year}</p>}
                </div>
              </div>
            )}

            {/* Bio */}
            {user.bio && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Bio</h4>
                <p className="text-sm">{user.bio}</p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Saved Posts
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  My Clubs
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
              </div>
            </div>

            {/* Sign Out */}
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleSignOut}
              disabled={isLoading}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoading ? "Signing out..." : "Sign Out"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 