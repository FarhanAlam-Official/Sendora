"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Heart, Users, Zap, Github, Mail, FileText, Sparkles, Paintbrush, Award, Download, Rocket, Shield, Globe, Code } from "lucide-react"
import Link from "next/link"

export default function About() {
  const features = [
    {
      icon: FileText,
      title: "Upload & Match",
      description: "Upload your existing PDF certificates and intelligently match them with recipients using our smart matching system",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Paintbrush,
      title: "Smart Matching",
      description: "Automatic certificate matching with confidence scores and manual override options for perfect accuracy",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Award,
      title: "Personalized Emails",
      description: "Send customized emails with dynamic placeholders including recipient names and certificate links",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Download,
      title: "Bulk Distribution",
      description: "Send hundreds of personalized emails with certificates in minutes using batch processing",
      color: "from-orange-500 to-red-500",
    },
  ]

  const values = [
    {
      icon: Heart,
      title: "Built with Care",
      description: "Crafted for reliability and simplicity",
      color: "from-red-500 to-pink-500",
    },
    {
      icon: Users,
      title: "For Everyone",
      description: "Works for colleges, clubs, and teams",
      color: "from-purple-500 to-indigo-500",
    },
    {
      icon: Zap,
      title: "Always Fast",
      description: "Quick setup, instant distribution",
      color: "from-yellow-500 to-orange-500",
    },
  ]

  const techStack = [
    { icon: Code, label: "Next.js", color: "from-gray-700 to-gray-900" },
    { icon: Rocket, label: "Vercel", color: "from-black to-gray-800" },
    { icon: Shield, label: "Secure", color: "from-green-600 to-emerald-600" },
    { icon: Globe, label: "Modern Web", color: "from-blue-600 to-cyan-600" },
  ]

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
    <main className="pt-24 pb-16 relative overflow-hidden min-h-screen">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl"
        ></motion.div>
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tl from-accent/20 to-primary/20 rounded-full blur-3xl"
        ></motion.div>
        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl"
        ></motion.div>
      </div>

      {/* Animated Grid Background */}
      <div className="absolute inset-0 -z-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.05) 1px, transparent 0)" }}></div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Hero Section with Logo */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="max-w-4xl mx-auto mb-24"
        >
          <motion.div
            variants={fadeInUp}
            className="flex flex-col items-center justify-center mb-12"
          >
            {/* Badge */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full mb-6 backdrop-blur-sm shadow-lg"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                <Sparkles className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="text-sm font-semibold text-primary">Smart Certificate Distribution</span>
            </motion.div>

            {/* Title with Logo */}
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-center flex flex-wrap items-center justify-center gap-3 md:gap-4 lg:gap-6"
            >
              <span>About </span>
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent flex items-center gap-3 md:gap-4 lg:gap-6">
                Sendora
                {/* Logo with Animation */}
                <motion.div
                  whileHover={{ scale: 1.15, rotate: [0, -5, 5, -5, 0] }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-xl opacity-50"></div>
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative"
                  >
                    <Image
                      src="/logo.png"
                      alt="Sendora Logo"
                      width={80}
                      height={80}
                      className="w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain drop-shadow-2xl"
                      priority
                    />
                  </motion.div>
                </motion.div>
              </span>
            </motion.h1>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="prose prose-invert max-w-none space-y-6"
          >
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-center">
              Sendora was created to solve a real problem: sending personalized certificates and emails at scale is
              tedious. Whether you're managing a college graduation, event, or training program, manually configuring
              SMTP and sending individual emails takes time away from what matters.
            </p>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-center">
              We built Sendora to be the fastest way to distribute certificates and personalized messages. Upload your
              data, map your fields, preview your email, and send—all in minutes.
            </p>

            <motion.div
              variants={fadeInUp}
              className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 backdrop-blur-sm"
            >
              <p className="text-center text-muted-foreground">
                <span className="font-semibold text-foreground">Built with passion by Farhan Alam.</span> Version 1.0 • Built with Next.js & Vercel
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Certificate Generation Features */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-24"
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Professional Certificate <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Generation</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Create stunning, personalized certificates with ease. Built-in templates or your custom design - the choice is yours.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="group relative p-8 rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 hover:border-primary/50 transition-all hover:shadow-2xl overflow-hidden"
              >
                {/* Hover Gradient Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                
                <div className={`relative inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-xl blur-sm"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">{feature.description}</p>
                
                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-24"
        >
          <motion.div variants={fadeInUp} className="grid md:grid-cols-3 gap-6 md:gap-8 py-12 border-y border-border">
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group text-center p-6 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 hover:border-primary/30 transition-all hover:shadow-xl"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${value.color} mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{value.title}</h3>
                <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Tech Stack Section */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mb-24"
        >
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built with Modern <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Technology</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powered by cutting-edge tools and frameworks for optimal performance
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            {techStack.map((tech, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ scale: 1.1, y: -4 }}
                className="group flex flex-col items-center gap-3 p-6 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border hover:border-primary/50 transition-all hover:shadow-lg min-w-[120px]"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tech.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                  <tech.icon className="w-6 h-6 text-white" />
                </div>
                <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{tech.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Developer Section */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mt-24 pt-20 relative"
        >
          {/* Organic Background Elements - No Card Border */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <motion.div
              animate={{
                x: [0, 30, -20, 0],
                y: [0, -20, 10, 0],
                scale: [1, 1.1, 0.9, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-primary/15 via-accent/10 to-transparent rounded-full blur-3xl"
            ></motion.div>
            <motion.div
              animate={{
                x: [0, -25, 15, 0],
                y: [0, 20, -15, 0],
                scale: [1, 0.95, 1.05, 1],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
              className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-tl from-accent/15 via-primary/10 to-transparent rounded-full blur-3xl"
            ></motion.div>
          </div>

          <motion.div
            variants={fadeInUp}
            className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            {/* Asymmetric Layout - Text Left, Image Right */}
            <div className="relative grid md:grid-cols-[1fr_auto] gap-8 md:gap-12 items-center">
              {/* Content Section - Left Side */}
              <motion.div
                variants={fadeInUp}
                className="relative text-center md:text-left space-y-8 order-2 md:order-1"
              >
                {/* Floating Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm mb-4"
                >
                  <Code className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">Full-Stack Developer</span>
                </motion.div>

                <div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                    Meet the <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Developer</span>
                  </h2>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100px" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary rounded-full mb-6 md:mb-8"
                  ></motion.div>
                </div>
                
                <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                  Sendora was created by <span className="font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Farhan Alam</span>, a passionate
                  full-stack developer dedicated to building tools that solve real-world problems. With expertise in
                  modern web technologies and a keen interest in automation, Farhan designed Sendora to make bulk
                  certificate distribution simple, fast, and accessible to everyone.
                </p>

                {/* Social Links - More Prominent */}
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-6">
                  <motion.div
                    whileHover={{ scale: 1.08, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="https://github.com/FarhanAlam-Official"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-xl hover:shadow-2xl transition-all relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        <Github className="w-5 h-5" />
                        <span>Visit GitHub</span>
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.08, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="mailto:thefarhanalam01@gmail.com"
                      className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl border-2 border-primary/30 bg-background/80 backdrop-blur-sm hover:border-primary/60 hover:bg-primary/5 text-primary font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      <Mail className="w-5 h-5" />
                      <span>Get in Touch</span>
                    </Link>
                  </motion.div>
                </div>

                {/* Quote - Floating Design */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="relative pt-8"
                >
                  <div className="absolute left-0 md:left-8 top-0 text-6xl md:text-7xl font-serif text-primary/20 leading-none">"</div>
                  <p className="text-base md:text-lg text-muted-foreground italic pl-8 md:pl-16 pt-4 border-l-2 border-primary/20">
                    Building tools that make life easier, one line of code at a time.
                  </p>
                </motion.div>
              </motion.div>

              {/* Profile Picture - Floating Right */}
              <motion.div
                variants={fadeInUp}
                className="flex justify-center md:block order-1 md:order-2"
              >
                <div className="relative inline-block">
                  {/* Irregular SVG Background Shape - Larger & More Organic */}
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 0.95, 1],
                      rotate: [0, 5, -5, 0],
                      x: [0, 10, -5, 0],
                      y: [0, -5, 10, 0],
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -inset-16 md:-inset-20 -z-10"
                  >
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 400 400"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <defs>
                        <linearGradient id="profileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                          <stop offset="30%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
                          <stop offset="70%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.15" />
                        </linearGradient>
                        <filter id="blur">
                          <feGaussianBlur in="SourceGraphic" stdDeviation="15" />
                        </filter>
                        <radialGradient id="radialGradient" cx="50%" cy="50%">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.1" />
                        </radialGradient>
                      </defs>
                      {/* Multiple organic shapes for depth */}
                      <path
                        d="M 100 80 Q 150 30 220 60 Q 280 40 320 100 Q 340 150 300 220 Q 250 280 180 260 Q 100 270 60 210 Q 40 160 70 110 Q 80 90 100 80 Z"
                        fill="url(#profileGradient)"
                        filter="url(#blur)"
                        style={{ transformOrigin: "center" }}
                      />
                      <ellipse
                        cx="200"
                        cy="200"
                        rx="180"
                        ry="170"
                        fill="url(#radialGradient)"
                        filter="url(#blur)"
                        opacity="0.6"
                      />
                    </svg>
                  </motion.div>
                  
                  {/* Profile Picture Container - More Dynamic with Blue Shadow */}
                  <motion.div
                    whileHover={{ scale: 1.08, rotate: [0, 2, -2, 0] }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="relative z-10 w-52 h-52 md:w-64 md:h-64 rounded-full"
                    style={{ boxShadow: "none" }}
                  >
                    {/* Outer Blue Glow/Smoke Effect - Multiple Layers */}
                    <motion.div
                      animate={{
                        opacity: [0.6, 0.9, 0.6],
                        scale: [0.95, 1.1, 0.95],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 rounded-full -z-20"
                      style={{
                        background: "radial-gradient(circle at center, hsl(var(--primary) / 0.7) 0%, hsl(var(--primary) / 0.5) 30%, hsl(var(--primary) / 0.3) 60%, transparent 80%)",
                        filter: "blur(25px)",
                        boxShadow: "none",
                      }}
                    />
                    <motion.div
                      animate={{
                        opacity: [0.4, 0.7, 0.4],
                        scale: [1.05, 1.15, 1.05],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1,
                      }}
                      className="absolute inset-0 rounded-full -z-20"
                      style={{
                        background: "radial-gradient(circle at center, hsl(var(--accent) / 0.6) 0%, hsl(var(--accent) / 0.4) 40%, hsl(var(--accent) / 0.2) 70%, transparent 85%)",
                        filter: "blur(35px)",
                        boxShadow: "none",
                      }}
                    />
                    <motion.div
                      animate={{
                        opacity: [0.5, 0.8, 0.5],
                        scale: [1.1, 1.2, 1.1],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2,
                      }}
                      className="absolute inset-0 rounded-full -z-20"
                      style={{
                        background: "radial-gradient(circle at center, hsl(var(--primary) / 0.4) 0%, hsl(var(--primary) / 0.2) 50%, transparent 75%)",
                        filter: "blur(45px)",
                        boxShadow: "none",
                      }}
                    />
                    
                    {/* Main Container - NO dark shadows, only blue */}
                    <motion.div
                      className="relative w-full h-full rounded-full overflow-visible"
                      style={{
                        boxShadow: "none",
                        filter: "drop-shadow(0 0 30px hsl(var(--primary) / 0.6)) drop-shadow(0 0 60px hsl(var(--primary) / 0.4)) drop-shadow(0 0 90px hsl(var(--primary) / 0.3)) drop-shadow(0 20px 60px hsl(var(--primary) / 0.5))",
                      }}
                    >
                      {/* Animated gradient border */}
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-0 rounded-full p-[4px] overflow-hidden"
                        style={{
                          background: "linear-gradient(45deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))",
                          boxShadow: "none",
                        }}
                      >
                        <div className="w-full h-full rounded-full bg-background overflow-hidden relative" style={{ boxShadow: "none" }}>
                          {/* Blue glow behind image - brighter */}
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/50 via-primary/40 to-accent/40 blur-2xl -z-10" style={{ boxShadow: "none" }}></div>
                          <Image
                            src="/user.png"
                            alt="Farhan Alam"
                            width={256}
                            height={256}
                            className="w-full h-full object-cover relative z-10"
                            style={{ 
                              boxShadow: "none",
                              filter: "drop-shadow(0 0 0 transparent)",
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent z-20" style={{ boxShadow: "none" }}></div>
                        </div>
                      </motion.div>
                    </motion.div>
                    
                    {/* Floating particles */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          y: [0, -20 + i * 5, 0],
                          x: [0, 10 - i * 2, 0],
                          opacity: [0.4, 0.8, 0.4],
                          scale: [0.8, 1.2, 0.8],
                        }}
                        transition={{
                          duration: 3 + i * 0.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.3,
                        }}
                        className="absolute rounded-full blur-sm"
                        style={{
                          width: `${8 + i * 2}px`,
                          height: `${8 + i * 2}px`,
                          background: i % 2 === 0 
                            ? "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))"
                            : "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))",
                          top: `${10 + i * 15}%`,
                          left: i % 2 === 0 ? `${5 + i * 10}%` : `${90 - i * 10}%`,
                        }}
                      />
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </main>
  )
}
