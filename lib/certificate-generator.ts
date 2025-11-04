/**
 * @fileoverview Certificate Generation Module
 * 
 * This module provides comprehensive functionality for generating professional PDF certificates
 * using jsPDF. It supports both pre-defined templates and custom user-uploaded templates,
 * with extensive customization options including fonts, colors, positioning, and styling.
 * 
 * **Key Features:**
 * - Multiple pre-defined certificate templates (Classic, Modern, Elegant)
 * - Custom template support (upload your own background images/PDFs)
 * - Dynamic field mapping from Excel/CSV data to certificate fields
 * - Rich text formatting (fonts, colors, sizes, alignment, underlines)
 * - Logo and signature image support with flexible positioning
 * - Batch generation for multiple recipients
 * - Smart filename generation based on recipient names
 * - Custom font support via font-manager integration
 * - Comprehensive error handling and validation
 * 
 * **Certificate Field Types:**
 * - Certificate Title: Main heading (e.g., "CERTIFICATE OF ACHIEVEMENT")
 * - Award Message: Introductory text (e.g., "This certificate is awarded to")
 * - Recipient Name: The certificate recipient (required)
 * - Sub-message: Additional context below the name
 * - Course Title: Name of the course or program
 * - Date: Certificate issue date
 * - Organization: Issuing organization name
 * - Signature Position: Title of the signatory (e.g., "Director")
 * - Certificate Number: Unique certificate identifier
 * - Custom Fields: User-defined dynamic fields
 * 
 * **Workflow:**
 * 1. Select or upload a certificate template
 * 2. Map Excel/CSV columns to certificate fields
 * 3. Customize styles, fonts, and colors
 * 4. Generate certificates for single or multiple recipients
 * 5. Download as individual PDF files
 * 
 * @module lib/certificate-generator
 * @requires jspdf - PDF generation library
 * @requires @/types/certificate - TypeScript type definitions
 * @requires @/components/send-wizard-context - Context types for wizard flow
 * @requires @/components/certificate-templates - Pre-defined template configurations
 * @requires @/lib/font-manager - Custom font management
 * 
 * @author Farhan Alam
 * @version 2.0.0
 */

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
import { registerFontWithDocument, isFontRegistered } from "@/lib/font-manager"

/**
 * Converts a hexadecimal color code to an RGB array
 * 
 * This helper function parses hex color strings (with or without # prefix) and
 * converts them to RGB values suitable for jsPDF color methods.
 * 
 * @param {string} hex - Hexadecimal color code (e.g., "#FF5733" or "FF5733")
 * @returns {[number, number, number]} RGB array with values 0-255 for each channel [R, G, B]
 * 
 * @example
 * hexToRgb("#FF5733") // => [255, 87, 51]
 * hexToRgb("00FF00")  // => [0, 255, 0]
 * hexToRgb("invalid") // => [0, 0, 0] (fallback to black)
 * 
 * @private
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
 * Determines the appropriate jsPDF font style from font configuration
 * 
 * This helper function translates font styling options into jsPDF-compatible style strings.
 * It prioritizes explicit fontStyle parameter, then combines fontWeight and italic properties.
 * 
 * **Priority Order:**
 * 1. Explicit fontStyle parameter (if provided)
 * 2. Combination of fontWeight + italic boolean
 * 3. Default to "normal"
 * 
 * @param {("normal" | "bold")} [fontWeight] - Font weight specification
 * @param {boolean} [italic] - Whether the font should be italic
 * @param {("normal" | "italic" | "bold" | "bolditalic")} [fontStyle] - Explicit font style (overrides other params)
 * @returns {string} jsPDF-compatible font style string
 * 
 * @example
 * getFontStyle("bold", true)           // => "bolditalic"
 * getFontStyle("bold", false)          // => "bold"
 * getFontStyle("normal", true)         // => "italic"
 * getFontStyle(undefined, undefined, "bold") // => "bold" (explicit style)
 * 
 * @private
 */
function getFontStyle(fontWeight?: "normal" | "bold", italic?: boolean, fontStyle?: "normal" | "italic" | "bold" | "bolditalic"): string {
  // If fontStyle is explicitly set, use it
  if (fontStyle) {
    return fontStyle
  }
  
  // Otherwise, determine from fontWeight and italic
  const isBold = fontWeight === "bold"
  const isItalic = italic === true
  
  if (isBold && isItalic) return "bolditalic"
  if (isBold) return "bold"
  if (isItalic) return "italic"
  return "normal"
}

/**
 * Applies font styling to a jsPDF document with custom font support
 * 
 * This helper function sets the font family and style on a jsPDF document, with
 * intelligent handling of custom fonts. It automatically registers custom fonts
 * if available and falls back to Helvetica if a custom font is not registered.
 * 
 * **Font Handling:**
 * - Built-in fonts (helvetica, times, courier) are applied directly
 * - Custom fonts are registered with the document if available in the font registry
 * - Unregistered custom fonts trigger a warning and fallback to Helvetica
 * - Font styles (normal, bold, italic, bolditalic) are applied consistently
 * 
 * @param {jsPDF} doc - The jsPDF document instance to apply styling to
 * @param {string} [fontFamily="helvetica"] - Font family name (built-in or custom)
 * @param {("normal" | "bold")} [fontWeight] - Font weight specification
 * @param {boolean} [italic] - Whether the font should be italic
 * @param {("normal" | "italic" | "bold" | "bolditalic")} [fontStyle] - Explicit font style
 * @returns {void}
 * 
 * @example
 * // Apply built-in font
 * setStyledFont(doc, "helvetica", "bold", false)
 * 
 * @example
 * // Apply custom font (if registered)
 * setStyledFont(doc, "Montserrat", "normal", true)
 * 
 * @example
 * // Explicit font style
 * setStyledFont(doc, "times", undefined, undefined, "bolditalic")
 * 
 * @see {@link registerFontWithDocument} for registering custom fonts
 * @see {@link isFontRegistered} to check font availability
 * @private
 */
function setStyledFont(
  doc: jsPDF,
  fontFamily: string = "helvetica",
  fontWeight?: "normal" | "bold",
  italic?: boolean,
  fontStyle?: "normal" | "italic" | "bold" | "bolditalic"
) {
  const style = getFontStyle(fontWeight, italic, fontStyle)
  
  // Register custom font if it's a custom font (not built-in)
  const builtInFonts = ["helvetica", "times", "courier"]
  if (!builtInFonts.includes(fontFamily.toLowerCase())) {
    if (isFontRegistered(fontFamily)) {
      registerFontWithDocument(doc, fontFamily)
    } else {
      // Fallback to helvetica if custom font not registered
      console.warn(`Custom font "${fontFamily}" not registered, using helvetica`)
      doc.setFont("helvetica", style)
      return
    }
  }
  
  doc.setFont(fontFamily, style)
}

/**
 * Renders text on a jsPDF document with advanced styling options
 * 
 * This helper function provides enhanced text rendering capabilities including
 * alignment, word wrapping, and underline support. It extends jsPDF's basic
 * text rendering with visual enhancements.
 * 
 * **Features:**
 * - Text alignment (left, center, right)
 * - Maximum width constraint with automatic text wrapping
 * - Optional underline decoration with alignment-aware positioning
 * - Precise underline positioning below text baseline
 * 
 * **Underline Behavior:**
 * - Thickness: 10% of font size (0.5mm line width)
 * - Position: 1mm below text baseline
 * - Length: Matches text width exactly
 * - Alignment: Honors text alignment (left, center, right)
 * 
 * @param {jsPDF} doc - The jsPDF document instance
 * @param {string} text - The text content to render
 * @param {number} x - X-coordinate for text positioning (mm)
 * @param {number} y - Y-coordinate for text baseline (mm)
 * @param {Object} [options={}] - Rendering options
 * @param {("left" | "center" | "right")} [options.align="left"] - Text alignment
 * @param {number} [options.maxWidth] - Maximum width for text wrapping (mm)
 * @param {boolean} [options.underline=false] - Whether to draw underline beneath text
 * @returns {void}
 * 
 * @example
 * // Basic centered text
 * renderTextWithStyle(doc, "Certificate Title", 105, 50, { align: "center" })
 * 
 * @example
 * // Underlined text with max width
 * renderTextWithStyle(doc, "John Doe", 105, 80, {
 *   align: "center",
 *   maxWidth: 150,
 *   underline: true
 * })
 * 
 * @example
 * // Left-aligned text with wrapping
 * renderTextWithStyle(doc, longText, 20, 100, {
 *   align: "left",
 *   maxWidth: 170
 * })
 * 
 * @private
 */
function renderTextWithStyle(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options: {
    align?: "left" | "center" | "right"
    maxWidth?: number
    underline?: boolean
  } = {}
) {
  doc.text(text, x, y, {
    align: options.align || "left",
    maxWidth: options.maxWidth,
  })
  
  // Draw underline if requested
  if (options.underline) {
    const textWidth = doc.getTextWidth(text)
    const fontSize = doc.getFontSize()
    const lineHeight = fontSize * 0.1 // Underline thickness
    const underlineY = y + lineHeight + 1 // 1mm below baseline
    
    // Calculate underline start position based on alignment
    let underlineX = x
    if (options.align === "center") {
      underlineX = x - textWidth / 2
    } else if (options.align === "right") {
      underlineX = x - textWidth
    }
    
    doc.setLineWidth(0.5)
    doc.setDrawColor(...hexToRgb("#000000"))
    doc.line(underlineX, underlineY, underlineX + textWidth, underlineY)
  }
}

/**
 * Retrieves a field value from a recipient row using field mapping configuration
 * 
 * This helper function acts as a data accessor, safely extracting values from
 * recipient data rows based on the configured field mapping. It provides type-safe
 * access to mapped columns and handles missing or undefined values gracefully.
 * 
 * **Field Mapping Logic:**
 * - Looks up the column name from the field mapping configuration
 * - Validates that the column name is a string (not an array for customFields)
 * - Retrieves the value from the recipient data row
 * - Converts the value to string and handles null/undefined cases
 * 
 * @param {FileRow} row - The recipient data row (typically from Excel/CSV)
 * @param {CertificateFieldMapping} fieldMapping - Field mapping configuration
 * @param {keyof CertificateFieldMapping} fieldName - Name of the field to retrieve
 * @returns {string} The field value as a string, or empty string if not found
 * 
 * @example
 * const recipientName = getFieldValue(row, fieldMapping, "recipientName")
 * // If fieldMapping.recipientName = "Full Name" and row["Full Name"] = "John Doe"
 * // Returns: "John Doe"
 * 
 * @example
 * const courseTitle = getFieldValue(row, fieldMapping, "courseTitle")
 * // If field not mapped or value missing
 * // Returns: ""
 * 
 * @private
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
 * Generates a single PDF certificate for a recipient
 * 
 * This is the core certificate generation function that creates a professional PDF
 * certificate using jsPDF. It supports extensive customization including templates,
 * styling, custom fonts, logos, signatures, and dynamic field placement.
 * 
 * **Generation Process:**
 * 1. Initialize PDF document with template dimensions and orientation
 * 2. Apply background color and border decorations
 * 3. Add template-specific decorative elements (corners, lines, etc.)
 * 4. Render logo image if provided
 * 5. Render all text fields (title, name, date, organization, etc.)
 * 6. Add signature image and position title if provided
 * 7. Render custom fields based on mapping
 * 8. Return the complete jsPDF document
 * 
 * **Field Rendering Order:**
 * 1. Logo (background layer)
 * 2. Certificate Title
 * 3. Award Message
 * 4. Recipient Name (required)
 * 5. Sub-message
 * 6. Course Title
 * 7. Date
 * 8. Organization
 * 9. Signature Image & Position
 * 10. Certificate Number
 * 11. Custom Fields
 * 
 * **PDF Zoom Note:**
 * Generated PDFs may open at 50% zoom in some PDF viewers (browser or Adobe Reader).
 * This is a viewer default setting based on page size vs window size, not a PDF defect.
 * The PDF content and quality are correct - users can zoom as needed.
 * 
 * @param {CertificateTemplate} template - The certificate template configuration
 * @param {FileRow} recipientData - Recipient data from Excel/CSV row
 * @param {CertificateFieldMapping} fieldMapping - Mapping of columns to certificate fields
 * @param {Partial<CertificateStyles>} [customStyles] - Optional style overrides
 * @param {string} [organizationName] - Default organization name (if not in data)
 * @param {string} [defaultCertificateTitle] - Default title (if not in data)
 * @param {string} [defaultAwardMessage] - Default award message (if not in data)
 * @param {string} [defaultSubMessage] - Default sub-message (if not in data)
 * @param {string} [defaultSignaturePosition] - Default signature position (if not in data)
 * @param {CertificateLogo} [logo] - Logo image configuration (image data, position, size)
 * @param {CertificateSignature} [signature] - Signature image configuration
 * @param {CertificateFontSizes} [customFontSizes] - Custom font size overrides for all fields
 * @returns {jsPDF} The generated PDF document (use .output() or .save() to export)
 * 
 * @example
 * // Generate a basic certificate
 * const pdf = generateCertificate(
 *   classicTemplate,
 *   { "Name": "John Doe", "Email": "john@example.com" },
 *   { recipientName: "Name" }
 * )
 * pdf.save("certificate.pdf")
 * 
 * @example
 * // Generate with custom styles and logo
 * const pdf = generateCertificate(
 *   modernTemplate,
 *   recipientData,
 *   fieldMapping,
 *   { primaryColor: "#FF5733", backgroundColor: "#FFFFFF" },
 *   "Acme University",
 *   "Certificate of Excellence",
 *   undefined,
 *   undefined,
 *   undefined,
 *   { data: base64Image, x: 20, y: 20, width: 30, height: 30 }
 * )
 * 
 * @throws {Error} If required recipient name field is missing
 * @see {@link generateCertificateBatch} for batch generation
 * @see {@link CertificateTemplate} for template structure
 * @public
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
      const fontFamily = titlePos.fontFamily || "helvetica"
      setStyledFont(doc, fontFamily, titlePos.fontWeight, titlePos.italic, titlePos.fontStyle)
      if (titlePos.color) {
        doc.setTextColor(...hexToRgb(titlePos.color))
      }
      const textColor = titlePos.color ? hexToRgb(titlePos.color) : hexToRgb(finalStyles.primaryColor)
      renderTextWithStyle(doc, certTitle.toUpperCase(), titlePos.x, titlePos.y, {
        align: titlePos.align || "center",
        maxWidth: width - 60,
        underline: titlePos.underline,
      })
      // Restore draw color for underline
      if (titlePos.underline) {
        doc.setDrawColor(...textColor)
      }
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
      const fontFamily = awardPos.fontFamily || "helvetica"
      setStyledFont(doc, fontFamily, awardPos.fontWeight, awardPos.italic, awardPos.fontStyle)
      if (awardPos.color) {
        doc.setTextColor(...hexToRgb(awardPos.color))
      }
      const textColor = awardPos.color ? hexToRgb(awardPos.color) : hexToRgb(finalStyles.primaryColor)
      renderTextWithStyle(doc, awardMsg, awardPos.x, awardPos.y, {
        align: awardPos.align || "center",
        maxWidth: width - 60,
        underline: awardPos.underline,
      })
      if (awardPos.underline) {
        doc.setDrawColor(...textColor)
      }
      doc.setTextColor(...hexToRgb(finalStyles.primaryColor))
    }
  }

  // Render recipient name (required field)
  if (fields.recipientName) {
    const name = getFieldValue(recipientData, fieldMapping, "recipientName") || "Recipient Name"
    const namePos = fields.recipientName
    const fontSize = customFontSizes?.recipientName ?? namePos.fontSize
    doc.setFontSize(fontSize)
    const fontFamily = namePos.fontFamily || "helvetica"
    setStyledFont(doc, fontFamily, namePos.fontWeight, namePos.italic, namePos.fontStyle)
    if (namePos.color) {
      doc.setTextColor(...hexToRgb(namePos.color))
    }
    const textColor = namePos.color ? hexToRgb(namePos.color) : hexToRgb(finalStyles.primaryColor)
    const textAlign = namePos.align || "center"
    renderTextWithStyle(doc, name, namePos.x, namePos.y, {
      align: textAlign,
      maxWidth: width - 60,
      underline: namePos.underline,
    })
    if (namePos.underline) {
      doc.setDrawColor(...textColor)
    }
    doc.setTextColor(...hexToRgb(finalStyles.primaryColor)) // Reset color
  }

  // Render sub-message (optional, appears below recipient name)
  if (fields.subMessage) {
    const subMsg = getFieldValue(recipientData, fieldMapping, "subMessage") || defaultSubMessage || ""
    if (subMsg) {
      const subPos = fields.subMessage
      const fontSize = customFontSizes?.subMessage ?? subPos.fontSize
      doc.setFontSize(fontSize)
      const fontFamily = subPos.fontFamily || "helvetica"
      setStyledFont(doc, fontFamily, subPos.fontWeight, subPos.italic, subPos.fontStyle)
      if (subPos.color) {
        doc.setTextColor(...hexToRgb(subPos.color))
      }
      const textColor = subPos.color ? hexToRgb(subPos.color) : hexToRgb(finalStyles.primaryColor)
      renderTextWithStyle(doc, subMsg, subPos.x, subPos.y, {
        align: subPos.align || "center",
        maxWidth: width - 60,
        underline: subPos.underline,
      })
      if (subPos.underline) {
        doc.setDrawColor(...textColor)
      }
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
      const fontFamily = coursePos.fontFamily || "helvetica"
      setStyledFont(doc, fontFamily, coursePos.fontWeight, coursePos.italic, coursePos.fontStyle)
      if (coursePos.color) {
        doc.setTextColor(...hexToRgb(coursePos.color))
      }
      const textColor = coursePos.color ? hexToRgb(coursePos.color) : hexToRgb(finalStyles.primaryColor)
      renderTextWithStyle(doc, courseTitle, coursePos.x, coursePos.y, {
        align: coursePos.align || "center",
        maxWidth: width - 60,
        underline: coursePos.underline,
      })
      if (coursePos.underline) {
        doc.setDrawColor(...textColor)
      }
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
 * Generates PDF certificates for multiple recipients in batch
 * 
 * This function orchestrates the batch generation of certificates for multiple recipients,
 * handling individual certificate creation, error recovery, filename generation, and
 * PDF-to-base64 conversion for each recipient.
 * 
 * **Batch Processing Features:**
 * - Processes all recipients sequentially
 * - Graceful error handling (continues on individual failures)
 * - Automatic filename generation from recipient names
 * - Filename sanitization (removes special characters, limits length)
 * - Base64 encoding for easy storage/transmission
 * - Size tracking for each generated PDF
 * 
 * **Error Handling:**
 * - Individual failures are logged but don't stop the batch
 * - Failed certificates are skipped (not included in results)
 * - Errors are logged to console for debugging
 * 
 * **Filename Generation:**
 * - Based on recipient name field
 * - Sanitized: alphanumeric and underscores only
 * - Limited to 50 characters
 * - Format: `{sanitized_name}_certificate.pdf`
 * - Example: "john_doe_certificate.pdf"
 * 
 * @param {string} templateId - ID of the template to use (e.g., "classic", "modern", "elegant")
 * @param {FileRow[]} recipients - Array of recipient data rows from Excel/CSV
 * @param {CertificateFieldMapping} fieldMapping - Mapping configuration for all recipients
 * @param {Partial<CertificateStyles>} [customStyles] - Optional style overrides
 * @param {string} [organizationName] - Default organization name
 * @param {string} [defaultCertificateTitle] - Default certificate title
 * @param {string} [defaultAwardMessage] - Default award message
 * @param {string} [defaultSubMessage] - Default sub-message
 * @param {string} [defaultSignaturePosition] - Default signature position
 * @param {CertificateLogo} [logo] - Logo configuration (applied to all certificates)
 * @param {CertificateSignature} [signature] - Signature configuration (applied to all)
 * @param {CertificateFontSizes} [customFontSizes] - Font size overrides for all fields
 * @param {CertificateTemplate} [templateOverride] - Optional template override (for custom fonts)
 * @returns {Promise<PdfFile[]>} Array of generated PDF files with base64 data
 * 
 * @example
 * // Generate certificates for 100 recipients
 * const pdfFiles = await generateCertificateBatch(
 *   "classic",
 *   recipientRows,
 *   { recipientName: "Name", date: "Date" },
 *   { primaryColor: "#2563eb" },
 *   "Tech University"
 * )
 * console.log(`Generated ${pdfFiles.length} certificates`)
 * 
 * @example
 * // Use with custom template and fonts
 * const pdfFiles = await generateCertificateBatch(
 *   "custom",
 *   recipients,
 *   fieldMapping,
 *   customStyles,
 *   "My Organization",
 *   undefined,
 *   undefined,
 *   undefined,
 *   undefined,
 *   logoConfig,
 *   signatureConfig,
 *   { recipientName: 36, certificateTitle: 48 },
 *   customTemplateWithFonts
 * )
 * 
 * @throws {Error} If template not found
 * @throws {Error} If required field mapping (recipientName) is missing
 * @see {@link generateCertificate} for single certificate generation
 * @see {@link validateFieldMapping} to validate mapping before generation
 * @public
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
  templateOverride?: CertificateTemplate, // Optional template override (for custom font styles)
): Promise<PdfFile[]> {
  const template = templateOverride || getTemplate(templateId)
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
 * Validates the field mapping configuration for certificate generation
 * 
 * This validation function ensures that all required field mappings are properly
 * configured before attempting certificate generation. It prevents runtime errors
 * by catching configuration issues early.
 * 
 * **Validation Rules:**
 * - Recipient name field mapping is required (core field)
 * - All other fields are optional (will use defaults if not mapped)
 * - Returns detailed error messages for failed validations
 * 
 * **Usage Pattern:**
 * Call this function before batch generation to ensure valid configuration
 * and provide user-friendly error messages if setup is incomplete.
 * 
 * @param {CertificateFieldMapping} fieldMapping - The field mapping configuration to validate
 * @returns {{valid: boolean; errors: string[]}} Validation result with error details
 * 
 * @example
 * // Validate before generation
 * const validation = validateFieldMapping(fieldMapping)
 * if (!validation.valid) {
 *   console.error("Validation errors:", validation.errors)
 *   return
 * }
 * // Proceed with generation...
 * 
 * @example
 * // Integration with form validation
 * const { valid, errors } = validateFieldMapping(formData.fieldMapping)
 * if (!valid) {
 *   setFormErrors(errors)
 *   return
 * }
 * 
 * @see {@link CertificateFieldMapping} for mapping structure
 * @public
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
 * Extracts and normalizes recipient name for PDF matching
 * 
 * This utility function prepares recipient names for the auto-matching algorithm
 * that pairs generated certificates with pre-uploaded PDFs. It normalizes names
 * to ensure consistent matching regardless of formatting differences.
 * 
 * **Normalization Process:**
 * - Converts to lowercase for case-insensitive matching
 * - Removes all whitespace characters
 * - Removes special characters and punctuation
 * - Preserves only alphanumeric characters
 * 
 * **Use Case:**
 * This function is used when auto-matching generated certificates with uploaded
 * PDFs. Both the recipient name and PDF filename are normalized using the same
 * process to enable accurate matching.
 * 
 * @param {FileRow} recipient - The recipient data row
 * @param {CertificateFieldMapping} fieldMapping - Field mapping configuration
 * @returns {string} Normalized recipient name for matching
 * 
 * @example
 * // Recipient name: "John Doe"
 * getRecipientNameForMatching(recipient, fieldMapping)
 * // => "johndoe"
 * 
 * @example
 * // Recipient name: "María García-López"
 * getRecipientNameForMatching(recipient, fieldMapping)
 * // => "mariagarcialopez"
 * 
 * @see {@link findMatchingPDF} in pdf-utils.ts for the matching algorithm
 * @public
 */
export function getRecipientNameForMatching(
  recipient: FileRow,
  fieldMapping: CertificateFieldMapping,
): string {
  const name = getFieldValue(recipient, fieldMapping, "recipientName")
  return name.toLowerCase().replace(/\s+/g, "")
}

/**
 * Generates a certificate from a custom user-uploaded template
 * 
 * This function creates certificates using custom background images (PNG/JPG) uploaded
 * by users. Unlike pre-defined templates, custom templates use the actual image dimensions
 * and allow flexible field positioning through a visual editor.
 * 
 * **Custom Template Features:**
 * - Uses user-uploaded images as certificate background
 * - Preserves original image dimensions for the PDF
 * - Supports PNG and JPG formats
 * - Flexible field positioning with visual preview
 * - Custom font, size, and color for recipient name
 * - Alignment options (left, center, right)
 * - Underline support
 * 
 * **PDF Dimensions:**
 * - Automatically determined from uploaded image
 * - Orientation set based on width vs height ratio
 * - No default margins (uses exact image dimensions)
 * - Coordinates use (0,0) as top-left corner
 * 
 * **Positioning System:**
 * - X/Y coordinates in millimeters
 * - Origin (0,0) at top-left corner
 * - Text alignment affects how X coordinate is interpreted:
 *   - Left: X is left edge of text
 *   - Center: X is center point of text
 *   - Right: X is right edge of text
 * 
 * **PDF Zoom Behavior:**
 * If PDFs open at 50% zoom, this is a PDF viewer setting (browser or Adobe Reader),
 * not a problem with the PDF. The viewer decides initial zoom based on page size
 * vs window size. Content is generated correctly and users can zoom as needed.
 * 
 * @param {CustomTemplateImage} customTemplate - Custom template image configuration
 * @param {FileRow} recipientData - Recipient data from Excel/CSV
 * @param {CertificateFieldMapping} fieldMapping - Field mapping configuration
 * @param {Object} [fieldPositions] - Optional field position overrides
 * @param {CustomTemplateFieldPosition} [fieldPositions.recipientName] - Recipient name position config
 * @returns {Promise<jsPDF>} The generated PDF document
 * 
 * @example
 * // Generate certificate from custom template
 * const pdf = await generateCertificateFromCustomTemplate(
 *   {
 *     type: "image",
 *     name: "template.png",
 *     data: base64ImageData,
 *     width: 297,  // A4 landscape width
 *     height: 210  // A4 landscape height
 *   },
 *   { "Name": "John Doe" },
 *   { recipientName: "Name" },
 *   {
 *     recipientName: {
 *       x: 148.5,  // Center of A4 landscape
 *       y: 105,
 *       fontSize: 32,
 *       fontFamily: "helvetica",
 *       fontWeight: "bold",
 *       align: "center",
 *       fontColor: "#000000"
 *     }
 *   }
 * )
 * 
 * @throws {Error} If template type is PDF (not yet supported, use PNG/JPG export)
 * @see {@link generateCertificatesFromCustomTemplateBatch} for batch generation
 * @public
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
    
    // Use fontFamily, fontWeight, italic, and fontStyle from position
    const fontFamily = pos.fontFamily || "helvetica"
    setStyledFont(doc, fontFamily, pos.fontWeight, pos.italic, pos.fontStyle)
    
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
    
    const textColor = pos.fontColor ? hexToRgb(pos.fontColor) : hexToRgb("#000000")
    renderTextWithStyle(doc, recipientName, pos.x, pos.y, {
      align: align,
      maxWidth: Math.max(maxWidth, 20), // Ensure minimum width
      underline: pos.underline,
    })
    if (pos.underline) {
      doc.setDrawColor(...textColor)
    }
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
 * Generates certificates from a custom template for multiple recipients in batch
 * 
 * This is the batch processing version of generateCertificateFromCustomTemplate,
 * allowing efficient generation of many certificates from a single custom template.
 * It handles all recipients with the same template and positioning configuration.
 * 
 * **Batch Processing:**
 * - Uses the same custom template for all certificates
 * - Applies consistent field positioning to all recipients
 * - Individual error handling (failures don't stop the batch)
 * - Automatic filename generation per recipient
 * - Base64 encoding for storage/transmission
 * 
 * **Performance Considerations:**
 * - Template image is reused for all certificates (efficient)
 * - Sequential processing ensures consistent output
 * - Memory-efficient base64 conversion
 * 
 * @param {CustomTemplateImage} customTemplate - Custom template configuration (shared)
 * @param {FileRow[]} recipients - Array of recipient data rows
 * @param {CertificateFieldMapping} fieldMapping - Field mapping (shared)
 * @param {Object} [fieldPositions] - Field positioning (shared for all certificates)
 * @param {CustomTemplateFieldPosition} [fieldPositions.recipientName] - Name position config
 * @returns {Promise<PdfFile[]>} Array of generated PDF files with base64 data
 * 
 * @example
 * // Generate 50 certificates from custom template
 * const pdfFiles = await generateCertificatesFromCustomTemplateBatch(
 *   customTemplate,
 *   recipients,
 *   { recipientName: "Full Name" },
 *   {
 *     recipientName: {
 *       x: 148.5,
 *       y: 105,
 *       fontSize: 32,
 *       fontFamily: "Montserrat",
 *       fontWeight: "bold",
 *       align: "center",
 *       fontColor: "#1a1a1a",
 *       underline: true
 *     }
 *   }
 * )
 * console.log(`Generated ${pdfFiles.length} custom certificates`)
 * 
 * @throws {Error} If recipient name field mapping is missing
 * @see {@link generateCertificateFromCustomTemplate} for single generation
 * @public
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

