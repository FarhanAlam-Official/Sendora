/**
 * @fileoverview Generic Error Page Component - Comprehensive Error Display with Diagnostics
 * @module components/error-pages/GenericErrorPage
 * @description
 * This component provides a professional, user-friendly error page with advanced
 * error handling and debugging features. It's designed to catch and display any
 * unexpected errors in the application.
 * 
 * Features:
 * - Customizable error title and message
 * - Error digest display (Next.js error tracking)
 * - Expandable/collapsible error stack trace
 * - Copy error details to clipboard
 * - Email error report functionality
 * - Try again/reset functionality
 * - Return to home navigation
 * - Helpful troubleshooting tips
 * - Dark mode support
 * - Smooth animations
 * 
 * Actions Available:
 * - Try Again: Calls reset() or reloads page
 * - Go Home: Navigate to homepage
 * - Copy Error Details: Copy JSON payload to clipboard
 * - Report Issue: Open email client with pre-filled error details
 * - View/Hide Details: Toggle stack trace visibility
 * 
 * Error Details Payload:
 * - Title: Error title
 * - Message: Error message
 * - Digest: Next.js error digest ID
 * - Time: ISO timestamp
 * - Stack trace: Full error stack (if available)
 * 
 * @requires react
 * @requires next/link
 * @requires @/components/ui/button
 * @requires @/components/ui/card
 * @requires @/components/ui/separator
 * @requires @/components/ui/badge
 * @requires @/components/ui/toast
 * @requires lucide-react
 */

"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { showToast } from "@/components/ui/toast"
import { AlertTriangle, RefreshCw, Home, Copy, Bug, ChevronDown, ChevronUp, ShieldAlert } from "lucide-react"
import { useState } from "react"

/**
 * Props for the GenericErrorPage component.
 * 
 * @interface
 */
interface GenericErrorPageProps {
  /** Error object from Next.js error boundary (optional) */
  error?: Error & { digest?: string }
  /** Reset function to attempt recovery (optional) */
  reset?: () => void
  /** Custom error title (defaults to "Something went wrong") */
  errorTitle?: string
  /** Custom error message (defaults to generic message) */
  errorMessage?: string
}

/**
 * Generic Error Page Component - Displays comprehensive error information with actions.
 * 
 * This component serves as a fallback error page for the entire application,
 * catching any unhandled errors and presenting them in a user-friendly way.
 * 
 * Key Features:
 * - Professional error display with ShieldAlert icon
 * - Error digest badge (for tracking in logs)
 * - Expandable stack trace (default: open)
 * - Action buttons: Try Again, Go Home
 * - Utility actions: Copy Details, Report Issue, Toggle Details
 * - Helpful troubleshooting cards
 * - Responsive layout with dark mode
 * - Smooth animations (fade-in, bounce-in)
 * 
 * Error Copying:
 * - Creates JSON payload with all error details
 * - Includes title, message, digest, and timestamp
 * - Uses clipboard API to copy
 * - Shows success/failure toast notification
 * 
 * Error Reporting:
 * - Opens email client (mailto:)
 * - Pre-fills subject: "Sendora Error Report"
 * - Includes all error details in email body
 * - Uses NEXT_PUBLIC_ADMIN_EMAIL or default email
 * - User can add steps to reproduce
 * 
 * Reset Functionality:
 * - Calls provided reset() function if available
 * - Falls back to window.location.reload()
 * - Attempts to recover from error state
 * 
 * Troubleshooting Cards:
 * 1. What happened: Brief explanation
 * 2. Troubleshooting: Clear cache, reload, try different browser
 * 3. Need help: Report issue with reproduction steps
 * 
 * @component
 * @param {GenericErrorPageProps} props - Component props
 * @returns {JSX.Element} Error page with diagnostics and actions
 * 
 * @example
 * ```tsx
 * // In error.tsx (Next.js error boundary)
 * export default function Error({ error, reset }) {
 *   return <GenericErrorPage error={error} reset={reset} />
 * }
 * 
 * // Custom error page
 * <GenericErrorPage
 *   errorTitle="Payment Failed"
 *   errorMessage="We couldn't process your payment. Please try again."
 *   reset={() => retryPayment()}
 * />
 * ```
 */
export default function GenericErrorPage({ 
  error, 
  reset, 
  errorTitle = "Something went wrong",
  errorMessage = "An unexpected error occurred. Please try again."
}: GenericErrorPageProps) {
  // State to control stack trace visibility (default: open)
  const [detailsOpen, setDetailsOpen] = useState(true)

  // Extract error digest if available (Next.js tracking ID)
  const digest = error?.digest

  /**
   * Copies error details to clipboard as JSON.
   * Shows success/failure toast notification.
   */
  const handleCopy = async () => {
    try {
      const payload = JSON.stringify({
        title: errorTitle,
        message: errorMessage,
        digest,
        time: new Date().toISOString(),
      }, null, 2)
      await navigator.clipboard.writeText(payload)
      showToast.success({ title: "Error details copied" })
    } catch {
      showToast.error({ title: "Copy failed", description: "Please try again." })
    }
  }

  /**
   * Opens email client with pre-filled error report.
   * Uses mailto: protocol with encoded subject and body.
   */
  const handleReport = async () => {
    try {
      const subject = encodeURIComponent("Sendora Error Report")
      const body = encodeURIComponent(
        `Please describe what you were doing when this happened.\n\n`+
        `Error Title: ${errorTitle}\n`+
        `Message: ${errorMessage}\n`+
        `Digest: ${digest || "N/A"}\n`+
        `Time: ${new Date().toISOString()}\n`
      )
      window.location.href = `mailto:${process.env.NEXT_PUBLIC_ADMIN_EMAIL || "sendora.tool@gmail.com"}?subject=${subject}&body=${body}`
      showToast.info({ title: "Opening mail client" })
    } catch {
      showToast.error({ title: "Could not open mail client" })
    }
  }

  /**
   * Attempts to recover from error by calling reset() or reloading page.
   */
  const handleReset = () => {
    if (reset) {
      reset()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-[70vh] bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-12">
        {/* Main error card - transparent background with animations */}
        <Card className="max-w-4xl mx-auto border-0 shadow-none bg-transparent animate-fade-in-up">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 dark:bg-red-400/10 flex items-center justify-center mb-4 animate-bounce-in">
              <ShieldAlert className="w-8 h-8 text-red-500 dark:text-red-400" />
            </div>
            {/* Error title with gradient text */}
            <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200">
              {errorTitle}
            </CardTitle>
            <CardDescription className="text-base text-slate-600 dark:text-slate-300 mt-2">
              {errorMessage}
            </CardDescription>
            {/* Error digest badge - for tracking in logs */}
            {digest && (
              <div className="mt-3">
                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                  Digest: {digest}
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {/* Primary action buttons - Try Again and Go Home */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={handleReset}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try again
              </Button>
              <Button 
                variant="outline"
                onClick={() => { window.location.href = "/" }}
                className="border-slate-300 text-slate-800 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700"
              >
                <Home className="w-4 h-4 mr-2" />
                Go home
              </Button>
            </div>

            <Separator className="my-6" />

            {/* Utility action buttons - Copy, Report, Toggle Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button 
                variant="ghost" 
                onClick={handleCopy}
                className="justify-start hover:bg-red-50 hover:text-slate-900 dark:hover:bg-red-900/20 dark:hover:text-white"
              >
                <Copy className="w-4 h-4 mr-2 text-red-500" />
                Copy error details
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleReport}
                className="justify-start hover:bg-yellow-50 hover:text-slate-900 dark:hover:bg-yellow-900/20 dark:hover:text-white"
              >
                <Bug className="w-4 h-4 mr-2 text-yellow-600" />
                Report issue
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setDetailsOpen((v) => !v)}
                className="justify-start hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white"
              >
                {detailsOpen ? (
                  <ChevronUp className="w-4 h-4 mr-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 mr-2" />
                )}
                {detailsOpen ? "Hide details" : "View details"}
              </Button>
            </div>

            {/* Expandable error stack trace section */}
            {detailsOpen && (
              <div className="mt-6 animate-fade-in-up">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/40 p-4">
                  <pre className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words max-h-64 overflow-auto">
{`${error?.stack || errorMessage}`}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Helpful troubleshooting cards - 3 informational sections */}
        <div className="max-w-4xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[{icon: AlertTriangle, title: "What happened?", desc: "An unexpected error occurred. You can try again or return home."},
            {icon: RefreshCw, title: "Troubleshooting", desc: "Clear cache, reload the page, or try a different browser."},
            {icon: Bug, title: "Need help?", desc: "Report the issue with steps to reproduce so we can fix it quickly."}].map((item, i) => (
            <Card key={i} className="border-0 bg-transparent transition-colors duration-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <item.icon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white mb-1">{item.title}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">{item.desc}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
