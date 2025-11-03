"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Mail, Github, Linkedin, Instagram, Facebook } from "lucide-react"

export default function Footer() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-gradient-to-b from-background to-background/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid md:grid-cols-5 gap-8">
          {/* Brand Section */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="md:col-span-1 space-y-4"
          >
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Sendora Logo"
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
                priority
              />
              <span className="font-bold text-lg text-foreground">Sendora</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Smart certificate and email distribution made simple.
            </p>
            <div className="flex gap-3 pt-2">
              {[
                { icon: Instagram, href: "https://instagram.com/farhan.alam.01", label: "Instagram", color: "hover:text-pink-500" },
                { icon: Facebook, href: "https://facebook.com/farhanalam930", label: "Facebook", color: "hover:text-blue-500" },
                { icon: Linkedin, href: "https://linkedin.com/in/farhan-alam-aa56b2309", label: "LinkedIn", color: "hover:text-blue-600" },
                { icon: Mail, href: "mailto:thefarhanalam01@gmail.com", label: "Email", color: "hover:text-red-500" },
                { icon: Github, href: "https://github.com/FarhanAlam-Official", label: "GitHub", color: "hover:text-gray-400" },
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition-all group ${social.color}`}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Product Links */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="font-semibold text-foreground">Product</h3>
            <ul className="space-y-2">
              {[
                { label: "Features", href: "/how-it-works" },
                { label: "How It Works", href: "/how-it-works" },
                { label: "Pricing", href: "#" },
                { label: "Security", href: "#" },
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="font-semibold text-foreground">Company</h3>
            <ul className="space-y-2">
              {[
                { label: "About", href: "/about" },
                { label: "Blog", href: "#" },
                { label: "Contact", href: "/contact" },
                { label: "Careers", href: "#" },
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources Links */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="font-semibold text-foreground">Resources</h3>
            <ul className="space-y-2">
              {[
                { label: "Documentation", href: "#" },
                { label: "API Docs", href: "#" },
                { label: "Templates", href: "#" },
                { label: "FAQ", href: "#" },
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h3 className="font-semibold text-foreground">Legal</h3>
            <ul className="space-y-2">
              {[
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
                { label: "Cookie Policy", href: "#" },
                { label: "Licenses", href: "#" },
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <motion.p
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-sm text-muted-foreground text-center md:text-left"
          >
            Made with <span className="text-red-500">❤️</span> by{" "}
            <Link
              href="https://github.com/FarhanAlam-Official"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent hover:from-primary hover:via-accent hover:to-primary transition-all no-underline"
            >
              Farhan Alam
            </Link>
            . © {currentYear} Sendora. All rights reserved.
          </motion.p>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4"
          >
            <Link
              href="https://github.com/FarhanAlam-Official"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}
