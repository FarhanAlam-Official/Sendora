import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const { host, port, email, password } = await request.json()

    if (!host || !email || !password) {
      return NextResponse.json({ error: "Missing required SMTP fields" }, { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      host,
      port: Number.parseInt(port) || 587,
      secure: (Number.parseInt(port) || 587) === 465,
      auth: {
        user: email,
        pass: password,
      },
    })

    await transporter.verify()

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
