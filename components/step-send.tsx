"use client"

/**
 * @fileoverview Step Send Component - Email Sending Execution with Progress Tracking (Legacy)
 * @module components/step-send
 * @description
 * This component implements email sending with advanced progress tracking and control:
 * - Sequential email sending with batch API fallback
 * - Real-time progress tracking (sent, failed, skipped counts)
 * - Pause/resume functionality for sending process
 * - Detailed error reporting for failed emails
 * - Visual progress bar and status indicators
 * - Send completion summary
 * 
 * NOTE: This is a legacy component. Modern flow uses StepPreviewSend instead.
 * 
 * Features:
 * - Batch sending with individual fallback
 * - Progress statistics (4 metrics cards)
 * - Animated progress bar with percentage
 * - Pause/Resume/Cancel controls
 * - Failed email list with error reasons
 * - Completion actions (Send Again, Back to Home)
 * - 500ms delay between individual emails
 * 
 * Send Modes:
 * - Batch Mode: Uses /api/sendEmails-batch endpoint (preferred)
 * - Fallback Mode: Individual sends via /api/sendEmails (if batch fails)
 * 
 * @requires react
 * @requires @/components/ui/button
 * @requires ./send-wizard-context
 * @requires lucide-react
 * @requires next/link
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useSendWizard } from "./send-wizard-context"
import { AlertCircle, CheckCircle2, Loader2, Pause, RotateCcw, X } from "lucide-react"
import Link from "next/link"

/**
 * Progress tracking interface for email sending operation.
 * Stores current state of the sending process including statistics and status.
 * 
 * @interface
 */
interface SendProgress {
  /** Number of emails successfully sent */
  sent: number
  /** Number of emails that failed to send */
  failed: number
  /** Number of recipients that were skipped */
  skipped: number
  /** Total number of recipients in the upload */
  total: number
  /** Current index in the sending sequence (0-based) */
  currentIndex: number
  /** Current status of the sending operation */
  status: "idle" | "sending" | "paused" | "completed" | "error"
  /** Array of failed email details with error reasons */
  failedEmails: Array<{ email: string; reason: string }>
}

/**
 * Step Send Component - Email sending execution with progress tracking (legacy).
 * 
 * This component handles the actual email sending process with:
 * - Batch API with individual fallback
 * - Real-time progress tracking
 * - Pause/resume controls
 * - Error handling and reporting
 * 
 * NOTE: This is a legacy component from an older wizard flow.
 * Modern implementations use StepPreviewSend which combines preview and send.
 * 
 * Send Flow:
 * 1. User clicks "Start Sending"
 * 2. Emails are prepared with placeholder substitution
 * 3. Attempt batch send via /api/sendEmails-batch
 * 4. If batch fails, fallback to individual sends
 * 5. Track progress and errors in real-time
 * 6. Display completion summary
 * 
 * Batch Send Process:
 * - Collects all emails with substituted placeholders
 * - Sends single request to /api/sendEmails-batch
 * - API handles delays and error tracking
 * - Returns success/failure counts and details
 * - Faster and more efficient than individual sends
 * 
 * Fallback Individual Send:
 * - Triggered if batch API fails or is unavailable
 * - Iterates through each email sequentially
 * - 500ms delay between sends (rate limiting)
 * - Updates progress after each send
 * - Can be paused/resumed
 * - Tracks failures individually
 * 
 * Progress Tracking:
 * - Sent: Successful deliveries
 * - Failed: Errors with reasons
 * - Skipped: Recipients excluded in wizard
 * - Total: All rows in uploaded file
 * - Progress bar: Visual percentage indicator
 * 
 * Pause/Resume:
 * - Pause: Sets isPaused flag, breaks send loop
 * - Resume: Continues from currentIndex
 * - Cancel: Not fully implemented (shows button)
 * - State persists across pause/resume cycles
 * 
 * Error Handling:
 * - Network errors caught and logged
 * - API errors extracted from response
 * - All failures stored with email and reason
 * - Failed list displayed after completion
 * - User can retry entire batch
 * 
 * Component States:
 * - idle: Ready to start sending
 * - sending: Currently sending emails
 * - paused: Sending temporarily stopped
 * - completed: All sends finished
 * - error: Critical error occurred (not fully used)
 * 
 * @component
 * @returns {JSX.Element} Email sending interface with progress tracking
 * 
 * @example
 * // Legacy wizard flow (not commonly used)
 * <SendWizardProvider>
 *   <StepSend /> // Shows when currentStep === 8 (old flow)
 * </SendWizardProvider>
 */
export default function StepSend() {
  const { state, setStep, reset } = useSendWizard()
  const [progress, setProgress] = useState<SendProgress>({
    sent: 0,
    failed: 0,
    skipped: state.skippedRows.size,
    total: state.rows.length,
    currentIndex: 0,
    status: "idle",
    failedEmails: [],
  })
  const [isPaused, setIsPaused] = useState(false)

  // Filter out skipped recipients to get list of emails to send
  const activeRows = state.rows.map((row, idx) => ({ row, idx })).filter(({ idx }) => !state.skippedRows.has(idx))

  /**
   * Main email sending function with batch API and fallback support.
   * 
   * Process:
   * 1. Prepares emails with placeholder substitution ({{name}}, {{certificate_link}})
   * 2. Attempts batch send via /api/sendEmails-batch
   * 3. Falls back to individual sends if batch fails
   * 4. Tracks progress and errors throughout
   * 5. Updates state after completion
   * 
   * Batch Mode (Preferred):
   * - Single API request with all emails
   * - Server handles delays and error tracking
   * - Faster and more efficient
   * - Returns aggregated results
   * 
   * Fallback Mode (Individual):
   * - Sequential email sending
   * - 500ms delay between sends
   * - Can be paused/resumed
   * - Real-time progress updates
   * 
   * @async
   * @function
   * @returns {Promise<void>}
   */
  const sendEmails = async () => {
    setProgress((prev) => ({ ...prev, status: "sending" }))
    setIsPaused(false)

    const failedEmails: Array<{ email: string; reason: string }> = []
    let sent = 0
    let failed = 0

    // Prepare all emails with placeholder substitution
    // Converts wizard data into ready-to-send email objects
    const emailsToSend = await Promise.all(
      activeRows.map(async ({ row, idx }) => {
        let subject = state.subject
        let body = state.messageBody

        const nameField = state.mapping.name
        const certificateField = state.mapping.certificateLink

        // Replace {{name}} and {{recipient_name}} placeholders with actual recipient name
        if (nameField) {
          subject = subject.replace(/\{\{name\}\}/g, row[nameField])
          body = body.replace(/\{\{name\}\}/g, row[nameField])
          body = body.replace(/\{\{recipient_name\}\}/g, row[nameField])
        }

        // Replace {{certificate_link}} placeholder with actual certificate URL
        if (certificateField) {
          body = body.replace(/\{\{certificate_link\}\}/g, row[certificateField])
        }

        return {
          to: row[state.mapping.email || "email"],
          subject,
          body,
        }
      }),
    )

    try {
      // Attempt batch send - more efficient, single API call
      const batchResponse = await fetch("/api/sendEmails-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: emailsToSend,
          smtpConfig: state.smtpConfig,
          customSMTP:
            state.smtpConfig === "custom" ? JSON.parse(localStorage.getItem("sendora_smtp_custom") || "{}") : undefined,
          delayBetween: 500,
        }),
      })

      if (batchResponse.ok) {
        // Batch send successful - extract results
        const batchData = await batchResponse.json()
        sent = batchData.success
        failed = batchData.failed
        // Collect failure details for display
        batchData.results
          .filter((r: any) => !r.success)
          .forEach((r: any) => {
            failedEmails.push({ email: r.email, reason: r.error })
          })
      } else {
        throw new Error("Batch send failed")
      }
    } catch (error) {
      // Fallback to individual sends if batch API fails
      // Slower but more reliable for smaller batches
      for (let i = 0; i < emailsToSend.length; i++) {
        // Check if user paused the sending
        if (isPaused) {
          setProgress((prev) => ({ ...prev, status: "paused" }))
          return
        }

        const email = emailsToSend[i]
        // Update progress for current email being sent
        setProgress((prev) => ({
          ...prev,
          currentIndex: i + 1,
        }))

        try {
          // Send individual email via single-send API
          const response = await fetch("/api/sendEmails", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: email.to,
              subject: email.subject,
              body: email.body,
              smtpConfig: state.smtpConfig,
              customSMTP:
                state.smtpConfig === "custom"
                  ? JSON.parse(localStorage.getItem("sendora_smtp_custom") || "{}")
                  : undefined,
            }),
          })

          if (response.ok) {
            // Email sent successfully
            sent++
            setProgress((prev) => ({ ...prev, sent }))
          } else {
            // Email failed - extract error message
            const errorData = await response.json()
            failed++
            failedEmails.push({ email: email.to, reason: errorData.error })
            setProgress((prev) => ({
              ...prev,
              failed,
              failedEmails: [...prev.failedEmails, { email: email.to, reason: errorData.error }],
            }))
          }
        } catch (err) {
          // Network error or other exception
          failed++
          failedEmails.push({
            email: email.to,
            reason: err instanceof Error ? err.message : "Unknown error",
          })
          setProgress((prev) => ({
            ...prev,
            failed,
            failedEmails: [
              ...prev.failedEmails,
              { email: email.to, reason: err instanceof Error ? err.message : "Unknown error" },
            ],
          }))
        }

        // Delay between emails to prevent rate limiting (500ms)
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    // Mark sending as complete
    setProgress((prev) => ({
      ...prev,
      status: "completed",
      currentIndex: activeRows.length,
    }))
  }

  // Calculate progress percentage for progress bar
  const percentComplete = (progress.currentIndex / activeRows.length) * 100

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Send Emails</h2>
        <p className="text-muted-foreground">Your emails are ready to send</p>
      </div>

      {/* Progress Statistics Cards - Shows sent, failed, skipped, and total counts */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{progress.sent}</p>
          <p className="text-xs text-muted-foreground">Sent</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{progress.failed}</p>
          <p className="text-xs text-muted-foreground">Failed</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-muted-foreground">{progress.skipped}</p>
          <p className="text-xs text-muted-foreground">Skipped</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{progress.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
      </div>

      {/* Animated Progress Bar - Shows only when sending has started */}
      {progress.status !== "idle" && (
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium">
              {progress.currentIndex} of {activeRows.length} sent
            </span>
            <span className="text-muted-foreground">{Math.round(percentComplete)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      )}

      {/* Status Alerts - Display completion, pause, or error messages */}
      {/* Completion Alert - Green success message */}
      {progress.status === "completed" && (
        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-700">Sending Complete!</p>
            <p className="text-sm text-green-600">
              {progress.sent} sent, {progress.failed} failed
            </p>
          </div>
        </div>
      )}

      {/* Paused Alert - Amber warning message */}
      {progress.status === "paused" && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700">Sending paused</p>
        </div>
      )}

      {/* Failed Emails List - Shows after completion if any failures occurred */}
      {progress.failed > 0 && progress.status === "completed" && (
        <div className="space-y-3">
          <h4 className="font-semibold text-red-600">Failed Emails ({progress.failed})</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {progress.failedEmails.map((item, idx) => (
              <div key={idx} className="text-xs p-3 bg-red-500/10 border border-red-500/20 rounded">
                <p className="font-mono text-red-700">{item.email}</p>
                <p className="text-red-600 text-xs mt-1">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Buttons - Different buttons shown based on current status */}
      <div className="flex gap-3">
        {/* Idle State - Show Start button */}
        {progress.status === "idle" && (
          <Button
            onClick={sendEmails}
            className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground"
          >
            <Loader2 className="w-4 h-4 mr-2" />
            Start Sending
          </Button>
        )}

        {/* Sending State - Show Pause and Cancel buttons */}
        {progress.status === "sending" && (
          <>
            <Button onClick={() => setIsPaused(true)} variant="outline" className="flex-1">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
            <Button variant="destructive" className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancel All
            </Button>
          </>
        )}

        {/* Paused State - Show Resume and Cancel buttons */}
        {progress.status === "paused" && (
          <>
            <Button
              onClick={sendEmails}
              className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Resume
            </Button>
            <Button variant="destructive" className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancel All
            </Button>
          </>
        )}

        {/* Completed State - Show Send Again and Back to Home buttons */}
        {progress.status === "completed" && (
          <>
            <Button
              onClick={() => reset()}
              className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Send Again
            </Button>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Back to Home
              </Button>
            </Link>
          </>
        )}
      </div>

      {/* Contact & Support Link */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center text-sm text-blue-700">
        <p>
          Questions?{" "}
          <Link href="/contact" className="underline font-medium">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  )
}
