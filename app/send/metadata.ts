import { Metadata } from 'next'

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
