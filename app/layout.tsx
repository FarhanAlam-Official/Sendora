import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Toaster } from "@/components/ui/sonner"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://sendora.vercel.app'),
  title: {
    default: "Sendora - Smart Certificate Distribution & Bulk Email Automation",
    template: "%s | Sendora",
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
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
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
  manifest: "/manifest.webmanifest",
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
  twitter: {
    card: "summary_large_image",
    title: "Sendora - Smart Certificate Distribution & Bulk Email Automation",
    description: "Automate bulk certificate and email distribution with ease. Upload Excel/CSV files and send personalized emails to hundreds of recipients in seconds.",
    images: ["/logo.png"],
    creator: "@FarhanAlam",
  },
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
  alternates: {
    canonical: "https://sendora.vercel.app",
  },
  category: "technology",
  classification: "Business Software",
  verification: {
    // Add your verification codes here when available
    // google: "your-google-site-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://sendora.vercel.app" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="application-name" content="Sendora" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sendora" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body className={`font-sans antialiased`}>
        <Navbar />
        {children}
        <Footer />
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
