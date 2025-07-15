import { sql } from "@/lib/db"
import { NoteCard } from "@/components/note-card"
import { Badge } from "@/components/ui/badge"
// Import the `Bot` icon from `lucide-react`
import { Calendar, FileText, Tag, UserCircle2, BookOpen, Bot } from "lucide-react"
import { getSession } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // Import Card components
import { Avatar, AvatarFallback } from "@/components/ui/avatar" // Import Avatar components
import Link from "next/link" // Import Link component
import Button from "@/components/ui/button" // Import Button component

// Mock profile data for preview mode
const mockProfile = {
  id: 1,
  name: "Demo User",
  email: "demo@example.com",
  created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
  publicNotes: [
    {
      id: 1,
      title: "Welcome to NotesHub",
      content: "This is a public note shared with the community!",
      is_public: true,
      user_id: 1,
      user_name: "Demo User",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      like_count: 12,
      comment_count: 3,
      tags: [
        { id: 1, name: "welcome" },
        { id: 2, name: "tutorial" },
      ],
      attachments: [], // Ensure attachments array is present for mock data
    },
    {
      id: 3,
      title: "JavaScript Tips & Tricks",
      content: "Here are some useful JavaScript tips and tricks for developers.",
      is_public: true,
      user_id: 1, // Changed to user 1 for mock profile
      user_name: "Demo User",
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      like_count: 8,
      comment_count: 5,
      tags: [
        { id: 3, name: "javascript" },
        { id: 4, name: "tips" },
      ],
      attachments: [],
    },
  ],
  popularTags: [
    { name: "welcome", count: 1 },
    { name: "tutorial", count: 1 },
    { name: "javascript", count: 1 },
    { name: "tips", count: 1 },
  ],
}

async function getUserProfile(userId: number) {
  if (!sql) {
    return mockProfile
  }

  try {
    const users = await sql`
      SELECT id, name, email, created_at
      FROM users
      WHERE id = ${userId}
    `

    if (users.length === 0) {
      return null
    }

    const user = users[0]

    // Get public notes
    const publicNotes = await sql`
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
      WHERE n.user_id = ${userId} AND n.is_public = true
      ORDER BY n.updated_at DESC
    `

    // Get tags and attachments for each note
    for (const note of publicNotes) {
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

    // Get popular tags
    const popularTags = await sql`
      SELECT t.name, COUNT(*) as count
      FROM tags t
      JOIN note_tags nt ON t.id = nt.tag_id
      JOIN notes n ON nt.note_id = n.id
      WHERE n.user_id = ${userId} AND n.is_public = true
      GROUP BY t.name
      ORDER BY count DESC
      LIMIT 10
    `

    return {
      ...user,
      publicNotes,
      popularTags,
    }
  } catch (error) {
    console.error("Failed to fetch user profile:", error)
    return mockProfile
  }
}

export default async function ProfilePage({ params }: { params: { userId: string } }) {
  const userId = Number.parseInt(params.userId)
  const session = await getSession()

  if (isNaN(userId)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Invalid User ID</h1>
        </div>
      </div>
    )
  }

  const profile = await getUserProfile(userId)

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">User Not Found</h1>
          <p className="text-muted-foreground mt-2">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const isOwnProfile = session?.user?.id === userId

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header Section */}
      <Card className="mb-8 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-primary shadow-md">
            <AvatarFallback className="text-5xl md:text-6xl font-bold bg-primary text-primary-foreground flex items-center justify-center">
              <Bot className="w-16 h-16 md:w-20 md:h-20" />
            </AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold capitalize">{profile.name}</h1>
              {isOwnProfile && <Badge variant="secondary">Your Profile</Badge>}
            </div>
            <p className="text-lg text-muted-foreground mb-4">{profile.email}</p>

            {/* Profile Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <CardContent className="flex flex-col items-center justify-center p-0">
                  <Calendar className="w-6 h-6 text-primary mb-2" />
                  <p className="text-xl font-bold">{new Date(profile.created_at).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                </CardContent>
              </Card>
              <Card className="p-4 text-center">
                <CardContent className="flex flex-col items-center justify-center p-0">
                  <FileText className="w-6 h-6 text-primary mb-2" />
                  <p className="text-xl font-bold">{profile.publicNotes.length}</p>
                  <p className="text-sm text-muted-foreground">Public Notes</p>
                </CardContent>
              </Card>
              <Card className="p-4 text-center">
                <CardContent className="flex flex-col items-center justify-center p-0">
                  <Tag className="w-6 h-6 text-primary mb-2" />
                  <p className="text-xl font-bold">{profile.popularTags.length}</p>
                  <p className="text-sm text-muted-foreground">Unique Tags</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Card>

      {/* Popular Tags */}
      {profile.popularTags.length > 0 && (
        <Card className="mb-8 p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" /> Popular Tags
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-wrap gap-2">
            {profile.popularTags.map((tag) => (
              <Badge key={tag.name} variant="outline" className="text-base px-3 py-1">
                {tag.name} ({tag.count})
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Public Notes */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" /> Public Notes
        </h2>
        {profile.publicNotes.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-muted-foreground/20 rounded-lg">
            <UserCircle2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {isOwnProfile
                ? "You haven't shared any public notes yet. Start creating and sharing your knowledge!"
                : "This user hasn't shared any public notes yet."}
            </p>
            {isOwnProfile && (
              <Link href="/create">
                <Button>Create Your First Public Note</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.publicNotes.map((note) => (
              <NoteCard key={note.id} note={note} currentUserId={session?.user?.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
