"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TagInput } from "./tag-input"
import { PDFUpload } from "./pdf-upload"
import type { NoteWithDetails } from "@/lib/db"

interface NoteFormProps {
  note?: NoteWithDetails
  onCancel?: () => void
}

interface FormErrors {
  title?: string[]
  content?: string[]
  general?: string[]
}

export function NoteForm({ note, onCancel }: NoteFormProps) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [tags, setTags] = useState<string[]>(note?.tags?.map((t) => t.name) || [])
  const [pdfFiles, setPdfFiles] = useState<File[]>([])
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    formData.set("tags", tags.join(","))

    // Add PDF files to form data
    pdfFiles.forEach((file, index) => {
      if (file && file.name) {
        formData.append(`pdf_file_${index}`, file)
      }
    })

    const endpoint = note ? `/api/notes/${note.id}/update` : "/api/notes/create"

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // If onCancel is provided (e.g., when used in a modal), call it to close the form
        if (onCancel) {
          onCancel()
        }
        router.push(data.redirect) // Redirects to /dashboard
        router.refresh() // Refreshes the data on the dashboard
      } else {
        setErrors(data.errors || { general: ["An error occurred"] })
      }
    } catch (error) {
      setErrors({ general: ["Network error. Please try again."] })
    } finally {
      setLoading(false)
    }
  }

  const handleFilesChange = (files: File[]) => {
    // Filter out any invalid files
    const validFiles = files.filter((file) => file && file.name && file.type === "application/pdf")
    setPdfFiles(validFiles)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{note ? "Edit Note" : "Create New Note"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={note?.title || ""}
              placeholder="Enter note title..."
              required
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              defaultValue={note?.content || ""}
              placeholder="Write your note here..."
              rows={10}
              required
            />
            {errors.content && <p className="text-sm text-red-500">{errors.content[0]}</p>}
          </div>

          <TagInput defaultTags={tags} onChange={setTags} />

          <PDFUpload onFilesChange={handleFilesChange} existingAttachments={note?.attachments} />

          <div className="flex items-center space-x-2">
            <Checkbox id="is_public" name="is_public" defaultChecked={note?.is_public || false} />
            <Label htmlFor="is_public">Make this note public</Label>
          </div>

          {errors.general && (
            <Alert variant="destructive">
              <AlertDescription>{errors.general[0]}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : note ? "Update Note" : "Create Note"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
