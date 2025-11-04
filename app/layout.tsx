/**
 * @fileoverview Root Layout - Application Shell and Global Metadata
 * @module app/layout
 * @description
 * This is the root layout for the entire Next.js application. It defines the HTML
 * structure, global metadata, fonts, analytics, and persistent UI components.
 * 
 * Features:
 * - Comprehensive SEO metadata (Open Graph, Twitter Cards, Schema.org)
 * - Global font configuration (Geist, Geist Mono)
 * - Persistent navigation and footer
 * - Toast notifications system
 * - Vercel Analytics integration
 * - PWA manifest and icons
 * - Mobile optimization
 * - Dark mode support preparation
 * 
 * Global Components:
 * - Navbar: Site navigation (all pages)
 * - Footer: Site footer (all pages)
 * - Toaster: Toast notifications
 * - Analytics: Vercel Analytics tracking
 * 
 * SEO Configuration:
 * - Comprehensive metadata for search engines
 * - Open Graph tags for social sharing
 * - Twitter Card optimization
 * - Structured data ready (added in pages)
 * - Robots directives
 * - Canonical URLs
 * 
 * PWA Support:
 * - Web app manifest
 * - Multiple icon sizes (16x16 to 512x512)
 * - Apple touch icons
 * - Android chrome icons
 * - Favicon configuration
 * 
 * @requires react
 * @requires next
 * @requires next/font/google
 * @requires @vercel/analytics/next
 * @requires @/components/navbar
 * @requires @/components/footer
 * @requires @/components/ui/sonner
 */

import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Toaster } from "@/components/ui/sonner"

// Google Fonts - Geist (sans-serif) and Geist Mono (monospace)
// Loaded with latin subset for optimal performance
const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

/**
 * Global metadata configuration for the entire application.
 * 
 * This metadata object defines SEO, social sharing, PWA, and discoverability
 * settings that apply across all pages. Individual pages can override these
 * using their own metadata exports.
 * 
 * Sections:
 * 1. Base Metadata: Title, description, keywords
 * 2. Author & Publisher: Creator information
 * 3. Icons: Favicons, Apple touch, Android chrome
 * 4. Open Graph: Social media sharing (Facebook, LinkedIn, etc.)
 * 5. Twitter Cards: Twitter-specific sharing
 * 6. Robots: Search engine directives
 * 7. Verification: Site verification codes (Google, Bing, etc.)
 * 
 * Title Template:
 * - Default: "Sendora - Smart Certificate Distribution..."
 * - Template: "%s | Sendora" (e.g., "About | Sendora")
 * 
 * Keywords:
 * - 20+ targeted keywords for SEO
 * - Covers: bulk email, certificates, automation, etc.
 * 
 * @constant
 * @type {Metadata}
 */
export const metadata: Metadata = {
  metadataBase: new URL('https://sendora.vercel.app'),
  title: {
    default: "Sendora - Smart Certificate Distribution & Bulk Email Automation",
    template: "%s | Sendora", // Page title | Sendora
  },
  description: "Automate bulk certificate and email distribution with ease. Upload Excel/CSV files, map fields, and send personalized emails to hundreds of recipients in seconds. Secure, fast, and free.",
  keywords: [
    "bulk email sender",
    "certificate distribution",
    "email automation",
    "mass email tool",
    "personalized email sender",
    "excel to email",
    "csv email sender",
    "bulk certificate sender",
    "smtp email sender",
    "email marketing tool",
    "automated email distribution",
    "certificate generator",
    "email personalization",
    "bulk mailing software",
    "event certificate distribution",
    "training certificate sender",
    "graduation certificate distribution",
    "nodemailer bulk send",
    "next.js email sender",
    "free bulk email tool",
  ],
  authors: [{ name: "Farhan Alam", url: "https://github.com/FarhanAlam-Official" }],
  creator: "Farhan Alam",
  publisher: "Sendora",
  // Prevent automatic detection of emails, addresses, phone numbers
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Favicon and app icons for multiple platforms
  // Order matters: browsers prefer larger sizes for better display quality
  icons: {
    icon: [
      // Prioritize larger PNG files first for better quality on high-DPI displays
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      // Keep ICO last for legacy browser support
      { url: "/favicon/favicon.ico", sizes: "any" },
      // Add larger sizes for better display in modern browsers
      { url: "/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "icon",
        url: "/favicon/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        rel: "android-chrome",
        url: "/favicon/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "android-chrome",
        url: "/favicon/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  // Web app manifest for PWA functionality
  manifest: "/manifest.webmanifest",
  // Open Graph metadata for social media sharing
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sendora.vercel.app",
    title: "Sendora - Smart Certificate Distribution & Bulk Email Automation",
    description: "Automate bulk certificate and email distribution with ease. Upload Excel/CSV files, map fields, and send personalized emails to hundreds of recipients in seconds.",
    siteName: "Sendora",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Sendora - Smart Certificate Distribution",
      },
    ],
  },
  // Twitter Card metadata for Twitter sharing
  twitter: {
    card: "summary_large_image",
    title: "Sendora - Smart Certificate Distribution & Bulk Email Automation",
    description: "Automate bulk certificate and email distribution with ease. Upload Excel/CSV files and send personalized emails to hundreds of recipients in seconds.",
    images: ["/logo.png"],
    creator: "@FarhanAlam",
  },
  // Search engine crawling directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Canonical URL for SEO
  alternates: {
    canonical: "https://sendora.vercel.app",
  },
  // Content classification
  category: "technology",
  classification: "Business Software",
  // Site verification codes (add when available)
  verification: {
    // Add your verification codes here when available
    // google: "your-google-site-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
}

/**
 * Root Layout Component - Application shell with global UI.
 * 
 * This component wraps the entire application and provides:
 * - HTML structure with proper lang attribute
 * - Global meta tags in <head>
 * - Persistent navigation (Navbar)
 * - Page content (children)
 * - Persistent footer (Footer)
 * - Toast notification system (Toaster)
 * - Analytics tracking (Vercel Analytics)
 * 
 * Component Tree:
 * ```
 * <html lang="en">
 *   <head>
 *     - Canonical link
 *     - Theme color
 *     - PWA meta tags
 *     - Mobile optimization
 *   </head>
 *   <body>
 *     <Navbar />
 *     {children} ← Page content
 *     <Footer />
 *     <Toaster /> ← Toast notifications
 *     <Analytics /> ← Vercel tracking
 *   </body>
 * </html>
 * ```
 * 
 * Head Configuration:
 * - Canonical URL: SEO best practice
 * - Theme color: #3b82f6 (primary blue)
 * - PWA tags: App name, mobile capabilities
 * - IE compatibility: Edge rendering
 * 
 * Body Configuration:
 * - Font: Geist (sans-serif) applied via className
 * - Antialiasing: Smooth font rendering
 * - Layout: Navbar → Content → Footer
 * 
 * Global Components:
 * - Navbar: Responsive navigation with mobile menu
 * - Footer: 5-column footer with links
 * - Toaster: Sonner toast notifications
 * - Analytics: Vercel Analytics (production only)
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content to render
 * @returns {JSX.Element} Complete HTML document structure
 * 
 * @example
 * ```tsx
 * // Automatically wraps all pages in Next.js App Router
 * // Each route's page.tsx is passed as children:
 * // app/page.tsx → children
 * // app/about/page.tsx → children
 * ```
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Favicon: Explicit links for maximum browser compatibility */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        {/* SEO: Canonical URL */}
        <link rel="canonical" href="https://sendora.vercel.app" />
        {/* PWA: Theme color for browser UI */}
        <meta name="theme-color" content="#3b82f6" />
        {/* PWA: Application name */}
        <meta name="application-name" content="Sendora" />
        {/* iOS: Full screen web app */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sendora" />
        {/* Android: Enable web app mode */}
        <meta name="mobile-web-app-capable" content="yes" />
        {/* IE: Force Edge rendering engine */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body className={`font-sans antialiased`}>
        {/* Global navigation */}
        <Navbar />
        {/* Page-specific content */}
        {children}
        {/* Global footer */}
        <Footer />
        {/* Toast notification system */}
        <Toaster />
        {/* Vercel Analytics (production only) */}
        <Analytics />
      </body>
    </html>
  )
}
