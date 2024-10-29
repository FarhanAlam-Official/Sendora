"use client"

import { motion } from "framer-motion"
import { Upload, MapPin, Eye, Send } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      number: "1",
      title: "Upload Your Data",
      description:
        "Upload an Excel or CSV file containing recipient information with columns for names, emails, and any custom fields you need.",
    },
    {
      icon: MapPin,
      number: "2",
      title: "Map Your Fields",
      description:
        "Connect your file columns to email fields. Map name, email, certificate links, or any custom content. Manually edit, skip, or cancel specific rows.",
    },
    {
      icon: Eye,
      number: "3",
      title: "Preview & Compose",
      description:
        "Write your email subject and body with dynamic placeholders like {{name}}. See a live preview of how each email will look.",
    },
    {
      icon: Send,
      number: "4",
      title: "Send & Track",
      description:
        "Choose your SMTP configuration (default or custom), review the summary, and send. Track progress in real-time with detailed logging.",
    },
  ]

  return (
    <main className="pt-24 pb-16">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">How Sendora Works</h1>
          <p className="text-xl text-muted-foreground">A simple, guided 4-step process</p>
        </motion.div>

        <div className="space-y-12">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex gap-8 items-center ${idx % 2 === 1 ? "flex-row-reverse" : ""}`}
            >
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  <step.icon className="w-10 h-10" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">
                  Step {step.number}: {step.title}
                </h3>
                <p className="text-lg text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  )
}
