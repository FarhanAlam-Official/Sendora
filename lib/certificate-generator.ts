import { jsPDF } from "jspdf"
import type {
  CertificateTemplate,
  CertificateFieldMapping,
  CertificateConfig,
  CertificateStyles,
  CustomTemplateImage,
  CustomTemplateFieldPosition,
  CertificateLogo,
  CertificateSignature,
  CertificateFontSizes,
} from "@/types/certificate"
import type { PdfFile, FileRow } from "@/components/send-wizard-context"
import { getTemplate } from "@/components/certificate-templates"

/**
 * Convert hex color to RGB array
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [
        Number.parseInt(result[1], 16),
        Number.parseInt(result[2], 16),
        Number.parseInt(result[3], 16),
      ]
    : [0, 0, 0]
}

/**
 * Get field value from recipient row based on field mapping
 */
function getFieldValue(
  row: FileRow,
  fieldMapping: CertificateFieldMapping,
  fieldName: keyof CertificateFieldMapping,
): string {
  const columnName = fieldMapping[fieldName]
  // Type guard: ensure columnName is a string (not an array for customFields)
  if (!columnName || typeof columnName !== "string") return ""
  return row[columnName]?.toString() || ""
}

/**
 * Generate a single certificate PDF
 */
export function generateCertificate(
  template: CertificateTemplate,
  recipientData: FileRow,
  fieldMapping: CertificateFieldMapping,
  customStyles?: Partial<CertificateStyles>,
  organizationName?: string,
  defaultCertificateTitle?: string,
  defaultAwardMessage?: string,
  defaultSubMessage?: string,
  defaultSignaturePosition?: string,
  logo?: CertificateLogo,
  signature?: CertificateSignature,
  customFontSizes?: CertificateFontSizes,
): jsPDF {
  const { layout, fields, styles } = template
  const finalStyles = { ...styles, ...customStyles }

  // Create PDF document
  const doc = new jsPDF({
    orientation: layout.orientation,
    unit: "mm",
    format: layout.size,
  })

  const [width, height] = layout.size
  
  // Note: If PDFs open at 50% zoom, this is a PDF viewer setting, not an issue with the PDF.
  // The PDF content is correct - users can adjust zoom in their PDF viewer as needed.

  // Set background color
  doc.setFillColor(...hexToRgb(finalStyles.backgroundColor))
  doc.rect(0, 0, width, height, "F")

  // Draw border if configured
  if (finalStyles.borderColor && finalStyles.borderWidth) {
    doc.setDrawColor(...hexToRgb(finalStyles.borderColor))
    doc.setLineWidth(finalStyles.borderWidth)
    const borderOffset = finalStyles.borderWidth / 2
    doc.rect(
      borderOffset,
      borderOffset,
      width - finalStyles.borderWidth,
      height - finalStyles.borderWidth,
    )
  }

  // Draw decorative elements based on template
  if (template.id === "classic") {
    // Classic template: Add corner decorations
    doc.setDrawColor(...hexToRgb(finalStyles.borderColor || "#d4af37"))
    doc.setLineWidth(2)
    const cornerSize = 20
    // Top-left corner
    doc.line(10, 10, 10 + cornerSize, 10)
    doc.line(10, 10, 10, 10 + cornerSize)
    // Top-right corner
    doc.line(width - 10, 10, width - 10 - cornerSize, 10)
    doc.line(width - 10, 10, width - 10, 10 + cornerSize)
    // Bottom-left corner
    doc.line(10, height - 10, 10 + cornerSize, height - 10)
    doc.line(10, height - 10, 10, height - 10 - cornerSize)
    // Bottom-right corner
    doc.line(width - 10, height - 10, width - 10 - cornerSize, height - 10)
    doc.line(width - 10, height - 10, width - 10, height - 10 - cornerSize)
  } else if (template.id === "modern") {
    // Modern template: Add subtle top accent line
    doc.setDrawColor(...hexToRgb(finalStyles.primaryColor))
    doc.setLineWidth(4)
    doc.line(30, 30, width - 30, 30)
  } else if (template.id === "elegant") {
    // Elegant template: Add decorative border inset
    doc.setDrawColor(...hexToRgb(finalStyles.borderColor || "#d1d5db"))
    doc.setLineWidth(1)
    doc.rect(20, 20, width - 40, height - 40)
  }

  // Add logo if provided (before text rendering)
  if (logo) {
    try {
      const ext = logo.name.split(".").pop()?.toLowerCase() || "png"
      const mimeType = ext === "jpg" || ext === "jpeg" ? "JPEG" : "PNG"
      const logoWidth = logo.width || 40 // Default 40mm width
      const logoHeight = logo.height || 40 // Default 40mm height
      const logoX = logo.x ?? (width - logoWidth) / 2 // Center by default
      const logoY = logo.y ?? 20 // Top by default
      
      doc.addImage(
        `data:image/${ext};base64,${logo.data}`,
        mimeType,
        logoX,
        logoY,
        logoWidth,
        logoHeight,
      )
    } catch (error) {
      console.error("Failed to add logo:", error)
    }
  }

  // Set text color
  doc.setTextColor(...hexToRgb(finalStyles.primaryColor))

  // Render certificate title (optional, appears at the top)
  if (fields.certificateTitle) {
    const certTitle = getFieldValue(recipientData, fieldMapping, "certificateTitle") || defaultCertificateTitle || "CERTIFICATE"
    if (certTitle) {
      const titlePos = fields.certificateTitle
      const fontSize = customFontSizes?.certificateTitle ?? titlePos.fontSize
      doc.setFontSize(fontSize)
      doc.setFont("helvetica", titlePos.fontWeight || "bold")
      if (titlePos.color) {
        doc.setTextColor(...hexToRgb(titlePos.color))
      }
      doc.text(certTitle.toUpperCase(), titlePos.x, titlePos.y, {
        align: titlePos.align || "center",
        maxWidth: width - 60,
      })
      doc.setTextColor(...hexToRgb(finalStyles.primaryColor))
    }
  }

  // Render award message (optional, appears before recipient name)
  if (fields.awardMessage) {
    const awardMsg = getFieldValue(recipientData, fieldMapping, "awardMessage") || defaultAwardMessage || "This certificate is awarded to"
    if (awardMsg) {
      const awardPos = fields.awardMessage
      const fontSize = customFontSizes?.awardMessage ?? awardPos.fontSize
      doc.setFontSize(fontSize)
      doc.setFont("helvetica", awardPos.fontWeight || "normal")
      if (awardPos.color) {
        doc.setTextColor(...hexToRgb(awardPos.color))
      }
      doc.text(awardMsg, awardPos.x, awardPos.y, {
        align: awardPos.align || "center",
        maxWidth: width - 60,
      })
      doc.setTextColor(...hexToRgb(finalStyles.primaryColor))
    }
  }

  // Render recipient name (required field)
  if (fields.recipientName) {
    const name = getFieldValue(recipientData, fieldMapping, "recipientName") || "Recipient Name"
    const namePos = fields.recipientName
    const fontSize = customFontSizes?.recipientName ?? namePos.fontSize
    doc.setFontSize(fontSize)
    doc.setFont("helvetica", namePos.fontWeight || "normal")
    if (namePos.color) {
      doc.setTextColor(...hexToRgb(namePos.color))
    }
    const textAlign = namePos.align || "center"
    doc.text(name, namePos.x, namePos.y, {
      align: textAlign,
      maxWidth: width - 60,
    })
    doc.setTextColor(...hexToRgb(finalStyles.primaryColor)) // Reset color
  }

  // Render sub-message (optional, appears below recipient name)
  if (fields.subMessage) {
    const subMsg = getFieldValue(recipientData, fieldMapping, "subMessage") || defaultSubMessage || ""
    if (subMsg) {
      const subPos = fields.subMessage
      const fontSize = customFontSizes?.subMessage ?? subPos.fontSize
      doc.setFontSize(fontSize)
      doc.setFont("helvetica", subPos.fontWeight || "normal")
      if (subPos.color) {
        doc.setTextColor(...hexToRgb(subPos.color))
      }
      doc.text(subMsg, subPos.x, subPos.y, {
        align: subPos.align || "center",
        maxWidth: width - 60,
      })
      doc.setTextColor(...hexToRgb(finalStyles.primaryColor))
    }
  }

  // Render course title (optional)
  if (fields.courseTitle) {
    const courseTitle = getFieldValue(recipientData, fieldMapping, "courseTitle")
    if (courseTitle) {
      const coursePos = fields.courseTitle
      const fontSize = customFontSizes?.courseTitle ?? coursePos.fontSize
      doc.setFontSize(fontSize)
      doc.setFont("helvetica", coursePos.fontWeight || "normal")
      if (coursePos.color) {
        doc.setTextColor(...hexToRgb(coursePos.color))
      }
      doc.text(courseTitle, coursePos.x, coursePos.y, {
        align: coursePos.align || "center",
        maxWidth: width - 60,
      })
      doc.setTextColor(...hexToRgb(finalStyles.primaryColor))
    }
  }

  // Render date (optional)
  if (fields.date) {
    const date = getFieldValue(recipientData, fieldMapping, "date")
    if (date) {
      const datePos = fields.date
      const fontSize = customFontSizes?.date ?? datePos.fontSize
      doc.setFontSize(fontSize)
      doc.setFont("helvetica", datePos.fontWeight || "normal")
      if (datePos.color) {
        doc.setTextColor(...hexToRgb(datePos.color))
      }
      doc.text(`Date: ${date}`, datePos.x, datePos.y, {
        align: datePos.align || "center",
      })
      doc.setTextColor(...hexToRgb(finalStyles.primaryColor))
    }
  }

  // Render organization (optional, can use default)
  if (fields.organization) {
    const organization =
      getFieldValue(recipientData, fieldMapping, "organization") ||
      organizationName ||
      ""
    if (organization) {
      const orgPos = fields.organization
      const fontSize = customFontSizes?.organization ?? orgPos.fontSize
      doc.setFontSize(fontSize)
      doc.setFont("helvetica", orgPos.fontWeight || "normal")
      if (orgPos.color) {
        doc.setTextColor(...hexToRgb(orgPos.color))
      }
      doc.text(organization, orgPos.x, orgPos.y, {
        align: orgPos.align || "center",
        maxWidth: width - 60,
      })
      doc.setTextColor(...hexToRgb(finalStyles.primaryColor))
    }
  }

  // Add signature if provided (typically at bottom)
  if (signature) {
    try {
      const ext = signature.name.split(".").pop()?.toLowerCase() || "png"
      const mimeType = ext === "jpg" || ext === "jpeg" ? "JPEG" : "PNG"
      const sigWidth = signature.width || 40 // Default 40mm width
      const sigHeight = signature.height || 20 // Default 20mm height
      const sigX = signature.x ?? width - sigWidth - 30 // Right side by default
      const sigY = signature.y ?? height - sigHeight - 20 // Bottom by default
      
      doc.addImage(
        `data:image/${ext};base64,${signature.data}`,
        mimeType,
        sigX,
        sigY,
        sigWidth,
        sigHeight,
      )

      // Render signature position/title below signature (optional)
      if (fields.signaturePosition) {
        const sigPosition = getFieldValue(recipientData, fieldMapping, "signaturePosition") || defaultSignaturePosition || ""
        if (sigPosition) {
          const sigPosField = fields.signaturePosition
          const fontSize = customFontSizes?.signaturePosition ?? sigPosField.fontSize
          doc.setFontSize(fontSize)
          doc.setFont("helvetica", sigPosField.fontWeight || "normal")
          if (sigPosField.color) {
            doc.setTextColor(...hexToRgb(sigPosField.color))
          }
          // Position text below signature image
          const positionY = sigY + sigHeight + 5 // 5mm below signature
          doc.text(sigPosition, sigPosField.x ?? sigX + sigWidth / 2, positionY, {
            align: sigPosField.align || "center",
            maxWidth: sigWidth + 20,
          })
          doc.setTextColor(...hexToRgb(finalStyles.primaryColor))
        }
      }
    } catch (error) {
      console.error("Failed to add signature:", error)
    }
  } else if (fields.signaturePosition) {
    // Render signature position even without signature image (text only)
    const sigPosition = getFieldValue(recipientData, fieldMapping, "signaturePosition") || defaultSignaturePosition || ""
    if (sigPosition) {
      const sigPosField = fields.signaturePosition
      const fontSize = customFontSizes?.signaturePosition ?? sigPosField.fontSize
      doc.setFontSize(fontSize)
      doc.setFont("helvetica", sigPosField.fontWeight || "normal")
      if (sigPosField.color) {
        doc.setTextColor(...hexToRgb(sigPosField.color))
      }
      doc.text(sigPosition, sigPosField.x, sigPosField.y, {
        align: sigPosField.align || "center",
        maxWidth: width - 60,
      })
      doc.setTextColor(...hexToRgb(finalStyles.primaryColor))
    }
  }

  // Render certificate number (optional)
  if (fields.certificateNumber) {
    const certNumber = getFieldValue(recipientData, fieldMapping, "certificateNumber")
    if (certNumber) {
      const certNumPos = fields.certificateNumber
      const fontSize = customFontSizes?.certificateNumber ?? certNumPos.fontSize
      doc.setFontSize(fontSize)
      doc.setFont("helvetica", certNumPos.fontWeight || "normal")
      if (certNumPos.color) {
        doc.setTextColor(...hexToRgb(certNumPos.color))
      }
      doc.text(`Cert. No: ${certNumber}`, certNumPos.x, certNumPos.y, {
        align: certNumPos.align || "left",
      })
      doc.setTextColor(...hexToRgb(finalStyles.primaryColor))
    }
  }

  // Render custom fields
  if (fields.customFields && fieldMapping.customFields) {
    fields.customFields.forEach((customField, index) => {
      const mapping = fieldMapping.customFields?.find((cf) => cf.key === customField.key)
      if (mapping) {
        const value = recipientData[mapping.columnName]?.toString() || ""
        if (value) {
          const pos = customField.position
          doc.setFontSize(pos.fontSize)
          doc.setFont("helvetica", pos.fontWeight || "normal")
          if (pos.color) {
            doc.setTextColor(...hexToRgb(pos.color))
          }
          doc.text(value, pos.x, pos.y, {
            align: pos.align || "left",
            maxWidth: width - 60,
          })
          doc.setTextColor(...hexToRgb(finalStyles.primaryColor))
        }
      }
    })
  }

  return doc
}

/**
 * Generate certificates for multiple recipients
 */
export async function generateCertificateBatch(
  templateId: string,
  recipients: FileRow[],
  fieldMapping: CertificateFieldMapping,
  customStyles?: Partial<CertificateStyles>,
  organizationName?: string,
  defaultCertificateTitle?: string,
  defaultAwardMessage?: string,
  defaultSubMessage?: string,
  defaultSignaturePosition?: string,
  logo?: CertificateLogo,
  signature?: CertificateSignature,
  customFontSizes?: CertificateFontSizes,
): Promise<PdfFile[]> {
  const template = getTemplate(templateId)
  if (!template) {
    throw new Error(`Template not found: ${templateId}`)
  }

  // Validate required field mapping
  if (!fieldMapping.recipientName) {
    throw new Error("Recipient name field mapping is required")
  }

  const pdfFiles: PdfFile[] = []

  for (const recipient of recipients) {
    try {
      const doc = generateCertificate(
        template,
        recipient,
        fieldMapping,
        customStyles,
        organizationName,
        defaultCertificateTitle,
        defaultAwardMessage,
        defaultSubMessage,
        defaultSignaturePosition,
        logo,
        signature,
        customFontSizes,
      )

      // Convert PDF to base64
      const pdfBlob = doc.output("blob")
      const arrayBuffer = await pdfBlob.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)
      let binary = ""
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      const base64 = btoa(binary)

      // Generate filename from recipient name
      const recipientName = getFieldValue(recipient, fieldMapping, "recipientName") || "certificate"
      // Sanitize and limit length for filename (max 50 chars)
      const sanitizedName = recipientName
        .replace(/[^a-zA-Z0-9\s]/g, "_")
        .replace(/\s+/g, "_")
        .toLowerCase()
        .slice(0, 50)
        .replace(/_+$/, "") // Remove trailing underscores
      const filename = `${sanitizedName}_certificate.pdf`

      pdfFiles.push({
        name: filename,
        blob: base64,
        size: bytes.byteLength,
      })
    } catch (error) {
      console.error(`Failed to generate certificate for recipient:`, error)
      // Continue with other recipients even if one fails
    }
  }

  return pdfFiles
}

/**
 * Validate field mapping configuration
 */
export function validateFieldMapping(fieldMapping: CertificateFieldMapping): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!fieldMapping.recipientName) {
    errors.push("Recipient name field mapping is required")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get recipient name for matching (used for auto-matching generated certificates)
 */
export function getRecipientNameForMatching(
  recipient: FileRow,
  fieldMapping: CertificateFieldMapping,
): string {
  const name = getFieldValue(recipient, fieldMapping, "recipientName")
  return name.toLowerCase().replace(/\s+/g, "")
}

/**
 * Generate certificate from custom uploaded template (image/PDF)
 */
export async function generateCertificateFromCustomTemplate(
  customTemplate: CustomTemplateImage,
  recipientData: FileRow,
  fieldMapping: CertificateFieldMapping,
  fieldPositions?: { recipientName?: CustomTemplateFieldPosition },
): Promise<jsPDF> {
  const [width, height] = [customTemplate.width, customTemplate.height]

  // Create PDF document with custom dimensions
  // Note: jsPDF uses 0,0 as top-left corner with no default margins for custom formats
  const doc = new jsPDF({
    orientation: width > height ? "landscape" : "portrait",
    unit: "mm",
    format: [width, height],
    compress: true,
  })
  
  // Ensure we're using the exact dimensions without margins
  doc.setPage(1)
  
  // Note about 50% zoom: If PDFs open at 50% zoom, this is typically a PDF viewer setting
  // (browser or Adobe Reader default), not a problem with the PDF itself. The PDF content
  // is generated correctly - users can zoom in/out as needed. The viewer decides the initial
  // zoom based on page size vs window size. This is normal behavior and doesn't affect
  // print quality or PDF functionality.

  // Add the background image/PDF
  if (customTemplate.type === "image") {
    // Determine image format from extension
    const ext = customTemplate.name.split(".").pop()?.toLowerCase() || "png"
    const mimeType = ext === "jpg" || ext === "jpeg" ? "JPEG" : "PNG"
    
    // Add image as background
    doc.addImage(
      `data:image/${ext};base64,${customTemplate.data}`,
      mimeType,
      0,
      0,
      width,
      height,
    )
  } else {
    // For PDF, we'd need to extract the first page and add it as image
    // For now, we'll convert PDF to image on client side before upload
    throw new Error("PDF template support coming soon. Please export as PNG/JPG first.")
  }

  // Get recipient name
  const recipientName = getFieldValue(recipientData, fieldMapping, "recipientName") || "Recipient Name"

  // Add recipient name at specified position
  if (fieldPositions?.recipientName) {
    const pos = fieldPositions.recipientName
    doc.setFontSize(pos.fontSize)
    doc.setFont("helvetica", pos.fontWeight || "normal")
    
    if (pos.fontColor) {
      doc.setTextColor(...hexToRgb(pos.fontColor))
    } else {
      doc.setTextColor(...hexToRgb("#000000"))
    }

    // jsPDF text positioning:
    // - align "left": x is the left edge of text
    // - align "center": x is the center point of text
    // - align "right": x is the right edge of text
    // Note: No margins are added for custom format documents
    const align = pos.align || "center"
    
    // Calculate maxWidth to ensure text doesn't overflow
    let maxWidth: number
    if (align === "center") {
      // For center, calculate available space on both sides
      const leftSpace = pos.x
      const rightSpace = width - pos.x
      maxWidth = Math.min(leftSpace, rightSpace) * 2 - 10
    } else if (align === "left") {
      maxWidth = width - pos.x - 10
    } else {
      // right alignment
      maxWidth = pos.x - 10
    }
    
    doc.text(recipientName, pos.x, pos.y, {
      align: align,
      maxWidth: Math.max(maxWidth, 20), // Ensure minimum width
    })
  } else {
    // Default center position if not specified
    doc.setFontSize(32)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...hexToRgb("#000000"))
    doc.text(recipientName, width / 2, height / 2, {
      align: "center",
    })
  }

  return doc
}

/**
 * Generate certificates from custom template for multiple recipients
 */
export async function generateCertificatesFromCustomTemplateBatch(
  customTemplate: CustomTemplateImage,
  recipients: FileRow[],
  fieldMapping: CertificateFieldMapping,
  fieldPositions?: { recipientName?: CustomTemplateFieldPosition },
): Promise<PdfFile[]> {
  // Validate required field mapping
  if (!fieldMapping.recipientName) {
    throw new Error("Recipient name field mapping is required")
  }

  const pdfFiles: PdfFile[] = []

  for (const recipient of recipients) {
    try {
      const doc = await generateCertificateFromCustomTemplate(
        customTemplate,
        recipient,
        fieldMapping,
        fieldPositions,
      )

      // Convert PDF to base64
      const pdfBlob = doc.output("blob")
      const arrayBuffer = await pdfBlob.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)
      let binary = ""
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      const base64 = btoa(binary)

      // Generate filename from recipient name
      const recipientName = getFieldValue(recipient, fieldMapping, "recipientName") || "certificate"
      // Sanitize and limit length for filename (max 50 chars)
      const sanitizedName = recipientName
        .replace(/[^a-zA-Z0-9\s]/g, "_")
        .replace(/\s+/g, "_")
        .toLowerCase()
        .slice(0, 50)
        .replace(/_+$/, "") // Remove trailing underscores
      const filename = `${sanitizedName}_certificate.pdf`

      pdfFiles.push({
        name: filename,
        blob: base64,
        size: bytes.byteLength,
      })
    } catch (error) {
      console.error(`Failed to generate certificate for recipient:`, error)
      // Continue with other recipients even if one fails
    }
  }

  return pdfFiles
}

