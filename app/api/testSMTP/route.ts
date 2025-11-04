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