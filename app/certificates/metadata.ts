import { Metadata } from 'next'

/**
 * Metadata configuration for the Certificates page
 * 
 * This file defines the SEO metadata for the Certificates page, including:
 * - Page title and description optimized for certificate generation
 * - Keywords for search engine optimization
 * - Open Graph tags for social media sharing
 * - Twitter card configuration
 * - Canonical URL for proper indexing
 * 
 * The metadata is designed to attract users interested in creating and managing certificates.
 */
export const metadata: Metadata = {
  title: "Certificate Generator - Create Custom Certificates",
  description: "Generate professional certificates with Sendora. Choose from templates or upload your own design. Create, customize, and distribute certificates at scale.",
  keywords: [
    "certificate generator",
    "create certificates",
    "custom certificates",
    "certificate templates",
    "online certificate maker",
    "professional certificates",
    "certificate design tool",
    "bulk certificate creation",
  ],
  openGraph: {
    title: "Certificate Generator - Create Custom Certificates | Sendora",
    description: "Generate professional certificates with Sendora. Choose from templates or upload your own design. Create, customize, and distribute certificates at scale.",
    url: "https://sendora.vercel.app/certificates",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Sendora Certificate Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Certificate Generator - Create Custom Certificates | Sendora",
    description: "Generate professional certificates with Sendora. Choose from templates or upload your own design.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://sendora.vercel.app/certificates",
  },
}

export default metadata
