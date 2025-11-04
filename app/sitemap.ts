/**
 * @fileoverview Sitemap Generator - XML Sitemap for SEO
 * @module app/sitemap
 * @description
 * This file generates the sitemap.xml for search engine crawlers.
 * It lists all public pages with metadata for optimal SEO.
 * 
 * Features:
 * - Automatic sitemap.xml generation
 * - Dynamic lastModified dates
 * - Priority and change frequency hints
 * - All public routes included
 * 
 * Sitemap Benefits:
 * - Helps search engines discover pages
 * - Indicates page importance (priority)
 * - Shows update frequency
 * - Improves crawl efficiency
 * - Better indexing and ranking
 * 
 * Page Priority Scale (0.0 - 1.0):
 * - 1.0: Homepage (most important)
 * - 0.9: Main app feature (/send)
 * - 0.8: Key features (/how-it-works, /certificates)
 * - 0.7: About page
 * - 0.6: Contact page
 * 
 * Change Frequency:
 * - weekly: Homepage, /send, /certificates (frequently updated)
 * - monthly: Static pages (/about, /contact, /how-it-works)
 * 
 * Next.js Integration:
 * - Automatically generates /sitemap.xml
 * - Called at build time
 * - Type-safe with MetadataRoute.Sitemap
 * - Accessible at https://sendora.vercel.app/sitemap.xml
 * 
 * @requires next
 */

import { MetadataRoute } from 'next'

/**
 * Sitemap Generator - Creates XML sitemap for search engines.
 * 
 * This function generates the sitemap.xml file that helps search engines
 * discover and index all pages in the application.
 * 
 * Sitemap Entry Properties:
 * 1. url: Full URL of the page
 * 2. lastModified: Last update date (for caching)
 * 3. changeFrequency: How often page content changes
 * 4. priority: Relative importance (0.0 to 1.0)
 * 
 * Change Frequency Options:
 * - always: Changes every time accessed
 * - hourly: Changes hourly
 * - daily: Changes daily
 * - weekly: Changes weekly (most content)
 * - monthly: Changes monthly (static pages)
 * - yearly: Rarely changes
 * - never: Archived content
 * 
 * Priority Guidelines:
 * - 1.0: Most important (homepage)
 * - 0.8-0.9: Key features
 * - 0.5-0.7: Secondary pages
 * - 0.3-0.4: Less important
 * - 0.0-0.2: Rarely accessed
 * 
 * Pages Included:
 * 1. Homepage (/) - Priority 1.0, Weekly
 * 2. Send Page (/send) - Priority 0.9, Weekly (main feature)
 * 3. How It Works (/how-it-works) - Priority 0.8, Monthly
 * 4. About (/about) - Priority 0.7, Monthly
 * 5. Contact (/contact) - Priority 0.6, Monthly
 * 6. Certificates (/certificates) - Priority 0.8, Weekly
 * 
 * SEO Impact:
 * - Faster page discovery
 * - Better crawl budget allocation
 * - Higher indexing rate
 * - Improved search rankings
 * 
 * Submission:
 * - Google Search Console: Submit sitemap URL
 * - Bing Webmaster Tools: Add sitemap
 * - Automatic discovery via robots.txt
 * 
 * @function
 * @returns {MetadataRoute.Sitemap} Array of sitemap entries
 * 
 * @example
 * ```typescript
 * // Next.js automatically calls this and generates:
 * // /sitemap.xml
 * // 
 * // XML format:
 * // <?xml version="1.0" encoding="UTF-8"?>
 * // <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
 * //   <url>
 * //     <loc>https://sendora.vercel.app/</loc>
 * //     <lastmod>2025-11-04</lastmod>
 * //     <changefreq>weekly</changefreq>
 * //     <priority>1.0</priority>
 * //   </url>
 * //   ...
 * // </urlset>
 * ```
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sendora.vercel.app'
  const currentDate = new Date() // Last modified date for all pages

  return [
    // Homepage - Highest priority, updated weekly
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // Send page - Main app feature, high priority
    {
      url: `${baseUrl}/send`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // How It Works - Important documentation page
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // About page - Company information
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Contact page - User support
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    // Certificates page - Key feature
    {
      url: `${baseUrl}/certificates`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]
}
