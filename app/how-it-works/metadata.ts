import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "How It Works - Certificate Distribution Guide",
  description: "Learn how Sendora works in 5 simple steps: Upload data, upload certificates, map fields, preview emails, and send. Complete guide to automated certificate distribution.",
  keywords: [
    "how sendora works",
    "certificate distribution guide",
    "bulk email tutorial",
    "email automation guide",
    "certificate sender tutorial",
    "smtp setup guide",
    "excel to email guide",
    "bulk mailing process",
  ],
  openGraph: {
    title: "How It Works - Certificate Distribution Guide | Sendora",
    description: "Learn how Sendora works in 5 simple steps: Upload data, upload certificates, map fields, preview emails, and send. Complete guide to automated certificate distribution.",
    url: "https://sendora.vercel.app/how-it-works",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "How Sendora Works",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "How It Works - Certificate Distribution Guide | Sendora",
    description: "Learn how Sendora works in 5 simple steps. Complete guide to automated certificate distribution.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://sendora.vercel.app/how-it-works",
  },
}

export default metadata
