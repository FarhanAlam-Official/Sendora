import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

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

export async function POST(request: NextRequest): Promise<NextResponse<BatchEmailResponse | { error: string }>> {
  try {
    const body: BatchEmailRequest = await request.json()
    const { emails, smtpConfig, customSMTP, delayBetween = 500 } = body

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "No emails provided" }, { status: 400 })
    }

    const startTime = Date.now()
    const results: BatchEmailResponse["results"] = []
    let successCount = 0
    let failedCount = 0

    const DEFAULT_SMTP = {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASSWORD || "",
      },
    }

    // Create transporter based on config
    let transporter: nodemailer.Transporter
    let fromEmail: string

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
      transporter = nodemailer.createTransport(DEFAULT_SMTP)
      fromEmail = DEFAULT_SMTP.auth.user
    }

    // Send each email with delay
    for (const email of emails) {
      try {
        const attachments: any[] = []
        if (email.pdfAttachment) {
          attachments.push({
            filename: email.pdfAttachment.filename || "certificate.pdf",
            content: Buffer.from(email.pdfAttachment.content, "base64"),
          })
        }

        const result = await transporter.sendMail({
          from: fromEmail,
          to: email.to,
          subject: email.subject,
          html: email.body,
          attachments,
        })

        results.push({
          email: email.to,
          success: true,
          messageId: result.messageId,
        })
        successCount++
        console.log(`[Batch] Sent to ${email.to}`)
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error"
        results.push({
          email: email.to,
          success: false,
          error: errorMsg,
        })
        failedCount++
        console.error(`[Batch] Failed to send to ${email.to}: ${errorMsg}`)
      }

      // Delay between emails
      if (emails.indexOf(email) < emails.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayBetween))
      }
    }

    const totalTime = Date.now() - startTime

    return NextResponse.json({
      success: successCount,
      failed: failedCount,
      results,
      totalTime,
    })
  } catch (error) {
    console.error("[Batch] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process batch" },
      { status: 500 },
    )
  }
}
