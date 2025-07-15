"use client"

import { useState, useEffect } from "react"
import { NoteCard } from "@/components/note-card"
import { SearchBar } from "@/components/search-bar"
import { NoteDetailModal } from "@/components/note-detail-modal"
import type { NoteWithDetails } from "@/lib/db"

interface ExploreClientProps {
  initialNotes: NoteWithDetails[]
  currentUserId?: number // Optional, as explore page might not always have a logged-in user
}

export function ExploreClient({ initialNotes, currentUserId }: ExploreClientProps) {
  const [notes, setNotes] = useState<NoteWithDetails[]>(initialNotes)
  const [filteredNotes, setFilteredNotes] = useState<NoteWithDetails[]>(initialNotes)
  const [selectedNote, setSelectedNote] = useState<NoteWithDetails | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Re-fetch notes if initialNotes changes (e.g., after a revalidation)
  useEffect(() => {
    setNotes(initialNotes)
    setFilteredNotes(initialNotes)
  }, [initialNotes])

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredNotes(notes)
      return
    }

    const filtered = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.content.toLowerCase().includes(query.toLowerCase()) ||
        note.user_name?.toLowerCase().includes(query.toLowerCase()),
    )
    setFilteredNotes(filtered)
  }

  const handleViewDetails = (note: NoteWithDetails) => {
    setSelectedNote(note)
    setShowDetailModal(true)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Explore Public Notes</h1>
        <p className="text-muted-foreground">Discover interesting notes shared by the community</p>
      </div>

      <div className="mb-6">
        <SearchBar onSearch={handleSearch} placeholder="Search public notes..." />
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {notes.length === 0 ? "No public notes available yet." : "No notes match your search."}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} onViewDetails={handleViewDetails} currentUserId={currentUserId} />
          ))}
        </div>
      )}

      <NoteDetailModal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} note={selectedNote} />
    </div>
  )
}
