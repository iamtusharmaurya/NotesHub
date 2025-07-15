import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

// Mock comments for preview mode
const mockComments = [
  {
    id: 1,
    note_id: 1,
    user_id: 2,
    content: "Great introduction! Very helpful for beginners.",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    user_name: "Jane Smith",
  },
  {
    id: 2,
    note_id: 1,
    user_id: 3,
    content: "Thanks for sharing this. Looking forward to more content!",
    created_at: new Date(Date.now() - 43200000).toISOString(),
    updated_at: new Date(Date.now() - 43200000).toISOString(),
    user_name: "Alex Johnson",
  },
]

export async function GET(request: Request, { params }: { params: { noteId: string } }) {
  try {
    const noteId = Number.parseInt(params.noteId)

    if (isNaN(noteId)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 })
    }

    // If no database connection, return mock data
    if (!sql) {
      console.log("Preview mode: Returning mock comments")
      return NextResponse.json(mockComments.filter((comment) => comment.note_id === noteId))
    }

    const comments = await sql`
      SELECT c.*, u.name as user_name
      FROM note_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.note_id = ${noteId}
      ORDER BY c.created_at ASC
    `

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Failed to fetch comments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
