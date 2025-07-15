import type { NoteWithDetails } from "./db"
import { MOCK_PDF_FILENAME } from "./constants"

// This array will be mutable for preview mode simulations of public notes
export let mockPublicNotes: NoteWithDetails[] = [
  {
    id: 1,
    title: "Welcome to NotesHub",
    content:
      "This is a public note shared with the community! NotesHub allows you to create, organize, and share your thoughts with others. This is a preview version with mock data.",
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
    attachments: [
      {
        id: 1,
        note_id: 1,
        filename: MOCK_PDF_FILENAME,
        original_filename: "Welcome Guide.pdf",
        file_size: 245760,
        mime_type: "application/pdf",
        file_path: `/uploads/${MOCK_PDF_FILENAME}`,
        created_at: new Date().toISOString(),
      },
    ],
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

// Function to update mock public notes
export function updateMockPublicNotes(newNotes: NoteWithDetails[]) {
  mockPublicNotes = newNotes
}
