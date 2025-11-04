/**
 * @fileoverview Email Sending API Route with Retry Logic
 * @module app/api/sendEmails
 * @description
 * This API endpoint sends individual emails with PDF certificate attachments.
 * It supports both default and custom SMTP configurations with automatic retry logic.
 * 
 * Features:
 * - Single email sending with retry mechanism
 * - Configurable SMTP (default from env or custom from request)
 * - PDF attachment support (base64 encoded)
 * - Email validation with regex
 * - Automatic retry on failure (3 attempts, 1000ms delay)
 * - Detailed error logging
 * - HTML email support
 * 
 * Retry Strategy:
 * - MAX_RETRIES: 3 attempts total
 * - RETRY_DELAY: 1000ms between attempts
 * - Exponential delay could be added for production
 * - Logs each retry attempt for debugging
 * 
 * SMTP Configuration:
 * - Default: Uses environment variables (SMTP_HOST, etc.)
 * - Custom: Accepts SMTP config in request body
 * - Validation: Checks required SMTP fields
 * - Flexibility: Supports various SMTP providers
 * 
 * PDF Attachments:
 * - Format: Base64 encoded string
 * - Decoding: Automatic conversion to Buffer
 * - Filename: Customizable via request
 * - Content-Type: application/pdf
 * 
 * Email Validation:
 * - Regex pattern validation
 * - Format: standard email format
 * - Prevents invalid email attempts
 * 
 * Environment Variables (Default SMTP):
 * - SMTP_HOST: SMTP server hostname
 * - SMTP_PORT: SMTP server port (default: 587)
 * - SMTP_SECURE: Use TLS/SSL (true/false)
 * - SMTP_USER: SMTP username
 * - SMTP_PASSWORD: SMTP password
 * - FROM_EMAIL: Default sender email
 * - FROM_NAME: Default sender name
 * 
 * @requires next/server
 * @requires nodemailer
 */

import { type NextRequest, NextResponse } from "next/server"
import nodemailer, { type Transporter } from "nodemailer"
import { createEmailTemplate } from "@/lib/email-template"

/**
 * Default SMTP configuration from environment variables
 * Used when no custom SMTP is provided
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
 * Maximum number of retry attempts for sending emails
 */
const MAX_RETRIES = 3

/**
 * Delay between retry attempts in milliseconds
 */
const RETRY_DELAY = 1000 // ms

/**
 * Helper function to send emails with retry logic
 * 
 * This function attempts to send an email and will retry up to MAX_RETRIES times
 * with a delay between each attempt if the initial send fails.
 * 
 * @param transporter - Nodemailer transporter instance
 * @param mailOptions - Email options including recipient, subject, body, and attachments
 * @param retries - Current retry attempt count (starts at 0)
 * @returns Promise resolving to the send result
 */
async function sendWithRetry(transporter: any, mailOptions: any, retries = 0): Promise<any> {
  try {
    console.log(`[Email] Attempting to send to ${mailOptions.to} (attempt ${retries + 1}/${MAX_RETRIES})`)
    const result = await transporter.sendMail(mailOptions)
    console.log(`[Email] Successfully sent to ${mailOptions.to}`)
    return result
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.log(`[Email] Retry ${retries + 1}/${MAX_RETRIES} for ${mailOptions.to} after ${RETRY_DELAY}ms`)
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      return sendWithRetry(transporter, mailOptions, retries + 1)
    }
    throw error
  }
}

/**
 * POST handler for the single email sending API endpoint
 * 
 * This endpoint sends a single email with the following features:
 * 1. Support for both default and custom SMTP configurations
 * 2. Email validation
 * 3. PDF attachment support
 * 4. Retry mechanism for failed sends
 * 5. Detailed error reporting
 * 
 * The function validates the request, configures the appropriate SMTP transporter,
 * prepares attachments if provided, and sends the email with retry logic.
 * 
 * @param request - Next.js request object containing email data
 * @returns NextResponse with success or error status
 */
export async function POST(request: NextRequest) {
  try {
    const { to, subject, body, smtpConfig, customSMTP, pdfAttachment } = await request.json()

    // Validate required fields
    if (!to || !subject || !body) {
      return NextResponse.json({ error: "Missing required fields: to, subject, body" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    let transporter: Transporter
    let fromEmail: string

    if (smtpConfig === "custom" && customSMTP) {
      // Custom SMTP - validate and create transporter
      if (!customSMTP.host || !customSMTP.email || !customSMTP.password) {
        return NextResponse.json({ error: "Missing custom SMTP configuration" }, { status: 400 })
      }

      console.log(`[Email] Using custom SMTP: ${customSMTP.host}:${customSMTP.port}`)
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
    } else if (smtpConfig === "default") {
      // Default SMTP - check if environment variables are set
      if (!DEFAULT_SMTP.auth.user || !DEFAULT_SMTP.auth.pass) {
        return NextResponse.json(
          {
            error: "Default SMTP is not configured. Please configure SMTP_HOST, SMTP_USER, and SMTP_PASSWORD environment variables on the server, or use 'Custom SMTP' option instead.",
            details: "The default SMTP option requires server-side environment variables to be set. If you don't have access to server configuration, please use the 'Use My Own SMTP' option and configure your SMTP settings in the wizard.",
          },
          { status: 500 },
        )
      }

      console.log(`[Email] Using default SMTP: ${DEFAULT_SMTP.host}:${DEFAULT_SMTP.port}`)
      transporter = nodemailer.createTransport(DEFAULT_SMTP)
      fromEmail = DEFAULT_SMTP.auth.user
    } else {
      return NextResponse.json({ error: "No SMTP configuration selected" }, { status: 400 })
    }

    // Prepare attachments if provided
    const attachments: any[] = []
    if (pdfAttachment) {
      attachments.push({
        filename: pdfAttachment.filename || "certificate.pdf",
        content: Buffer.from(pdfAttachment.content, "base64"),
      })
    }

    // Wrap email body in professional HTML template
    const htmlBody = createEmailTemplate(body)

    // Send the email with retry logic
    const result = await sendWithRetry(transporter, {
      from: fromEmail,
      to,
      subject,
      html: htmlBody,
      attachments,
    })

    console.log(`[Email] Message sent to ${to} with ID: ${result.messageId}`)

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      timestamp: new Date().toISOString(),
      recipient: to,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to send email"
    console.error(`[Email] Error sending email:`, errorMessage)

    return NextResponse.json(
      {
        error: errorMessage,
        code: error instanceof Error && "code" in error ? (error as any).code : "SEND_ERROR",
      },
      { status: 500 },
    )
  }
}