import { ExploreClient } from "@/components/explore-client"
import type { NoteWithDetails } from "@/lib/db"
import { mockPublicNotes } from "@/lib/mock-public-notes" // Import mock data for preview
import { getSession } from "@/lib/auth" // To get current user ID for like button

async function fetchPublicNotes(): Promise<NoteWithDetails[]> {
  // In a real application, you'd fetch from your database here.
  // For the v0 preview, we'll use the API route which handles mock data.
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/notes/public`, {
      cache: "no-store", // Ensure data is always fresh on server-side fetch
    })
    if (!response.ok) {
      console.error(`Failed to fetch public notes: ${response.status} ${response.statusText}`)
      // Fallback to mock data if API call fails (e.g., in preview without DB)
      return mockPublicNotes
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching public notes:", error)
    // Fallback to mock data on network error
    return mockPublicNotes
  }
}

export default async function ExplorePage() {
  const publicNotes = await fetchPublicNotes()
  const session = await getSession() // Get session to pass currentUserId to NoteCard

  return <ExploreClient initialNotes={publicNotes} currentUserId={session?.user?.id} />
}
