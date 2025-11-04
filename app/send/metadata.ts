import { Metadata } from 'next'

/**
 * Metadata configuration for the Send Wizard page
 * 
 * This file defines the SEO metadata for the main certificate/email sending workflow page, including:
 * - Page title and description optimized for the sending process
 * - Keywords for search engine optimization
 * - Open Graph tags for social media sharing
 * - Twitter card configuration
 * - Canonical URL for proper indexing
 * 
 * The metadata emphasizes the core functionality of the Sendora platform
 * to attract users looking to send certificates and emails in bulk.
 */
export const metadata: Metadata = {
  title: "Send Bulk Emails & Certificates - Start Now",
  description: "Start sending bulk personalized emails and certificates now. Upload your Excel/CSV file, map fields, and distribute certificates to hundreds of recipients in minutes. Free and secure.",
  keywords: [
    "send bulk emails",
    "send certificates",
    "bulk email sender tool",
    "personalized email distribution",
    "certificate distribution tool",
    "mass email sender",
    "bulk mailing",
    "email automation tool",
    "smtp bulk sender",
  ],
  openGraph: {
    title: "Send Bulk Emails & Certificates - Start Now | Sendora",
    description: "Start sending bulk personalized emails and certificates now. Upload your Excel/CSV file, map fields, and distribute certificates to hundreds of recipients in minutes.",
    url: "https://sendora.vercel.app/send",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Send Bulk Emails with Sendora",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Send Bulk Emails & Certificates - Start Now | Sendora",
    description: "Start sending bulk personalized emails and certificates now. Free, secure, and fast.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://sendora.vercel.app/send",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default metadata
