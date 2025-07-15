"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useRouter } from "next/navigation"

interface LikeButtonProps {
  noteId: number
  initialLiked: boolean
  initialCount: number
  requireAuth?: boolean
}

export function LikeButton({ noteId, initialLiked, initialCount, requireAuth = false }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleLike = () => {
    if (requireAuth) {
      router.push("/login")
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/notes/${noteId}/like`, {
          method: "POST",
        })

        if (response.ok) {
          setIsLiked(!isLiked)
          setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))
        }
      } catch (error) {
        console.error("Failed to toggle like:", error)
      }
    })
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLike} disabled={isPending} className="flex items-center gap-1">
      <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
      <span>{likeCount}</span>
    </Button>
  )
}
