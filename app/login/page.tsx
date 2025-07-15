import { AuthForm } from "@/components/auth-form"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <AuthForm mode="login" />
    </div>
  )
}
