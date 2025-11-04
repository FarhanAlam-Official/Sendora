/**
 * @fileoverview App-Level 404 Not Found Page
 * @module app/not-found
 * @description
 * This is the root-level 404 error page for the Next.js application.
 * It's displayed when a user navigates to a non-existent route.
 * 
 * Features:
 * - Uses NotFoundErrorPage component with interactive astronaut
 * - Triggered automatically by Next.js for invalid routes
 * - Can also be manually triggered via notFound() function
 * - Provides navigation options (Go Home, Go Back, Learn More)
 * 
 * When This Activates:
 * - User visits a route that doesn't exist (e.g., /xyz)
 * - notFound() is called in a page or API route
 * - Dynamic route doesn't match any data
 * - Middleware redirects to non-existent route
 * 
 * Component Used:
 * - NotFoundErrorPage: Interactive 404 page with:
 *   * Floating astronaut with parallax
 *   * Large "404" display
 *   * "Lost in cyberspace" message
 *   * Animated background effects
 *   * Action buttons for navigation
 * 
 * Alternative to Custom Error:
 * - Next.js provides notFound() function
 * - Call in page.tsx to trigger this page
 * - Example: if (!data) notFound()
 * 
 * @requires @/components/error-pages/NotFoundErrorPage
 */

import NotFoundErrorPage from "@/components/error-pages/NotFoundErrorPage"

/**
 * App-Level 404 Not Found Page Component.
 * 
 * This component is displayed when a user navigates to a route that doesn't
 * exist in the application. It provides a friendly, interactive error page
 * instead of a generic browser 404.
 * 
 * Next.js Behavior:
 * - Automatically shown for non-existent routes
 * - Can be manually triggered with notFound() function
 * - Doesn't require route definition
 * - Works in both app and pages router
 * 
 * User Experience:
 * - Engaging visual design (floating astronaut)
 * - Clear error message ("Lost in cyberspace")
 * - Multiple navigation options
 * - Maintains app branding and style
 * 
 * Navigation Options:
 * 1. Go Home: Returns to homepage (/)
 * 2. Go Back: Browser back button
 * 3. Learn More: Links to about page
 * 
 * SEO Considerations:
 * - Returns proper 404 HTTP status code
 * - Not indexed by search engines
 * - Helps identify broken links
 * 
 * Programmatic Usage:
 * ```typescript
 * // In any page or component:
 * import { notFound } from 'next/navigation'
 * 
 * if (!user) {
 *   notFound() // Triggers this 404 page
 * }
 * ```
 * 
 * @component
 * @returns {JSX.Element} Interactive 404 error page
 * 
 * @example
 * ```tsx
 * // This file is automatically used by Next.js
 * // When user visits non-existent route:
 * // https://sendora.com/invalid-page
 * // → Shows NotFoundErrorPage
 * ```
 */
export default function NotFound() {
  return <NotFoundErrorPage />
}