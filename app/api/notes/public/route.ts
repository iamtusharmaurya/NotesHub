import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { mockPublicNotes } from "@/lib/mock-public-notes" // Import mutable mockPublicNotes

export async function GET() {
  try {
    // If no database connection, return mock data
    if (!sql) {
      console.log("Preview mode: Returning mock public notes")
      return NextResponse.json(mockPublicNotes)
    }

    const notes = await sql`
      SELECT 
        n.*,
        u.name as user_name,
        COALESCE(like_counts.like_count, 0) as like_count,
        COALESCE(comment_counts.comment_count, 0) as comment_count
      FROM notes n
      JOIN users u ON n.user_id = u.id
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
      WHERE n.is_public = true
      ORDER BY n.updated_at DESC
      LIMIT 50
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
    console.error("Failed to fetch public notes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
