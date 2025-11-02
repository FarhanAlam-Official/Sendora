export type CertificateMode = "upload" | "create"

export interface CertificateFieldPosition {
  x: number // Position in mm from left
  y: number // Position in mm from top
  fontSize: number
  fontFamily?: string
  fontWeight?: "normal" | "bold"
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
  recipientName?: string // Excel column name
  awardMessage?: string // Excel column name for custom award message, or use default
  courseTitle?: string
  date?: string
  organization?: string // Excel column name, or use default organizationName
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
  fontFamily?: string
  fontWeight?: "normal" | "bold"
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
  recipientName?: number
  awardMessage?: number
  courseTitle?: number
  date?: number
  organization?: number
  certificateNumber?: number
}

export interface CertificateConfig {
  templateId: string
  fieldMapping: CertificateFieldMapping
  customStyles?: Partial<CertificateStyles>
  organizationName?: string // Default issuer name
  defaultAwardMessage?: string // Default award message (e.g., "This certificate is awarded to")
  logo?: CertificateLogo
  signature?: CertificateSignature
  customFontSizes?: CertificateFontSizes // Override font sizes for each field
  customTemplate?: CustomTemplateImage
  customFieldPositions?: {
    recipientName?: CustomTemplateFieldPosition
    [key: string]: CustomTemplateFieldPosition | undefined
  }
}

