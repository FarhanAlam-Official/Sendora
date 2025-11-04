/**
 * @fileoverview Global Error Boundary - Root-Level Error Handling
 * @module app/global-error
 * @description
 * This is the root-level error boundary for the entire Next.js application.
 * It catches errors that occur in the root layout or during critical failures.
 * 
 * Features:
 * - Catches errors in root layout.tsx
 * - Provides fallback UI when layout fails
 * - Must render complete HTML structure (html, body tags)
 * - Always shows ServerErrorPage for maximum compatibility
 * 
 * When This Activates:
 * - Errors in app/layout.tsx
 * - Critical errors during app initialization
 * - Errors not caught by error.tsx
 * - Production-only (development shows error overlay)
 * 
 * Important Notes:
 * - Must include <html> and <body> tags
 * - Cannot use components from layout (they may have failed)
 * - Should be simple and self-contained
 * - Only active in production builds
 * 
 * Design Decision:
 * - Always shows ServerErrorPage (generic 500 error)
 * - Doesn't attempt error classification
 * - Keeps it simple to avoid secondary failures
 * - Provides consistent experience for critical errors
 * 
 * Next.js Integration:
 * - Must be a Client Component ("use client")
 * - Receives error object with optional digest
 * - Receives reset function (may not always work)
 * - Replaces entire page structure on error
 * 
 * @requires react
 * @requires @/components/error-pages/ServerErrorPage
 */

"use client"

import ServerErrorPage from "@/components/error-pages/ServerErrorPage"

/**
 * Global Error Boundary Component - Root-level error fallback.
 * 
 * This component serves as the last line of defense for error handling.
 * When the root layout or critical components fail, this provides a
 * minimal but functional error page.
 * 
 * HTML Structure:
 * - Must render complete <html> and <body> tags
 * - Replaces entire page when activated
 * - Cannot rely on layout components (they may have failed)
 * 
 * Error Display:
 * - Always shows ServerErrorPage component
 * - Generic 500 error presentation
 * - Doesn't attempt to classify error type
 * - Simple and reliable fallback
 * 
 * Reset Functionality:
 * - Receives reset() function from Next.js
 * - May or may not work depending on error
 * - ServerErrorPage doesn't expose reset button
 * - User can navigate back or go home
 * 
 * Production vs Development:
 * - Production: Shows this component
 * - Development: Shows error overlay instead
 * - Test in production build to see this
 * 
 * Why ServerErrorPage?
 * - Most generic and safe option
 * - Doesn't require additional logic
 * - Won't fail due to dependencies
 * - Provides clear error indication
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Error & { digest?: string }} props.error - Error object from Next.js
 * @param {() => void} props.reset - Reset function from Next.js (may not work)
 * @returns {JSX.Element} Complete HTML page with error display
 * 
 * @example
 * ```tsx
 * // This file is automatically used by Next.js
 * // When root layout fails:
 * // <html>
 * //   <body>
 * //     <ServerErrorPage />
 * //   </body>
 * // </html>
 * ```
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        {/* Always show ServerErrorPage for global errors */}
        <ServerErrorPage />
      </body>
    </html>
  )
}