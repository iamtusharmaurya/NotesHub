"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface AuthFormProps {
  mode: "login" | "signup"
}

interface FormErrors {
  name?: string[]
  email?: string[]
  password?: string[]
  general?: string[]
}

export function AuthForm({ mode }: AuthFormProps) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login"

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.success) {
        router.push(data.redirect)
        router.refresh()
      } else {
        setErrors(data.errors || { general: ["An error occurred"] })
      }
    } catch (error) {
      setErrors({ general: ["Network error. Please try again."] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{mode === "signup" ? "Sign Up" : "Login"}</CardTitle>
        <CardDescription>
          {mode === "signup"
            ? "Create your account to start taking notes"
            : "Enter your credentials to access your notes"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" type="text" placeholder="John Doe" required />
              {errors.name && <p className="text-sm text-red-500">{errors.name[0]}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="john@example.com" required />
            {errors.email && <p className="text-sm text-red-500">{errors.email[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
            {errors.password && <p className="text-sm text-red-500">{errors.password[0]}</p>}
          </div>

          {errors.general && (
            <Alert variant="destructive">
              <AlertDescription>{errors.general[0]}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : mode === "signup" ? "Sign Up" : "Login"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="underline">
                Login
              </Link>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
