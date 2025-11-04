import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "About Sendora - Smart Certificate Distribution Platform",
  description: "Learn about Sendora, the smart certificate distribution platform built by Farhan Alam. Automate bulk email distribution with our modern, secure, and fast solution.",
  keywords: [
    "about sendora",
    "certificate distribution platform",
    "farhan alam",
    "sendora developer",
    "email automation platform",
    "bulk email solution",
    "certificate sender about",
  ],
  openGraph: {
    title: "About Sendora - Smart Certificate Distribution Platform",
    description: "Learn about Sendora, the smart certificate distribution platform built by Farhan Alam. Automate bulk email distribution with our modern, secure, and fast solution.",
    url: "https://sendora.vercel.app/about",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "About Sendora",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Sendora - Smart Certificate Distribution Platform",
    description: "Learn about Sendora, built by Farhan Alam to automate bulk certificate and email distribution.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://sendora.vercel.app/about",
  },
}

export default metadata
