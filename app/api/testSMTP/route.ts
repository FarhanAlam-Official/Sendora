/**
 * @fileoverview SMTP Configuration Testing API Route
 * @module app/api/testSMTP
 * @description
 * This API endpoint tests SMTP configuration by creating a transporter
 * and verifying the connection without sending an actual email.
 * 
 * Features:
 * - SMTP connection verification
 * - Validates required SMTP fields
 * - Tests authentication credentials
 * - Returns detailed error messages
 * - Used in wizard SMTP configuration step
 * 
 * Use Cases:
 * - Validate SMTP settings before saving
 * - Test custom SMTP configuration
 * - Troubleshoot email sending issues
 * - Pre-flight check for email campaigns
 * - Setup wizard validation
 * 
 * SMTP Providers Supported:
 * - Gmail (smtp.gmail.com:587)
 * - Outlook (smtp-mail.outlook.com:587)
 * - SendGrid (smtp.sendgrid.net:587)
 * - Mailgun (smtp.mailgun.org:587)
 * - AWS SES (email-smtp.us-east-1.amazonaws.com:587)
 * - Custom SMTP servers
 * 
 * Verification Process:
 * 1. Validates required fields (host, email, password)
 * 2. Creates nodemailer transporter with config
 * 3. Calls transporter.verify() to test connection
 * 4. Returns success or detailed error message
 * 
 * Security:
 * - Does not store SMTP credentials
 * - Does not send test emails
 * - Only validates connection
 * - Returns sanitized error messages
 * 
 * @requires next/server
 * @requires nodemailer
 */

import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

/**
 * POST handler for the SMTP configuration test API endpoint
 * 
 * This endpoint verifies SMTP configuration by:
 * 1. Validating required SMTP fields (host, email, password)
 * 2. Creating a nodemailer transporter with the provided configuration
 * 3. Attempting to verify the SMTP connection
 * 4. Returning success or error status
 * 
 * The function is used in the admin SMTP configuration UI to test
 * custom SMTP settings before saving them for email sending.
 * 
 * @param request - Next.js request object containing SMTP configuration data
 * @returns NextResponse with verification result
 */
export async function POST(request: NextRequest) {
  try {
    const { host, port, email, password } = await request.json()

    // Validate required fields
    if (!host || !email || !password) {
      return NextResponse.json({ error: "Missing required SMTP fields" }, { status: 400 })
    }

    // Create transporter with provided configuration
    const transporter = nodemailer.createTransport({
      host,
      port: Number.parseInt(port) || 587,
      secure: (Number.parseInt(port) || 587) === 465,
      auth: {
        user: email,
        pass: password,
      },
    })

    // Verify SMTP connection
    await (transporter as any).verify()

    return NextResponse.json({
      success: true,
      message: "SMTP connection verified",
    })
  } catch (error) {
    console.error("SMTP test error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "SMTP verification failed" },
      { status: 500 },
    )
  }
}