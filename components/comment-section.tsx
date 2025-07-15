"use client"

import { useState, useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trash2, MessageCircle } from "lucide-react"
import { addComment, deleteComment } from "@/actions/interactions"
import type { Comment } from "@/lib/db"

interface CommentSectionProps {
  noteId: number
  comments: Comment[]
  currentUserId?: number
  requireAuth?: boolean
}

export function CommentSection({ noteId, comments, currentUserId, requireAuth = false }: CommentSectionProps) {
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [state, formAction, pending] = useActionState(addComment.bind(null, noteId), undefined)

  const handleDeleteComment = async (commentId: number) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      await deleteComment(commentId)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Comments ({comments.length})
        </h3>
        {!requireAuth && (
          <Button variant="outline" size="sm" onClick={() => setShowCommentForm(!showCommentForm)}>
            Add Comment
          </Button>
        )}
      </div>

      {showCommentForm && (
        <Card>
          <CardContent className="pt-4">
            <form action={formAction} className="space-y-4">
              <Textarea name="content" placeholder="Write your comment..." rows={3} required />
              {state?.errors?.content && <p className="text-sm text-red-500">{state.errors.content[0]}</p>}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={pending}>
                  {pending ? "Posting..." : "Post Comment"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCommentForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {comments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{comment.user_name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm capitalize">{comment.user_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
                {currentUserId === comment.user_id && (
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteComment(comment.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {requireAuth && comments.length === 0 && (
        <p className="text-center text-muted-foreground py-4">
          No comments yet.{" "}
          <a href="/login" className="underline">
            Login
          </a>{" "}
          to add the first comment!
        </p>
      )}
    </div>
  )
}
