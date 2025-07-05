"use client"

import { useState, useEffect } from "react"
import { useSession } from "../providers/SessionProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  MessageSquare, 
  Send, 
  Search,
  Users,
  Plus,
  X,
  MoreVertical
} from "lucide-react"

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
  _count: {
    messages: number
  }
}

interface MessagesModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function MessagesModal({ isOpen, onClose }: MessagesModalProps) {
  const { user } = useSession()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

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

  const fetchMessages = async (chatId: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/messages/${chatId}`)
      const result = await response.json()
      
      if (result.success) {
        setMessages(result.data.messages)
      }
    } catch (error) {
      console.error("Fetch messages error:", error)
    }
  }

  const sendMessage = async (chatId: string, content: string) => {
    if (!content.trim() || !user) return

    try {
      const formData = new FormData()
      formData.append("content", content)

      const response = await fetch(`/api/messages/${chatId}`, {
        method: "POST",
        body: formData,
      })
      
      if (response.ok) {
        setNewMessage("")
        fetchMessages(chatId)
        fetchChats() // Refresh chat list to update last message
      }
    } catch (error) {
      console.error("Send message error:", error)
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedChat && newMessage.trim()) {
      sendMessage(selectedChat.id, newMessage)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchChats()
    }
  }, [isOpen, user])

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id)
    }
  }, [selectedChat])

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
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-4xl mx-4 h-[80vh]">
        <Card className="w-full h-full flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex gap-4 p-0">
            {/* Chat List */}
            <div className="w-80 border-r flex flex-col">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading chats...</p>
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No conversations yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start a conversation to see messages here
                    </p>
                  </div>
                ) : (
                  filteredChats.map((chat) => {
                    const otherUser = getOtherParticipant(chat)
                    const lastMessage = getLastMessage(chat)
                    const unreadCount = chat._count.messages

                    return (
                      <div
                        key={chat.id}
                        className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedChat?.id === chat.id ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedChat(chat)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={chat.type === "DIRECT" ? otherUser?.profilePic : ""} 
                              alt={chat.type === "DIRECT" ? otherUser?.name : chat.name} 
                            />
                            <AvatarFallback>
                              {chat.type === "DIRECT" 
                                ? otherUser?.name.split(" ").map(n => n[0]).join("").toUpperCase()
                                : chat.name?.split(" ").map(n => n[0]).join("").toUpperCase()
                              }
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm truncate">
                                {chat.type === "DIRECT" ? otherUser?.name : chat.name}
                              </p>
                              {lastMessage && (
                                <p className="text-xs text-muted-foreground">
                                  {formatTime(lastMessage.createdAt)}
                                </p>
                              )}
                            </div>
                            {lastMessage && (
                              <p className="text-sm text-muted-foreground truncate">
                                {lastMessage.sender.id === user?.id ? "You: " : ""}
                                {lastMessage.content}
                              </p>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={getOtherParticipant(selectedChat)?.profilePic} 
                          alt={getOtherParticipant(selectedChat)?.name} 
                        />
                        <AvatarFallback>
                          {getOtherParticipant(selectedChat)?.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {selectedChat.type === "DIRECT" 
                            ? getOtherParticipant(selectedChat)?.name 
                            : selectedChat.name
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedChat.type === "DIRECT" 
                            ? `@${getOtherParticipant(selectedChat)?.username}`
                            : `${selectedChat.participants.length} members`
                          }
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender.id === user?.id ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender.id === user?.id
                            ? "bg-blue-500 text-white"
                            : "bg-muted"
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender.id === user?.id ? "text-blue-100" : "text-muted-foreground"
                          }`}>
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" size="sm" disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a conversation</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose a chat to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 