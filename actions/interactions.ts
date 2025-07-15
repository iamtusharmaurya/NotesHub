"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { CommentSchema, type FormState } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export async function toggleLike(noteId: number) {
  const session = await getSession()

  if (!session) {
    return { error: "Must be logged in to like notes" }
  }

  // If no database connection, simulate success
  if (!sql) {
    console.log("Preview mode: Simulating like toggle")
    return { success: true }
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

    revalidatePath("/explore")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { error: "Failed to toggle like" }
  }
}

export async function addComment(noteId: number, state: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession()

  if (!session) {
    return { errors: { general: ["Must be logged in to comment"] } }
  }

  const validatedFields = CommentSchema.safeParse({
    content: formData.get("content"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { content } = validatedFields.data

  // If no database connection, simulate success
  if (!sql) {
    console.log("Preview mode: Simulating comment addition")
    return { message: "Comment added successfully" }
  }

  try {
    await sql`
      INSERT INTO note_comments (note_id, user_id, content)
      VALUES (${noteId}, ${session.user.id}, ${content})
    `

    revalidatePath("/explore")
    revalidatePath("/dashboard")
    return { message: "Comment added successfully" }
  } catch (error) {
    return {
      errors: { general: ["Failed to add comment"] },
    }
  }
}

export async function deleteComment(commentId: number) {
  const session = await getSession()

  if (!session) {
    return { error: "Unauthorized" }
  }

  // If no database connection, simulate success
  if (!sql) {
    console.log("Preview mode: Simulating comment deletion")
    return { success: true }
  }

  try {
    await sql`
      DELETE FROM note_comments 
      WHERE id = ${commentId} AND user_id = ${session.user.id}
    `

    revalidatePath("/explore")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete comment" }
  }
}
