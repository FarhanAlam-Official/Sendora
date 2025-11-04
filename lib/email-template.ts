/**
 * Email Template Utility
 * 
 * Creates professional HTML email templates with consistent styling
 * and automatic footer with Sendora website link.
 */

/**
 * Get the Sendora website URL from environment variables or construct from base URL
 * Falls back to a default URL if not configured
 */
function getSendoraWebsiteUrl(): string {
  // Try environment variable first
  if (process.env.NEXT_PUBLIC_SENDORA_URL) {
    return process.env.NEXT_PUBLIC_SENDORA_URL
  }
  
  // Try SENDORA_WEBSITE_URL
  if (process.env.SENDORA_WEBSITE_URL) {
    return process.env.SENDORA_WEBSITE_URL
  }
  
  // Try NEXT_PUBLIC_BASE_URL or BASE_URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL
  if (baseUrl) {
    return baseUrl
  }
  
  // Fallback to default
  return "https://sendoraa.vercel.app"
}

/**
 * Enhances content by converting plain URLs into styled buttons
 * Detects URLs that aren't already wrapped in anchor tags and styles them
 * 
 * @param content - HTML content that may contain plain URLs
 * @returns Enhanced content with styled links
 */
function enhanceContentWithButtons(content: string): string {
  // First, collect all URLs that are already in anchor tags
  const urlsInAnchors = new Set<string>()
  content.replace(/<a\s+href="([^"]+)"[^>]*>/gi, (match, href) => {
    if (href.match(/https?:\/\//)) {
      urlsInAnchors.add(href)
      // Also check if the URL appears in the anchor text
      const anchorMatch = content.match(new RegExp(`<a[^>]*href="${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>([^<]+)</a>`, 'i'))
      if (anchorMatch && anchorMatch[1]) {
        urlsInAnchors.add(anchorMatch[1])
      }
    }
    return match
  })
  
  // Enhance existing anchor tags that look like certificate links
  let enhanced = content.replace(
    /<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi,
    (match, href, text) => {
      // If it's a URL and looks like a certificate link, style it as a button
      if (href.match(/https?:\/\//)) {
        // Check if it's likely a certificate link
        const isCertificateLink = 
          text.toLowerCase().includes('certificate') || 
          text.toLowerCase().includes('download') || 
          text.toLowerCase().includes('link') ||
          text.trim() === href || // Plain URL as link text
          text.match(/^https?:\/\//) // URL as text
        
        if (isCertificateLink) {
          const buttonText = text.match(/^https?:\/\//) ? '📄 Download Certificate' : text
          return `
            <div style="margin: 24px 0; text-align: center;">
              <a href="${href}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                ${buttonText}
              </a>
            </div>
          `.trim()
        }
      }
      return match
    }
  )
  
  // Then, convert plain URLs (not in anchor tags) to styled buttons
  const urlPattern = /(https?:\/\/[^\s<>"']+)/gi
  enhanced = enhanced.replace(urlPattern, (url) => {
    // Skip if this URL is already in an anchor tag
    if (urlsInAnchors.has(url)) {
      return url
    }
    
    // Create a styled button for certificate links
    return `
      <div style="margin: 24px 0; text-align: center;">
        <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
          📄 Download Certificate
        </a>
      </div>
    `.trim()
  })
  
  return enhanced
}

/**
 * Wraps email content in a professional HTML template
 * 
 * @param content - The HTML content to wrap (can include <br> tags)
 * @returns Complete HTML email template with styling and footer
 */
export function createEmailTemplate(content: string): string {
  const sendoraUrl = getSendoraWebsiteUrl()
  
  // Enhance content with styled buttons for certificate links
  const enhancedContent = enhanceContentWithButtons(content)
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; line-height: 1.6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                ✨ Certificate Delivery
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <div style="color: #333333; font-size: 16px; line-height: 1.8;">
                ${enhancedContent}
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; border-top: 1px solid #e9ecef; text-align: center;">
              <p style="margin: 0 0 12px 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
                This email was sent via <strong style="color: #667eea;">Sendora</strong>
              </p>
              <p style="margin: 0; color: #6c757d; font-size: 14px;">
                <a href="${sendoraUrl}" style="color: #667eea; text-decoration: none; font-weight: 500;">Visit Sendora Website</a>
              </p>
              <p style="margin: 16px 0 0 0; color: #adb5bd; font-size: 12px; line-height: 1.6;">
                © ${new Date().getFullYear()} Sendora. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Converts plain text to HTML with proper formatting
 * Preserves line breaks and converts them to <br> tags
 * 
 * @param text - Plain text content
 * @returns HTML formatted content
 */
export function formatTextToHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>")
}

