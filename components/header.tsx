"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Plus, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "./theme-toggle"
// Removed: import { motion } from "framer-motion"

interface HeaderProps {
  user?: {
    id: number
    name: string
    email: string
  } | null
}

export function Header({ user }: HeaderProps) {
  const [loggingOut, setLoggingOut] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (response.ok) {
        router.push("/login")
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to logout:", error)
    } finally {
      setLoggingOut(false)
    }
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  // Common navigation links for both desktop and mobile (top section)
  const CommonNavLinks = () => (
    <>
      <Link href="/explore" className="text-muted-foreground hover:text-foreground" onClick={closeMobileMenu}>
        Explore
      </Link>

      {user ? (
        <>
          <Link href="/dashboard" onClick={closeMobileMenu}>
            <Button variant="ghost" className="font-bold text-muted-foreground hover:text-primary">
              My Notes
            </Button>
          </Link>
          {/* Display user's first name with emoji for desktop, "My Profile" for mobile */}
          <Link href={`/profile/${user.id}`} onClick={closeMobileMenu}>
            <Button variant="ghost" className="font-bold text-muted-foreground hover:text-primary">
              <span className="hidden md:inline capitalize">
                {user.name.split(" ")[0]}
                {" 😎"}
              </span>
              <span className="md:hidden">My Profile</span> {/* Keep "My Profile" for mobile */}
            </Button>
          </Link>
          <Link href="/create" onClick={closeMobileMenu}>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleLogout()
              closeMobileMenu()
            }}
            disabled={loggingOut}
            className="border-primary text-primary hover:bg-primary/10 bg-transparent"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </Button>
        </>
      ) : (
        <>
          <Link href="/login" onClick={closeMobileMenu}>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Login
            </Button>
          </Link>
          <Link href="/signup" onClick={closeMobileMenu}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Sign Up</Button>
          </Link>
        </>
      )}
    </>
  )

  // Mobile-specific navigation links (includes common links + footer links)
  const MobileNavContent = () => (
    <>
      <Link
        href="/"
        className="flex items-center gap-2 font-bold text-xl text-foreground mb-4"
        onClick={closeMobileMenu}
      >
        <BookOpen className="w-6 h-6 text-primary" />
        NotesHub
      </Link>
      <nav className="flex flex-col gap-4">
        <CommonNavLinks />

        <div className="border-t border-border my-4" />

        {/* Company Links (Mobile Only) */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground mb-2">COMPANY</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/about-us" className="hover:text-foreground transition-colors" onClick={closeMobileMenu}>
                About Us
              </Link>
            </li>
            <li>
              <Link href="/support" className="hover:text-foreground transition-colors" onClick={closeMobileMenu}>
                Support
              </Link>
            </li>
            <li>
              <Link
                href="/privacy-policy"
                className="hover:text-foreground transition-colors"
                onClick={closeMobileMenu}
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms-and-condition"
                className="hover:text-foreground transition-colors"
                onClick={closeMobileMenu}
              >
                Terms and Condition
              </Link>
            </li>
            <li>
              <Link
                href="/pricing-and-refund"
                className="hover:text-foreground transition-colors"
                onClick={closeMobileMenu}
              >
                Pricing and Refund
              </Link>
            </li>
            <li>
              <Link href="/hire-from-us" className="hover:text-foreground transition-colors" onClick={closeMobileMenu}>
                Hire From Us
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  )

  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
          <BookOpen className="w-6 h-6 text-primary" />
          NotesHub
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <CommonNavLinks />
          <ThemeToggle />
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px] flex flex-col">
              <MobileNavContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
