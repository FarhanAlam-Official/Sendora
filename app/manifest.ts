/**
 * @fileoverview PWA Web App Manifest - Progressive Web App Configuration
 * @module app/manifest
 * @description
 * This file generates the web app manifest for Progressive Web App (PWA) functionality.
 * The manifest defines how the app appears when installed on user devices.
 * 
 * Features:
 * - App name and short name
 * - Description for app stores
 * - Start URL (entry point)
 * - Display mode (standalone = full-screen app)
 * - Theme and background colors
 * - Screen orientation preference
 * - App categories for discoverability
 * - Multiple icon sizes for various devices
 * 
 * PWA Benefits:
 * - Install to home screen (mobile/desktop)
 * - Offline capability (with service worker)
 * - App-like experience (no browser UI)
 * - Better engagement and retention
 * 
 * Icon Configuration:
 * - 16x16: Browser favicon
 * - 32x32: Browser tab icon
 * - 180x180: Apple touch icon (iOS)
 * - 192x192: Android chrome (any purpose)
 * - 512x512: Android chrome splash screen
 * 
 * Display Modes:
 * - standalone: Full-screen app without browser UI
 * - minimal-ui: Minimal browser controls
 * - browser: Opens in normal browser tab
 * - fullscreen: Complete full-screen (rare)
 * 
 * Next.js Integration:
 * - Automatically generates /manifest.webmanifest
 * - Called at build time
 * - Type-safe with MetadataRoute.Manifest
 * - Linked in layout.tsx metadata
 * 
 * @requires next
 */

import { MetadataRoute } from 'next'

/**
 * Web App Manifest Generator - PWA configuration.
 * 
 * This function generates the manifest.json file that defines how the
 * application behaves when installed as a Progressive Web App.
 * 
 * Manifest Properties:
 * 
 * 1. name: Full application name (shown on splash screen, app drawer)
 * 2. short_name: Abbreviated name (shown under home screen icon)
 * 3. description: App description for app stores and install prompts
 * 4. start_url: URL to load when app is launched (usually "/")
 * 5. display: How the app appears ("standalone" = app mode)
 * 6. background_color: Splash screen background (#ffffff = white)
 * 7. theme_color: Browser UI color (#3b82f6 = primary blue)
 * 8. orientation: Preferred screen orientation (portrait-primary)
 * 9. categories: App store categories for discoverability
 * 10. icons: Array of icon objects with sizes and purposes
 * 
 * Icon Purposes:
 * - "any": Can be used for any purpose
 * - "maskable": Can be masked to different shapes (Android adaptive icons)
 * - "monochrome": Single color for notification icons
 * 
 * Categories:
 * - business: Business tools category
 * - productivity: Productivity apps
 * - education: Educational software
 * 
 * Installation Triggers:
 * - Manifest present ✓
 * - HTTPS (or localhost) ✓
 * - Service worker (optional, enhances offline)
 * - User engagement (visits, time on site)
 * 
 * Testing:
 * - Chrome DevTools → Application → Manifest
 * - Lighthouse audit for PWA score
 * - Test install prompt on mobile
 * 
 * @function
 * @returns {MetadataRoute.Manifest} Web app manifest configuration
 * 
 * @example
 * ```typescript
 * // Next.js automatically calls this and generates:
 * // /manifest.webmanifest or /manifest.json
 * // 
 * // Users can then install the app:
 * // - Mobile: "Add to Home Screen"
 * // - Desktop: Browser install prompt
 * ```
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sendora - Smart Certificate Distribution',
    short_name: 'Sendora',
    description: 'Automate bulk certificate and email distribution with ease. Upload Excel, map fields, and send personalized emails to hundreds of recipients in seconds.',
    start_url: '/', // Landing page when app is launched
    display: 'standalone', // Full-screen app mode without browser UI
    background_color: '#ffffff', // Splash screen background
    theme_color: '#3b82f6', // Browser UI color (primary blue)
    orientation: 'portrait-primary', // Preferred orientation
    categories: ['business', 'productivity', 'education'], // App store categories
    // Icon array for different device sizes and purposes
    icons: [
      {
        src: '/favicon/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/favicon/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/favicon/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
    ],
  }
}
