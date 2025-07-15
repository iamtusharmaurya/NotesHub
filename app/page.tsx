"use client" // This component needs to be a client component for framer-motion

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Share, Search, Lock, Play } from "lucide-react" // Import Play icon
import { motion } from "framer-motion" // Import motion from framer-motion
import { Badge } from "@/components/ui/badge" // Import Badge component

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Faster stagger for text
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  }

  const logoVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  const heroText = "We only teach what we are really good at."
  const words = heroText.split(" ")

  const conceptsText = "we do whatever it takes to help you understand the concepts."
  const conceptsWords = conceptsText.split(" ")

  const companiesText = "All College students working with"
  const companiesWords = companiesText.split(" ")

  const YOUTUBE_THUMBNAIL_URL = "/images/youtube-thumbnail.png"

  const companyLogos = [
    {
      src: "/images/company-logos/gl-bajaj.jpeg", // Updated to use the new GL Bajaj logo
      alt: "GL Bajaj Institute of Technology and Management Logo",
    },
    {
      src: "/images/company-logos/galgotias-university.png", // Updated to use the new Galgotias University logo
      alt: "Galgotias University Logo",
    },
    {
      src: "/images/company-logos/niet-greater-noida.png", // Updated to use the new NIET Greater Noida logo
      alt: "NIET Greater Noida Autonomous Institute Logo",
    },
  ]

  const courses = [
    {
      id: 1,
      imageSrc: "/images/courses/git-github-thumbnail.png",
      title: "Git and GitHub Introduction",
      badges: [{ text: "LIVE NOW", variant: "destructive" }],
      price: "₹199", // Fixed price
      isComingSoon: false,
    },
    {
      id: 2,
      imageSrc: "/images/courses/python-thumbnail.png",
      title: "Python Introduction",
      badges: [{ text: "LIVE NOW", variant: "destructive" }],
      price: "₹199", // Fixed price
      isComingSoon: false,
    },
    {
      id: 3,
      imageSrc: "/images/courses/dsa-thumbnail.webp",
      title: "Learn Data Structures and Algorithms",
      badges: [{ text: "Coming Soon", variant: "destructive" }],
      price: "₹199", // Fixed price
      isComingSoon: true,
    },
    {
      id: 4,
      imageSrc: "/images/courses/fullstack-thumbnail.webp",
      title: "Full Stack Web Development With MERN STACK & GenAI",
      badges: [{ text: "LIVE NOW", variant: "destructive" }],
      price: "₹199", // Fixed price
      isComingSoon: false,
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground leading-tight"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {words.map((word, i) => (
              <motion.span
                key={word + i}
                variants={itemVariants}
                className={`inline-block mr-2 ${word === "teach" ? "text-primary" : ""} ${
                  word === "good" || word === "at." ? "font-display italic" : ""
                }`}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>
          <motion.p
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Get ready to <span className="text-primary font-semibold">accelerate your career</span> with customized
            Notes and leave your mark in the industry.
          </motion.p>
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1, duration: 0.5 }}
            className="flex gap-4 justify-center"
          >
            <Link href="/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Get Started
              </Button>
            </Link>
            <Link href="/explore">
              <Button
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary/10 bg-transparent"
              >
                Explore Notes
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <h3 className="text-4xl font-bold text-foreground mb-2">25k+</h3>
              <p className="text-muted-foreground">Students</p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h3 className="text-4xl font-bold text-foreground mb-2">20+</h3>
              <p className="text-muted-foreground">Collages</p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h3 className="text-4xl font-bold text-foreground mb-2">54K+</h3>
              <p className="text-muted-foreground">PDF Notes.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Concepts Video Section */}
      <section className="py-20 px-4 bg-background text-center">
        <div className="container mx-auto max-w-4xl">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-12 text-foreground leading-tight"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={containerVariants}
          >
            {conceptsWords.map((word, i) => (
              <motion.span
                key={word + i}
                variants={itemVariants}
                className={`inline-block mr-2 ${
                  word === "understand" || word === "the" || word === "concepts." ? "text-primary" : ""
                }`}
              >
                {word}
              </motion.span>
            ))}
          </motion.h2>

          <motion.div
            className="relative w-full max-w-3xl mx-auto aspect-video rounded-lg overflow-hidden shadow-xl border border-border"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Directly use the Blob URL for the YouTube video thumbnail */}
            <img
              src={YOUTUBE_THUMBNAIL_URL || "/placeholder.svg"}
              alt="YouTube video thumbnail"
              style={{ objectFit: "fill" }}
              className="absolute inset-0 w-full h-full"
            />
            {/* Overlay for play button and "Watch on YouTube" */}
            <a
              href="https://youtu.be/MeWAG1QH5sg?si=RfMbfgXY0VuI5zTc" // Replace with actual YouTube video URL
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex items-center justify-center bg-black/50 group"
            >
              <Play className="w-20 h-20 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                Watch on <span className="font-bold">YouTube</span>
              </div>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12"
          >
            <Link href="/explore">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Explore free learning
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="py-20 px-4 bg-background text-center">
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-12 text-foreground leading-tight"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={containerVariants}
          >
            {companiesWords.map((word, i) => (
              <motion.span
                key={word + i}
                variants={itemVariants}
                className={`inline-block mr-2 ${word === "working" || word === "with" ? "text-primary" : ""}`}
              >
                {word}
              </motion.span>
            ))}
          </motion.h2>

          <motion.div
            className="flex flex-wrap justify-center gap-8 items-center mb-12" // Changed to flexbox for centering
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            {companyLogos.map((logo, index) => (
              <motion.div key={index} variants={logoVariants} className="flex justify-center items-center p-4">
                {/* Directly use the Blob URL for company logos */}
                <img
                  src={logo.src || "/placeholder.svg"}
                  alt={logo.alt}
                  style={{ objectFit: "contain" }}
                  className="object-contain max-h-24 w-auto" // Increased max-h to make logos bigger
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12"
          >
            <Link href="/explore">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Explore Courses
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Courses Offered Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-12 text-foreground text-left"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
          >
            Paid Notes.
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            {courses.map((course) => (
              <motion.div key={course.id} variants={cardVariants}>
                <Card className="h-full bg-card border-border shadow-lg hover:shadow-xl transition-shadow text-foreground flex flex-col">
                  <div className="relative w-full aspect-video overflow-hidden rounded-t-lg">
                    {/* Directly use the Blob URL for course thumbnails */}
                    <img
                      src={course.imageSrc || "/placeholder.svg"}
                      alt={course.title}
                      style={{ objectFit: "cover" }}
                      className="absolute inset-0 w-full h-full"
                    />
                    {course.isComingSoon && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-xl font-bold">
                        Coming soon
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-3 flex-grow">
                    <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {course.badges
                        .filter((badge) => badge.text !== "HINGLISH") // Filter out HINGLISH badge
                        .map((badge, index) => (
                          <Badge key={index} variant={badge.variant as "default" | "secondary" | "destructive"}>
                            {badge.text}
                          </Badge>
                        ))}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl font-bold">{course.price}</span>
                    </div>
                    {course.isComingSoon ? (
                      <Button className="w-full bg-muted text-muted-foreground cursor-not-allowed" disabled>
                        Coming soon
                      </Button>
                    ) : (
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        View Details
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            className="text-3xl font-bold text-center mb-12 text-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
          >
            Everything you need to manage your notes
          </motion.h2>
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            <motion.div variants={cardVariants}>
              <Card className="h-full bg-card border-border shadow-lg hover:shadow-xl transition-shadow text-foreground">
                <CardHeader>
                  <BookOpen className="w-8 h-8 mb-2 text-primary" />
                  <CardTitle>Create & Edit</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    Write and edit your notes with a clean, distraction-free interface.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="h-full bg-card border-border shadow-lg hover:shadow-xl transition-shadow text-foreground">
                <CardHeader>
                  <Lock className="w-8 h-8 mb-2 text-primary" />
                  <CardTitle>Privacy Control</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    Keep notes private or make them public. You control who sees what.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="h-full bg-card border-border shadow-lg hover:shadow-xl transition-shadow text-foreground">
                <CardHeader>
                  <Share className="w-8 h-8 mb-2 text-primary" />
                  <CardTitle>Share Ideas</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    Share your public notes with others and discover interesting content.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="h-full bg-card border-border shadow-lg hover:shadow-xl transition-shadow text-foreground">
                <CardHeader>
                  <Search className="w-8 h-8 mb-2 text-primary" />
                  <CardTitle>Find & Explore</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    Search through public notes and discover new ideas from the community.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="py-20 px-4 bg-card"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to start writing?</h2>
          <p className="text-muted-foreground mb-8">Join thousands of users who trust NotesHub with their ideas.</p>
          <Link href="/signup">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Create Your Account
            </Button>
          </Link>
        </div>
      </motion.section>
    </div>
  )
}
