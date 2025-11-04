import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

/**
 * GET handler for the health check API endpoint
 * 
 * This endpoint provides system health status information including:
 * 1. API operational status
 * 2. SMTP configuration status
 * 3. SMTP connection verification (if configured)
 * 
 * The health check helps monitor the application's operational status
 * and verifies that required services like SMTP are properly configured.
 * 
 * @param request - Next.js request object
 * @returns NextResponse with health status information
 */
export async function GET(request: NextRequest) {
  try {
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
     * Health status object containing API and SMTP information
     */
    const status = {
      api: "operational",
      timestamp: new Date().toISOString(),
      smtp: {
        configured: !!DEFAULT_SMTP.auth.user && !!DEFAULT_SMTP.auth.pass,
        host: DEFAULT_SMTP.host,
        port: DEFAULT_SMTP.port,
      },
    }

    // Attempt to verify SMTP if configured
    if (DEFAULT_SMTP.auth.user && DEFAULT_SMTP.auth.pass) {
      try {
        const transporter = nodemailer.createTransport(DEFAULT_SMTP)
        // Use verify method to test SMTP connection (type assertion to avoid TS error)
        await (transporter as any).verify()
        return NextResponse.json({
          ...status,
          smtp: {
            ...status.smtp,
            verified: true,
          },
        })
      } catch (error) {
        return NextResponse.json({
          ...status,
          smtp: {
            ...status.smtp,
            verified: false,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        })
      }
    }

    return NextResponse.json(status)
  } catch (error) {
    return NextResponse.json(
      {
        api: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}