/**
 * @fileoverview App-Level Error Boundary - Intelligent Error Routing
 * @module app/error
 * @description
 * This is the main error boundary for the Next.js application. It catches errors
 * that occur during rendering and routes them to appropriate error pages based
 * on error type classification.
 * 
 * Features:
 * - Error type detection (network, server, generic)
 * - Automatic routing to specialized error pages
 * - Client-side error logging
 * - Reset functionality to attempt recovery
 * - Next.js error digest support
 * 
 * Error Classification:
 * 1. Network Errors: Routes to NetworkErrorPage
 *    - "fetch", "network", "Network" in error message
 *    - NetworkError or TypeError error names
 * 2. Server Errors: Routes to ServerErrorPage
 *    - "500" or "Internal Server Error" in message
 *    - Error digest starts with "500"
 * 3. Generic Errors: Routes to GenericErrorPage (fallback)
 *    - All other unclassified errors
 * 
 * Helper Functions:
 * - isNetworkError(): Detects network-related failures
 * - isServerError(): Detects server-side errors
 * 
 * Next.js Integration:
 * - Must be a Client Component ("use client")
 * - Receives error object with optional digest
 * - Receives reset function from Next.js
 * - Catches errors in child components (not layout)
 * 
 * @requires react
 * @requires @/components/error-pages/GenericErrorPage
 * @requires @/components/error-pages/NetworkErrorPage
 * @requires @/components/error-pages/ServerErrorPage
 */

"use client"

import { useEffect } from "react"
import GenericErrorPage from "@/components/error-pages/GenericErrorPage"
import NetworkErrorPage from "@/components/error-pages/NetworkErrorPage"
import ServerErrorPage from "@/components/error-pages/ServerErrorPage"

/**
 * Determines if an error is network-related.
 * 
 * Checks for common network error patterns:
 * - Error message contains "fetch", "network", or "Network"
 * - Error name is "NetworkError" or "TypeError"
 * 
 * @function
 * @param {Error} error - The error object to check
 * @returns {boolean} True if error is network-related
 * 
 * @example
 * ```typescript
 * const err = new Error("Failed to fetch data")
 * isNetworkError(err) // Returns true
 * ```
 */
function isNetworkError(error: Error): boolean {
  // Check for common network error patterns
  if (error.message.includes("fetch") || error.message.includes("network") || error.message.includes("Network")) {
    return true
  }
  if (error.name === "NetworkError" || error.name === "TypeError") {
    return true
  }
  return false
}

/**
 * Determines if an error is a server error (5xx).
 * 
 * Checks for server error patterns:
 * - Error message contains "500" or "Internal Server Error"
 * - Error digest (Next.js tracking ID) starts with "500"
 * 
 * @function
 * @param {Error & { digest?: string }} error - The error object to check
 * @returns {boolean} True if error is server-related
 * 
 * @example
 * ```typescript
 * const err = new Error("500 Internal Server Error")
 * isServerError(err) // Returns true
 * ```
 */
function isServerError(error: Error & { digest?: string }): boolean {
  // Check for common server error patterns
  if (error.message.includes("500") || error.message.includes("Internal Server Error")) {
    return true
  }
  if (error.digest?.startsWith("500")) {
    return true
  }
  return false
}

/**
 * App-Level Error Boundary Component - Routes errors to appropriate pages.
 * 
 * This component serves as the main error boundary for the Next.js application.
 * It catches errors during rendering, classifies them, and displays the
 * appropriate error page with recovery options.
 * 
 * Error Routing Logic:
 * 1. Check if network error → Show NetworkErrorPage
 * 2. Check if server error → Show ServerErrorPage
 * 3. Otherwise → Show GenericErrorPage with reset
 * 
 * Error Logging:
 * - Logs all errors to console with prefix "Error caught by error boundary:"
 * - Helps with debugging and monitoring
 * - useEffect ensures logging happens on client side
 * 
 * Recovery Mechanism:
 * - GenericErrorPage receives reset() function
 * - User can click "Try Again" to attempt recovery
 * - Triggers React re-render to attempt fixing error
 * 
 * Next.js Props:
 * - error: Error object with optional digest property
 * - reset: Function to reset error boundary and retry
 * 
 * Scope:
 * - Catches errors in route components and children
 * - Does NOT catch errors in layout.tsx
 * - Does NOT catch errors in root layout
 * - Use global-error.tsx for layout errors
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Error & { digest?: string }} props.error - Error object from Next.js
 * @param {() => void} props.reset - Reset function from Next.js
 * @returns {JSX.Element} Appropriate error page component
 * 
 * @example
 * ```tsx
 * // This file is automatically used by Next.js
 * // When an error occurs in /app or any route:
 * // - Network errors show NetworkErrorPage
 * // - Server errors show ServerErrorPage
 * // - Other errors show GenericErrorPage
 * ```
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console for debugging
    // This runs on client side only
    console.error("Error caught by error boundary:", error)
  }, [error])

  // Route to appropriate error page based on error type
  // Priority: Network → Server → Generic
  if (isNetworkError(error)) {
    return <NetworkErrorPage />
  }

  if (isServerError(error)) {
    return <ServerErrorPage />
  }

  // Default to generic error page
  return <GenericErrorPage error={error} reset={reset} />
}
