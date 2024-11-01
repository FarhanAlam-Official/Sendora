import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function GET(request: NextRequest) {
  try {
    const DEFAULT_SMTP = {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASSWORD || "",
      },
    }

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
        await transporter.verify()
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
