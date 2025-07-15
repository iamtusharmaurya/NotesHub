"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye, Lock, MessageCircle } from "lucide-react"
import { LikeButton } from "./like-button"
import { Badge } from "@/components/ui/badge"
import type { NoteWithDetails } from "@/lib/db"

interface NoteCardProps {
  note: NoteWithDetails
  showActions?: boolean
  onEdit?: (note: NoteWithDetails) => void
  currentUserId?: number
  onViewDetails?: (note: NoteWithDetails) => void
}

export function NoteCard({ note, showActions = false, onEdit, currentUserId, onViewDetails }: NoteCardProps) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note?")) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/notes/${note.id}/delete`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to delete note:", error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="h-full cursor-pointer hover:shadow-md transition-shadow" onClick={() => onViewDetails?.(note)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={note.is_public ? "default" : "secondary"}>
              {note.is_public ? (
                <>
                  <Eye className="w-3 h-3 mr-1" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 mr-1" />
                  Private
                </>
              )}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground capitalize">by {note.user_name}</p>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {note.tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{note.content}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-xs text-muted-foreground">{new Date(note.created_at).toLocaleDateString()}</p>
            {note.is_public && (
              <div className="flex items-center gap-2">
                <LikeButton
                  noteId={note.id}
                  initialLiked={note.is_liked || false}
                  initialCount={note.like_count || 0}
                  requireAuth={!currentUserId}
                />
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{note.comment_count || 0}</span>
                </div>
              </div>
            )}
          </div>
          {showActions && (
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="outline" onClick={() => onEdit?.(note)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleDelete} disabled={deleting}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
