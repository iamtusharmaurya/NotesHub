import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardClient } from "@/components/dashboard-client"
import type { NoteWithDetails } from "@/lib/db"
import { GET as getNotesApi } from "@/app/api/notes/route" // Import the GET handler

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  // Directly call the API route's GET handler
  const apiResponse = await getNotesApi()
  const notes: NoteWithDetails[] = await apiResponse.json()

  return <DashboardClient initialNotes={notes} currentUserId={session.user.id} />
}
