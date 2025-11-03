"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MessageSquare, User, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { notifications } from "@/lib/notifications"

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Prevent double submission
    if (isSubmitting) return
    
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    
    // Create an AbortController for timeout handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    let hasShownToast = false
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      // Only proceed if we got a valid response
      if (!response) {
        throw new Error('No response from server')
      }
      
      if (response.ok) {
        // Try to parse JSON, but don't fail if it's not JSON
        try {
          await response.json()
        } catch {
          // Response was OK, that's what matters
        }
        
        // Only show success if we got a successful response
        if (!hasShownToast) {
          notifications.showSuccess({
            title: 'Message sent successfully!',
            description: "We'll get back to you soon.",
          })
          hasShownToast = true
        }
        // Reset form after successful submission
        if (formRef.current) {
          formRef.current.reset()
        } else {
          e.currentTarget.reset()
        }
      } else {
        // Handle error response
        let errorMessage = 'Please try again or email us directly.'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // Couldn't parse error response, use default
        }
        
        if (!hasShownToast) {
          notifications.showError({
            title: 'Failed to send message',
            description: errorMessage,
          })
          hasShownToast = true
        }
      }
    } catch (error: unknown) {
      clearTimeout(timeoutId)
      
      // Only show toast if we haven't already shown one
      if (!hasShownToast) {
        // Don't show error if it was an abort (timeout) - might have succeeded on server
        if (error instanceof Error && error.name === 'AbortError') {
          notifications.showInfo(
            'This may take a moment. If you receive a confirmation email, your message was sent successfully.'
          )
        } else {
          notifications.showError({
            title: 'Failed to send message',
            description: error instanceof Error ? error.message : 'Please check your connection and try again.',
          })
        }
        hasShownToast = true
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <main className="pt-24 pb-16 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tl from-accent/20 to-primary/20 rounded-full blur-3xl"></div>
      </div>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          {/* Header */}
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent mb-6"
            >
              <MessageSquare className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Get in <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have a question or feedback? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Contact Info Cards */}
            <motion.div variants={fadeInUp} className="space-y-6">
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Email Us</h3>
                    <p className="text-muted-foreground">Send us an email anytime</p>
                    <a href="mailto:sendora@gmail.com" className="text-primary hover:underline mt-2 inline-block">
                      sendora@gmail.com
                    </a>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Quick Response</h3>
                    <p className="text-muted-foreground">We typically reply within 24 hours</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Data Privacy</h3>
                    <p className="text-muted-foreground">Your information is secure and private</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Contact Form */}
            <motion.div variants={fadeInUp} className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl -z-10 blur-xl"></div>
              <form ref={formRef} onSubmit={handleSubmit} className="bg-card border border-border rounded-3xl p-8 shadow-2xl space-y-6">
                <div className="relative">
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Name
                  </label>
                  <Input 
                    type="text" 
                    name="name" 
                    placeholder="Your full name" 
                    required 
                    className="w-full h-12 transition-all focus:ring-2 focus:ring-primary" 
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    Email
                  </label>
                  <Input 
                    type="email" 
                    name="email" 
                    placeholder="your@email.com" 
                    required 
                    className="w-full h-12 transition-all focus:ring-2 focus:ring-primary" 
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Message
                  </label>
                  <Textarea 
                    name="message" 
                    placeholder="Tell us what's on your mind..." 
                    required 
                    className="w-full h-32 transition-all focus:ring-2 focus:ring-primary resize-none" 
                  />
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:shadow-xl transition-all text-base font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
