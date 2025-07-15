import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { NoteSchema } from "@/lib/validations"
import { getSession } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomBytes } from "crypto"
import { revalidatePath } from "next/cache"
import { mockNotes, updateMockNotes } from "@/lib/mock-data"
import { mockPublicNotes, updateMockPublicNotes } from "@/lib/mock-public-notes" // Import public mock data

async function handleNoteTags(noteId: number, tagsString: string) {
  if (!tagsString?.trim() || !sql) return

  const tagNames = tagsString
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)

  try {
    // Remove existing tags for this note
    await sql`DELETE FROM note_tags WHERE note_id = ${noteId}`

    for (const tagName of tagNames) {
      // Insert tag if it doesn't exist
      await sql`
        INSERT INTO tags (name) VALUES (${tagName})
        ON CONFLICT (name) DO NOTHING
      `

      // Get tag id and link to note
      const tagResult = await sql`SELECT id FROM tags WHERE name = ${tagName}`
      if (tagResult.length > 0) {
        await sql`
          INSERT INTO note_tags (note_id, tag_id)
          VALUES (${noteId}, ${tagResult[0].id})
          ON CONFLICT DO NOTHING
        `
      }
    }
  } catch (error) {
    console.warn("Database not available for tag handling")
  }
}

async function handleFileUploads(noteId: number, formData: FormData) {
  if (!sql) {
    console.warn("Preview mode: File uploads are simulated and not persisted.")
    return [] // Return empty array for mock attachments
  }

  const uploadDir = join(process.cwd(), "uploads")

  try {
    await mkdir(uploadDir, { recursive: true })
  } catch (error) {
    console.warn("Could not create upload directory:", error)
  }

  const files: File[] = []
  let index = 0
  const attachmentsInfo = []

  // Extract PDF files from form data
  while (formData.has(`pdf_file_${index}`)) {
    const file = formData.get(`pdf_file_${index}`) as File
    if (file && file.size > 0 && file.name && file.type === "application/pdf") {
      files.push(file)
    }
    index++
  }

  for (const file of files) {
    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generate unique filename
      const fileExtension = file.name.split(".").pop() || "pdf"
      const uniqueFilename = `${randomBytes(16).toString("hex")}.${fileExtension}`
      const filePath = join(uploadDir, uniqueFilename)

      // Save file
      await writeFile(filePath, buffer)

      // Save file info to database
      const attachmentResult = await sql`
        INSERT INTO note_attachments (note_id, filename, original_filename, file_size, mime_type, file_path)
        VALUES (${noteId}, ${uniqueFilename}, ${file.name}, ${file.size}, ${file.type}, ${filePath})
        RETURNING id, filename, original_filename, file_size, mime_type, file_path, created_at
      `
      attachmentsInfo.push(attachmentResult[0])
    } catch (error) {
      console.error("Failed to save file:", error)
    }
  }
  return attachmentsInfo
}

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()

    const validatedFields = NoteSchema.safeParse({
      title: formData.get("title"),
      content: formData.get("content"),
      is_public: formData.get("is_public") === "on",
    })

    if (!validatedFields.success) {
      return NextResponse.json({ errors: validatedFields.error.flatten().fieldErrors }, { status: 400 })
    }

    const { title, content, is_public } = validatedFields.data
    const tags = (formData.get("tags") as string) || ""

    // If no database connection, simulate successful creation
    if (!sql) {
      console.log("Preview mode: Simulating note creation with PDF upload (no actual file storage).")
      const newNoteId = Math.max(...mockNotes.map((n) => n.id), ...mockPublicNotes.map((n) => n.id)) + 1
      const newMockNote = {
        id: newNoteId,
        title,
        content,
        is_public,
        user_id: session.user.id,
        user_name: session.user.name || "Demo User", // Add user_name for public notes
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        like_count: 0,
        comment_count: 0,
        is_liked: false,
        tags: tags
          .split(",")
          .filter(Boolean)
          .map((name) => ({ id: Math.random(), name })),
        attachments: formData.has("pdf_file_0") // Simulate attachment if a file was uploaded
          ? [
              {
                id: Math.random(),
                note_id: newNoteId,
                filename: "mock-pdf-for-preview.pdf",
                original_filename: (formData.get("pdf_file_0") as File)?.name || "uploaded_file.pdf",
                file_size: (formData.get("pdf_file_0") as File)?.size || 1024,
                mime_type: "application/pdf",
                file_path: "/uploads/mock-pdf-for-preview.pdf",
                created_at: new Date().toISOString(),
              },
            ]
          : [],
      }
      updateMockNotes([...mockNotes, newMockNote])
      if (is_public) {
        updateMockPublicNotes([...mockPublicNotes, newMockNote])
      }
      revalidatePath("/dashboard")
      revalidatePath("/explore") // Revalidate explore page for public notes
      return NextResponse.json({ success: true, redirect: "/dashboard" })
    }

    try {
      const result = await sql`
        INSERT INTO notes (title, content, is_public, user_id)
        VALUES (${title}, ${content}, ${is_public}, ${session.user.id})
        RETURNING id
      `

      const noteId = result[0].id
      await handleNoteTags(noteId, tags)
      const attachments = await handleFileUploads(noteId, formData)

      revalidatePath("/dashboard")
      if (is_public) {
        revalidatePath("/explore")
      }
      return NextResponse.json({ success: true, redirect: "/dashboard" })
    } catch (error) {
      console.error("Failed to create note:", error)
      return NextResponse.json(
        { errors: { general: ["Failed to create note"] }, message: "Failed to create note" },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Invalid request:", error)
    return NextResponse.json({ errors: { general: ["Invalid request"] }, message: "Invalid request" }, { status: 400 })
  }
}
