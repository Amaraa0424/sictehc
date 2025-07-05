# UniConnect - Academic Social Media Platform

A real-time social media platform tailored for university students to share research, academic papers, and collaborate within campus clubs.

## 🚀 Features

### ✅ Implemented
- **Social Media Layout**: Complete three-column layout with sidebar, main feed, and trending sections
- **Responsive Design**: Mobile-first approach with bottom navigation for mobile devices
- **Post System**: Create, view, like, comment, repost, and save posts
- **User Interface**: Modern dark theme with zinc color palette
- **Real-time Framework**: WebSocket-ready architecture with simulated real-time updates
- **Component Library**: Reusable UI components using shadcn/ui
- **Authentication**: Login and registration system with Supabase

### 🔄 In Progress
- **Real-time Updates**: WebSocket integration for live interactions
- **File Upload**: Media upload for posts (images, PDFs, documents)
- **Search & Discovery**: Advanced search and filtering
- **Club Management**: Club creation and management features

### 📋 Planned
- **Chat System**: Real-time messaging between users
- **Notifications**: Push notifications for interactions
- **Analytics**: Post engagement and user analytics
- **Mobile App**: React Native companion app

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (Auth, Database, Storage)
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: WebSocket (simulated, ready for implementation)
- **Deployment**: Vercel

## 🏗️ Project Structure

```
app/
├── components/
│   ├── layout/
│   │   └── FeedLayout.tsx          # Main layout wrapper
│   ├── feed/
│   │   ├── CreatePostCard.tsx      # Post creation form
│   │   ├── PostCard.tsx            # Individual post display
│   │   ├── FeedFilters.tsx         # Search and filtering
│   │   ├── Pagination.tsx          # Page navigation
│   │   └── FollowButton.tsx        # User follow functionality
│   ├── navigation/
│   │   └── MobileNav.tsx           # Mobile navigation
│   ├── realtime/
│   │   └── RealtimeProvider.tsx    # WebSocket provider
│   └── skeletons/                  # Loading state components
├── hooks/
│   └── useRealtimePosts.ts         # Real-time post updates
├── lib/
│   ├── actions/                    # Server actions
│   ├── auth.ts                     # Authentication utilities
│   └── prisma.ts                   # Database client
└── page.tsx                        # Main feed page
```

## 🎯 Key Components

### FeedLayout
- Three-column responsive layout
- Sticky header with search and navigation
- Mobile bottom navigation
- Real-time provider integration

### CreatePostCard
- Rich text editor with advanced options
- Tag management system
- Media type selection
- Visibility controls

### PostCard
- Complete post display with interactions
- Like, comment, repost, save functionality
- Media rendering (images, videos, documents)
- Real-time interaction feedback

### Real-time System
- WebSocket-ready architecture
- Event-driven updates
- Optimistic UI updates
- Fallback to simulated updates

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Configure Supabase and database URLs
   ```

3. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Visit Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Register a new account
   - Start creating posts and exploring the platform

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6)
- **Background**: Zinc (#09090B)
- **Surface**: Zinc (#18181B)
- **Text**: Zinc (#FAFAFA, #A1A1AA)

### Typography
- **Font**: Geist Sans (Google Fonts)
- **Weights**: 400, 500, 600, 700
- **Sizes**: 12px, 14px, 16px, 18px, 20px, 24px

### Components
- **Cards**: Rounded corners (8px), subtle shadows
- **Buttons**: Consistent padding, hover states
- **Forms**: Clean inputs with focus states
- **Navigation**: Clear hierarchy and active states

## 🔧 Development

### Adding New Features
1. Create components in appropriate directories
2. Follow the established naming conventions
3. Use TypeScript interfaces for props
4. Implement responsive design
5. Add loading states and error handling

### Real-time Integration
1. Use the `useRealtime` hook for WebSocket events
2. Subscribe to relevant event types
3. Implement optimistic updates
4. Handle connection states gracefully

### Styling Guidelines
1. Use Tailwind utility classes
2. Follow the established color palette
3. Maintain consistent spacing
4. Ensure accessibility compliance

## 📱 Mobile Experience

The platform is designed with a mobile-first approach:
- **Bottom Navigation**: Easy thumb access to key features
- **Touch-Friendly**: Large touch targets and gestures
- **Responsive Layout**: Adapts to different screen sizes
- **Progressive Enhancement**: Works without JavaScript

## 🔮 Future Enhancements

- **Advanced Search**: Full-text search with filters
- **Club Features**: Event management, member roles
- **Analytics Dashboard**: User engagement metrics
- **API Integration**: External academic databases
- **Mobile App**: Native iOS/Android applications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the coding standards
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**UniConnect** - Connecting students through academic collaboration and research sharing.
