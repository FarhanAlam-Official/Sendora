"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CERTIFICATE_TEMPLATES, getTemplate } from "./certificate-templates"
import {
  generateCertificate,
  generateCertificateBatch,
  validateFieldMapping,
  generateCertificateFromCustomTemplate,
  generateCertificatesFromCustomTemplateBatch,
} from "@/lib/certificate-generator"
import type { 
  CertificateFieldMapping, 
  CustomTemplateImage, 
  CustomTemplateFieldPosition,
  CertificateLogo,
  CertificateSignature,
  CertificateFontSizes,
  CertificateStyles,
} from "@/types/certificate"
import { fileToBase64 } from "@/lib/pdf-utils"
import JSZip from "jszip"
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Sparkles,
  Palette,
  Settings,
  Paintbrush,
  X,
  FileUp,
  Download,
  ImageIcon,
  PenTool,
  Info,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import * as XLSX from "xlsx"
import { notifications } from "@/lib/notifications"

interface FileRow {
  [key: string]: string
}

export default function CertificateGeneratorStandalone() {
  const [file, setFile] = useState<File | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<FileRow[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>(CERTIFICATE_TEMPLATES[0].id)
  const [fieldMapping, setFieldMapping] = useState<CertificateFieldMapping>({})
  const [organizationName, setOrganizationName] = useState<string>("")
  const [generating, setGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [error, setError] = useState<string>("")
  const [previewPdf, setPreviewPdf] = useState<string | null>(null)
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showCustomization, setShowCustomization] = useState(false)
  const [customStyles, setCustomStyles] = useState<Partial<CertificateStyles>>({})
  const [useCustomTemplate, setUseCustomTemplate] = useState(false)
  const [customTemplateFile, setCustomTemplateFile] = useState<File | null>(null)
  const [customTemplatePreview, setCustomTemplatePreview] = useState<string | null>(null)
  const [namePosition, setNamePosition] = useState({
    x: 148.5,
    y: 100,
    fontSize: 32,
    fontColor: "#000000",
    fontWeight: "bold" as "normal" | "bold",
    align: "center" as "left" | "center" | "right",
  })
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [xOffset, setXOffset] = useState(0)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [signatureFile, setSignatureFile] = useState<File | null>(null)
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null)
  const [defaultCertificateTitle, setDefaultCertificateTitle] = useState<string>("Certificate of Appreciation")
  const [defaultAwardMessage, setDefaultAwardMessage] = useState<string>("This certificate is awarded to")
  const [defaultSubMessage, setDefaultSubMessage] = useState<string>("for completion of the course")
  const [defaultSignaturePosition, setDefaultSignaturePosition] = useState<string>("Manager")
  const [customFontSizes, setCustomFontSizes] = useState<CertificateFontSizes>({})
  const [generatedCertificates, setGeneratedCertificates] = useState<Array<{ name: string; blob: string }>>([])
  const [skippedRows, setSkippedRows] = useState<Set<number>>(new Set())

  // Skip/unskip functions
  const skipRow = (index: number) => {
    setSkippedRows((prev) => {
      const newSet = new Set(prev)
      newSet.add(index)
      return newSet
    })
  }

  const unskipRow = (index: number) => {
    setSkippedRows((prev) => {
      const newSet = new Set(prev)
      newSet.delete(index)
      return newSet
    })
  }

  // Handle file upload
  const handleFileUpload = (uploadedFile: File) => {
    try {
      if (!uploadedFile.name.match(/\.(xlsx|csv|xls)$/)) {
        const errorMsg = "Please upload a valid Excel or CSV file"
        setError(errorMsg)
        notifications.showError({
          title: 'Invalid file type',
          description: errorMsg,
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const data = e.target?.result
        if (!data) return

        try {
          let workbook: XLSX.WorkBook
          if (uploadedFile.name.endsWith(".csv")) {
            const text = data as string
            workbook = XLSX.read(text, { type: "string" })
          } else {
            workbook = XLSX.read(data, { type: "array" })
          }

          const worksheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as FileRow[]

          if (jsonData.length === 0) {
            const errorMsg = "File appears to be empty"
            setError(errorMsg)
            notifications.showError({
              title: 'Empty file',
              description: errorMsg,
            })
            return
          }

          const headersRow = Object.keys(jsonData[0])
          if (headersRow.length === 0) {
            const errorMsg = "Could not detect headers. Please ensure your Excel file has a header row."
            setError(errorMsg)
            notifications.showError({
              title: 'Invalid file format',
              description: errorMsg,
            })
            return
          }

          setHeaders(headersRow)
          setRows(jsonData)
          setFile(uploadedFile)
          setSkippedRows(new Set()) // Reset skipped rows when new file is uploaded
          
          notifications.showSuccess({
            title: 'File uploaded successfully!',
            description: `Loaded ${jsonData.length} recipients from ${uploadedFile.name}`,
          })

          // Auto-detect recipient name field
          const nameFields = headersRow.filter((h) => 
            h.toLowerCase().includes("name") || 
            h.toLowerCase().includes("recipient") ||
            h.toLowerCase().includes("participant")
          )
          if (nameFields.length > 0 && !fieldMapping.recipientName) {
            setFieldMapping((prev) => ({
              ...prev,
              recipientName: nameFields[0],
            }))
          }

          setError("")
        } catch (parseError) {
          const errorMsg = "Failed to parse file. Please check the format."
          setError(errorMsg)
          notifications.showError({
            title: 'File parsing error',
            description: errorMsg,
          })
          console.error(parseError)
        }
      }

      reader.onerror = () => {
        const errorMsg = "Failed to read file"
        setError(errorMsg)
        notifications.showError({
          title: 'File read error',
          description: errorMsg,
        })
      }

      if (uploadedFile.name.endsWith(".csv")) {
        reader.readAsText(uploadedFile)
      } else {
        reader.readAsArrayBuffer(uploadedFile)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to parse file"
      setError(errorMsg)
      notifications.showError({
        title: 'File upload error',
        description: errorMsg,
      })
    }
  }

  // Get active (non-skipped) rows
  const activeRows = rows.filter((_, idx) => !skippedRows.has(idx))
  
  // Get first active row index for preview
  const firstActiveRowIndex = rows.findIndex((_, idx) => !skippedRows.has(idx))
  
  // Get sample row for preview
  const getSampleRow = (): FileRow => {
    const sample: FileRow = {}
    // Always ensure recipient name is populated for preview, even if mapping isn't set yet
    if (fieldMapping.recipientName) {
      sample[fieldMapping.recipientName] = "John Doe"
    }
    if (fieldMapping.certificateTitle) {
      sample[fieldMapping.certificateTitle] = defaultCertificateTitle || "Certificate of Appreciation"
    }
    if (fieldMapping.awardMessage) {
      sample[fieldMapping.awardMessage] = defaultAwardMessage || "This certificate is awarded to"
    }
    if (fieldMapping.subMessage) {
      sample[fieldMapping.subMessage] = defaultSubMessage || "for completion of the course"
    }
    if (fieldMapping.courseTitle) {
      sample[fieldMapping.courseTitle] = "Advanced Web Development"
    }
    if (fieldMapping.date) {
      sample[fieldMapping.date] = new Date().toLocaleDateString()
    }
    if (fieldMapping.organization) {
      sample[fieldMapping.organization] = organizationName || "ABC Academy"
    }
    if (fieldMapping.signaturePosition) {
      sample[fieldMapping.signaturePosition] = defaultSignaturePosition || "Manager"
    }
    return sample
  }

  // Get current template styles
  const getCurrentStyles = (): CertificateStyles => {
    const template = getTemplate(selectedTemplate)
    if (!template) {
      return {
        primaryColor: "#000000",
        secondaryColor: "#666666",
        backgroundColor: "#ffffff",
      }
    }
    return {
      ...template.styles,
      ...customStyles,
    }
  }

  // Handle custom template upload
  const handleCustomTemplateUpload = async (file: File) => {
    const fileName = file.name.toLowerCase()
    const validExtensions = [".png", ".jpg", ".jpeg"]
    const hasValidExtension = validExtensions.some((ext) => fileName.endsWith(ext))
    const validMimeTypes = ["image/png", "image/jpeg", "image/jpg"]
    const hasValidMimeType = validMimeTypes.includes(file.type.toLowerCase())

    if (!hasValidExtension && !hasValidMimeType) {
      const errorMsg = "Please upload a PNG or JPG image file. Supported formats: .png, .jpg, .jpeg"
      setError(errorMsg)
      notifications.showError({
        title: 'Invalid image format',
        description: errorMsg,
      })
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      const errorMsg = `File size too large. Maximum size is 10MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`
      setError(errorMsg)
      notifications.showError({
        title: 'File too large',
        description: errorMsg,
      })
      return
    }

    try {
      const preview = URL.createObjectURL(file)
      
      // Load image to get dimensions
      const img = new Image()
      img.src = preview
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })
          resolve(null)
        }
        img.onerror = reject
      })
      
      setCustomTemplatePreview(preview)
      setCustomTemplateFile(file)
      setError("")
      notifications.showSuccess({
        title: 'Template uploaded successfully!',
        description: 'You can now position the name field on your template.',
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load image"
      setError(errorMsg)
      notifications.showError({
        title: 'Image load error',
        description: errorMsg,
      })
    }
  }

  // Handle logo upload
  const handleLogoUpload = async (file: File) => {
    const fileName = file.name.toLowerCase()
    const validExtensions = [".png", ".jpg", ".jpeg"]
    const hasValidExtension = validExtensions.some((ext) => fileName.endsWith(ext))

    if (!hasValidExtension) {
      const errorMsg = "Please upload a PNG or JPG image file for logo"
      setError(errorMsg)
      notifications.showError({
        title: 'Invalid logo format',
        description: errorMsg,
      })
      return
    }

    try {
      const preview = URL.createObjectURL(file)
      setLogoPreview(preview)
      setLogoFile(file)
      setError("")
      notifications.showSuccess({
        title: 'Logo uploaded!',
        description: 'Logo will be added to certificates.',
      })
    } catch (err) {
      const errorMsg = "Failed to load logo"
      setError(errorMsg)
      notifications.showError({
        title: 'Logo upload error',
        description: errorMsg,
      })
    }
  }

  // Handle signature upload
  const handleSignatureUpload = async (file: File) => {
    const fileName = file.name.toLowerCase()
    const validExtensions = [".png", ".jpg", ".jpeg"]
    const hasValidExtension = validExtensions.some((ext) => fileName.endsWith(ext))

    if (!hasValidExtension) {
      const errorMsg = "Please upload a PNG or JPG image file for signature"
      setError(errorMsg)
      notifications.showError({
        title: 'Invalid signature format',
        description: errorMsg,
      })
      return
    }

    try {
      const preview = URL.createObjectURL(file)
      setSignaturePreview(preview)
      setSignatureFile(file)
      setError("")
      notifications.showSuccess({
        title: 'Signature uploaded!',
        description: 'Signature will be added to certificates.',
      })
    } catch (err) {
      const errorMsg = "Failed to load signature"
      setError(errorMsg)
      notifications.showError({
        title: 'Signature upload error',
        description: errorMsg,
      })
    }
  }

  // Get preview row (first active or sample)
  const previewRow = firstActiveRowIndex >= 0 && rows[firstActiveRowIndex] 
    ? rows[firstActiveRowIndex] 
    : getSampleRow()

  // Generate preview
  const generatePreview = async () => {
    if (!previewRow) {
      const errorMsg = "Unable to generate preview. Please ensure field mapping is set up correctly."
      setError(errorMsg)
      notifications.showError({
        title: 'Preview error',
        description: errorMsg,
      })
      return
    }

    if (!fieldMapping.recipientName) {
      const errorMsg = "Please map the recipient name field"
      setError(errorMsg)
      notifications.showWarning(errorMsg)
      return
    }

    try {
      if (useCustomTemplate && customTemplateFile && customTemplatePreview) {
        // Generate from custom template
        const base64 = await fileToBase64(customTemplateFile)
        const img = new Image()
        img.src = customTemplatePreview
        
        await new Promise((resolve) => {
          img.onload = resolve
        })

        const widthMM = img.width * 0.264583 // Convert to mm
        const heightMM = img.height * 0.264583

        const customTemplate: CustomTemplateImage = {
          data: base64,
          name: customTemplateFile.name,
          type: "image",
          width: widthMM,
          height: heightMM,
        }

        const fieldPositions: { recipientName: CustomTemplateFieldPosition } = {
          recipientName: {
            ...namePosition,
            x: namePosition.x + xOffset, // Apply offset adjustment
          },
        }

        const doc = await generateCertificateFromCustomTemplate(
          customTemplate,
          previewRow,
          fieldMapping,
          fieldPositions,
        )

        const pdfBlob = doc.output("blob")
        const arrayBuffer = await pdfBlob.arrayBuffer()
        const bytes = new Uint8Array(arrayBuffer)
        let binary = ""
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i])
        }
        const base64Pdf = btoa(binary)
        setPreviewPdf(base64Pdf)
        
        // Create blob URL for iframe (allows disabling toolbar)
        const binaryString1 = atob(base64Pdf)
        const bytes1 = new Uint8Array(binaryString1.length)
        for (let i = 0; i < binaryString1.length; i++) {
          bytes1[i] = binaryString1.charCodeAt(i)
        }
        const blob1 = new Blob([bytes1], { type: "application/pdf" })
        const blobUrl1 = URL.createObjectURL(blob1)
        setPreviewPdfUrl(blobUrl1)
        
        setShowPreview(true)
        setError("")
      } else {
        const template = getTemplate(selectedTemplate)
        if (!template) {
          throw new Error("Template not found")
        }

        let logo: CertificateLogo | undefined
        let signature: CertificateSignature | undefined
        
        if (logoFile && logoPreview) {
          const base64 = await fileToBase64(logoFile)
          logo = {
            data: base64,
            name: logoFile.name,
            width: 40,
            height: 40,
            x: undefined,
            y: 20,
          }
        }
        
        if (signatureFile && signaturePreview) {
          const base64 = await fileToBase64(signatureFile)
          signature = {
            data: base64,
            name: signatureFile.name,
            width: 40,
            height: 20,
            x: undefined,
            y: undefined,
          }
        }

        const doc = generateCertificate(
          template,
          previewRow,
          fieldMapping,
          getCurrentStyles(),
          organizationName || undefined,
          defaultCertificateTitle,
          defaultAwardMessage,
          defaultSubMessage,
          defaultSignaturePosition,
          logo,
          signature,
          customFontSizes,
        )
        const pdfBlob = doc.output("blob")
        const arrayBuffer = await pdfBlob.arrayBuffer()
        const bytes2 = new Uint8Array(arrayBuffer)
        let binary = ""
        for (let i = 0; i < bytes2.byteLength; i++) {
          binary += String.fromCharCode(bytes2[i])
        }
        const base64Pdf = btoa(binary)
        setPreviewPdf(base64Pdf)
        
        // Create blob URL for iframe (allows disabling toolbar)
        const binaryString2 = atob(base64Pdf)
        const bytes3 = new Uint8Array(binaryString2.length)
        for (let i = 0; i < binaryString2.length; i++) {
          bytes3[i] = binaryString2.charCodeAt(i)
        }
        const blob2 = new Blob([bytes3], { type: "application/pdf" })
        const blobUrl2 = URL.createObjectURL(blob2)
        setPreviewPdfUrl(blobUrl2)
        
        setShowPreview(true)
        setError("")
        notifications.showSuccess({
          title: 'Preview generated!',
          description: 'Certificate preview is ready.',
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate preview"
      setError(errorMessage)
      console.error("Preview generation error:", err)
      setShowPreview(false)
      setPreviewPdf(null)
      if (previewPdfUrl) {
        URL.revokeObjectURL(previewPdfUrl)
        setPreviewPdfUrl(null)
      }
      notifications.showError({
        title: 'Preview generation failed',
        description: errorMessage,
      })
    }
  }

  // Cleanup blob URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (previewPdfUrl) {
        URL.revokeObjectURL(previewPdfUrl)
      }
    }
  }, [previewPdfUrl])

  // Generate all certificates and download as ZIP
  const handleGenerateAndDownload = async () => {
    const validation = validateFieldMapping(fieldMapping)
    if (!validation.valid) {
      const errorMsg = validation.errors.join(", ")
      setError(errorMsg)
      notifications.showError({
        title: 'Validation error',
        description: errorMsg,
      })
      return
    }

    if (rows.length === 0) {
      const errorMsg = "Please upload an Excel/CSV file first"
      setError(errorMsg)
      notifications.showWarning(errorMsg)
      return
    }

    if (useCustomTemplate && !customTemplateFile) {
      const errorMsg = "Please upload a custom template image"
      setError(errorMsg)
      notifications.showError({
        title: 'Missing template',
        description: errorMsg,
      })
      return
    }

    if (activeRows.length === 0) {
      const errorMsg = "No active recipients to generate certificates for"
      setError(errorMsg)
      notifications.showWarning(errorMsg)
      return
    }

    setGenerating(true)
    setError("")
    setGenerationProgress(0)
    
    notifications.showInfo(`Generating ${activeRows.length} certificate${activeRows.length > 1 ? 's' : ''}...`)

    try {
      let pdfFiles: Array<{ name: string; blob: string }> = []

      if (useCustomTemplate && customTemplateFile && customTemplatePreview) {
        const base64 = await fileToBase64(customTemplateFile)
        const img = new Image()
        img.src = customTemplatePreview
        
        await new Promise((resolve) => {
          img.onload = resolve
        })

        const widthMM = img.width * 0.264583
        const heightMM = img.height * 0.264583

        const customTemplate: CustomTemplateImage = {
          data: base64,
          name: customTemplateFile.name,
          type: "image",
          width: widthMM,
          height: heightMM,
        }

        const fieldPositions: { recipientName: CustomTemplateFieldPosition } = {
          recipientName: {
            ...namePosition,
            x: namePosition.x + xOffset,
          },
        }

        // Only generate for non-skipped rows
        const activeRecipients = rows.filter((_, idx) => !skippedRows.has(idx))
        pdfFiles = await generateCertificatesFromCustomTemplateBatch(
          customTemplate,
          activeRecipients,
          fieldMapping,
          fieldPositions,
        )
      } else {
        const template = getTemplate(selectedTemplate)
        if (!template) {
          throw new Error("Template not found")
        }

        let logo: CertificateLogo | undefined
        let signature: CertificateSignature | undefined
        
        if (logoFile && logoPreview) {
          const base64 = await fileToBase64(logoFile)
          logo = {
            data: base64,
            name: logoFile.name,
            width: 40,
            height: 40,
            x: undefined,
            y: 20,
          }
        }
        
        if (signatureFile && signaturePreview) {
          const base64 = await fileToBase64(signatureFile)
          signature = {
            data: base64,
            name: signatureFile.name,
            width: 40,
            height: 20,
            x: undefined,
            y: undefined,
          }
        }

        // Only generate for non-skipped rows
        const activeRecipients = rows.filter((_, idx) => !skippedRows.has(idx))
        pdfFiles = await generateCertificateBatch(
          selectedTemplate,
          activeRecipients,
          fieldMapping,
          getCurrentStyles(),
          organizationName || undefined,
          defaultCertificateTitle,
          defaultAwardMessage,
          defaultSubMessage,
          defaultSignaturePosition,
          logo,
          signature,
          customFontSizes,
        )
      }

      setGeneratedCertificates(pdfFiles)
      setGenerationProgress(100)

      // Create ZIP file
      const zip = new JSZip()
      
      pdfFiles.forEach((pdf) => {
        // Convert base64 to binary string
        const binaryString = atob(pdf.blob)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        zip.file(pdf.name, bytes)
      })

      // Generate ZIP filename with date and organization name
      const date = new Date()
      const dateStr = date.toISOString().split("T")[0] // YYYY-MM-DD format
      
      let zipFilename = "certificates"
      
      // Add organization name if available
      if (organizationName && organizationName.trim()) {
        const sanitizedOrg = organizationName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase().slice(0, 30)
        zipFilename += `-${sanitizedOrg}`
      }
      
      // Add date
      zipFilename += `-${dateStr}.zip`

      // Generate ZIP and download
      const zipBlob = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = zipFilename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setError("")
      
      // Show success notification
      notifications.showSuccess({
        title: 'Certificates generated successfully!',
        description: `Generated ${pdfFiles.length} certificate${pdfFiles.length > 1 ? 's' : ''} and downloaded as ZIP file.`,
      }, {
        duration: 6000,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate certificates"
      setError(errorMessage)
      console.error("Certificate generation error:", err)
      notifications.showError({
        title: 'Certificate generation failed',
        description: errorMessage,
      }, {
        duration: 5000,
      })
    } finally {
      setGenerating(false)
    }
  }

  // This component is very long, so I'll continue with the rest in the next message...
  // For now, let me return a simplified version that has the core structure

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-6 pt-24 pb-12 px-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Generate Certificates</h1>
        <p className="text-muted-foreground">
          Upload your Excel/CSV file, customize your certificate design, and download all certificates as a ZIP file.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* File Upload Section */}
      {!file && (
        <>
          {/* File Upload Component - Prominent */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 dark:from-primary/20 dark:via-primary/10 dark:to-accent/20 border-2 border-primary/30 dark:border-primary/40 rounded-2xl p-8 shadow-2xl">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative">
              <div 
                className="relative border-3 border-dashed rounded-xl p-16 text-center transition-all cursor-pointer group border-primary/50 hover:border-primary bg-primary/5 hover:bg-primary/10 hover:scale-[1.01] hover:shadow-lg"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <div className="flex flex-col items-center justify-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                    <FileUp className="w-16 h-16 text-primary relative z-10 group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      Drag and drop your file here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Or click to browse
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <Badge variant="outline" className="font-semibold">XLSX</Badge>
                      <Badge variant="outline" className="font-semibold">CSV</Badge>
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  id="file-upload"
                  accept=".xlsx,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleFileUpload(file)
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Format Guide - Below Upload, Less Prominent */}
          <details className="relative overflow-hidden bg-gradient-to-br from-amber-50/30 via-orange-50/15 to-red-50/30 dark:from-amber-950/10 dark:via-orange-950/5 dark:to-red-950/10 border border-amber-200/30 dark:border-amber-800/20 rounded-xl shadow-md">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            
            <summary className="relative cursor-pointer p-4 flex items-center gap-3 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
                <Info className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">
                📋 View Expected File Format (Optional)
              </h3>
            </summary>
            
            <div className="relative p-5 pt-0 border-t border-border/50">
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-3">
                  Your CSV/XLSX file should contain the following columns:
                </p>
                
                <div className="overflow-x-auto rounded-lg border border-border/50 bg-background/80 backdrop-blur-sm shadow-inner max-h-[400px] overflow-y-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-gradient-to-r from-muted/60 to-muted/40 border-b border-border">
                          <th className="text-left py-2 px-3 font-semibold text-foreground">Column Name</th>
                          <th className="text-left py-2 px-3 font-semibold text-foreground">Status</th>
                          <th className="text-left py-2 px-3 font-semibold text-foreground">Description</th>
                          <th className="text-left py-2 px-3 font-semibold text-foreground">Example</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="py-2 px-3 font-mono font-medium text-foreground">Name / Recipient Name</td>
                          <td className="py-2 px-3">
                            <Badge variant="destructive" className="text-[10px] font-semibold px-1.5 py-0.5">Mandatory</Badge>
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground">Full name of recipient</td>
                          <td className="py-2 px-3 font-mono text-[10px] text-muted-foreground bg-muted/30 rounded px-1.5 py-0.5 inline-block">John Doe</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="py-2 px-3 font-mono font-medium text-foreground">Course Title</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0.5">Optional</Badge>
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground">Course/program name</td>
                          <td className="py-2 px-3 font-mono text-[10px] text-muted-foreground bg-muted/30 rounded px-1.5 py-0.5 inline-block">Advanced Web Dev</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="py-2 px-3 font-mono font-medium text-foreground">Date</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0.5">Optional</Badge>
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground">Certificate date</td>
                          <td className="py-2 px-3 font-mono text-[10px] text-muted-foreground bg-muted/30 rounded px-1.5 py-0.5 inline-block">2024-01-15</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="py-2 px-3 font-mono font-medium text-foreground">Organization</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0.5">Optional</Badge>
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground">Issuing organization</td>
                          <td className="py-2 px-3 font-mono text-[10px] text-muted-foreground bg-muted/30 rounded px-1.5 py-0.5 inline-block">ABC Academy</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="py-2 px-3 font-mono font-medium text-foreground">Certificate Title</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0.5">Optional</Badge>
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground">Certificate type</td>
                          <td className="py-2 px-3 font-mono text-[10px] text-muted-foreground bg-muted/30 rounded px-1.5 py-0.5 inline-block">Certificate of...</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="py-2 px-3 font-mono font-medium text-foreground">Award Message</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0.5">Optional</Badge>
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground">Message above name</td>
                          <td className="py-2 px-3 font-mono text-[10px] text-muted-foreground bg-muted/30 rounded px-1.5 py-0.5 inline-block">This certificate...</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="py-2 px-3 font-mono font-medium text-foreground">Sub Message</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0.5">Optional</Badge>
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground">Message below name</td>
                          <td className="py-2 px-3 font-mono text-[10px] text-muted-foreground bg-muted/30 rounded px-1.5 py-0.5 inline-block">for completion...</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="py-2 px-3 font-mono font-medium text-foreground">Signature Position</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0.5">Optional</Badge>
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground">Title below signature</td>
                          <td className="py-2 px-3 font-mono text-[10px] text-muted-foreground bg-muted/30 rounded px-1.5 py-0.5 inline-block">Manager</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="py-2 px-3 font-mono font-medium text-foreground">Certificate Number</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0.5">Optional</Badge>
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground">Unique cert ID</td>
                          <td className="py-2 px-3 font-mono text-[10px] text-muted-foreground bg-muted/30 rounded px-1.5 py-0.5 inline-block">CERT-2024-001</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-3 p-2 rounded bg-amber-50/30 dark:bg-amber-950/15 border border-amber-200/30 dark:border-amber-800/20">
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">💡</strong> Only <strong className="text-foreground">Name/Recipient Name</strong> is required. 
                      All other fields are optional with default values available.
                    </p>
                  </div>
                </div>
              </div>
            </details>
          </>
        )}

      {file && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">File Uploaded</h3>
              <p className="text-sm text-muted-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{rows.length} recipients found</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              setFile(null)
              setHeaders([])
              setRows([])
              setFieldMapping({})
            }}>
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* Template Selection and Configuration */}
      {file && (
        <>
          {/* Template Mode Toggle */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Template Mode</h3>
                <p className="text-sm text-muted-foreground">
                  {useCustomTemplate
                    ? "Upload your own certificate design (PNG, JPG from Google Slides or Canva)"
                    : "Use pre-designed templates with customization options"}
                </p>
              </div>
              <Button
                variant={useCustomTemplate ? "default" : "outline"}
                onClick={() => setUseCustomTemplate(!useCustomTemplate)}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                {useCustomTemplate ? "Use Templates" : "Upload Custom"}
              </Button>
            </div>
          </div>

          {/* Template Selection */}
          {!useCustomTemplate && (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Select Template</h3>
                </div>
                <Collapsible open={showCustomization} onOpenChange={setShowCustomization}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Paintbrush className="w-4 h-4" />
                      Customize
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 space-y-4">
                    <div className="border-t border-border pt-4">
                      <h4 className="font-semibold text-sm mb-3">Color Customization</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="primary-color" className="text-xs mb-1 block">Primary Color</Label>
                          <div className="flex gap-2">
                            <Input
                              id="primary-color"
                              type="color"
                              value={customStyles.primaryColor || getTemplate(selectedTemplate)?.styles.primaryColor || "#000000"}
                              onChange={(e) => {
                                setCustomStyles((prev) => ({ ...prev, primaryColor: e.target.value }))
                              }}
                              className="h-9 w-16 p-1 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={customStyles.primaryColor || getTemplate(selectedTemplate)?.styles.primaryColor || "#000000"}
                              onChange={(e) => {
                                if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                                  setCustomStyles((prev) => ({ ...prev, primaryColor: e.target.value }))
                                }
                              }}
                              className="flex-1 font-mono text-xs"
                              placeholder="#000000"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="secondary-color" className="text-xs mb-1 block">Secondary Color</Label>
                          <div className="flex gap-2">
                            <Input
                              id="secondary-color"
                              type="color"
                              value={customStyles.secondaryColor || getTemplate(selectedTemplate)?.styles.secondaryColor || "#666666"}
                              onChange={(e) => {
                                setCustomStyles((prev) => ({ ...prev, secondaryColor: e.target.value }))
                              }}
                              className="h-9 w-16 p-1 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={customStyles.secondaryColor || getTemplate(selectedTemplate)?.styles.secondaryColor || "#666666"}
                              onChange={(e) => {
                                if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                                  setCustomStyles((prev) => ({ ...prev, secondaryColor: e.target.value }))
                                }
                              }}
                              className="flex-1 font-mono text-xs"
                              placeholder="#666666"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="bg-color" className="text-xs mb-1 block">Background Color</Label>
                          <div className="flex gap-2">
                            <Input
                              id="bg-color"
                              type="color"
                              value={customStyles.backgroundColor || getTemplate(selectedTemplate)?.styles.backgroundColor || "#ffffff"}
                              onChange={(e) => {
                                setCustomStyles((prev) => ({ ...prev, backgroundColor: e.target.value }))
                              }}
                              className="h-9 w-16 p-1 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={customStyles.backgroundColor || getTemplate(selectedTemplate)?.styles.backgroundColor || "#ffffff"}
                              onChange={(e) => {
                                if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                                  setCustomStyles((prev) => ({ ...prev, backgroundColor: e.target.value }))
                                }
                              }}
                              className="flex-1 font-mono text-xs"
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="border-color" className="text-xs mb-1 block">Border Color</Label>
                          <div className="flex gap-2">
                            <Input
                              id="border-color"
                              type="color"
                              value={customStyles.borderColor || getTemplate(selectedTemplate)?.styles.borderColor || "#cccccc"}
                              onChange={(e) => {
                                setCustomStyles((prev) => ({ ...prev, borderColor: e.target.value }))
                              }}
                              className="h-9 w-16 p-1 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={customStyles.borderColor || getTemplate(selectedTemplate)?.styles.borderColor || "#cccccc"}
                              onChange={(e) => {
                                if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                                  setCustomStyles((prev) => ({ ...prev, borderColor: e.target.value }))
                                }
                              }}
                              className="flex-1 font-mono text-xs"
                              placeholder="#cccccc"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label htmlFor="border-width" className="text-xs mb-1 block">
                          Border Width: {customStyles.borderWidth ?? getTemplate(selectedTemplate)?.styles.borderWidth ?? 2}px
                        </Label>
                        <Input
                          id="border-width"
                          type="range"
                          min="0"
                          max="10"
                          value={customStyles.borderWidth ?? getTemplate(selectedTemplate)?.styles.borderWidth ?? 2}
                          onChange={(e) => {
                            setCustomStyles((prev) => ({ ...prev, borderWidth: Number.parseInt(e.target.value) }))
                          }}
                          className="w-full"
                        />
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCustomStyles({})
                          }}
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reset to Default
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CERTIFICATE_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template.id)
                      setCustomStyles({})
                    }}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedTemplate === template.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1">{template.name}</div>
                    <div className="text-xs text-muted-foreground">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Template Upload */}
          {useCustomTemplate && (
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Upload Custom Template</h3>
              </div>
              
              {!customTemplatePreview ? (
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                  onClick={() => document.getElementById("custom-template-upload")?.click()}
                >
                  <FileUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm font-medium mb-2">Upload your certificate template</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Export from Google Slides or Canva as PNG/JPG
                  </p>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,image/png,image/jpeg,image/jpg"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleCustomTemplateUpload(file)
                      }
                      e.target.value = ""
                    }}
                    className="hidden"
                    id="custom-template-upload"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative border border-border rounded-lg overflow-hidden bg-muted/20">
                    {/* Image Preview with Position Overlay */}
                    <div 
                      className="relative w-full cursor-crosshair"
                      onMouseMove={(e) => {
                        if (isDragging && customTemplatePreview && imageDimensions) {
                          const img = e.currentTarget.querySelector("img")
                          if (img) {
                            const rect = img.getBoundingClientRect()
                            const scaleX = imageDimensions.width / rect.width
                            const scaleY = imageDimensions.height / rect.height
                            const x = ((e.clientX - rect.left) * scaleX) * 0.264583
                            const y = ((e.clientY - rect.top) * scaleY) * 0.264583
                            setNamePosition((prev) => ({
                              ...prev,
                              x: Math.max(0, Math.min(x, imageDimensions.width * 0.264583)),
                              y: Math.max(0, Math.min(y, imageDimensions.height * 0.264583)),
                            }))
                          }
                        }
                      }}
                      onMouseUp={() => {
                        setIsDragging(false)
                      }}
                      onMouseLeave={() => {
                        setIsDragging(false)
                      }}
                      onClick={(e) => {
                        if (!isDragging && customTemplatePreview && imageDimensions && previewRow) {
                          const img = e.currentTarget.querySelector("img")
                          if (img && e.target === img) {
                            const rect = img.getBoundingClientRect()
                            const scaleX = imageDimensions.width / rect.width
                            const scaleY = imageDimensions.height / rect.height
                            const x = ((e.clientX - rect.left) * scaleX) * 0.264583
                            const y = ((e.clientY - rect.top) * scaleY) * 0.264583
                            setNamePosition((prev) => ({
                              ...prev,
                              x: Math.max(0, Math.min(x, imageDimensions.width * 0.264583)),
                              y: Math.max(0, Math.min(y, imageDimensions.height * 0.264583)),
                            }))
                          }
                        }
                      }}
                    >
                      <img
                        src={customTemplatePreview}
                        alt="Template preview"
                        className="w-full h-auto pointer-events-none"
                        onLoad={(e) => {
                          const img = e.currentTarget
                          if (img && !imageDimensions) {
                            setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })
                          }
                        }}
                      />
                      {/* Position Indicator Overlay */}
                      {imageDimensions && customTemplatePreview && previewRow && fieldMapping.recipientName && (() => {
                        const imageWidthMM = imageDimensions.width * 0.264583
                        const imageHeightMM = imageDimensions.height * 0.264583
                        const adjustedX = namePosition.x + xOffset
                        const xPercent = (adjustedX / imageWidthMM) * 100
                        const yPercent = (namePosition.y / imageHeightMM) * 100
                        
                        // Calculate font size scale: PDF uses points (pt), we need to convert to pixels
                        // jsPDF font sizes are in points (pt), where 72pt = 1 inch = 96px at 96 DPI
                        // So 1pt ≈ 1.333px. However, the image preview might be scaled.
                        // To match the PDF preview better, we use a conversion factor that accounts
                        // for the typical display scale. Testing shows ~0.85-0.9 works well.
                        const fontSizePt = namePosition.fontSize
                        // Convert pt to px: accounting for display scale to match PDF preview
                        const fontSizePx = Math.max(10, Math.min(fontSizePt * 0.9, 50))
                        
                        let leftStyle: string
                        let transformStyle: string
                        
                        if (namePosition.align === "center") {
                          leftStyle = `${xPercent}%`
                          transformStyle = "translateX(-50%)"
                        } else if (namePosition.align === "right") {
                          leftStyle = `${xPercent}%`
                          transformStyle = "translateX(-100%)"
                        } else {
                          leftStyle = `${xPercent}%`
                          transformStyle = "none"
                        }
                        
                        return (
                          <div
                            className="absolute border-2 border-primary border-dashed bg-primary/10 rounded-sm pointer-events-none"
                            style={{
                              left: leftStyle,
                              top: `${yPercent}%`,
                              padding: "8px 12px",
                              transform: `${transformStyle} translateY(-50%)`,
                              minWidth: "120px",
                              zIndex: 10,
                            }}
                          >
                            <div 
                              className="font-semibold whitespace-nowrap text-primary"
                              style={{
                                fontSize: `${fontSizePx}px`,
                                color: namePosition.fontColor,
                                fontWeight: namePosition.fontWeight,
                                textAlign: namePosition.align,
                                lineHeight: "1.2",
                              }}
                            >
                              {previewRow[fieldMapping.recipientName] || "Name Preview"}
                            </div>
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full border-2 border-background flex items-center justify-center">
                              <div className="w-2 h-2 bg-background rounded-full"></div>
                            </div>
                          </div>
                        )
                      })()}
                      
                      {/* Draggable Handle */}
                      {imageDimensions && customTemplatePreview && previewRow && fieldMapping.recipientName && (() => {
                        const imageWidthMM = imageDimensions.width * 0.264583
                        const imageHeightMM = imageDimensions.height * 0.264583
                        const adjustedX = namePosition.x + xOffset
                        const xPercent = (adjustedX / imageWidthMM) * 100
                        const yPercent = (namePosition.y / imageHeightMM) * 100
                        
                        return (
                          <div
                            className="absolute cursor-grab active:cursor-grabbing z-20"
                            style={{
                              left: `calc(${xPercent}% - 12px)`,
                              top: `calc(${yPercent}% - 12px)`,
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              backgroundColor: "hsl(var(--primary))",
                              border: "3px solid hsl(var(--background))",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setIsDragging(true)
                            }}
                          />
                        )
                      })()}
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 z-30"
                        onClick={() => {
                          setCustomTemplateFile(null)
                          setCustomTemplatePreview(null)
                          setImageDimensions(null)
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      
                      <div className="absolute bottom-2 left-2 right-2 pointer-events-none z-20">
                        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-2 text-xs text-muted-foreground text-center">
                          💡 Click on the image to position the name, or drag the <span className="text-primary font-semibold">●</span> handle
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-sm">Name Position Settings</h4>
                    <p className="text-xs text-muted-foreground">
                      Click on the image above to set position, or adjust manually below
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">X Position (mm)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={namePosition.x.toFixed(1)}
                          onChange={(e) => setNamePosition((prev) => ({ ...prev, x: Number.parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Y Position (mm)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={namePosition.y.toFixed(1)}
                          onChange={(e) => setNamePosition((prev) => ({ ...prev, y: Number.parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">X Offset (mm)</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.1"
                            value={xOffset.toFixed(1)}
                            onChange={(e) => setXOffset(Number.parseFloat(e.target.value) || 0)}
                          />
                          <Button variant="outline" size="sm" onClick={() => setXOffset(-25)}>
                            -25
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Font Size</Label>
                        <Input
                          type="number"
                          value={namePosition.fontSize}
                          onChange={(e) => setNamePosition((prev) => ({ ...prev, fontSize: Number.parseInt(e.target.value) || 32 }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Text Color</Label>
                        <Input
                          type="color"
                          value={namePosition.fontColor}
                          onChange={(e) => setNamePosition((prev) => ({ ...prev, fontColor: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Alignment</Label>
                        <Select
                          value={namePosition.align}
                          onValueChange={(value: "left" | "center" | "right") => setNamePosition((prev) => ({ ...prev, align: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Font Weight</Label>
                        <Select
                          value={namePosition.fontWeight}
                          onValueChange={(value: "normal" | "bold") => setNamePosition((prev) => ({ ...prev, fontWeight: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="bold">Bold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Field Mapping Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Field Mapping & Award Message */}
            <div className="space-y-6">
              {/* Field Mapping */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Map Fields</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="recipient-name" className="mb-2 block">
                      Recipient Name <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={fieldMapping.recipientName || "none"}
                      onValueChange={(value) => {
                        setFieldMapping({
                          ...fieldMapping,
                          recipientName: value === "none" ? undefined : value,
                        })
                      }}
                    >
                      <SelectTrigger id="recipient-name">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="course-title" className="mb-2 block">Course/Title (Optional)</Label>
                    <Select
                      value={fieldMapping.courseTitle || "none"}
                      onValueChange={(value) => {
                        setFieldMapping({
                          ...fieldMapping,
                          courseTitle: value === "none" ? undefined : value,
                        })
                      }}
                    >
                      <SelectTrigger id="course-title">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="date" className="mb-2 block">Date (Optional)</Label>
                    <Select
                      value={fieldMapping.date || "none"}
                      onValueChange={(value) => {
                        setFieldMapping({
                          ...fieldMapping,
                          date: value === "none" ? undefined : value,
                        })
                      }}
                    >
                      <SelectTrigger id="date">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="organization" className="mb-2 block">Organization/Issuer (Optional)</Label>
                    <Select
                      value={fieldMapping.organization || "none"}
                      onValueChange={(value) => {
                        setFieldMapping({
                          ...fieldMapping,
                          organization: value === "none" ? undefined : value,
                        })
                      }}
                    >
                      <SelectTrigger id="organization">
                        <SelectValue placeholder="Select column or use default" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Use default below</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="org-name" className="mb-2 block">Default Organization Name</Label>
                    <Input
                      id="org-name"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="e.g., ABC Academy"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Used if organization column is not mapped or empty
                    </p>
                  </div>
                </div>
              </div>

              {/* Award Message & Branding */}
              {!useCustomTemplate && (
                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">Award Message & Branding</h3>
                  </div>
                
                  <div>
                    <Label htmlFor="certificate-title" className="mb-2 block">Certificate Title</Label>
                    <Select
                      value={fieldMapping.certificateTitle || "none"}
                      onValueChange={(value) => {
                        setFieldMapping({
                          ...fieldMapping,
                          certificateTitle: value === "none" ? undefined : value,
                        })
                      }}
                    >
                      <SelectTrigger id="certificate-title">
                        <SelectValue placeholder="Use default or select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Use default below</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="default-certificate-title"
                      value={defaultCertificateTitle}
                      onChange={(e) => setDefaultCertificateTitle(e.target.value)}
                      placeholder="Certificate of Appreciation"
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Used if certificate title column is not mapped
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="award-message" className="mb-2 block">Award Message</Label>
                    <Select
                      value={fieldMapping.awardMessage || "none"}
                      onValueChange={(value) => {
                        setFieldMapping({
                          ...fieldMapping,
                          awardMessage: value === "none" ? undefined : value,
                        })
                      }}
                    >
                      <SelectTrigger id="award-message">
                        <SelectValue placeholder="Use default or select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Use default below</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="default-award-message"
                      value={defaultAwardMessage}
                      onChange={(e) => setDefaultAwardMessage(e.target.value)}
                      placeholder="This certificate is awarded to"
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Used if award message column is not mapped
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="sub-message" className="mb-2 block">Sub Message (Below Name)</Label>
                    <Select
                      value={fieldMapping.subMessage || "none"}
                      onValueChange={(value) => {
                        setFieldMapping({
                          ...fieldMapping,
                          subMessage: value === "none" ? undefined : value,
                        })
                      }}
                    >
                      <SelectTrigger id="sub-message">
                        <SelectValue placeholder="Use default or select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Use default below</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="default-sub-message"
                      value={defaultSubMessage}
                      onChange={(e) => setDefaultSubMessage(e.target.value)}
                      placeholder="for completion of the course"
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Used if sub-message column is not mapped
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="signature-position" className="mb-2 block">Signature Position/Title</Label>
                    <Select
                      value={fieldMapping.signaturePosition || "none"}
                      onValueChange={(value) => {
                        setFieldMapping({
                          ...fieldMapping,
                          signaturePosition: value === "none" ? undefined : value,
                        })
                      }}
                    >
                      <SelectTrigger id="signature-position">
                        <SelectValue placeholder="Use default or select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Use default below</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="default-signature-position"
                      value={defaultSignaturePosition}
                      onChange={(e) => setDefaultSignaturePosition(e.target.value)}
                      placeholder="Manager"
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Position/title shown below signature (e.g., "Manager", "President")
                    </p>
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <Label className="mb-2 block">Logo (Optional)</Label>
                    {!logoPreview ? (
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleLogoUpload(file)
                            e.target.value = ""
                          }}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label htmlFor="logo-upload" className="cursor-pointer">
                          <FileUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Click to upload logo</p>
                          <p className="text-xs text-muted-foreground">PNG or JPG (max 2MB)</p>
                        </label>
                      </div>
                    ) : (
                      <div className="relative border border-border rounded-lg p-4">
                        <img src={logoPreview} alt="Logo preview" className="max-h-20 mx-auto" />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setLogoPreview(null)
                            setLogoFile(null)
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Signature Upload */}
                  <div>
                    <Label className="mb-2 block">Signature (Optional)</Label>
                    {!signaturePreview ? (
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleSignatureUpload(file)
                            e.target.value = ""
                          }}
                          className="hidden"
                          id="signature-upload"
                        />
                        <label htmlFor="signature-upload" className="cursor-pointer">
                          <FileUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Click to upload signature</p>
                          <p className="text-xs text-muted-foreground">PNG or JPG (max 2MB)</p>
                        </label>
                      </div>
                    ) : (
                      <div className="relative border border-border rounded-lg p-4">
                        <img src={signaturePreview} alt="Signature preview" className="max-h-20 mx-auto" />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setSignaturePreview(null)
                            setSignatureFile(null)
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Font Sizes */}
            <div className="space-y-6">
              {/* Font Size Controls */}
              {!useCustomTemplate && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">Font Sizes</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTemplate && getTemplate(selectedTemplate)?.fields.certificateTitle && (
                      <div>
                        <Label className="text-xs mb-1 block">Certificate Title</Label>
                        <Input
                          type="number"
                          value={customFontSizes.certificateTitle ?? getTemplate(selectedTemplate)?.fields.certificateTitle?.fontSize ?? 36}
                          onChange={(e) => {
                            setCustomFontSizes((prev) => ({
                              ...prev,
                              certificateTitle: Number.parseInt(e.target.value) || undefined,
                            }))
                          }}
                        />
                      </div>
                    )}
                    {selectedTemplate && getTemplate(selectedTemplate)?.fields.awardMessage && (
                      <div>
                        <Label className="text-xs mb-1 block">Award Message</Label>
                        <Input
                          type="number"
                          value={customFontSizes.awardMessage ?? getTemplate(selectedTemplate)?.fields.awardMessage?.fontSize ?? 14}
                          onChange={(e) => {
                            setCustomFontSizes((prev) => ({
                              ...prev,
                              awardMessage: Number.parseInt(e.target.value) || undefined,
                            }))
                          }}
                        />
                      </div>
                    )}
                    {selectedTemplate && getTemplate(selectedTemplate)?.fields.recipientName && (
                      <div>
                        <Label className="text-xs mb-1 block">Recipient Name</Label>
                        <Input
                          type="number"
                          value={customFontSizes.recipientName ?? getTemplate(selectedTemplate)?.fields.recipientName.fontSize ?? 32}
                          onChange={(e) => {
                            setCustomFontSizes((prev) => ({
                              ...prev,
                              recipientName: Number.parseInt(e.target.value) || undefined,
                            }))
                          }}
                        />
                      </div>
                    )}
                    {selectedTemplate && getTemplate(selectedTemplate)?.fields.subMessage && (
                      <div>
                        <Label className="text-xs mb-1 block">Sub Message</Label>
                        <Input
                          type="number"
                          value={customFontSizes.subMessage ?? getTemplate(selectedTemplate)?.fields.subMessage?.fontSize ?? 14}
                          onChange={(e) => {
                            setCustomFontSizes((prev) => ({
                              ...prev,
                              subMessage: Number.parseInt(e.target.value) || undefined,
                            }))
                          }}
                        />
                      </div>
                    )}
                    {selectedTemplate && getTemplate(selectedTemplate)?.fields.courseTitle && (
                      <div>
                        <Label className="text-xs mb-1 block">Course Title</Label>
                        <Input
                          type="number"
                          value={customFontSizes.courseTitle ?? getTemplate(selectedTemplate)?.fields.courseTitle?.fontSize ?? 18}
                          onChange={(e) => {
                            setCustomFontSizes((prev) => ({
                              ...prev,
                              courseTitle: Number.parseInt(e.target.value) || undefined,
                            }))
                          }}
                        />
                      </div>
                    )}
                    {selectedTemplate && getTemplate(selectedTemplate)?.fields.date && (
                      <div>
                        <Label className="text-xs mb-1 block">Date</Label>
                        <Input
                          type="number"
                          value={customFontSizes.date ?? getTemplate(selectedTemplate)?.fields.date?.fontSize ?? 14}
                          onChange={(e) => {
                            setCustomFontSizes((prev) => ({
                              ...prev,
                              date: Number.parseInt(e.target.value) || undefined,
                            }))
                          }}
                        />
                      </div>
                    )}
                    {selectedTemplate && getTemplate(selectedTemplate)?.fields.organization && (
                      <div>
                        <Label className="text-xs mb-1 block">Organization</Label>
                        <Input
                          type="number"
                          value={customFontSizes.organization ?? getTemplate(selectedTemplate)?.fields.organization?.fontSize ?? 16}
                          onChange={(e) => {
                            setCustomFontSizes((prev) => ({
                              ...prev,
                              organization: Number.parseInt(e.target.value) || undefined,
                            }))
                          }}
                        />
                      </div>
                    )}
                    {selectedTemplate && getTemplate(selectedTemplate)?.fields.signaturePosition && (
                      <div>
                        <Label className="text-xs mb-1 block">Signature Position</Label>
                        <Input
                          type="number"
                          value={customFontSizes.signaturePosition ?? getTemplate(selectedTemplate)?.fields.signaturePosition?.fontSize ?? 12}
                          onChange={(e) => {
                            setCustomFontSizes((prev) => ({
                              ...prev,
                              signaturePosition: Number.parseInt(e.target.value) || undefined,
                            }))
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Certificate Preview</h3>
              <div className="flex items-center gap-2">
                {showPreview && previewPdf && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Generate proper filename for preview download
                      const downloadPreviewRow = firstActiveRowIndex >= 0 && rows[firstActiveRowIndex] 
                        ? rows[firstActiveRowIndex] 
                        : getSampleRow()
                      const recipientName = downloadPreviewRow[fieldMapping.recipientName || ""]?.toString() || "preview"
                      const sanitizedName = recipientName
                        .replace(/[^a-zA-Z0-9\s]/g, "_")
                        .replace(/\s+/g, "_")
                        .toLowerCase()
                        .slice(0, 50)
                        .replace(/_+$/, "")
                      const filename = `${sanitizedName}_certificate_preview.pdf`
                      
                      // Create download link
                      const binaryString = atob(previewPdf)
                      const bytes = new Uint8Array(binaryString.length)
                      for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i)
                      }
                      const blob = new Blob([bytes], { type: "application/pdf" })
                      const url = URL.createObjectURL(blob)
                      const link = document.createElement("a")
                      link.href = url
                      link.download = filename
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                      URL.revokeObjectURL(url)
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Preview
                  </Button>
                )}
                <Button 
                  onClick={generatePreview} 
                  variant="outline" 
                  size="sm"
                  disabled={!fieldMapping.recipientName || (useCustomTemplate && !customTemplateFile)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Generate Preview
                </Button>
              </div>
            </div>
            {showPreview && previewPdfUrl ? (
              <div className="border border-border rounded-lg overflow-hidden relative">
                <iframe
                  src={previewPdfUrl}
                  className="w-full h-[600px]"
                  title="Certificate Preview"
                  style={{ 
                    pointerEvents: "auto",
                    border: "none"
                  }}
                />
              </div>
            ) : (
              <div className="border border-border rounded-lg p-12 text-center">
                <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Click "Generate Preview" to see your certificate</p>
              </div>
            )}
          </div>

          {/* Recipient Preview with Skip Functionality */}
          {rows.length > 0 && fieldMapping.recipientName && (
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Recipient Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    Review recipients and skip any you don't want to generate certificates for. Skipped recipients will be excluded from generation.
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {rows.slice(0, 100).map((row, idx) => {
                  const nameField = fieldMapping.recipientName || ""
                  const isSkipped = skippedRows.has(idx)

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.01 }}
                      className={`flex items-center gap-4 p-4 rounded-lg border ${
                        isSkipped ? "bg-red-50/50 border-red-200 opacity-60" : "bg-muted/50 border-border"
                      }`}
                    >
                      <div className="flex-shrink-0 flex items-center justify-center">
                        <Checkbox
                          id={`skip-${idx}`}
                          checked={isSkipped}
                          onCheckedChange={(checked) => {
                            const shouldSkip = checked === true
                            if (shouldSkip) {
                              skipRow(idx)
                            } else {
                              unskipRow(idx)
                            }
                          }}
                          className="w-5 h-5 border-2 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary cursor-pointer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${isSkipped ? "line-through text-muted-foreground" : ""}`}>
                          {row[nameField]?.toString() || `Recipient ${idx + 1}`}
                        </p>
                        {isSkipped && (
                          <p className="text-xs text-red-600 mt-1">⏭️ Skipped - will not be generated</p>
                        )}
                      </div>
                      {!isSkipped && (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      )}
                    </motion.div>
                  )
                })}
                {rows.length > 100 && (
                  <p className="text-xs text-muted-foreground text-center">
                    ... and {rows.length - 100} more recipients
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{activeRows.length}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{rows.length}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{skippedRows.size}</p>
                  <p className="text-xs text-muted-foreground">Skipped</p>
                </div>
              </div>

              {skippedRows.size > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-2"
                >
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-600 text-sm">
                    {skippedRows.size} recipient{skippedRows.size > 1 ? "s" : ""} will be skipped (no certificate generated)
                  </span>
                </motion.div>
              )}
            </div>
          )}

          {/* Generate and Download Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleGenerateAndDownload}
              disabled={!fieldMapping.recipientName || generating || (useCustomTemplate && !customTemplateFile) || rows.length === 0 || activeRows.length === 0}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate & Download ZIP
                </>
              )}
            </Button>
          </div>

          {generating && (
            <div className="space-y-2">
              <Progress value={generationProgress} />
              <p className="text-sm text-muted-foreground text-center">
                Generating certificates... {generationProgress}%
              </p>
            </div>
          )}

          {generatedCertificates.length > 0 && !generating && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully generated {generatedCertificates.length} certificates! The ZIP file should have downloaded automatically.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </motion.div>
  )
}

