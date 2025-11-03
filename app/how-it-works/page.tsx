"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Upload, MapPin, Eye, Send, FileUp, FileCheck, Sparkles, BarChart3, Shield, CheckCircle2 } from "lucide-react"

export default function HowItWorks() {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })

  const steps = [
    {
      icon: Upload,
      number: "1",
      title: "Upload Your Data",
      description:
        "Upload an Excel or CSV file containing recipient information with columns for names, emails, and any custom fields you need.",
      color: "from-blue-500 to-cyan-500",
      features: ["Excel/CSV support", "Auto parsing", "Instant validation"],
    },
    {
      icon: FileCheck,
      number: "2",
      title: "Upload Certificates",
      description:
        "Upload PDF certificates and match them with your recipients. Our intelligent system helps you connect the right certificate to each person.",
      color: "from-purple-500 to-pink-500",
      features: ["Smart matching", "Bulk upload", "Manual override"],
    },
    {
      icon: MapPin,
      number: "3",
      title: "Map Your Fields",
      description:
        "Connect your file columns to email fields. Map name, email, certificate links, or any custom content. Manually edit, skip, or cancel specific rows.",
      color: "from-orange-500 to-red-500",
      features: ["Drag & drop mapping", "Custom fields", "Row editing"],
    },
    {
      icon: Eye,
      number: "4",
      title: "Preview & Compose",
      description:
        "Write your email subject and body with dynamic placeholders like {{name}}. See a live preview of how each email will look.",
      color: "from-green-500 to-emerald-500",
      features: ["Live preview", "Dynamic placeholders", "Template support"],
    },
    {
      icon: Send,
      number: "5",
      title: "Configure & Send",
      description:
        "Choose your SMTP configuration (default or custom), review the summary, and send. Track progress in real-time with detailed logging.",
      color: "from-indigo-500 to-blue-500",
      features: ["SMTP setup", "Real-time tracking", "Error handling"],
    },
  ]

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  }

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  return (
    <main className="pt-24 pb-16 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center mb-20"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent mb-6"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4">
            How <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Sendora</span> Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A simple, powerful 5-step process to automate your certificate and email distribution
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div 
          ref={containerRef}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="space-y-8"
        >
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="group"
            >
              <div className="relative bg-card border border-border rounded-3xl p-8 hover:shadow-2xl transition-all overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-5`}></div>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                  {/* Icon Section */}
                  <div className="flex-shrink-0 relative">
                    <motion.div
                      whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                      transition={{ duration: 0.5 }}
                      className="relative"
                    >
                      <div className={`flex items-center justify-center h-24 w-24 rounded-2xl bg-gradient-to-br ${step.color} shadow-lg group-hover:shadow-xl transition-shadow`}>
                        <step.icon className="w-12 h-12 text-white" />
                      </div>
                      {/* Step Number */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                        <span className="font-bold text-primary">{step.number}</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                      {step.description}
                    </p>
                    
                    {/* Features */}
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {step.features.map((feature, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Arrow Connector (except last) */}
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-full w-0.5 h-8 bg-gradient-to-b from-primary to-accent" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="inline-block p-8 rounded-3xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
              Join thousands of organizations already using Sendora to automate their certificate and email distribution
            </p>
            <a
              href="/send"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-xl transition-all hover:scale-105"
            >
              Start Sending Now
            </a>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
