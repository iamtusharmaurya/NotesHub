"use client"

import React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, File, X, Eye, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PDFFile {
  file: File
  preview: string
  id: string
}

interface PDFUploadProps {
  onFilesChange: (files: File[]) => void
  existingAttachments?: Array<{
    id: number
    filename: string
    original_filename: string
    file_size: number
  }>
}

export function PDFUpload({ onFilesChange, existingAttachments = [] }: PDFUploadProps) {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    const pdfFiles = fileArray.filter((file) => {
      return file && file.type === "application/pdf"
    })

    if (pdfFiles.length !== fileArray.length) {
      alert("Only PDF files are allowed")
    }

    const newPdfFiles: PDFFile[] = pdfFiles
      .filter((file) => file && file.name) // Ensure file and file.name exist
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9),
      }))

    const updatedFiles = [...pdfFiles, ...newPdfFiles]
    setPdfFiles(updatedFiles)
    onFilesChange(updatedFiles.map((pf) => pf.file))

    // Reset the input
    if (event.target) {
      event.target.value = ""
    }
  }

  const removeFile = (id: string) => {
    const fileToRemove = pdfFiles.find((pf) => pf.id === id)
    if (fileToRemove && fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview)
    }

    const updatedFiles = pdfFiles.filter((pf) => pf.id !== id)
    setPdfFiles(updatedFiles)
    onFilesChange(updatedFiles.map((pf) => pf.file))
  }

  const openPDFPreview = (preview: string) => {
    if (preview) {
      window.open(preview, "_blank")
    }
  }

  // Clean up object URLs when component unmounts
  React.useEffect(() => {
    return () => {
      pdfFiles.forEach((pdfFile) => {
        if (pdfFile.preview) {
          URL.revokeObjectURL(pdfFile.preview)
        }
      })
    }
  }, [])

  return (
    <div className="space-y-4">
      <Label>PDF Attachments</Label>

      {/* File Upload Area */}
      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardContent className="p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="mt-4">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="mb-2">
                Choose PDF Files
              </Button>
              <p className="text-sm text-muted-foreground">or drag and drop PDF files here</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Existing Attachments */}
      {existingAttachments && existingAttachments.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Existing Attachments</Label>
          {existingAttachments.map((attachment) => {
            if (!attachment || !attachment.id) return null

            return (
              <Card key={attachment.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <File className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="font-medium text-sm">{attachment.original_filename || "Unknown file"}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(attachment.file_size)}</p>
                    </div>
                    <Badge variant="secondary">PDF</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (attachment.filename) {
                          window.open(`/api/attachments/${attachment.filename}`, "_blank")
                        }
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (attachment.filename && attachment.original_filename) {
                          const link = document.createElement("a")
                          link.href = `/api/attachments/${attachment.filename}`
                          link.download = attachment.original_filename
                          link.click()
                        }
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* New PDF Files Preview */}
      {pdfFiles.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">New Attachments</Label>
          {pdfFiles.map((pdfFile) => {
            if (!pdfFile || !pdfFile.file || !pdfFile.file.name) return null

            return (
              <Card key={pdfFile.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <File className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="font-medium text-sm">{pdfFile.file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(pdfFile.file.size)}</p>
                    </div>
                    <Badge variant="secondary">PDF</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => openPDFPreview(pdfFile.preview)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => removeFile(pdfFile.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Hidden input for form submission */}
      <input type="hidden" name="pdf_files" value={pdfFiles.length.toString()} />
    </div>
  )
}
