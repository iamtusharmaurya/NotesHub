import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { mockNotes, updateMockNotes } from "@/lib/mock-data"
import { mockPublicNotes, updateMockPublicNotes } from "@/lib/mock-public-notes" // Import public mock data
import { revalidatePath } from "next/cache"

export async function DELETE(request: Request, { params }: { params: { noteId: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const noteId = Number.parseInt(params.noteId)
    if (isNaN(noteId)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 })
    }

    // If no database connection, simulate successful deletion
    if (!sql) {
      console.log(`Preview mode: Simulating deletion of note ID: ${noteId}`)
      const updatedMockNotesPrivate = mockNotes.filter((note) => note.id !== noteId)
      updateMockNotes(updatedMockNotesPrivate)

      const updatedMockNotesPublic = mockPublicNotes.filter((note) => note.id !== noteId)
      updateMockPublicNotes(updatedMockNotesPublic)

      revalidatePath("/dashboard")
      revalidatePath("/explore") // Revalidate explore page for public notes
      return NextResponse.json({ success: true })
    }

    try {
      await sql`
        DELETE FROM notes 
        WHERE id = ${noteId} AND user_id = ${session.user.id}
      `

      revalidatePath("/dashboard")
      revalidatePath("/explore") // Revalidate explore page for public notes
      return NextResponse.json({ success: true })
    } catch (error) {
      return NextResponse.json({ error: "Failed to delete note" }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
