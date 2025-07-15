import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { SignupSchema } from "@/lib/validations"
import { hashPassword, createSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const validatedFields = SignupSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    })

    if (!validatedFields.success) {
      return NextResponse.json({ errors: validatedFields.error.flatten().fieldErrors }, { status: 400 })
    }

    const { name, email, password } = validatedFields.data

    // If no database connection, simulate successful signup
    if (!sql) {
      console.log("Preview mode: Simulating user signup")
      await createSession(1) // Mock user ID
      return NextResponse.json({ success: true, redirect: "/dashboard" })
    }

    try {
      // Check if user already exists
      const existingUsers = await sql`
        SELECT id FROM users WHERE email = ${email}
      `

      if (existingUsers.length > 0) {
        return NextResponse.json({ errors: { email: ["Email already exists"] } }, { status: 400 })
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password)

      const users = await sql`
        INSERT INTO users (name, email, password_hash)
        VALUES (${name}, ${email}, ${hashedPassword})
        RETURNING id
      `

      const userId = users[0].id

      // Create session
      await createSession(userId)

      return NextResponse.json({ success: true, redirect: "/dashboard" })
    } catch (error) {
      return NextResponse.json(
        { errors: { general: ["An error occurred while creating your account"] } },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json({ errors: { general: ["Invalid request"] } }, { status: 400 })
  }
}
