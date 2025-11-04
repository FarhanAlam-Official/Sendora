import { Metadata } from 'next'

/**
 * Metadata configuration for the How It Works page
 * 
 * This file defines the SEO metadata for the How It Works page, including:
 * - Page title and description explaining the Sendora process
 * - Keywords for search engine optimization
 * - Open Graph tags for social media sharing
 * - Twitter card configuration
 * - Canonical URL for proper indexing
 * 
 * The metadata is designed to educate users about the Sendora workflow
 * and improve search visibility for process-related queries.
 */
export const metadata: Metadata = {
  title: 'How It Works - Sendora Certificate Distribution Process',
  description: 'Learn how Sendora automates certificate and email distribution in 5 simple steps. Upload, map, compose, configure, and send personalized messages at scale.',
  keywords: [
    'how it works',
    'certificate distribution process',
    'email automation workflow',
    'bulk email sending',
    'certificate generation steps',
    'sendora process',
    'automated certificates',
  ],
  openGraph: {
    title: 'How It Works - Sendora Certificate Distribution Process',
    description: 'Learn how Sendora automates certificate and email distribution in 5 simple steps. Upload, map, compose, configure, and send personalized messages at scale.',
    url: 'https://sendora.vercel.app/how-it-works',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Sendora How It Works',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How It Works - Sendora Certificate Distribution Process',
    description: 'Learn how Sendora automates certificate and email distribution in 5 simple steps.',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: 'https://sendora.vercel.app/how-it-works',
  },
}

export default metadata