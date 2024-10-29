"use client"

import { motion } from "framer-motion"
import { Heart, Users, Zap, Github, Mail } from "lucide-react"
import Link from "next/link"

export default function About() {
  return (
    <main className="pt-24 pb-16">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-8">About Sendora</h1>

          <div className="prose prose-invert max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Sendora was created to solve a real problem: sending personalized certificates and emails at scale is
              tedious. Whether you're managing a college graduation, event, or training program, manually configuring
              SMTP and sending individual emails takes time away from what matters.
            </p>

            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              We built Sendora to be the fastest way to distribute certificates and personalized messages. Upload your
              data, map your fields, preview your email, and send—all in minutes.
            </p>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Built with passion by OCEM Techies. Version 1.0 • Built with Next.js & Vercel
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 py-12 border-y border-border">
            <div className="text-center">
              <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Built with Care</h3>
              <p className="text-muted-foreground">Crafted for reliability and simplicity</p>
            </div>
            <div className="text-center">
              <Users className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">For Everyone</h3>
              <p className="text-muted-foreground">Works for colleges, clubs, and teams</p>
            </div>
            <div className="text-center">
              <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Always Fast</h3>
              <p className="text-muted-foreground">Quick setup, instant distribution</p>
            </div>
          </div>

          {/* Developer Section */}
          <div className="mt-20 pt-20 border-t border-border">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto text-center"
            >
              <h2 className="text-3xl font-bold mb-4">About the Developer</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Sendora was created by <span className="font-semibold text-foreground">Farhan Alam</span>, a passionate
                full-stack developer dedicated to building tools that solve real-world problems. With expertise in
                modern web technologies and a keen interest in automation, Farhan designed Sendora to make bulk
                certificate distribution simple, fast, and accessible to everyone.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Link
                  href="https://github.com/FarhanAlam-Official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                >
                  <Github className="w-5 h-5" />
                  <span>Visit GitHub</span>
                </Link>
                <Link
                  href="mailto:farhan@example.com"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>Get in Touch</span>
                </Link>
              </div>

              <p className="text-sm text-muted-foreground italic">
                "Building tools that make life easier, one line of code at a time."
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
