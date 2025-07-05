"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "../providers/SessionProvider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { MessageSquare } from "lucide-react"

interface Chat {
  id: string
  name?: string
  type: "DIRECT" | "GROUP"
  participants: {
    user: {
      id: string
      name: string
      username: string
      profilePic?: string
    }
  }[]
  messages: {
    id: string
    content: string
    createdAt: string
    sender: {
      id: string
      name: string
      username: string
    }
  }[]
  unread?: boolean
}

interface MessagesModalProps {
  isOpen: boolean
  onClose: () => void
  buttonRef: React.RefObject<HTMLButtonElement | null>
}

export default function MessagesModal({ isOpen, onClose, buttonRef }: MessagesModalProps) {
  const { user } = useSession()
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [isOpen, onClose, buttonRef])

  const fetchChats = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const response = await fetch("/api/messages/chats")
      const result = await response.json()
      if (result.success) {
        setChats(result.data)
      }
    } catch (error) {
      console.error("Fetch chats error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchChats()
    }
  }, [isOpen, user])

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true
    if (chat.type === "DIRECT") {
      const otherParticipant = chat.participants.find(p => p.user.id !== user?.id)
      return otherParticipant?.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             otherParticipant?.user.username.toLowerCase().includes(searchQuery.toLowerCase())
    } else {
      return chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
    }
  })

  const getOtherParticipant = (chat: Chat) => {
    if (chat.type === "DIRECT") {
      return chat.participants.find(p => p.user.id !== user?.id)?.user
    }
    return null
  }

  const getLastMessage = (chat: Chat) => {
    return chat.messages[0]
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}h ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-zinc-900 rounded-xl shadow-2xl z-50 border border-zinc-800"
      style={{ minWidth: 320, maxWidth: 360, height: 520 }}
      tabIndex={-1}
      role="menu"
      aria-label="Messages"
    >
      <div className="flex flex-col h-full">
        {/* Search Bar */}
        <div className="p-4 border-b border-zinc-800">
          <Input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-zinc-800 text-zinc-100 border-zinc-700 placeholder-zinc-500"
          />
        </div>
        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-zinc-400">Loading chats...</div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">No chats found</div>
          ) : (
            filteredChats.map(chat => {
              const other = getOtherParticipant(chat)
              const lastMsg = getLastMessage(chat)
              const isUnread = chat.unread // You may want to set this from your backend
              return (
                <div
                  key={chat.id}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-zinc-800 transition-colors hover:bg-zinc-800 relative"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={other?.profilePic || undefined} alt={other?.name || chat.name} />
                    <AvatarFallback>{other?.name?.[0] || chat.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium truncate ${isUnread ? "text-zinc-100" : "text-zinc-300"}`}>{other?.name || chat.name}</div>
                    <div className="text-xs text-zinc-400 truncate">{lastMsg?.content || "Messages and calls are secured with encryption."}</div>
                  </div>
                  <div className="flex flex-col items-end min-w-[48px]">
                    <div className="text-xs text-zinc-500 whitespace-nowrap">{lastMsg ? formatTime(lastMsg.createdAt) : null}</div>
                    {isUnread && <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
} 