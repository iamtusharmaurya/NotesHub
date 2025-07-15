"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { File, Download } from "lucide-react"
import type { Attachment } from "@/lib/db"
import { MOCK_PDF_FILENAME, MOCK_PDF_URL } from "@/lib/constants" // Import constants
import { sql } from "@/lib/db" // Import sql to check for preview mode

interface NoteAttachmentsProps {
  attachments: Attachment[]
}

export function NoteAttachments({ attachments }: NoteAttachmentsProps) {
  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handlePreview = (filename: string) => {
    if (!filename) return

    // In preview mode (no SQL connection), directly open the mock PDF URL
    // This bypasses the problematic API route for previewing in the sandbox
    if (!sql && filename === MOCK_PDF_FILENAME) {
      window.open(MOCK_PDF_URL, "_blank")
    } else {
      // For actual deployments or other files, use the API route
      window.open(`/api/attachments/${filename}`, "_blank")
    }
  }

  const handleDownload = (filename: string, originalFilename: string) => {
    if (!filename || !originalFilename) return

    const link = document.createElement("a")
    link.href = `/api/attachments/${filename}`
    link.download = originalFilename
    link.click()
  }

  // Filter out any invalid attachments
  const validAttachments = attachments?.filter(
    (attachment) => attachment && attachment.id && attachment.filename && attachment.original_filename,
  )

  if (!validAttachments || validAttachments.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <File className="w-5 h-5" />
          Attachments ({validAttachments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {validAttachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <File className="h-8 w-8 text-red-500" />
                <div>
                  <p className="font-medium text-sm">{attachment.original_filename}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">{formatFileSize(attachment.file_size)}</p>
                    <Badge variant="secondary" className="text-xs">
                      PDF
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(attachment.filename, attachment.original_filename)}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
