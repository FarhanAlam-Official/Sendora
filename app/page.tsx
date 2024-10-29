"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useEffect } from "react"
import { CheckCircle2, Mail, FileUp, Zap, Shield, BarChart3, Sparkles, ArrowRight } from "lucide-react"

export default function Home() {
  // Clear send completion flag when visiting home page to allow new batches
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sendora_send_completed")
    }
  }, [])
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
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
      <section className="relative overflow-hidden pt-24 pb-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl opacity-40 animate-pulse"></div>
          <div
            className="absolute bottom-0 right-10 w-80 h-80 bg-gradient-to-br from-accent/20 to-primary/10 rounded-full blur-3xl opacity-40 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <motion.div variants={fadeInUp} className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full w-fit">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Smart Certificate Distribution</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-balance leading-tight">
                Send Personalized{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Certificates
                </span>{" "}
                at Scale
              </h1>

              <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
                Automate bulk certificate and email distribution. Upload, map, preview, and send personalized emails to
                hundreds of recipients in seconds. No configuration needed.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/send"
                    className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-xl transition-all"
                  >
                    Start Sending Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/how-it-works"
                    className="flex items-center justify-center gap-2 px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    See How It Works
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            <motion.div variants={scaleIn} className="hidden md:block">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 blur-3xl rounded-full group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 border border-primary/20 group-hover:border-primary/40 transition-all duration-500 backdrop-blur-sm">
                  <div className="space-y-6">
                    {[
                      { icon: FileUp, label: "Upload Excel", desc: "CSV or XLSX" },
                      { icon: Mail, label: "Map Fields", desc: "Personalize emails" },
                      { icon: CheckCircle2, label: "Send Bulk", desc: "Track progress" },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="flex items-center gap-4"
                      >
                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                          <item.icon className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="space-y-16"
        >
          <motion.div variants={fadeInUp} className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-balance">Powerful Features</h2>
            <p className="text-lg text-muted-foreground">Everything you need for bulk email distribution</p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={scaleIn}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="group p-8 rounded-xl border border-border hover:border-primary/50 transition-all bg-gradient-to-br from-card to-card/50 hover:shadow-lg"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Trust Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="space-y-12"
        >
          <motion.div variants={fadeInUp} className="text-center">
            <h2 className="text-3xl font-bold mb-4">Trusted by Organizations</h2>
            <p className="text-muted-foreground text-lg">
              Join colleges, clubs, and event organizers automating their distributions
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid md:grid-cols-3 gap-8">
            {[
              { stat: "10K+", label: "Emails Sent" },
              { stat: "500+", label: "Organizations" },
              { stat: "99.8%", label: "Delivery Rate" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="text-center p-8 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10"
              >
                <p className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  {item.stat}
                </p>
                <p className="text-muted-foreground">{item.label}</p>
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
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/30 rounded-2xl p-12 md:p-16 text-center group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative z-10 space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-balance">Ready to automate your distributions?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join thousands of organizations sending smarter certificates and emails. Get started in minutes, no credit
              card required.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/send"
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-xl transition-all"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </main>
  )
}
