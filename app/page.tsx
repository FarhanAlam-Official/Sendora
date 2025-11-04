"use client"

import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { CheckCircle2, Mail, FileUp, Zap, Shield, BarChart3, Sparkles, ArrowRight, Star, TrendingUp, Users, Lock } from "lucide-react"
import {
  organizationSchema,
  websiteSchema,
  webApplicationSchema,
  howToSchema,
  productSchema,
} from "@/lib/structured-data"

export default function Home() {
  // Clear send completion flag when visiting home page to allow new batches
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sendora_send_completed")
    }
  }, [])

  // Typing animation words
  const words = ["Certificates", "Documents", "Emails", "Awards"]
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentWord = words[currentWordIndex]
    let timeout: NodeJS.Timeout

    if (!isDeleting) {
      // Typing
      if (displayText.length < currentWord.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length + 1))
        }, 100)
      } else {
        // Pause before deleting
        timeout = setTimeout(() => {
          setIsDeleting(true)
        }, 2000)
      }
    } else {
      // Deleting
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length - 1))
        }, 50)
      } else {
        // Move to next word
        setIsDeleting(false)
        setCurrentWordIndex((prev) => (prev + 1) % words.length)
      }
    }

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayText, isDeleting, currentWordIndex])
  
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  }

  const fadeInDown = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  }

  const scaleIn = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 },
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  // Ref for stats animation
  const statsRef = useRef(null)
  const statsInView = useInView(statsRef, { once: true })

  const features = [
    {
      icon: FileUp,
      title: "Easy Upload",
      description: "Upload your Excel file and we'll parse it automatically",
      color: "from-blue-500/10 to-blue-400/5",
    },
    {
      icon: Mail,
      title: "Smart Mapping",
      description: "Map your data fields to recipients, subjects, and content",
      color: "from-purple-500/10 to-purple-400/5",
    },
    {
      icon: Zap,
      title: "Instant Send",
      description: "Send personalized emails in bulk with one click",
      color: "from-pink-500/10 to-pink-400/5",
    },
    {
      icon: Shield,
      title: "Secure",
      description: "Your credentials stored locally, never uploaded",
      color: "from-emerald-500/10 to-emerald-400/5",
    },
    {
      icon: BarChart3,
      title: "Track Progress",
      description: "Real-time progress tracking and detailed summaries",
      color: "from-orange-500/10 to-orange-400/5",
    },
    {
      icon: CheckCircle2,
      title: "Retry Failed",
      description: "Automatic retry for failed sends",
      color: "from-cyan-500/10 to-cyan-400/5",
    },
  ]

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 min-h-[90vh] flex items-center">
        {/* Enhanced Background Gradient Effects */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div 
            animate={{
              opacity: [0.4, 0.6, 0.4],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-3xl"
          ></motion.div>
          <motion.div
            animate={{
              opacity: [0.4, 0.6, 0.4],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute bottom-0 right-10 w-80 h-80 bg-gradient-to-br from-accent/30 to-primary/20 rounded-full blur-3xl"
          ></motion.div>
          <motion.div
            animate={{
              opacity: [0.4, 0.6, 0.4],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl"
          ></motion.div>
        </div>

        {/* Animated Grid Background */}
        <div className="absolute inset-0 -z-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.05) 1px, transparent 0)" }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            {/* Left Content */}
            <motion.div variants={fadeInUp} className="space-y-8 relative z-10">
              {/* Badge */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full w-fit backdrop-blur-sm shadow-lg hover:shadow-xl transition-all cursor-default"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                </motion.div>
                <span className="text-sm font-semibold text-primary">Smart Certificate Distribution</span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1 
                variants={fadeInUp}
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
              >
                <div className="space-y-2">
                  {/* First Line */}
                  <div>
                    <span>Send Personalized</span>
                  </div>
                  {/* Second Line - Cycling Word */}
                  <div className="flex items-baseline justify-center md:justify-start min-h-[1em]">
                    <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent inline-flex items-baseline">
                      <span>{displayText}</span>
                      <span className="inline-block font-bold text-primary ml-1 animate-pulse" style={{ fontSize: 'inherit' }}>|</span>
                    </span>
                  </div>
                  {/* Third Line */}
                  <div>
                    <span>at Scale</span>
                  </div>
                </div>
              </motion.h1>

              {/* Description */}
              <motion.p 
                variants={fadeInUp}
                className="text-lg md:text-xl text-muted-foreground text-pretty leading-relaxed max-w-2xl"
              >
                Automate bulk certificate and email distribution. Upload, map, preview, and send personalized emails to
                hundreds of recipients in seconds. No configuration needed.
              </motion.p>

              {/* Security Badge */}
              <motion.div
                variants={fadeInUp}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-emerald-100 border border-emerald-500/20 w-fit"
              >
                <Lock className="w-4 h-4 text-emerald-500" />
                <span className="text-muted-foreground">
                  All data processed <span className="font-semibold text-foreground">locally on your device</span> — nothing is sent to our servers
                </span>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }} 
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Link
                    href="/send"
                    className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold shadow-lg hover:shadow-2xl transition-all relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Start Sending Now
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      layoutId="button-bg"
                    />
                  </Link>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }} 
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Link
                    href="/how-it-works"
                    className="group flex items-center justify-center gap-2 px-8 py-4 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all hover:shadow-lg relative overflow-hidden bg-background/50 backdrop-blur-sm"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      See How It Works
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div 
                variants={fadeInUp}
                className="flex flex-wrap items-center gap-6 pt-8"
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background"></div>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">500+ Organizations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold">4.9/5 Rating</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Visual */}
            <motion.div 
              variants={scaleIn} 
              className="hidden lg:block relative -mt-48"
            >
              <motion.div 
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative group"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 blur-3xl rounded-full group-hover:blur-2xl transition-all duration-500 -z-10"></div>
                
                {/* Main Card */}
                <div className="relative bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-3xl p-8 border border-primary/20 group-hover:border-primary/40 transition-all duration-500 backdrop-blur-sm shadow-2xl">
                  {/* Decorative Elements */}
                  <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-xl"></div>
                  <div className="absolute bottom-4 left-4 w-32 h-32 bg-gradient-to-tl from-accent/20 to-transparent rounded-full blur-xl"></div>
                  
                  <div className="space-y-6 relative z-10">
                    {[
                      { icon: FileUp, label: "Upload Excel", desc: "CSV or XLSX", delay: 0.3 },
                      { icon: Mail, label: "Map Fields", desc: "Personalize emails", delay: 0.4 },
                      { icon: CheckCircle2, label: "Send Bulk", desc: "Track progress", delay: 0.5 },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: item.delay, type: "spring", stiffness: 100 }}
                        whileHover={{ x: 5, scale: 1.02 }}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/5 transition-colors cursor-default group/item"
                      >
                        <motion.div 
                          className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover/item:shadow-xl transition-shadow"
                          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                          transition={{ duration: 0.5 }}
                        >
                          <item.icon className="w-7 h-7 text-primary-foreground" />
                        </motion.div>
                        <div>
                          <p className="font-semibold text-foreground">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Progress Indicator */}
                  <div className="mt-8 pt-6 border-t border-primary/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Processing</span>
                      <span className="text-sm font-bold text-primary">98%</span>
                    </div>
                    <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "98%" }}
                        transition={{ duration: 2, delay: 1 }}
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border relative overflow-hidden">
        {/* Subtle Background */}
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-accent/10 to-transparent rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="space-y-16"
        >
          <motion.div variants={fadeInUp} className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-balance">
              Powerful <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-lg text-muted-foreground">Everything you need for bulk email distribution</p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={scaleIn}
                whileHover={{ y: -12, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="group relative p-8 rounded-2xl border border-border hover:border-primary/50 transition-all bg-gradient-to-br from-card to-card/50 hover:shadow-2xl overflow-hidden"
              >
                {/* Hover Gradient Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                  transition={{ duration: 0.5 }}
                  className={`relative w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-xl`}
                >
                  <feature.icon className="w-7 h-7 text-primary relative z-10" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-br from-primary/50 to-accent/50 rounded-xl blur-sm"
                  />
                </motion.div>
                
                {/* Content */}
                <h3 className="font-semibold text-lg mb-3 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
                  {feature.description}
                </p>

                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Trust Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="space-y-12"
        >
          <motion.div variants={fadeInUp} className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Organizations</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join colleges, clubs, and event organizers automating their distributions
            </p>
          </motion.div>

          <motion.div 
            ref={statsRef}
            variants={staggerContainer} 
            className="grid sm:grid-cols-3 gap-6 md:gap-8"
          >
            {[
              { stat: "10K+", label: "Emails Sent", icon: Mail, color: "from-blue-500 to-cyan-500" },
              { stat: "500+", label: "Organizations", icon: Users, color: "from-purple-500 to-pink-500" },
              { stat: "99.8%", label: "Delivery Rate", icon: TrendingUp, color: "from-green-500 to-emerald-500" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                whileHover={{ y: -8, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="group relative text-center p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 hover:border-primary/30 transition-all hover:shadow-2xl overflow-hidden"
              >
                {/* Icon */}
                <div className={`absolute top-4 right-4 w-16 h-16 bg-gradient-to-br ${item.color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-xl`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <item.icon className="w-8 h-8 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
                  <motion.p 
                    className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2"
                    initial={{ scale: 0 }}
                    animate={statsInView ? { scale: 1 } : {}}
                    transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                  >
                    {item.stat}
                  </motion.p>
                  <p className="text-muted-foreground font-medium">{item.label}</p>
                </div>

                {/* Animated Border */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-sm"></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/30 rounded-3xl p-12 md:p-16 text-center group cursor-default"
        >
          {/* Animated Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
          
          {/* Floating particles */}
          <motion.div
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-10 left-10 w-2 h-2 bg-primary rounded-full blur-sm"
          />
          <motion.div
            animate={{ y: [0, -15, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            className="absolute top-20 right-20 w-3 h-3 bg-accent rounded-full blur-sm"
          />
          <motion.div
            animate={{ y: [0, -25, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, delay: 2 }}
            className="absolute bottom-10 left-20 w-2 h-2 bg-primary rounded-full blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative z-10 space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="inline-block mb-4"
              >
                <Sparkles className="w-12 h-12 text-primary mx-auto" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-balance">
                Ready to automate your <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">distributions?</span>
              </h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join thousands of organizations sending smarter certificates and emails. Get started in minutes, no credit
              card required.
            </p>
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }} 
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Link
                href="/send"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-2xl transition-all relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity"
                  layoutId="cta-bg"
                />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
    </main>
  )
}
