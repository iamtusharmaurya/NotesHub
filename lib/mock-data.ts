import type { NoteWithDetails } from "./db"

// This array will be mutable for preview mode simulations
export let mockNotes: NoteWithDetails[] = [
  {
    id: 1,
    title: "Welcome to NotesHub",
    content:
      "This is your first note! You can create, edit, and share notes with others. This is a preview version with mock data.",
    is_public: true,
    user_id: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    like_count: 5,
    comment_count: 2,
    is_liked: false,
    tags: [
      { id: 1, name: "welcome" },
      { id: 2, name: "tutorial" },
    ],
    attachments: [
      {
        id: 1,
        note_id: 1,
        filename: "mock-pdf-for-preview.pdf",
        original_filename: "Welcome Guide.pdf",
        file_size: 245760,
        mime_type: "application/pdf",
        file_path: "/uploads/mock-pdf-for-preview.pdf",
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 2,
    title: "My Private Thoughts",
    content: "This is a private note that only I can see. Perfect for personal reflections and ideas.",
    is_public: false,
    user_id: 1,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    like_count: 0,
    comment_count: 0,
    is_liked: false,
    tags: [{ id: 3, name: "personal" }],
    attachments: [],
  },
  {
    id: 3,
    title: "JavaScript Tips & Tricks",
    content:
      "Here are some useful JavaScript tips that every developer should know:\n\n1. Use const and let instead of var\n2. Destructuring assignment for cleaner code\n3. Template literals for string interpolation\n4. Arrow functions for concise syntax\n\nHappy coding!",
    is_public: true,
    user_id: 2,
    user_name: "Jane Developer",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    like_count: 8,
    comment_count: 5,
    tags: [
      { id: 4, name: "javascript" },
      { id: 5, name: "programming" },
      { id: 6, name: "tips" },
    ],
    attachments: [],
  },
  {
    id: 4,
    title: "Productivity Hacks for Remote Work",
    content:
      "Working from home can be challenging. Here are some productivity tips that have helped me:\n\n• Create a dedicated workspace\n• Set clear boundaries between work and personal time\n• Use the Pomodoro Technique\n• Take regular breaks\n• Stay connected with your team",
    is_public: true,
    user_id: 3,
    user_name: "Alex Remote",
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 259200000).toISOString(),
    like_count: 15,
    comment_count: 7,
    tags: [
      { id: 7, name: "productivity" },
      { id: 8, name: "remote-work" },
      { id: 9, name: "tips" },
    ],
    attachments: [],
  },
]

// Function to update mock notes (e.g., for deletion)
export function updateMockNotes(newNotes: NoteWithDetails[]) {
  mockNotes = newNotes
}
