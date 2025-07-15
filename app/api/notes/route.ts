import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { mockNotes } from "@/lib/mock-data" // Import mutable mockNotes

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // If no database connection, return mock data
    if (!sql) {
      console.log("Preview mode: Returning mock notes with attachments")
      return NextResponse.json(mockNotes) // Use the mutable mockNotes
    }

    const notes = await sql`
      SELECT 
        n.*,
        COALESCE(like_counts.like_count, 0) as like_count,
        COALESCE(comment_counts.comment_count, 0) as comment_count,
        CASE WHEN user_likes.user_id IS NOT NULL THEN true ELSE false END as is_liked
      FROM notes n
      LEFT JOIN (
        SELECT note_id, COUNT(*) as like_count
        FROM note_likes
        GROUP BY note_id
      ) like_counts ON n.id = like_counts.note_id
      LEFT JOIN (
        SELECT note_id, COUNT(*) as comment_count
        FROM note_comments
        GROUP BY note_id
      ) comment_counts ON n.id = comment_counts.note_id
      LEFT JOIN note_likes user_likes ON n.id = user_likes.note_id AND user_likes.user_id = ${session.user.id}
      WHERE n.user_id = ${session.user.id}
      ORDER BY n.updated_at DESC
    `

    // Fetch tags and attachments for each note
    for (const note of notes) {
      const tags = await sql`
        SELECT t.* FROM tags t
        JOIN note_tags nt ON t.id = nt.tag_id
        WHERE nt.note_id = ${note.id}
      `
      note.tags = tags

      const attachments = await sql`
        SELECT * FROM note_attachments
        WHERE note_id = ${note.id}
        ORDER BY created_at ASC
      `
      note.attachments = attachments
    }

    return NextResponse.json(notes)
  } catch (error) {
    console.error("Failed to fetch notes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
