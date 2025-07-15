import { NoteForm } from "@/components/note-form"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function CreateNotePage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Create New Note</h1>
      <NoteForm />
    </div>
  )
}
