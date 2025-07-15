import type React from "react"
import type { Metadata } from "next"
import { Inter, Lora } from "next/font/google" // Import Lora font
import "./globals.css"
import { Header } from "@/components/header"
import { getSession } from "@/lib/auth"
import { Footer } from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider" // Import ThemeProvider

// Configure Inter font with CSS variable
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
// Configure Lora font with CSS variable and include italic style
const lora = Lora({ subsets: ["latin"], variable: "--font-lora", style: ["normal", "italic"] })

export const metadata: Metadata = {
  title: "NotesHub - Your Digital Notebook",
  description: "Create, organize, and share your notes with NotesHub",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  return (
    // Apply font variables to the html tag
    <html lang="en" className={`${inter.variable} ${lora.variable}`} suppressHydrationWarning>
      {/* Set Inter as the default font for the body */}
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header user={session?.user} />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
