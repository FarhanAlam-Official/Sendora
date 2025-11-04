/**
 * @fileoverview Health Check API Route - System Status Monitoring
 * @module app/api/health
 * @description
 * This API endpoint provides health check and system status information.
 * It verifies the operational status of the API and SMTP configuration.
 * 
 * Features:
 * - API operational status check
 * - SMTP configuration validation
 * - SMTP connection verification (if configured)
 * - Timestamp for monitoring
 * - Detailed error reporting
 * 
 * Use Cases:
 * - Uptime monitoring services
 * - Load balancer health checks
 * - DevOps monitoring dashboards
 * - Pre-deployment SMTP verification
 * - System status pages
 * 
 * Response Types:
 * 1. Fully Configured: SMTP verified successfully
 * 2. Configured but Failed: SMTP settings present but connection failed
 * 3. Not Configured: SMTP credentials missing
 * 4. API Error: Unexpected system error
 * 
 * Environment Variables Required:
 * - SMTP_HOST: SMTP server hostname (default: smtp.gmail.com)
 * - SMTP_PORT: SMTP server port (default: 587)
 * - SMTP_SECURE: Use TLS/SSL (true/false)
 * - SMTP_USER: SMTP authentication username
 * - SMTP_PASSWORD: SMTP authentication password
 * 
 * @requires next/server
 * @requires nodemailer
 */

import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

/**
 * GET Handler - Health Check Status
 * 
 * Returns system health information including:
 * - API operational status
 * - Current timestamp (ISO 8601)
 * - SMTP configuration status
 * - SMTP connection verification (if configured)
 * 
 * Response (Fully Healthy - 200):
 * ```json
 * {
 *   "api": "operational",
 *   "timestamp": "2025-11-04T12:00:00.000Z",
 *   "smtp": {
 *     "configured": true,
 *     "host": "smtp.gmail.com",
 *     "port": 587,
 *     "verified": true
 *   }
 * }
 * ```
 * 
 * Response (SMTP Not Verified - 200):
 * ```json
 * {
 *   "api": "operational",
 *   "timestamp": "2025-11-04T12:00:00.000Z",
 *   "smtp": {
 *     "configured": true,
 *     "host": "smtp.gmail.com",
 *     "port": 587,
 *     "verified": false,
 *     "error": "Invalid credentials"
 *   }
 * }
 * ```
 * 
 * Response (SMTP Not Configured - 200):
 * ```json
 * {
 *   "api": "operational",
 *   "timestamp": "2025-11-04T12:00:00.000Z",
 *   "smtp": {
 *     "configured": false,
 *     "host": "smtp.gmail.com",
 *     "port": 587
 *   }
 * }
 * ```
 * 
 * Response (Error - 500):
 * ```json
 * {
 *   "api": "error",
 *   "error": "Error message"
 * }
 * ```
 * 
 * Health Check Flow:
 * 1. Check if SMTP credentials are configured
 * 2. If configured, create transporter and verify connection
 * 3. Return status with verification result
 * 4. If not configured, return basic status
 * 
 * SMTP Verification:
 * - Uses nodemailer's verify() method
 * - Tests actual connection to SMTP server
 * - Validates credentials without sending email
 * - Returns detailed error on failure
 * 
 * Monitoring Integration:
 * - UptimeRobot: Check "operational" status
 * - Pingdom: Monitor response time
 * - Datadog: Parse JSON for metrics
 * - StatusPage: Display SMTP health
 * 
 * @function
 * @param {NextRequest} request - Next.js request object
 * @returns {Promise<NextResponse>} JSON response with health status
 * 
 * @example
 * ```typescript
 * // Check system health
 * const response = await fetch('/api/health')
 * const status = await response.json()
 * 
 * if (status.api === 'operational' && status.smtp.verified) {
 *   console.log('System is healthy')
 * }
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    /**
     * Default SMTP Configuration
     * 
     * Reads SMTP settings from environment variables with fallbacks:
     * - host: Default to smtp.gmail.com
     * - port: Default to 587 (TLS)
     * - secure: true for port 465 (SSL), false for 587 (TLS)
     * - auth: User and password from env vars
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
     * Health Status Object
     * 
     * Contains:
     * - api: Always "operational" if this code runs
     * - timestamp: Current time in ISO 8601 format
     * - smtp: SMTP configuration and status details
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

    // Attempt SMTP verification if credentials are configured
    if (DEFAULT_SMTP.auth.user && DEFAULT_SMTP.auth.pass) {
      try {
        const transporter = nodemailer.createTransport(DEFAULT_SMTP)
        // Verify SMTP connection (tests auth and connectivity)
        // Type assertion to avoid TypeScript error on verify method
        await (transporter as any).verify()
        // SMTP verified successfully
        return NextResponse.json({
          ...status,
          smtp: {
            ...status.smtp,
            verified: true,
          },
        })
      } catch (error) {
        // SMTP verification failed (invalid credentials, network error, etc.)
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

    // SMTP not configured (missing credentials)
    return NextResponse.json(status)
  } catch (error) {
    // Unexpected error in health check
    return NextResponse.json(
      {
        api: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}