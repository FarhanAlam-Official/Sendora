/**
 * @fileoverview Batch Email Sending API Route
 * @module app/api/sendEmails-batch
 * @description
 * This API endpoint sends multiple emails in batch with configurable delays
 * between sends. It processes emails sequentially and tracks success/failure.
 * 
 * Features:
 * - Batch email processing (multiple recipients)
 * - Sequential sending with configurable delays
 * - Individual PDF attachments per email
 * - Success/failure tracking per email
 * - Performance timing (total time)
 * - Detailed results array
 * - Custom or default SMTP configuration
 * - TypeScript interfaces for type safety
 * 
 * Use Cases:
 * - Certificate distribution to multiple recipients
 * - Newsletter sending
 * - Event notifications
 * - Bulk announcements
 * - Automated reporting
 * 
 * Performance Considerations:
 * - Sequential processing (prevents SMTP rate limiting)
 * - Configurable delay between sends (default: 500ms)
 * - Can be adjusted for different SMTP providers
 * - Gmail: 500-1000ms recommended
 * - SendGrid: Can be lower (100-200ms)
 * 
 * Rate Limiting:
 * - Delay prevents SMTP server throttling
 * - Helps avoid IP blacklisting
 * - Improves deliverability
 * - Prevents connection errors
 * 
 * Email Structure:
 * - Each email can have unique content
 * - Each email can have unique PDF attachment
 * - Shared SMTP configuration for all emails
 * - Individual success/failure tracking
 * 
 * Environment Variables (Default SMTP):
 * - SMTP_HOST: SMTP server hostname
 * - SMTP_PORT: SMTP server port
 * - SMTP_SECURE: Use TLS/SSL
 * - SMTP_USER: SMTP username
 * - SMTP_PASSWORD: SMTP password
 * 
 * @requires next/server
 * @requires nodemailer
 */

import { type NextRequest, NextResponse } from "next/server"
import nodemailer, { type Transporter } from "nodemailer"

/**
 * TypeScript Interface: Batch Email Request Data
 * 
 * Defines the structure of the batch email API request body.
 * Each batch contains an array of emails with individual recipients,
 * subjects, bodies, and optional PDF attachments.
 * 
 * @interface
 * @property {Array} emails - Array of email objects to send
 * @property {string} smtpConfig - SMTP configuration type ("default" or "custom")
 * @property {object} [customSMTP] - Optional custom SMTP configuration
 * @property {number} [delayBetween] - Optional delay between sends in ms (default: 500)
 */
interface BatchEmailRequest {
  emails: Array<{
    to: string
    subject: string
    body: string
    pdfAttachment?: {
      filename: string
      content: string
    }
  }>
  smtpConfig: "default" | "custom"
  customSMTP?: {
    host: string
    port: string
    email: string
    password: string
  }
  delayBetween?: number
}

/**
 * TypeScript Interface: Batch Email Response Data
 * 
 * Defines the structure of the batch email API response.
 * Includes success/failure counts, detailed results for each email,
 * and total processing time for performance monitoring.
 * 
 * @interface
 * @property {number} success - Count of successfully sent emails
 * @property {number} failed - Count of failed email sends
 * @property {Array} results - Detailed result object for each email
 * @property {number} totalTime - Total processing time in milliseconds
 */
interface BatchEmailResponse {
  success: number
  failed: number
  results: Array<{
    email: string
    success: boolean
    messageId?: string
    error?: string
  }>
  totalTime: number
}

/**
 * POST Handler - Send Batch Emails
 * 
 * Sends multiple emails sequentially with configurable delays between sends.
 * Tracks success/failure for each email and returns detailed results.
 * 
 * Request Body:
 * ```json
 * {
 *   "emails": [
 *     {
 *       "to": "user1@example.com",
 *       "subject": "Certificate 1",
 *       "body": "<p>HTML Content 1</p>",
 *       "pdfAttachment": {
 *         "filename": "cert1.pdf",
 *         "content": "base64-encoded-pdf-string"
 *       }
 *     }
 *   ],
 *   "smtpConfig": "default",
 *   "delayBetween": 500
 * }
 * ```
 * 
 * Response (Success - 200):
 * ```json
 * {
 *   "success": 2,
 *   "failed": 0,
 *   "totalTime": 1523,
 *   "results": [
 *     {
 *       "email": "user1@example.com",
 *       "success": true,
 *       "messageId": "<message-id-1>"
 *     }
 *   ]
 * }
 * ```
 * 
 * Processing Flow:
 * 1. Validate request body (emails array required)
 * 2. Choose SMTP configuration (custom or default)
 * 3. Create nodemailer transporter
 * 4. Start performance timer
 * 5. Loop through emails sequentially:
 *    a. Prepare mail options
 *    b. Add PDF attachment if provided
 *    c. Send email
 *    d. Track result (success/error)
 *    e. Wait delay before next email
 * 6. Calculate total time
 * 7. Return summary and detailed results
 * 
 * Features:
 * - Individual email failures don't stop batch
 * - Each failure is tracked in results array
 * - Batch continues with remaining emails
 * - Returns partial success if some emails fail
 * - Configurable delay prevents rate limiting
 * - Performance tracking for optimization
 * 
 * @function
 * @param {NextRequest} request - Next.js request object with JSON body
 * @returns {Promise<NextResponse<BatchEmailResponse | { error: string }>>} JSON response with batch results
 * 
 * @example
 * ```typescript
 * // Send batch of certificates
 * const response = await fetch('/api/sendEmails-batch', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     emails: batchEmailsArray,
 *     smtpConfig: 'default',
 *     delayBetween: 1000
 *   })
 * })
 * ```
 */
export async function POST(request: NextRequest): Promise<NextResponse<BatchEmailResponse | { error: string }>> {
  try {
    const body: BatchEmailRequest = await request.json()
    const { emails, smtpConfig, customSMTP, delayBetween = 500 } = body

    // Validate that emails array exists and is not empty
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "No emails provided" }, { status: 400 })
    }

    // Initialize performance timer and result tracking
    const startTime = Date.now()
    const results: BatchEmailResponse["results"] = []
    let successCount = 0
    let failedCount = 0

    /**
     * Default SMTP Configuration
     * 
     * Reads from environment variables for batch email sending.
     * Uses same configuration as single email endpoint.
     * Provides fallback values for Gmail SMTP.
     * 
     * @constant
     * @type {object}
     */
    const DEFAULT_SMTP = {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASSWORD || "",
      },
    }

    /**
     * Create email transporter based on configuration type.
     * Supports both custom SMTP (from request) and default SMTP (from env vars).
     */
    let transporter: Transporter
    let fromEmail: string

    // Use custom SMTP configuration if specified
    if (smtpConfig === "custom" && customSMTP) {
      transporter = nodemailer.createTransport({
        host: customSMTP.host,
        port: Number.parseInt(customSMTP.port) || 587,
        secure: (Number.parseInt(customSMTP.port) || 587) === 465,
        auth: {
          user: customSMTP.email,
          pass: customSMTP.password,
        },
      })
      fromEmail = customSMTP.email
    } else {
      // Use default SMTP configuration from environment variables
      transporter = nodemailer.createTransport(DEFAULT_SMTP)
      fromEmail = DEFAULT_SMTP.auth.user
    }

    /**
     * Process emails sequentially with delays between sends.
     * Each email is sent independently, so individual failures
     * don't affect the rest of the batch.
     */
    for (const email of emails) {
      try {
        /**
         * Prepare PDF attachments if provided in the email.
         * Decodes base64 content to Buffer for nodemailer.
         */
        const attachments: any[] = []
        if (email.pdfAttachment) {
          attachments.push({
            filename: email.pdfAttachment.filename || "certificate.pdf",
            content: Buffer.from(email.pdfAttachment.content, "base64"),
          })
        }

        /**
         * Send the email via SMTP.
         * Includes sender, recipient, subject, HTML body, and attachments.
         */
        const result = await transporter.sendMail({
          from: fromEmail,
          to: email.to,
          subject: email.subject,
          html: email.body,
          attachments,
        })

        // Track successful send with message ID
        results.push({
          email: email.to,
          success: true,
          messageId: result.messageId,
        })
        successCount++
        console.log(`[Batch] Sent to ${email.to}`)
      } catch (error) {
        // Track failed send with error message
        const errorMsg = error instanceof Error ? error.message : "Unknown error"
        results.push({
          email: email.to,
          success: false,
          error: errorMsg,
        })
        failedCount++
        console.error(`[Batch] Failed to send to ${email.to}: ${errorMsg}`)
      }

      /**
       * Add delay between emails to prevent SMTP rate limiting.
       * Skip delay for the last email in the batch.
       * Helps avoid IP blacklisting and improves deliverability.
       */
      if (emails.indexOf(email) < emails.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayBetween))
      }
    }

    // Calculate total processing time
    const totalTime = Date.now() - startTime

    // Return batch summary and detailed results
    return NextResponse.json({
      success: successCount,
      failed: failedCount,
      results,
      totalTime,
    })
  } catch (error) {
    // Handle unexpected errors during batch processing
    console.error("[Batch] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process batch" },
      { status: 500 },
    )
  }
}