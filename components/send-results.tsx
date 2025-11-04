/**
 * @fileoverview Send Results Component - Email Campaign Results Display
 * @module components/send-results
 * @description
 * This component displays comprehensive results after an email campaign is completed.
 * It provides detailed statistics, success/failure breakdown, and actionable next steps.
 * 
 * Features:
 * - Summary statistics cards (successful, failed, success rate, time per email)
 * - Timeline information with total time taken
 * - Detailed failed emails list with error messages
 * - Action buttons for sending more or returning home
 * - Visual color coding (green for success, red for failures)
 * - Scrollable failed emails section
 * 
 * Statistics Displayed:
 * - Successful: Count of emails sent successfully
 * - Failed: Count of emails that failed to send
 * - Success Rate: Percentage of successful sends
 * - Per Email: Average time taken per email in milliseconds
 * 
 * @requires react
 * @requires @/components/ui/card
 * @requires @/components/ui/button
 * @requires lucide-react
 * @requires next/link
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

/**
 * Individual send result interface.
 * Represents the outcome of sending a single email.
 * 
 * @interface
 */
interface SendResult {
  /** Recipient email address */
  email: string
  /** Whether the email was sent successfully */
  success: boolean
  /** SMTP message ID (only present on success) */
  messageId?: string
  /** Error message (only present on failure) */
  error?: string
}

/**
 * Component props for SendResults.
 * 
 * @interface
 */
interface SendResultsProps {
  /** Array of individual send results */
  results: SendResult[]
  /** Total time taken for the entire campaign in milliseconds */
  totalTime: number
  /** Callback function to reset and send more emails */
  onReset: () => void
}

/**
 * Send Results Component - Displays email campaign results with statistics and error details.
 * 
 * This component provides a comprehensive view of email sending results including:
 * - 4 summary cards with key metrics
 * - Timeline card showing total duration
 * - Failed emails section with error details (if any failures)
 * - Action buttons for next steps
 * 
 * Statistics Calculated:
 * - Successful: Emails with success=true
 * - Failed: Emails with success=false
 * - Success Rate: (successful/total) * 100
 * - Time Per Email: totalTime/total emails
 * 
 * Visual Design:
 * - Green color scheme for successful sends
 * - Red color scheme for failures
 * - Blue for success rate percentage
 * - Purple for timing metrics
 * 
 * Failed Emails Section:
 * - Only displayed if there are failures (failed > 0)
 * - Red-themed card with border and background
 * - Scrollable list (max-height: 256px)
 * - Each failed email shows address and error message
 * - Monospace font for email addresses
 * 
 * Action Buttons:
 * - "Send More Emails": Calls onReset() to restart wizard
 * - "Back to Home": Returns to homepage (/)
 * 
 * @component
 * @param {SendResultsProps} props - Component props
 * @returns {JSX.Element} Results display with statistics and actions
 * 
 * @example
 * ```tsx
 * const results = [
 *   { email: 'user1@example.com', success: true, messageId: 'abc123' },
 *   { email: 'user2@example.com', success: false, error: 'Invalid address' }
 * ]
 * 
 * <SendResults 
 *   results={results}
 *   totalTime={5000}
 *   onReset={() => resetWizard()}
 * />
 * ```
 */
export function SendResults({ results, totalTime, onReset }: SendResultsProps) {
  // Calculate statistics from results array
  const successful = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length
  const successRate = ((successful / results.length) * 100).toFixed(1)
  const timePerEmail = (totalTime / results.length).toFixed(0)

  return (
    <div className="space-y-6">
      {/* Summary Cards - 4 metric cards in responsive grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Successful sends card - green theme */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{successful}</p>
              <p className="text-xs text-muted-foreground mt-1">Successful</p>
            </div>
          </CardContent>
        </Card>
        {/* Failed sends card - red theme */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{failed}</p>
              <p className="text-xs text-muted-foreground mt-1">Failed</p>
            </div>
          </CardContent>
        </Card>
        {/* Success rate percentage - blue theme */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{successRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">Success Rate</p>
            </div>
          </CardContent>
        </Card>
        {/* Average time per email - purple theme */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{timePerEmail}ms</p>
              <p className="text-xs text-muted-foreground mt-1">Per Email</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline card - shows total campaign duration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Send Timeline
          </CardTitle>
          <CardDescription>Completed in {(totalTime / 1000).toFixed(2)}s</CardDescription>
        </CardHeader>
      </Card>

      {/* Failed Emails Section - only shown if there are failures */}
      {failed > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              Failed Emails ({failed})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Scrollable list of failed emails with error messages */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results
                .filter((r) => !r.success)
                .map((result, idx) => (
                  <div key={idx} className="p-3 bg-white rounded border border-red-200 text-sm">
                    <p className="font-mono text-red-600">{result.email}</p>
                    <p className="text-red-500 text-xs mt-1">{result.error}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons - next steps for user */}
      <div className="flex gap-3">
        <Button onClick={onReset} className="flex-1 bg-gradient-to-r from-primary to-accent">
          Send More Emails
        </Button>
        <Link href="/" className="flex-1">
          <Button variant="outline" className="w-full bg-transparent">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
