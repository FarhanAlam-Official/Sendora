import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

/**
 * Administrator email address for contact form submissions
 * Defaults to admin@sendora.app if not set in environment variables
 */
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@sendora.app"

/**
 * Nodemailer transporter configuration for sending emails
 * Uses environment variables for SMTP configuration with fallback values
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  ...(process.env.SMTP_USER && process.env.SMTP_PASSWORD
    ? {
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      }
    : {}),
})

/**
 * POST handler for the contact form API endpoint
 * 
 * This endpoint processes contact form submissions by:
 * 1. Validating required fields (name, email, message)
 * 2. Sending an email notification to the administrator
 * 3. Sending a confirmation email to the submitter
 * 4. Implementing security measures like HTML escaping to prevent XSS
 * 
 * The function sends both emails in parallel for better performance
 * and returns appropriate success or error responses.
 * 
 * @param request - Next.js request object containing form data
 * @returns NextResponse with success or error status
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const message = formData.get("message") as string

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    /**
     * Helper function to determine the base URL for logo embedding
     * Tries multiple sources to find the correct origin
     */
    const getBaseUrl = () => {
      // Try origin header first
      const origin = request.headers.get("origin")
      if (origin) return origin
      
      // Try referer header
      const referer = request.headers.get("referer")
      if (referer) {
        const url = new URL(referer)
        return `${url.protocol}//${url.host}`
      }
      
      // Try environment variable
      if (process.env.NEXT_PUBLIC_BASE_URL) {
        return process.env.NEXT_PUBLIC_BASE_URL
      }
      
      // Fallback to default
      return "https://sendoraa.vercel.app"
    }
    
    const baseUrl = getBaseUrl()
    const logoUrl = `${baseUrl}/logo.png`

    /**
     * Helper function to escape HTML characters to prevent XSS attacks
     */
    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
    }

    // Escape user inputs for security
    const escapedName = escapeHtml(name)
    const escapedEmail = escapeHtml(email)
    // Escape HTML first, then convert newlines to <br> tags
    const escapedMessage = escapeHtml(message).replace(/\n/g, "<br>")

    // Send both emails in parallel for better performance
    const adminEmailPromise = transporter.sendMail({
      from: ADMIN_EMAIL,
      to: ADMIN_EMAIL,
      subject: `📧 New Contact Form Submission from ${name}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <img src="${logoUrl}" alt="Sendora Logo" style="width: 120px; height: auto; margin-bottom: 20px; max-width: 120px;" />
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                📧 New Contact Form Submission
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                You have received a new message through the Sendora contact form.
              </p>
              
              <!-- Contact Details Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                          <strong style="color: #333333; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">👤 Name:</strong>
                          <p style="margin: 8px 0 0 0; color: #555555; font-size: 16px; font-weight: 500;">${escapedName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                          <strong style="color: #333333; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">✉️ Email:</strong>
                          <p style="margin: 8px 0 0 0; color: #555555; font-size: 16px;">
                            <a href="mailto:${escapedEmail}" style="color: #667eea; text-decoration: none;">${escapedEmail}</a>
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <strong style="color: #333333; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">💬 Message:</strong>
                          <div style="margin: 12px 0 0 0; padding: 15px; background-color: #ffffff; border-left: 4px solid #667eea; border-radius: 4px; color: #555555; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">
${escapedMessage}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Quick Action -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 30px;">
                <tr>
                  <td align="center">
                    <a href="mailto:${escapedEmail}?subject=Re: Your Contact Form Submission" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px;">
                      Reply to ${escapedName}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.6;">
                This email was automatically generated by the Sendora contact form system.<br>
                <strong style="color: #666666;">Sendora</strong> - Professional Certificate & Email Management Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    })

    const confirmationEmailPromise = transporter.sendMail({
      from: ADMIN_EMAIL,
      to: email,
      subject: "✅ We received your message - Sendora",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Contacting Us</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 30px; text-align: center;">
              <img src="${logoUrl}" alt="Sendora Logo" style="width: 120px; height: auto; margin-bottom: 20px; max-width: 120px; background-color: rgba(255, 255, 255, 0.1); padding: 10px; border-radius: 12px;" />
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                Message Received!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 50px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">
                Hi ${escapedName}! 👋
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.8;">
                Thank you for reaching out to us! We've successfully received your message and wanted to let you know that our team has been notified.
              </p>
              
              <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%); border-left: 4px solid #667eea; border-radius: 8px;">
                <p style="margin: 0; color: #555555; font-size: 15px; line-height: 1.8; font-style: italic;">
                  "${escapeHtml(message.substring(0, 150))}${message.length > 150 ? '...' : ''}"
                </p>
              </div>
              
              <p style="margin: 20px 0; color: #666666; font-size: 16px; line-height: 1.8;">
                Our team typically responds within <strong style="color: #667eea;">24 hours</strong>, but we'll do our best to get back to you even sooner!
              </p>
              
              <!-- What's Next Section -->
              <div style="margin: 40px 0; padding: 25px; background-color: #f8f9fa; border-radius: 8px;">
                <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 18px; font-weight: 600;">
                  What happens next?
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 15px; line-height: 2;">
                  <li>Our team will review your message</li>
                  <li>We'll prepare a thoughtful response</li>
                  <li>You'll receive an email reply at <strong style="color: #555555;">${escapedEmail}</strong></li>
                </ul>
              </div>
              
              <!-- Support Info -->
              <div style="margin: 30px 0; padding: 20px; background-color: #ffffff; border: 2px solid #e0e0e0; border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                  Need immediate assistance?
                </p>
                <p style="margin: 0; color: #333333; font-size: 15px; font-weight: 500;">
                  📧 <a href="mailto:sendora@gmail.com" style="color: #667eea; text-decoration: none; font-weight: 600;">sendora@gmail.com</a>
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 40px 30px; background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 15px 0; color: #333333; font-size: 20px; font-weight: 700;">
                Sendora
              </p>
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Professional Certificate & Email Management Platform<br>
                Making certificate distribution simple and efficient
              </p>
              <div style="margin-top: 25px; padding-top: 25px; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.6;">
                  This is an automated confirmation email. Please do not reply to this message.<br>
                  If you have any questions, please contact us at <a href="mailto:sendora@gmail.com" style="color: #667eea; text-decoration: none;">sendora@gmail.com</a>
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    })

    // Wait for both emails to be sent
    await Promise.all([adminEmailPromise, confirmationEmailPromise])

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
    })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send message" },
      { status: 500 },
    )
  }
}