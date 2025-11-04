export type CertificateMode = "upload" | "create"

export interface CertificateFieldPosition {
  x: number // Position in mm from left
  y: number // Position in mm from top
  fontSize: number
  fontFamily?: string // "helvetica" | "times" | "courier"
  fontWeight?: "normal" | "bold"
  fontStyle?: "normal" | "italic" | "bold" | "bolditalic"
  italic?: boolean // Legacy support - maps to fontStyle
  underline?: boolean
  color?: string
  align?: "left" | "center" | "right"
}

export interface CertificateLayout {
  orientation: "landscape" | "portrait"
  size: [number, number] // [width, height] in mm
}

export interface CertificateFields {
  certificateTitle?: CertificateFieldPosition // e.g., "Certificate of Appreciation" or "Certificate of Completion"
  awardMessage?: CertificateFieldPosition // e.g., "This certificate is awarded to"
  recipientName: CertificateFieldPosition
  subMessage?: CertificateFieldPosition // e.g., "for completion of..." or "in recognition of..."
  courseTitle?: CertificateFieldPosition
  date?: CertificateFieldPosition
  organization?: CertificateFieldPosition
  signaturePosition?: CertificateFieldPosition // Position/title below signature (e.g., "Manager", "President")
  certificateNumber?: CertificateFieldPosition
  customFields?: Array<{
    key: string
    position: CertificateFieldPosition
  }>
}

export interface CertificateStyles {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  borderColor?: string
  borderWidth?: number
}

export interface CertificateTemplate {
  id: string
  name: string
  description: string
  thumbnail?: string
  layout: CertificateLayout
  fields: CertificateFields
  styles: CertificateStyles
}

export interface CertificateFieldMapping {
  certificateTitle?: string // Excel column name for certificate title, or use default
  recipientName?: string // Excel column name
  awardMessage?: string // Excel column name for custom award message, or use default
  subMessage?: string // Excel column name for sub-message below name, or use default
  courseTitle?: string
  date?: string
  organization?: string // Excel column name, or use default organizationName
  signaturePosition?: string // Excel column name for position/title below signature (e.g., "Manager", "President")
  certificateNumber?: string
  customFields?: Array<{
    key: string
    columnName: string
  }>
}

export interface CustomTemplateImage {
  data: string // base64 image data
  name: string
  type: "image" | "pdf"
  width: number // in mm
  height: number // in mm
}

export interface CustomTemplateFieldPosition {
  x: number // X position in mm from left
  y: number // Y position in mm from top
  fontSize: number
  fontColor?: string
  fontFamily?: string // "helvetica" | "times" | "courier"
  fontWeight?: "normal" | "bold"
  fontStyle?: "normal" | "italic" | "bold" | "bolditalic"
  italic?: boolean // Legacy support - maps to fontStyle
  underline?: boolean
  align?: "left" | "center" | "right"
}

export interface CertificateLogo {
  data: string // base64 image data
  name: string
  width?: number // in mm (optional, will be scaled proportionally)
  height?: number // in mm (optional, will be scaled proportionally)
  x?: number // X position in mm (optional)
  y?: number // Y position in mm (optional)
}

export interface CertificateSignature {
  data: string // base64 image data
  name: string
  width?: number // in mm (optional, will be scaled proportionally)
  height?: number // in mm (optional, will be scaled proportionally)
  x?: number // X position in mm (optional)
  y?: number // Y position in mm (optional)
}

export interface CertificateFontSizes {
  certificateTitle?: number
  recipientName?: number
  awardMessage?: number
  subMessage?: number
  courseTitle?: number
  date?: number
  organization?: number
  signaturePosition?: number
  certificateNumber?: number
}

export interface CertificateConfig {
  templateId: string
  fieldMapping: CertificateFieldMapping
  customStyles?: Partial<CertificateStyles>
  organizationName?: string // Default issuer name
  defaultCertificateTitle?: string // Default certificate title (e.g., "Certificate of Appreciation")
  defaultAwardMessage?: string // Default award message (e.g., "This certificate is awarded to")
  defaultSubMessage?: string // Default sub-message (e.g., "for completion of the course")
  defaultSignaturePosition?: string // Default position below signature (e.g., "Manager")
  logo?: CertificateLogo
  signature?: CertificateSignature
  customFontSizes?: CertificateFontSizes // Override font sizes for each field
  customTemplate?: CustomTemplateImage
  customFieldPositions?: {
    recipientName?: CustomTemplateFieldPosition
    [key: string]: CustomTemplateFieldPosition | undefined
  }
}

