"use client"

import { useState, useEffect } from "react"
import { NoteCard } from "@/components/note-card"
import { NoteForm } from "@/components/note-form"
import { SearchBar } from "@/components/search-bar"
import { NoteDetailModal } from "@/components/note-detail-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { NoteWithDetails } from "@/lib/db"

interface DashboardClientProps {
  initialNotes: NoteWithDetails[]
  currentUserId: number // Pass current user ID for actions
}

export function DashboardClient({ initialNotes, currentUserId }: DashboardClientProps) {
  const [notes, setNotes] = useState<NoteWithDetails[]>(initialNotes)
  const [filteredNotes, setFilteredNotes] = useState<NoteWithDetails[]>(initialNotes)
  const [editingNote, setEditingNote] = useState<NoteWithDetails | null>(null)
  const [selectedNote, setSelectedNote] = useState<NoteWithDetails | null>(null)
  const [showForm, setShowForm] = useState(false)
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
        note.content.toLowerCase().includes(query.toLowerCase()),
    )
    setFilteredNotes(filtered)
  }

  const handleEdit = (note: NoteWithDetails) => {
    setEditingNote(note)
    setShowForm(true)
  }

  const handleViewDetails = (note: NoteWithDetails) => {
    setSelectedNote(note)
    setShowDetailModal(true)
  }

  const handleCancel = () => {
    setEditingNote(null)
    setShowForm(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Notes</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      {showForm && (
        <div className="mb-8">
          <NoteForm note={editingNote || undefined} onCancel={handleCancel} />
        </div>
      )}

      <div className="mb-6">
        <SearchBar onSearch={handleSearch} placeholder="Search your notes..." />
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {notes.length === 0 ? "You haven't created any notes yet." : "No notes match your search."}
          </p>
          {notes.length === 0 && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Note
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              showActions
              onEdit={handleEdit}
              currentUserId={currentUserId}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      <NoteDetailModal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} note={selectedNote} />
    </div>
  )
}
