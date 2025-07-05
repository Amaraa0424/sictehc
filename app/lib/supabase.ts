import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Storage buckets
export const STORAGE_BUCKETS = {
  PROFILE_PICS: 'profile-pics',
  POST_MEDIA: 'post-media',
  CLUB_IMAGES: 'club-images',
  CHAT_FILES: 'chat-files'
} as const

// Initialize storage buckets if they don't exist
export const initializeStorageBuckets = async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    const existingBuckets = buckets?.map(bucket => bucket.name) || []
    
    for (const bucketName of Object.values(STORAGE_BUCKETS)) {
      if (!existingBuckets.includes(bucketName)) {
        await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/*', 'application/pdf', 'video/*'],
          fileSizeLimit: 50 * 1024 * 1024 // 50MB
        })
      }
    }
  } catch (error) {
    console.error('Error initializing storage buckets:', error)
  }
} 