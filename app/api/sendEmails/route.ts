import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

const DEFAULT_SMTP = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASSWORD || "",
  },
}

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // ms

async function sendWithRetry(transporter: nodemailer.Transporter, mailOptions: any, retries = 0): Promise<any> {
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

export async function POST(request: NextRequest) {
  try {
    const { to, subject, body, smtpConfig, customSMTP, pdfAttachment } = await request.json()

    if (!to || !subject || !body) {
      return NextResponse.json({ error: "Missing required fields: to, subject, body" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    let transporter: nodemailer.Transporter
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

    const attachments: any[] = []
    if (pdfAttachment) {
      attachments.push({
        filename: pdfAttachment.filename || "certificate.pdf",
        content: Buffer.from(pdfAttachment.content, "base64"),
      })
    }

    const result = await sendWithRetry(transporter, {
      from: fromEmail,
      to,
      subject,
      html: body,
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
