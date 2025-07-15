import Link from "next/link"
import { Instagram, Linkedin, Youtube, Twitter, MessageSquare, BookOpen } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-background text-muted-foreground py-12 px-4 border-t border-border">
      <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand and Socials */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
            <BookOpen className="w-6 h-6 text-primary" />
            NotesHub
          </Link>
          <p className="text-sm">Let's connect with our socials</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-foreground transition-colors">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              <Linkedin className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              <MessageSquare className="w-5 h-5" /> {/* Using MessageSquare for Discord */}
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              <Youtube className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              <Twitter className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Company Links */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground mb-2">COMPANY</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/about-us" className="hover:text-foreground transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/support" className="hover:text-foreground transition-colors">
                Support
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-and-condition" className="hover:text-foreground transition-colors">
                Terms and Condition
              </Link>
            </li>
            <li>
              <Link href="/pricing-and-refund" className="hover:text-foreground transition-colors">
                Pricing and Refund
              </Link>
            </li>
            <li>
              <Link href="/hire-from-us" className="hover:text-foreground transition-colors">
                Hire From Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Community Links */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground mb-2">COMMUNITY</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/inertia" className="hover:text-foreground transition-colors">
                Inertia
              </Link>
            </li>
            <li>
              <Link href="/discord" className="hover:text-foreground transition-colors">
                Discord
              </Link>
            </li>
          </ul>
        </div>

        {/* Get In Touch */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground mb-2">Get In Touch</h3>
          <ul className="space-y-2 text-sm">
            <li>+91 7055594566</li>
            <li>
              <Link href="mailto:hello@sheryians.com" className="hover:text-foreground transition-colors">
                iamtusharmaurya@gmail.com
              </Link>
            </li>
            <li>Kanhai Gaon Market, Sector 45, Gurugram, Haryana 122022</li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="container mx-auto max-w-6xl border-t border-border mt-8 pt-8 text-center text-xs">
        <p>
          &copy; {new Date().getFullYear()} NotesHub. All Rights Reserved. Designed by{" "}
          <Link
            href="https://github.com/iamtusharmaurya"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            ❤️@iamtusharmaurya
          </Link>
          .
        </p>
      </div>
    </footer>
  )
}
