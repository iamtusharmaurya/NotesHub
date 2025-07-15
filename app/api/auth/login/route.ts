import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { LoginSchema } from "@/lib/validations"
import { verifyPassword, createSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const validatedFields = LoginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    })

    if (!validatedFields.success) {
      return NextResponse.json({ errors: validatedFields.error.flatten().fieldErrors }, { status: 400 })
    }

    const { email, password } = validatedFields.data

    // If no database connection, simulate successful login
    if (!sql) {
      console.log("Preview mode: Simulating user login")
      await createSession(1) // Mock user ID
      return NextResponse.json({ success: true, redirect: "/dashboard" })
    }

    try {
      // Find user
      const users = await sql`
        SELECT id, password_hash FROM users WHERE email = ${email}
      `

      if (users.length === 0) {
        return NextResponse.json({ errors: { general: ["Invalid email or password"] } }, { status: 400 })
      }

      const user = users[0]

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password_hash)

      if (!isValidPassword) {
        return NextResponse.json({ errors: { general: ["Invalid email or password"] } }, { status: 400 })
      }

      // Create session
      await createSession(user.id)

      return NextResponse.json({ success: true, redirect: "/dashboard" })
    } catch (error) {
      return NextResponse.json({ errors: { general: ["An error occurred while logging in"] } }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ errors: { general: ["Invalid request"] } }, { status: 400 })
  }
}
