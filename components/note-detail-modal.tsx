"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Eye, Lock, Calendar, User } from "lucide-react"
import { LikeButton } from "./like-button"
import { CommentSection } from "./comment-section"
import { NoteAttachments } from "./note-attachments"
import type { NoteWithDetails, Comment } from "@/lib/db"

interface NoteDetailModalProps {
  isOpen: boolean
  onClose: () => void
  note: NoteWithDetails | null
}

export function NoteDetailModal({ isOpen, onClose, note }: NoteDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (note && isOpen) {
      fetchComments()
    }
  }, [note, isOpen])

  const fetchComments = async () => {
    if (!note) return

    setLoading(true)
    try {
      const response = await fetch(`/api/notes/${note.id}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error)
      // Use mock comments for preview
      setComments([
        {
          id: 1,
          note_id: note.id,
          user_id: 2,
          content: "Great note! Very helpful.",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_name: "Jane Smith",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!note) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="line-clamp-2">{note.title}</span>
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
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Note metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {note.user_name && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {note.user_name}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(note.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <Badge key={tag.id} variant="outline">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Note content */}
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-sm">{note.content}</div>
          </div>

          {/* PDF Attachments */}
          {note.attachments && note.attachments.length > 0 && <NoteAttachments attachments={note.attachments} />}

          {/* Interactions */}
          {note.is_public && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-4 mb-6">
                <LikeButton
                  noteId={note.id}
                  initialLiked={note.is_liked || false}
                  initialCount={note.like_count || 0}
                  requireAuth={false}
                />
              </div>

              <CommentSection
                noteId={note.id}
                comments={comments}
                currentUserId={1} // Mock user ID for preview
                requireAuth={false}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
