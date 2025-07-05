// User types
export interface User {
  id: string
  email: string
  name: string
  username: string
  program?: string
  year?: number
  university?: string
  bio?: string
  profilePic?: string
  isVerified: boolean
  isPrivate: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile extends Omit<User, 'password'> {
  followersCount: number
  followingCount: number
  postsCount: number
}

// Post types
export interface Post {
  id: string
  authorId: string
  content: string
  title?: string
  abstract?: string
  mediaUrls: string[]
  mediaType: MediaType
  tags: string[]
  isPublished: boolean
  visibility: Visibility
  viewCount: number
  createdAt: Date
  updatedAt: Date
  author: User
  _count?: {
    comments: number
    likes: number
    reposts: number
  }
  isLiked?: boolean
  isReposted?: boolean
  isSaved?: boolean
}

export interface PostWithInteractions extends Post {
  comments: Comment[]
  likes: Like[]
  reposts: Repost[]
}

// Comment types
export interface Comment {
  id: string
  postId: string
  authorId: string
  content: string
  parentId?: string
  createdAt: Date
  updatedAt: Date
  author: User
  parent?: Comment
  replies: Comment[]
  _count?: {
    likes: number
  }
  isLiked?: boolean
}

// Like types
export interface Like {
  id: string
  postId: string
  userId: string
  createdAt: Date
  user: User
}

export interface CommentLike {
  id: string
  commentId: string
  userId: string
  createdAt: Date
}

// Repost types
export interface Repost {
  id: string
  postId: string
  userId: string
  createdAt: Date
  user: User
}

// Follow types
export interface Follow {
  id: string
  followerId: string
  followingId: string
  createdAt: Date
  follower: User
  following: User
}

// Club types
export interface Club {
  id: string
  name: string
  description: string
  category: string
  logo?: string
  banner?: string
  isActive: boolean
  isPrivate: boolean
  createdAt: Date
  updatedAt: Date
  _count?: {
    members: number
    posts: number
    events: number
  }
  userRole?: ClubRoleType
}

export interface ClubMember {
  id: string
  clubId: string
  userId: string
  role: ClubRoleType
  joinedAt: Date
  user: User
  club: Club
}

export interface ClubRole {
  id: string
  clubId: string
  userId: string
  role: ClubRoleType
  createdAt: Date
}

export interface ClubPost {
  id: string
  clubId: string
  authorId: string
  title: string
  content: string
  mediaUrls: string[]
  isAnnouncement: boolean
  createdAt: Date
  updatedAt: Date
  club: Club
}

export interface ClubEvent {
  id: string
  clubId: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  location?: string
  isOnline: boolean
  meetingUrl?: string
  createdAt: Date
  updatedAt: Date
  club: Club
}

// Chat types
export interface Chat {
  id: string
  name?: string
  isGroup: boolean
  createdAt: Date
  updatedAt: Date
  participants: ChatParticipant[]
  messages: Message[]
  lastMessage?: Message
  unreadCount?: number
}

export interface ChatParticipant {
  id: string
  chatId: string
  userId: string
  joinedAt: Date
  leftAt?: Date
  user: User
  chat: Chat
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  content: string
  mediaUrl?: string
  mediaType?: MediaType
  isRead: boolean
  readAt?: Date
  createdAt: Date
  sender: User
  chat: Chat
}

// Notification types
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  isRead: boolean
  readAt?: Date
  createdAt: Date
}

// User tag types
export interface UserTag {
  id: string
  userId: string
  tag: string
  createdAt: Date
}

// Saved post types
export interface SavedPost {
  id: string
  userId: string
  postId: string
  createdAt: Date
  post: Post
}

// Enums
export enum MediaType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  PDF = 'PDF',
  DOCUMENT = 'DOCUMENT'
}

export enum Visibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  CLUB_ONLY = 'CLUB_ONLY'
}

export enum ClubRoleType {
  PRESIDENT = 'PRESIDENT',
  SECRETARY = 'SECRETARY',
  MEMBER = 'MEMBER'
}

export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  REPOST = 'REPOST',
  FOLLOW = 'FOLLOW',
  MESSAGE = 'MESSAGE',
  CLUB_INVITE = 'CLUB_INVITE',
  CLUB_ANNOUNCEMENT = 'CLUB_ANNOUNCEMENT',
  EVENT_REMINDER = 'EVENT_REMINDER'
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Form types
export interface SignUpFormData {
  name: string
  email: string
  username: string
  password: string
  confirmPassword: string
  major?: string
  year?: number
  university?: string
}

export interface SignInFormData {
  email: string
  password: string
}

export interface CreatePostFormData {
  content: string
  title?: string
  abstract?: string
  mediaFiles?: File[]
  tags: string[]
  visibility: Visibility
}

export interface CreateClubFormData {
  name: string
  description: string
  category: string
  logo?: File
  banner?: File
  isPrivate: boolean
}

export interface UpdateProfileFormData {
  name: string
  username: string
  bio?: string
  program?: string
  year?: number
  university?: string
  profilePic?: File
  isPrivate: boolean
}

// Socket event types
export interface SocketEvents {
  // Connection events
  'user:connect': { userId: string }
  'user:disconnect': { userId: string }
  
  // Post events
  'post:create': Post
  'post:update': Post
  'post:delete': { postId: string }
  'post:like': { postId: string; userId: string }
  'post:unlike': { postId: string; userId: string }
  'post:comment': Comment
  'post:repost': Repost
  
  // Chat events
  'chat:message': Message
  'chat:typing': { chatId: string; userId: string; isTyping: boolean }
  'chat:read': { chatId: string; userId: string; messageIds: string[] }
  
  // Notification events
  'notification:new': Notification
  
  // Club events
  'club:join': ClubMember
  'club:leave': { clubId: string; userId: string }
  'club:post': ClubPost
  'club:event': ClubEvent
}

// Search types
export interface SearchFilters {
  query?: string
  type?: 'posts' | 'users' | 'clubs'
  tags?: string[]
  category?: string
  dateRange?: {
    start: Date
    end: Date
  }
  sortBy?: 'relevance' | 'date' | 'popularity'
}

// Real-time types
export interface TypingIndicator {
  chatId: string
  userId: string
  username: string
  isTyping: boolean
}

export interface OnlineStatus {
  userId: string
  isOnline: boolean
  lastSeen?: Date
} 