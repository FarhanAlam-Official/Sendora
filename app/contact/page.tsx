"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      })
      if (response.ok) {
        setMessage("Message sent successfully!")
        e.currentTarget.reset()
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (error) {
      setMessage("Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="pt-24 pb-16">
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground mb-12">Have a question? We'd love to hear from you.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input type="text" name="name" placeholder="Your name" required className="w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input type="email" name="email" placeholder="your@email.com" required className="w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <Textarea name="message" placeholder="Tell us what's on your mind..." required className="w-full h-32" />
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${message.includes("successfully") ? "bg-green-500/20 text-green-700" : "bg-red-500/20 text-red-700"}`}
              >
                {message}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </motion.div>
      </section>
    </main>
  )
}
