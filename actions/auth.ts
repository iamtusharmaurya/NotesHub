import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { SignupSchema, LoginSchema, type FormState } from "@/lib/validations"
import { hashPassword, verifyPassword, createSession, deleteSession } from "@/lib/auth"

export async function signup(state: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = SignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email, password } = validatedFields.data

  // If no database connection, simulate successful signup
  if (!sql) {
    console.log("Preview mode: Simulating user signup")
    await createSession(1) // Mock user ID
    redirect("/dashboard")
    return
  }

  try {
    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return {
        errors: { email: ["Email already exists"] },
      }
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
  } catch (error) {
    return {
      errors: { general: ["An error occurred while creating your account"] },
    }
  }

  redirect("/dashboard")
}

export async function login(state: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  // If no database connection, simulate successful login
  if (!sql) {
    console.log("Preview mode: Simulating user login")
    await createSession(1) // Mock user ID
    redirect("/dashboard")
    return
  }

  try {
    // Find user
    const users = await sql`
      SELECT id, password_hash FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      return {
        errors: { general: ["Invalid email or password"] },
      }
    }

    const user = users[0]

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      return {
        errors: { general: ["Invalid email or password"] },
      }
    }

    // Create session
    await createSession(user.id)
  } catch (error) {
    return {
      errors: { general: ["An error occurred while logging in"] },
    }
  }

  redirect("/dashboard")
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}
