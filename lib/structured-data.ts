/**
 * @fileoverview Structured Data (Schema.org) Configuration
 * 
 * This module provides comprehensive Schema.org structured data (JSON-LD) for
 * the Sendora application. Structured data helps search engines understand
 * the content, purpose, and features of the application, improving SEO and
 * enabling rich search results.
 * 
 * **Key Benefits:**
 * - Enhanced search engine visibility
 * - Rich snippets in search results (ratings, pricing, breadcrumbs)
 * - Better understanding by search crawlers
 * - Improved semantic web integration
 * - Voice search optimization
 * - Knowledge graph eligibility
 * 
 * **Schema Types Implemented:**
 * - Organization: Company/project information
 * - WebSite: Website metadata and search action
 * - WebApplication: Application features and capabilities
 * - SoftwareApplication: Software-specific metadata
 * - BreadcrumbList: Navigation structure
 * - FAQPage: Frequently asked questions
 * - HowTo: Step-by-step guides
 * - Product: Product information with ratings
 * 
 * **Implementation:**
 * Import the required schema and embed in page <head> using <script type="application/ld+json">
 * 
 * **SEO Impact:**
 * - Increases click-through rates from search results
 * - Enables special search features (sitelinks, review stars)
 * - Improves local and voice search discoverability
 * - Enhances brand authority and trust signals
 * 
 * @module lib/structured-data
 * @see {@link https://schema.org Schema.org Documentation}
 * @see {@link https://developers.google.com/search/docs/appearance/structured-data Google Structured Data Guide}
 * 
 * @author Farhan Alam
 * @version 1.0.0
 */

/**
 * Organization schema for Sendora
 * 
 * Defines the organization/project entity with founder, contact information,
 * and social media profiles. Helps establish brand identity in search results
 * and knowledge graphs.
 * 
 * **Fields:**
 * - Organization name and URL
 * - Logo for brand recognition
 * - Founder information
 * - Social media profiles (sameAs)
 * - Contact point for customer support
 * 
 * **Search Benefits:**
 * - Knowledge panel eligibility
 * - Rich sitelinks in results
 * - Brand entity recognition
 * - Verified contact information display
 * 
 * @constant
 * @type {Object}
 * @public
 */
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Sendora',
  url: 'https://sendora.vercel.app',
  logo: 'https://sendora.vercel.app/logo.png',
  description: 'Smart certificate distribution and bulk email automation platform',
  founder: {
    '@type': 'Person',
    name: 'Farhan Alam',
    url: 'https://github.com/FarhanAlam-Official',
    email: 'thefarhanalam01@gmail.com',
  },
  sameAs: [
    'https://github.com/FarhanAlam-Official',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'thefarhanalam01@gmail.com',
    contactType: 'Customer Support',
    availableLanguage: ['English'],
  },
}

/**
 * WebSite schema for Sendora
 * 
 * Defines the website entity with search functionality. Enables site search
 * box in Google search results and provides metadata for the website as a whole.
 * 
 * **Features:**
 * - Website name and URL
 * - Description for search previews
 * - SearchAction for sitelinks searchbox
 * - URL template for internal search
 * 
 * **Search Benefits:**
 * - Sitelinks searchbox in Google results
 * - Direct search from SERP
 * - Improved user engagement
 * - Better understanding of site purpose
 * 
 * @constant
 * @type {Object}
 * @public
 */
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Sendora',
  url: 'https://sendora.vercel.app',
  description: 'Automate bulk certificate and email distribution with ease',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://sendora.vercel.app/send?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

export const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Sendora',
  url: 'https://sendora.vercel.app',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  description: 'Automate bulk certificate and email distribution with ease. Upload Excel/CSV files, map fields, and send personalized emails to hundreds of recipients in seconds.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '500',
    bestRating: '5',
    worstRating: '1',
  },
  featureList: [
    'Excel/CSV Upload',
    'Smart Field Mapping',
    'Certificate Matching',
    'Email Personalization',
    'SMTP Configuration',
    'Real-time Progress Tracking',
    'Batch Processing',
    'Error Handling',
  ],
  screenshot: 'https://sendora.vercel.app/logo.png',
  author: {
    '@type': 'Person',
    name: 'Farhan Alam',
  },
}

export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Sendora',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '500',
  },
}

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
})

export const faqSchema = (faqs: { question: string; answer: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
})

export const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Send Bulk Emails and Certificates with Sendora',
  description: 'Complete guide to automating certificate and email distribution using Sendora',
  step: [
    {
      '@type': 'HowToStep',
      name: 'Upload Your Data',
      text: 'Upload an Excel or CSV file containing recipient information with columns for names, emails, and any custom fields you need.',
      image: 'https://sendora.vercel.app/logo.png',
      url: 'https://sendora.vercel.app/how-it-works#step-1',
    },
    {
      '@type': 'HowToStep',
      name: 'Upload Certificates',
      text: 'Upload PDF certificates and match them with your recipients using our intelligent matching system.',
      image: 'https://sendora.vercel.app/logo.png',
      url: 'https://sendora.vercel.app/how-it-works#step-2',
    },
    {
      '@type': 'HowToStep',
      name: 'Map Your Fields',
      text: 'Connect your file columns to email fields. Map name, email, certificate links, or any custom content.',
      image: 'https://sendora.vercel.app/logo.png',
      url: 'https://sendora.vercel.app/how-it-works#step-3',
    },
    {
      '@type': 'HowToStep',
      name: 'Preview & Compose',
      text: 'Write your email subject and body with dynamic placeholders like {{name}}. See a live preview of how each email will look.',
      image: 'https://sendora.vercel.app/logo.png',
      url: 'https://sendora.vercel.app/how-it-works#step-4',
    },
    {
      '@type': 'HowToStep',
      name: 'Configure & Send',
      text: 'Choose your SMTP configuration, review the summary, and send. Track progress in real-time with detailed logging.',
      image: 'https://sendora.vercel.app/logo.png',
      url: 'https://sendora.vercel.app/how-it-works#step-5',
    },
  ],
  totalTime: 'PT10M',
}

export const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Sendora - Smart Certificate Distribution',
  description: 'Automate bulk certificate and email distribution with ease',
  brand: {
    '@type': 'Brand',
    name: 'Sendora',
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: 'https://sendora.vercel.app',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '500',
  },
}
