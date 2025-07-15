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

export async function POST(request: Request, { params }: { params: { noteId: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const noteId = Number.parseInt(params.noteId)
    if (isNaN(noteId)) {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 })
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

    // If no database connection, simulate successful update
    if (!sql) {
      console.log(`Preview mode: Simulating update of note ID: ${noteId}`)
      const updatedMockNotesPrivate = mockNotes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              title,
              content,
              is_public,
              updated_at: new Date().toISOString(),
              tags: tags
                .split(",")
                .filter(Boolean)
                .map((name) => ({ id: Math.random(), name })),
              attachments: formData.has("pdf_file_0") // Simulate attachment if a file was uploaded
                ? [
                    {
                      id: Math.random(),
                      note_id: noteId,
                      filename: "mock-pdf-for-preview.pdf",
                      original_filename: (formData.get("pdf_file_0") as File)?.name || "uploaded_file.pdf",
                      file_size: (formData.get("pdf_file_0") as File)?.size || 1024,
                      mime_type: "application/pdf",
                      file_path: "/uploads/mock-pdf-for-preview.pdf",
                      created_at: new Date().toISOString(),
                    },
                  ]
                : note.attachments, // Keep existing attachments if no new file
            }
          : note,
      )
      updateMockNotes(updatedMockNotesPrivate)

      // Handle public notes mock data
      let updatedMockNotesPublic = mockPublicNotes.filter((note) => note.id !== noteId) // Remove if it was public
      if (is_public) {
        const updatedNoteForPublic = updatedMockNotesPrivate.find((note) => note.id === noteId)
        if (updatedNoteForPublic) {
          updatedMockNotesPublic = [...updatedMockNotesPublic, updatedNoteForPublic]
        }
      }
      updateMockPublicNotes(updatedMockNotesPublic)

      revalidatePath("/dashboard")
      revalidatePath("/explore") // Revalidate explore page for public notes
      return NextResponse.json({ success: true, redirect: "/dashboard" })
    }

    try {
      const result = await sql`
        UPDATE notes 
        SET title = ${title}, content = ${content}, is_public = ${is_public}, updated_at = NOW()
        WHERE id = ${noteId} AND user_id = ${session.user.id}
      `

      if (result.count === 0) {
        return NextResponse.json(
          { errors: { general: ["Note not found or unauthorized"] }, message: "Note not found or unauthorized" },
          { status: 404 },
        )
      }

      await handleNoteTags(noteId, tags)
      const attachments = await handleFileUploads(noteId, formData)

      revalidatePath("/dashboard")
      if (is_public) {
        revalidatePath("/explore")
      }
      return NextResponse.json({ success: true, redirect: "/dashboard" })
    } catch (error) {
      console.error("Failed to update note:", error)
      return NextResponse.json(
        { errors: { general: ["Failed to update note"] }, message: "Failed to update note" },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Invalid request:", error)
    return NextResponse.json({ errors: { general: ["Invalid request"] }, message: "Invalid request" }, { status: 400 })
  }
}
