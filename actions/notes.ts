import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { NoteSchema, type FormState } from "@/lib/validations"
import { getSession } from "@/lib/auth"

async function handleNoteTags(noteId: number, tagsString: string) {
  if (!tagsString.trim() || !sql) return

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

export async function createNote(state: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const validatedFields = NoteSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    is_public: formData.get("is_public") === "on",
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { title, content, is_public } = validatedFields.data
  const tags = formData.get("tags") as string

  // If no database connection, simulate successful creation
  if (!sql) {
    console.log("Preview mode: Simulating note creation")
    redirect("/dashboard")
    return
  }

  try {
    const result = await sql`
      INSERT INTO notes (title, content, is_public, user_id)
      VALUES (${title}, ${content}, ${is_public}, ${session.user.id})
      RETURNING id
    `

    const noteId = result[0].id
    await handleNoteTags(noteId, tags)
  } catch (error) {
    return {
      errors: { general: ["Failed to create note"] },
    }
  }

  redirect("/dashboard")
}

export async function updateNote(noteId: number, state: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const validatedFields = NoteSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    is_public: formData.get("is_public") === "on",
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { title, content, is_public } = validatedFields.data
  const tags = formData.get("tags") as string

  // If no database connection, simulate successful update
  if (!sql) {
    console.log("Preview mode: Simulating note update")
    redirect("/dashboard")
    return
  }

  try {
    const result = await sql`
      UPDATE notes 
      SET title = ${title}, content = ${content}, is_public = ${is_public}, updated_at = NOW()
      WHERE id = ${noteId} AND user_id = ${session.user.id}
    `

    if (result.count === 0) {
      return {
        errors: { general: ["Note not found or unauthorized"] },
      }
    }

    await handleNoteTags(noteId, tags)
  } catch (error) {
    return {
      errors: { general: ["Failed to update note"] },
    }
  }

  redirect("/dashboard")
}

export async function deleteNote(noteId: number) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  // If no database connection, simulate successful deletion
  if (!sql) {
    console.log("Preview mode: Simulating note deletion")
    redirect("/dashboard")
    return
  }

  try {
    await sql`
      DELETE FROM notes 
      WHERE id = ${noteId} AND user_id = ${session.user.id}
    `
  } catch (error) {
    console.error("Failed to delete note:", error)
  }

  redirect("/dashboard")
}
