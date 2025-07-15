import { neon } from "@neondatabase/serverless"

// Use the available Neon environment variables
const getDatabaseUrl = () => {
  // Try different environment variable names that might be available
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ""
  )
}

const databaseUrl = getDatabaseUrl()

if (!databaseUrl) {
  console.warn("No database URL found. Using mock data for preview.")
}

export const sql = databaseUrl ? neon(databaseUrl) : null

export interface User {
  id: number
  email: string
  password_hash: string
  name: string
  created_at: string
  updated_at: string
}

export interface Note {
  id: number
  title: string
  content: string
  is_public: boolean
  user_id: number
  created_at: string
  updated_at: string
  user_name?: string
}

export interface Session {
  id: string
  user_id: number
  expires_at: string
  created_at: string
}

export interface Tag {
  id: number
  name: string
  created_at: string
}

export interface Attachment {
  id: number
  note_id: number
  filename: string
  original_filename: string
  file_size: number
  mime_type: string
  file_path: string
  created_at: string
}

export interface NoteWithDetails extends Note {
  user_name?: string
  tags?: Tag[]
  like_count?: number
  is_liked?: boolean
  comment_count?: number
  attachments?: Attachment[]
}

export interface Comment {
  id: number
  note_id: number
  user_id: number
  content: string
  created_at: string
  updated_at: string
  user_name: string
}
