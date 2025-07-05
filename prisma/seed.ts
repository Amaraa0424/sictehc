import { PrismaClient } from '../app/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  await prisma.notification.deleteMany()
  await prisma.message.deleteMany()
  await prisma.chatParticipant.deleteMany()
  await prisma.chat.deleteMany()
  await prisma.commentLike.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.like.deleteMany()
  await prisma.repost.deleteMany()
  await prisma.savedPost.deleteMany()
  await prisma.post.deleteMany()
  await prisma.follow.deleteMany()
  await prisma.userTag.deleteMany()
  await prisma.clubMember.deleteMany()
  await prisma.club.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️ Cleared existing data')

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 12)

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@university.edu',
        name: 'John Doe',
        username: 'johndoe',
        password: hashedPassword,
        program: 'Computer Science',
        year: 3,
        university: 'Tech University',
        bio: 'Passionate about AI and machine learning. Working on research in natural language processing.',
        isVerified: true,
        profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      },
    }),
    prisma.user.create({
      data: {
        email: 'sarah.smith@university.edu',
        name: 'Sarah Smith',
        username: 'sarahsmith',
        password: hashedPassword,
        program: 'Physics',
        year: 4,
        university: 'Tech University',
        bio: 'Quantum physics researcher. Exploring the mysteries of the universe.',
        isVerified: true,
        profilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike.johnson@university.edu',
        name: 'Mike Johnson',
        username: 'mikejohnson',
        password: hashedPassword,
        program: 'Engineering',
        year: 2,
        university: 'Tech University',
        bio: 'Mechanical engineering student. Building the future one project at a time.',
        isVerified: true,
        profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      },
    }),
    prisma.user.create({
      data: {
        email: 'emma.wilson@university.edu',
        name: 'Emma Wilson',
        username: 'emmawilson',
        password: hashedPassword,
        program: 'Biology',
        year: 3,
        university: 'Tech University',
        bio: 'Biology researcher focusing on genetics and molecular biology.',
        isVerified: true,
        profilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      },
    }),
  ])

  console.log('👥 Created users')

  // Create follows
  await Promise.all([
    prisma.follow.create({
      data: {
        followerId: users[0].id,
        followingId: users[1].id,
      },
    }),
    prisma.follow.create({
      data: {
        followerId: users[0].id,
        followingId: users[2].id,
      },
    }),
    prisma.follow.create({
      data: {
        followerId: users[1].id,
        followingId: users[0].id,
      },
    }),
    prisma.follow.create({
      data: {
        followerId: users[2].id,
        followingId: users[0].id,
      },
    }),
    prisma.follow.create({
      data: {
        followerId: users[3].id,
        followingId: users[0].id,
      },
    }),
  ])

  console.log('👥 Created follows')

  // Create posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        authorId: users[0].id,
        content: 'Just published my latest research on transformer architectures in natural language processing. The results show significant improvements in efficiency while maintaining accuracy. Looking forward to discussing this with the community!',
        title: 'Efficient Transformer Architectures for NLP',
        abstract: 'This paper presents a novel approach to transformer architecture optimization, achieving 40% faster inference times with minimal accuracy loss.',
        mediaType: 'TEXT',
        visibility: 'PUBLIC',
        tags: ['AI', 'NLP', 'Machine Learning', 'Research'],
        viewCount: 156,
      },
    }),
    prisma.post.create({
      data: {
        authorId: users[1].id,
        content: 'Excited to share my findings on quantum entanglement in multi-particle systems. The experimental results are fascinating and challenge some of our previous assumptions about quantum mechanics.',
        title: 'Quantum Entanglement in Multi-Particle Systems',
        abstract: 'Experimental investigation of entanglement properties in systems with more than two particles.',
        mediaType: 'TEXT',
        visibility: 'PUBLIC',
        tags: ['Physics', 'Quantum Mechanics', 'Research'],
        viewCount: 89,
      },
    }),
    prisma.post.create({
      data: {
        authorId: users[2].id,
        content: 'Working on a new sustainable energy project. We\'re developing a more efficient solar panel design that could potentially increase energy capture by 25%. The prototype testing is going well!',
        title: 'Sustainable Energy Innovation',
        abstract: 'Development of next-generation solar panel technology for improved efficiency.',
        mediaType: 'TEXT',
        visibility: 'PUBLIC',
        tags: ['Engineering', 'Sustainability', 'Solar Energy'],
        viewCount: 234,
      },
    }),
    prisma.post.create({
      data: {
        authorId: users[3].id,
        content: 'Fascinating discovery in our genetics lab today! We found a new gene variant that appears to be linked to enhanced cognitive function. This could have significant implications for understanding brain development.',
        title: 'New Gene Variant Linked to Cognitive Enhancement',
        abstract: 'Identification and analysis of a novel genetic variant associated with improved cognitive performance.',
        mediaType: 'TEXT',
        visibility: 'PUBLIC',
        tags: ['Biology', 'Genetics', 'Neuroscience', 'Research'],
        viewCount: 178,
      },
    }),
    prisma.post.create({
      data: {
        authorId: users[0].id,
        content: 'Great discussion in today\'s AI seminar! We covered everything from recent breakthroughs in large language models to the ethical implications of AI development. The debate about AI safety was particularly engaging.',
        mediaType: 'TEXT',
        visibility: 'PUBLIC',
        tags: ['AI', 'Ethics', 'Seminar'],
        viewCount: 67,
      },
    }),
  ])

  console.log('📝 Created posts')

  // Create likes
  await Promise.all([
    prisma.like.create({
      data: {
        postId: posts[0].id,
        userId: users[1].id,
      },
    }),
    prisma.like.create({
      data: {
        postId: posts[0].id,
        userId: users[2].id,
      },
    }),
    prisma.like.create({
      data: {
        postId: posts[0].id,
        userId: users[3].id,
      },
    }),
    prisma.like.create({
      data: {
        postId: posts[1].id,
        userId: users[0].id,
      },
    }),
    prisma.like.create({
      data: {
        postId: posts[1].id,
        userId: users[2].id,
      },
    }),
    prisma.like.create({
      data: {
        postId: posts[2].id,
        userId: users[0].id,
      },
    }),
    prisma.like.create({
      data: {
        postId: posts[2].id,
        userId: users[1].id,
      },
    }),
    prisma.like.create({
      data: {
        postId: posts[3].id,
        userId: users[0].id,
      },
    }),
    prisma.like.create({
      data: {
        postId: posts[4].id,
        userId: users[1].id,
      },
    }),
  ])

  console.log('❤️ Created likes')

  // Create comments
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        postId: posts[0].id,
        authorId: users[1].id,
        content: 'This is fascinating! Have you considered the implications for real-time applications?',
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[0].id,
        authorId: users[2].id,
        content: 'Great work! The efficiency improvements are impressive. Would love to see the implementation details.',
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[1].id,
        authorId: users[0].id,
        content: 'This challenges some fundamental assumptions. How do you think this will impact our understanding of quantum mechanics?',
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[2].id,
        authorId: users[3].id,
        content: 'This is exactly what we need for a more sustainable future! What\'s the timeline for commercialization?',
      },
    }),
  ])

  console.log('💬 Created comments')

  // Create comment likes
  await Promise.all([
    prisma.commentLike.create({
      data: {
        commentId: comments[0].id,
        userId: users[0].id,
      },
    }),
    prisma.commentLike.create({
      data: {
        commentId: comments[1].id,
        userId: users[0].id,
      },
    }),
  ])

  console.log('👍 Created comment likes')

  // Create reposts
  await Promise.all([
    prisma.repost.create({
      data: {
        postId: posts[0].id,
        userId: users[1].id,
      },
    }),
    prisma.repost.create({
      data: {
        postId: posts[2].id,
        userId: users[3].id,
      },
    }),
  ])

  console.log('🔄 Created reposts')

  // Create saved posts
  await Promise.all([
    prisma.savedPost.create({
      data: {
        postId: posts[0].id,
        userId: users[1].id,
      },
    }),
    prisma.savedPost.create({
      data: {
        postId: posts[1].id,
        userId: users[0].id,
      },
    }),
  ])

  console.log('⭐ Created saved posts')

  // Create clubs
  const clubs = await Promise.all([
    prisma.club.create({
      data: {
        name: 'AI Research Club',
        description: 'A community of AI enthusiasts and researchers sharing knowledge and collaborating on projects.',
        category: 'Technology',
        isActive: true,
      },
    }),
    prisma.club.create({
      data: {
        name: 'Physics Society',
        description: 'Exploring the mysteries of the universe through physics research and discussions.',
        category: 'Science',
        isActive: true,
      },
    }),
    prisma.club.create({
      data: {
        name: 'Engineering Innovation Hub',
        description: 'Building the future through engineering innovation and sustainable technology.',
        category: 'Engineering',
        isActive: true,
      },
    }),
  ])

  console.log('🏛️ Created clubs')

  // Add users to clubs
  await Promise.all([
    prisma.clubMember.create({
      data: {
        clubId: clubs[0].id,
        userId: users[0].id,
        role: 'PRESIDENT',
      },
    }),
    prisma.clubMember.create({
      data: {
        clubId: clubs[0].id,
        userId: users[1].id,
        role: 'MEMBER',
      },
    }),
    prisma.clubMember.create({
      data: {
        clubId: clubs[1].id,
        userId: users[1].id,
        role: 'PRESIDENT',
      },
    }),
    prisma.clubMember.create({
      data: {
        clubId: clubs[1].id,
        userId: users[0].id,
        role: 'MEMBER',
      },
    }),
    prisma.clubMember.create({
      data: {
        clubId: clubs[2].id,
        userId: users[2].id,
        role: 'PRESIDENT',
      },
    }),
  ])

  console.log('👥 Added users to clubs')

  // Create notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: 'LIKE',
        title: 'Sarah Smith liked your post',
        message: 'Sarah Smith liked your post "Efficient Transformer Architectures for NLP"',
        isRead: false,
        data: { postId: posts[0].id, likerId: users[1].id },
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: 'COMMENT',
        title: 'Sarah Smith commented on your post',
        message: 'Sarah Smith commented on your post "Efficient Transformer Architectures for NLP"',
        isRead: false,
        data: { postId: posts[0].id, commenterId: users[1].id },
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: 'FOLLOW',
        title: 'Emma Wilson started following you',
        message: 'Emma Wilson started following you',
        isRead: true,
        data: { followerId: users[3].id },
      },
    }),
  ])

  console.log('🔔 Created notifications')

  console.log('✅ Database seeding completed!')
  console.log('\n📊 Summary:')
  console.log(`- ${users.length} users created`)
  console.log(`- ${posts.length} posts created`)
  console.log(`- ${comments.length} comments created`)
  console.log(`- ${clubs.length} clubs created`)
  console.log('\n🔑 Test Accounts:')
  users.forEach(user => {
    console.log(`- ${user.name} (${user.username}): ${user.email} / password123`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 