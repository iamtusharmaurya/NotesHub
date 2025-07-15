import "server-only"
import { cookies } from "next/headers"
import { sql } from "./db"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"

export interface SessionPayload {
  userId: number
  expiresAt: Date
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: number) {
  const sessionId = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  if (sql) {
    try {
      await sql`
        INSERT INTO sessions (id, user_id, expires_at)
        VALUES (${sessionId}, ${userId}, ${expiresAt})
      `
    } catch (error) {
      console.warn("Database not available, using cookie-only session")
    }
  }

  const cookieStore = await cookies()
  cookieStore.set("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  })

  // Store user info in cookie for preview mode
  cookieStore.set("user", JSON.stringify({ id: userId }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  })

  return sessionId
}

export async function getSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session")?.value
  const userCookie = cookieStore.get("user")?.value

  if (!sessionId) {
    return null
  }

  if (sql) {
    try {
      const sessions = await sql`
        SELECT s.*, u.id as user_id, u.email, u.name
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ${sessionId} AND s.expires_at > NOW()
      `

      if (sessions.length === 0) {
        return null
      }

      return {
        sessionId,
        user: {
          id: sessions[0].user_id,
          email: sessions[0].email,
          name: sessions[0].name,
        },
      }
    } catch (error) {
      console.warn("Database not available, using cookie session")
    }
  }

  // Fallback for preview mode
  if (userCookie) {
    try {
      const user = JSON.parse(userCookie)
      return {
        sessionId,
        user: {
          id: user.id,
          email: "demo@example.com",
          name: "Demo User",
        },
      }
    } catch (error) {
      return null
    }
  }

  return null
}

export async function deleteSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session")?.value

  if (sessionId && sql) {
    try {
      await sql`DELETE FROM sessions WHERE id = ${sessionId}`
    } catch (error) {
      console.warn("Database not available for session cleanup")
    }
  }

  cookieStore.delete("session")
  cookieStore.delete("user")
}
