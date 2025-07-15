import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { sql } from "@/lib/db"
import { MOCK_PDF_URL } from "@/lib/constants" // Import mock URL

export async function GET(request: Request, { params }: { params: { filename: string } }) {
  try {
    const { filename } = params

    if (!filename) {
      console.error("GET /api/attachments/[filename]: Filename is missing.")
      return NextResponse.json(
        { error: "Filename required" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      )
    }

    // --- Handle Preview Mode (no database connection) ---
    if (!sql) {
      console.warn("GET /api/attachments/[filename]: No database URL found. Attempting to serve mock PDF for preview.")
      let pdfBuffer: Buffer
      try {
        const response = await fetch(MOCK_PDF_URL)
        if (!response.ok) {
          console.error(
            `GET /api/attachments/[filename]: Failed to fetch mock PDF from ${MOCK_PDF_URL}: ${response.statusText}`,
          )
          // Fallback: create an empty PDF buffer if fetch fails
          pdfBuffer = Buffer.from([])
        } else {
          const arrayBuffer = await response.arrayBuffer()
          pdfBuffer = Buffer.from(arrayBuffer)
          console.log(
            `GET /api/attachments/[filename]: Successfully fetched mock PDF. Buffer length: ${pdfBuffer.length}`,
          )
        }

        return new NextResponse(pdfBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Length": pdfBuffer.length.toString(),
            "Content-Disposition": `inline; filename="${filename}.pdf"`, // Use requested filename for mock
            "Cache-Control": "no-store", // Prevent caching
          },
          status: 200, // Always return 200 OK for a PDF response
        })
      } catch (mockPdfError) {
        console.error("GET /api/attachments/[filename]: Uncaught error during mock PDF fetch/processing:", mockPdfError)
        // If any error occurs during fetch or buffer creation, return an empty PDF
        return new NextResponse(Buffer.from([]), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Length": "0",
            "Content-Disposition": `inline; filename="${filename}.pdf"`,
            "Cache-Control": "no-store", // Prevent caching
          },
          status: 200, // Still return 200 OK, but with empty content
        })
      }
    }
    // --- End Preview Mode Handling ---

    // --- Actual Deployment Logic (requires persistent file system and DB) ---
    // This part will not execute in the v0 preview environment due to `!sql` check
    const attachments = await sql`
      SELECT * FROM note_attachments WHERE filename = ${filename}
    `

    if (attachments.length === 0) {
      console.error(`GET /api/attachments/[filename]: File info not found in DB for filename: ${filename}`)
      return NextResponse.json({ error: "File not found" }, { status: 404, headers: { "Cache-Control": "no-store" } })
    }

    const attachment = attachments[0]
    const filePath = join(process.cwd(), "uploads", filename)

    console.log(`GET /api/attachments/[filename]: Attempting to read file from: ${filePath}`)
    console.log(
      `GET /api/attachments/[filename]: Expected MIME Type: ${attachment.mime_type}, Size: ${attachment.file_size}`,
    )

    try {
      const fileBuffer = await readFile(filePath)
      console.log(`GET /api/attachments/[filename]: Successfully read file. Buffer length: ${fileBuffer.length}`)

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": attachment.mime_type,
          "Content-Length": attachment.file_size.toString(),
          "Content-Disposition": `inline; filename="${attachment.original_filename}"`,
          "Cache-Control": "no-store", // Prevent caching
        },
      })
    } catch (readError) {
      console.error(`GET /api/attachments/[filename]: Failed to read file from disk at ${filePath}:`, readError)
      return NextResponse.json(
        { error: "File not found on disk or read error" },
        { status: 404, headers: { "Cache-Control": "no-store" } },
      )
    }
  } catch (error) {
    console.error("GET /api/attachments/[filename]: Uncaught error serving attachment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    )
  }
}
