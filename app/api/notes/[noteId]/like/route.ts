import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function POST(request: Request, { params }: { params: { noteId: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Must be logged in to like notes" }, { status: 401 })
    }

    const noteId = Number.parseInt(params.noteId)
    if (isNaN(noteId)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 })
    }

    // If no database connection, simulate success
    if (!sql) {
      console.log("Preview mode: Simulating like toggle")
      return NextResponse.json({ success: true })
    }

    try {
      // Check if already liked
      const existingLike = await sql`
        SELECT id FROM note_likes 
        WHERE note_id = ${noteId} AND user_id = ${session.user.id}
      `

      if (existingLike.length > 0) {
        // Unlike
        await sql`
          DELETE FROM note_likes 
          WHERE note_id = ${noteId} AND user_id = ${session.user.id}
        `
      } else {
        // Like
        await sql`
          INSERT INTO note_likes (note_id, user_id)
          VALUES (${noteId}, ${session.user.id})
        `
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
