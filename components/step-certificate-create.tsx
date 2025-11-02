"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useSendWizard } from "./send-wizard-context"
import { CERTIFICATE_TEMPLATES, getTemplate } from "./certificate-templates"
import {
  generateCertificate,
  generateCertificateBatch,
  validateFieldMapping,
  getRecipientNameForMatching,
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
} from "@/types/certificate"
import { fileToBase64 } from "@/lib/pdf-utils"
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
  Save,
  X,
  FileUp,
  ImageIcon,
  PenTool,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { CertificateStyles } from "@/types/certificate"

export default function StepCertificateCreate() {
  const {
    state,
    setStep,
    setPdfFiles,
    setPdfMatch,
    setCertificateTemplate,
    setCertificateFieldMapping,
    setCertificateConfig,
    skipRow,
    unskipRow,
  } = useSendWizard()

  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    state.certificateTemplate || CERTIFICATE_TEMPLATES[0].id,
  )
  const [fieldMapping, setFieldMapping] = useState<CertificateFieldMapping>(
    state.certificateFieldMapping || {},
  )
  const [organizationName, setOrganizationName] = useState<string>("")
  const [generating, setGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [error, setError] = useState<string>("")
  const [previewPdf, setPreviewPdf] = useState<string | null>(null) // base64 preview
  const [showPreview, setShowPreview] = useState(false)
  const [showCustomization, setShowCustomization] = useState(false)
  const [customStyles, setCustomStyles] = useState<Partial<CertificateStyles>>(
    state.certificateConfig?.customStyles || {},
  )
  const [useCustomTemplate, setUseCustomTemplate] = useState(false)
  const [customTemplateFile, setCustomTemplateFile] = useState<File | null>(null)
  const [customTemplatePreview, setCustomTemplatePreview] = useState<string | null>(null)
  const [namePosition, setNamePosition] = useState({
    x: 148.5, // Center of A4 landscape
    y: 100,
    fontSize: 32,
    fontColor: "#000000",
    fontWeight: "bold" as "normal" | "bold",
    align: "center" as "left" | "center" | "right",
  })
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [xOffset, setXOffset] = useState(0) // Offset to compensate for jsPDF positioning differences
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [signatureFile, setSignatureFile] = useState<File | null>(null)
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null)
  const [defaultCertificateTitle, setDefaultCertificateTitle] = useState<string>("Certificate of Appreciation")
  const [defaultAwardMessage, setDefaultAwardMessage] = useState<string>("This certificate is awarded to")
  const [defaultSubMessage, setDefaultSubMessage] = useState<string>("for completion of the course")
  const [defaultSignaturePosition, setDefaultSignaturePosition] = useState<string>("Manager")
  const [customFontSizes, setCustomFontSizes] = useState<CertificateFontSizes>({})

  // Get first active recipient for preview
  const firstActiveRowIndex = state.rows.findIndex((_, idx) => !state.skippedRows.has(idx))

  // Create sample data for preview if no data exists
  const getSampleRow = (): FileRow => {
    const sample: FileRow = {}
    if (fieldMapping.certificateTitle) {
      sample[fieldMapping.certificateTitle] = defaultCertificateTitle
    }
    if (fieldMapping.recipientName) {
      sample[fieldMapping.recipientName] = "John Doe"
    }
    if (fieldMapping.awardMessage) {
      sample[fieldMapping.awardMessage] = defaultAwardMessage
    }
    if (fieldMapping.subMessage) {
      sample[fieldMapping.subMessage] = defaultSubMessage
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
      sample[fieldMapping.signaturePosition] = defaultSignaturePosition
    }
    return sample
  }
  
  // Use sample data for preview if no real data exists
  const previewRow = firstActiveRowIndex >= 0 && state.rows[firstActiveRowIndex] 
    ? state.rows[firstActiveRowIndex] 
    : getSampleRow()

  // Auto-detect recipient name field if not set (only once on mount)
  useEffect(() => {
    if (!fieldMapping.recipientName && state.mapping.name && !state.certificateFieldMapping.recipientName) {
      const newMapping = {
        ...fieldMapping,
        recipientName: state.mapping.name,
      }
      setFieldMapping(newMapping)
      setCertificateFieldMapping(newMapping)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Sync selected template with context state on mount
  useEffect(() => {
    if (state.certificateTemplate && state.certificateTemplate !== selectedTemplate) {
      setSelectedTemplate(state.certificateTemplate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Get current template styles (base template + custom overrides)
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

  // Handle custom template file upload
  const handleCustomTemplateUpload = async (file: File) => {
    // Validate file type by extension (more reliable than MIME type)
    const fileName = file.name.toLowerCase()
    const validExtensions = [".png", ".jpg", ".jpeg"]
    const hasValidExtension = validExtensions.some((ext) => fileName.endsWith(ext))
    
    // Also check MIME type as fallback
    const validMimeTypes = ["image/png", "image/jpeg", "image/jpg"]
    const hasValidMimeType = validMimeTypes.includes(file.type.toLowerCase())
    
    if (!hasValidExtension && !hasValidMimeType) {
      setError("Please upload a PNG or JPG image file. Supported formats: .png, .jpg, .jpeg")
      return
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setError(`File size too large. Maximum size is 10MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`)
      return
    }

    try {
      setError("")
      
      // Create preview URL first
      const reader = new FileReader()
      reader.onerror = () => {
        setError("Failed to read the file. Please try again.")
      }
      
      reader.onload = async (e) => {
        try {
          const dataUrl = e.target?.result as string
          if (!dataUrl) {
            setError("Failed to load file preview")
            return
          }
          
          setCustomTemplatePreview(dataUrl)
          setCustomTemplateFile(file)

          // Calculate dimensions using the loaded image
          const img = new Image()
          img.onerror = () => {
            setError("Failed to load image. Please ensure it's a valid image file.")
          }
          
          img.onload = () => {
            // Store image dimensions for positioning overlay
            setImageDimensions({ width: img.width, height: img.height })
            
            // Set default position to center if not set
            if (namePosition.x === 148.5 && namePosition.y === 100) {
              // Convert image center to mm (assuming 96 DPI)
              const centerXMM = (img.width * 0.264583) / 2
              const centerYMM = (img.height * 0.264583) / 2
              setNamePosition((prev) => ({
                ...prev,
                x: centerXMM,
                y: centerYMM,
              }))
            }
            
            setError("")
          }
          
          img.src = dataUrl
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to process image")
        }
      }
      
      reader.readAsDataURL(file)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload template")
    }
  }

  // Handle logo upload
  const handleLogoUpload = async (file: File) => {
    const validExtensions = [".png", ".jpg", ".jpeg"]
    const fileName = file.name.toLowerCase()
    if (!validExtensions.some((ext) => fileName.endsWith(ext))) {
      setError("Logo must be PNG or JPG")
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string)
      setLogoFile(file)
      setError("")
    }
    reader.readAsDataURL(file)
  }

  // Handle signature upload
  const handleSignatureUpload = async (file: File) => {
    const validExtensions = [".png", ".jpg", ".jpeg"]
    const fileName = file.name.toLowerCase()
    if (!validExtensions.some((ext) => fileName.endsWith(ext))) {
      setError("Signature must be PNG or JPG")
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      setSignaturePreview(e.target?.result as string)
      setSignatureFile(file)
      setError("")
    }
    reader.readAsDataURL(file)
  }

  // Generate preview certificate
  const generatePreview = async () => {
    if (!previewRow) return

    try {
      // Prepare logo and signature if uploaded
      let logo: CertificateLogo | undefined
      let signature: CertificateSignature | undefined
      
      if (logoFile && logoPreview) {
        const base64 = await fileToBase64(logoFile)
        logo = {
          data: base64,
          name: logoFile.name,
          width: 40,
          height: 40,
          x: undefined, // Center by default
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
          x: undefined, // Right side by default
          y: undefined, // Bottom by default
        }
      }

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
        setShowPreview(true)
        setError("")
      } else if (!useCustomTemplate && selectedTemplate) {
        // Generate from template
        const template = getTemplate(selectedTemplate)
        if (!template) return

        const currentStyles = getCurrentStyles()
        const doc = generateCertificate(
          template,
          previewRow,
          fieldMapping,
          currentStyles,
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
        const bytes = new Uint8Array(arrayBuffer)
        let binary = ""
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i])
        }
        const base64 = btoa(binary)
        setPreviewPdf(base64)
        setShowPreview(true)
        setError("")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate preview")
    }
  }

  // Generate all certificates
  const handleGenerateAll = async () => {
    const validation = validateFieldMapping(fieldMapping)
    if (!validation.valid) {
      setError(validation.errors.join(", "))
      return
    }

    const activeRows = state.rows.filter((_, idx) => !state.skippedRows.has(idx))
    if (activeRows.length === 0) {
      setError("No active recipients to generate certificates for")
      return
    }

    if (useCustomTemplate && !customTemplateFile) {
      setError("Please upload a custom template image")
      return
    }

    setGenerating(true)
    setError("")
    setGenerationProgress(0)

    try {
      let pdfFiles: PdfFile[] = []

      if (useCustomTemplate && customTemplateFile && customTemplatePreview) {
        // Generate from custom template
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
            x: namePosition.x + xOffset, // Apply offset adjustment
          },
        }

        // Update config
        setCertificateConfig({
          templateId: "custom",
          fieldMapping,
          customTemplate,
          customFieldPositions: fieldPositions,
        })

        pdfFiles = await generateCertificatesFromCustomTemplateBatch(
          customTemplate,
          activeRows,
          fieldMapping,
          fieldPositions,
        )
      } else {
        // Generate from template
        const template = getTemplate(selectedTemplate)
        if (!template) {
          throw new Error("Template not found")
        }

        // Prepare logo and signature if uploaded
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

        // Update config in context
        const currentStyles = getCurrentStyles()
        setCertificateConfig({
          templateId: selectedTemplate,
          fieldMapping,
          customStyles: currentStyles,
          organizationName: organizationName || undefined,
          defaultCertificateTitle: defaultCertificateTitle,
          defaultAwardMessage: defaultAwardMessage,
          defaultSubMessage: defaultSubMessage,
          defaultSignaturePosition: defaultSignaturePosition,
          logo: logo,
          signature: signature,
          customFontSizes: customFontSizes,
        })

        // Generate certificates
        pdfFiles = await generateCertificateBatch(
          selectedTemplate,
          activeRows,
          fieldMapping,
          currentStyles,
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

      setPdfFiles(pdfFiles)

      // Auto-match certificates to recipients by name
      const matches = new Map<number, string>()
      activeRows.forEach((row, originalIndex) => {
        const rowIndex = state.rows.indexOf(row)
        if (rowIndex >= 0) {
          const recipientName = getRecipientNameForMatching(row, fieldMapping)
          const matchedFile = pdfFiles.find((file) => {
            const fileName = file.name.toLowerCase().replace(/\.pdf$/, "").replace(/_/g, "")
            return fileName.includes(recipientName) || recipientName.includes(fileName.replace("certificate", ""))
          })
          if (matchedFile) {
            setPdfMatch(rowIndex, matchedFile.name)
            matches.set(rowIndex, matchedFile.name)
          }
        }
      })

      setGenerationProgress(100)
      setError("")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate certificates"
      setError(errorMessage)
      console.error("Certificate generation error:", err)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Create Certificates</h2>
        <p className="text-muted-foreground">
          Select a template or upload your own design (Google Slides/Canva). Map your Excel columns to certificate fields and generate personalized certificates.
        </p>
      </div>

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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column: Configuration */}
        <div className="space-y-6">
          {/* Custom Template Upload */}
          {useCustomTemplate ? (
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Upload Custom Template</h3>
              </div>
              
              {!customTemplatePreview ? (
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    e.currentTarget.classList.add("border-primary", "bg-primary/5")
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    e.currentTarget.classList.remove("border-primary", "bg-primary/5")
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    e.currentTarget.classList.remove("border-primary", "bg-primary/5")
                    const file = e.dataTransfer.files?.[0]
                    if (file) {
                      handleCustomTemplateUpload(file)
                    }
                  }}
                  onClick={() => {
                    document.getElementById("custom-template-upload")?.click()
                  }}
                >
                  <FileUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm font-medium mb-2">Upload your certificate template</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Export from Google Slides or Canva as PNG/JPG (recommended: 1920x1080px or similar)
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Drag and drop your image here, or click anywhere to browse
                  </p>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,image/png,image/jpeg,image/jpg"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleCustomTemplateUpload(file)
                      }
                      // Reset input value to allow re-uploading the same file
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
                      {/* Position Indicator Overlay - Visual Preview Box */}
                      {imageDimensions && customTemplatePreview && previewRow && fieldMapping.recipientName && (() => {
                        // Calculate the exact position to match jsPDF behavior (with offset applied)
                        const imageWidthMM = imageDimensions.width * 0.264583
                        const imageHeightMM = imageDimensions.height * 0.264583
                        const adjustedX = namePosition.x + xOffset // Apply offset for preview accuracy
                        const xPercent = (adjustedX / imageWidthMM) * 100
                        const yPercent = (namePosition.y / imageHeightMM) * 100
                        
                        // For center alignment, the X position is the center point
                        // For left alignment, X is the left edge
                        // For right alignment, X is the right edge
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
                            className="text-sm font-semibold whitespace-nowrap text-primary"
                            style={{
                              fontSize: `${Math.max(12, Math.min(namePosition.fontSize / 3, 24))}px`,
                              color: namePosition.fontColor,
                              fontWeight: namePosition.fontWeight,
                              textAlign: namePosition.align,
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
                      
                      {/* Draggable Handle - positioned at exact X/Y coordinate */}
                      {imageDimensions && customTemplatePreview && previewRow && fieldMapping.recipientName && (() => {
                        const imageWidthMM = imageDimensions.width * 0.264583
                        const imageHeightMM = imageDimensions.height * 0.264583
                        const adjustedX = namePosition.x + xOffset // Apply offset for preview accuracy
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
                      
                      {/* Help Text */}
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
                        <Label className="text-xs">X Position (mm from left)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={namePosition.x.toFixed(1)}
                          onChange={(e) => setNamePosition((prev) => ({ ...prev, x: Number.parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Y Position (mm from top)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={namePosition.y.toFixed(1)}
                          onChange={(e) => setNamePosition((prev) => ({ ...prev, y: Number.parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">X Offset Adjustment (mm)</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.1"
                            value={xOffset.toFixed(1)}
                            onChange={(e) => setXOffset(Number.parseFloat(e.target.value) || 0)}
                            placeholder="0.0"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setXOffset(-25)}
                            title="Apply -25mm offset (common fix)"
                          >
                            -25
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Adjust if text appears offset. Try -25 if text is too far right.
                        </p>
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
          ) : null}
          
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
                        <Label htmlFor="primary-color" className="text-xs mb-1 block">
                          Primary Color
                        </Label>
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
                        <Label htmlFor="secondary-color" className="text-xs mb-1 block">
                          Secondary Color
                        </Label>
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
                        <Label htmlFor="bg-color" className="text-xs mb-1 block">
                          Background Color
                        </Label>
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
                        <Label htmlFor="border-color" className="text-xs mb-1 block">
                          Border Color
                        </Label>
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
            <div className="grid grid-cols-2 gap-3">
              {CERTIFICATE_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template.id)
                    setCertificateTemplate(template.id)
                    // Reset custom styles when switching templates
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

          {/* Award Message & Branding */}
          {!useCustomTemplate && (
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Award Message & Branding</h3>
              </div>
              
              {/* Certificate Title */}
              <div>
                <Label htmlFor="certificate-title" className="mb-2 block">
                  Certificate Title
                </Label>
                <Select
                  value={fieldMapping.certificateTitle || "none"}
                  onValueChange={(value) => {
                    const newMapping = {
                      ...fieldMapping,
                      certificateTitle: value === "none" ? undefined : value,
                    }
                    setFieldMapping(newMapping)
                    setCertificateFieldMapping(newMapping)
                  }}
                >
                  <SelectTrigger id="certificate-title">
                    <SelectValue placeholder="Use default or select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Use default below</SelectItem>
                    {state.headers.map((header) => (
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

              {/* Award Message */}
              <div>
                <Label htmlFor="award-message" className="mb-2 block">
                  Award Message
                </Label>
                <Select
                  value={fieldMapping.awardMessage || "none"}
                  onValueChange={(value) => {
                    const newMapping = {
                      ...fieldMapping,
                      awardMessage: value === "none" ? undefined : value,
                    }
                    setFieldMapping(newMapping)
                    setCertificateFieldMapping(newMapping)
                  }}
                >
                  <SelectTrigger id="award-message">
                    <SelectValue placeholder="Use default or select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Use default below</SelectItem>
                    {state.headers.map((header) => (
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

              {/* Sub Message */}
              <div>
                <Label htmlFor="sub-message" className="mb-2 block">
                  Sub Message (Below Name)
                </Label>
                <Select
                  value={fieldMapping.subMessage || "none"}
                  onValueChange={(value) => {
                    const newMapping = {
                      ...fieldMapping,
                      subMessage: value === "none" ? undefined : value,
                    }
                    setFieldMapping(newMapping)
                    setCertificateFieldMapping(newMapping)
                  }}
                >
                  <SelectTrigger id="sub-message">
                    <SelectValue placeholder="Use default or select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Use default below</SelectItem>
                    {state.headers.map((header) => (
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

              {/* Signature Position */}
              <div>
                <Label htmlFor="signature-position" className="mb-2 block">
                  Signature Position/Title
                </Label>
                <Select
                  value={fieldMapping.signaturePosition || "none"}
                  onValueChange={(value) => {
                    const newMapping = {
                      ...fieldMapping,
                      signaturePosition: value === "none" ? undefined : value,
                    }
                    setFieldMapping(newMapping)
                    setCertificateFieldMapping(newMapping)
                  }}
                >
                  <SelectTrigger id="signature-position">
                    <SelectValue placeholder="Use default or select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Use default below</SelectItem>
                    {state.headers.map((header) => (
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
                      <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
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
                      <PenTool className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
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
                {selectedTemplate && getTemplate(selectedTemplate)?.fields.certificateNumber && (
                  <div>
                    <Label className="text-xs mb-1 block">Certificate Number</Label>
                    <Input
                      type="number"
                      value={customFontSizes.certificateNumber ?? getTemplate(selectedTemplate)?.fields.certificateNumber?.fontSize ?? 10}
                      onChange={(e) => {
                        setCustomFontSizes((prev) => ({
                          ...prev,
                          certificateNumber: Number.parseInt(e.target.value) || undefined,
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

          {/* Field Mapping */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Map Fields</h3>
            </div>
            <div className="space-y-4">
              {/* Recipient Name (Required) */}
              <div>
                <Label htmlFor="recipient-name" className="mb-2 block">
                  Recipient Name <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={fieldMapping.recipientName || "none"}
                  onValueChange={(value) => {
                    const newMapping = {
                      ...fieldMapping,
                      recipientName: value === "none" ? undefined : value,
                    }
                    setFieldMapping(newMapping)
                    setCertificateFieldMapping(newMapping)
                  }}
                >
                  <SelectTrigger id="recipient-name">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {state.headers.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Course Title (Optional) */}
              <div>
                <Label htmlFor="course-title" className="mb-2 block">
                  Course/Title (Optional)
                </Label>
                <Select
                  value={fieldMapping.courseTitle || "none"}
                  onValueChange={(value) => {
                    const newMapping = {
                      ...fieldMapping,
                      courseTitle: value === "none" ? undefined : value,
                    }
                    setFieldMapping(newMapping)
                    setCertificateFieldMapping(newMapping)
                  }}
                >
                  <SelectTrigger id="course-title">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {state.headers.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date (Optional) */}
              <div>
                <Label htmlFor="date" className="mb-2 block">
                  Date (Optional)
                </Label>
                <Select
                  value={fieldMapping.date || "none"}
                  onValueChange={(value) => {
                    const newMapping = {
                      ...fieldMapping,
                      date: value === "none" ? undefined : value,
                    }
                    setFieldMapping(newMapping)
                    setCertificateFieldMapping(newMapping)
                  }}
                >
                  <SelectTrigger id="date">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {state.headers.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Organization (Optional) */}
              <div>
                <Label htmlFor="organization" className="mb-2 block">
                  Organization/Issuer (Optional)
                </Label>
                <Select
                  value={fieldMapping.organization || "none"}
                  onValueChange={(value) => {
                    const newMapping = {
                      ...fieldMapping,
                      organization: value === "none" ? undefined : value,
                    }
                    setFieldMapping(newMapping)
                    setCertificateFieldMapping(newMapping)
                  }}
                >
                  <SelectTrigger id="organization">
                    <SelectValue placeholder="Select column or use default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Use default below</SelectItem>
                    {state.headers.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Default Organization Name */}
              <div>
                <Label htmlFor="org-name" className="mb-2 block">
                  Default Organization Name
                </Label>
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

          {/* Preview Button */}
          {previewRow && (
            <Button 
              onClick={generatePreview} 
              variant="outline" 
              className="w-full" 
              disabled={!fieldMapping.recipientName || (useCustomTemplate && !customTemplateFile)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Certificate
            </Button>
          )}
        </div>

        {/* Right Column: Preview & Actions */}
        <div className="space-y-6">
          {/* Certificate Preview */}
          {showPreview && previewPdf && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Certificate Preview</h3>
              <div className="border border-border rounded-lg overflow-hidden">
                <iframe
                  src={`data:application/pdf;base64,${previewPdf}`}
                  className="w-full h-[500px]"
                  title="Certificate Preview"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Preview for: {previewRow?.[fieldMapping.recipientName || ""] || "First recipient"}
              </p>
            </div>
          )}

          {/* Generation Status */}
          {generating && (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <h3 className="font-semibold">Generating Certificates...</h3>
              </div>
              <Progress value={generationProgress} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                Generating certificates for {state.rows.filter((_, idx) => !state.skippedRows.has(idx)).length}{" "}
                recipients
              </p>
            </div>
          )}

          {/* Success Message */}
          {!generating && state.pdfFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-green-500/10 border border-green-500/30 rounded-lg p-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-700">
                  {state.pdfFiles.length} Certificate{state.pdfFiles.length > 1 ? "s" : ""} Generated
                </h3>
              </div>
              <p className="text-sm text-green-600">
                Certificates have been generated and matched to recipients. You can continue to compose your email.
              </p>
            </motion.div>
          )}

          {/* Stats */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Recipients</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Recipients:</span>
                <span className="font-semibold">{state.rows.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Recipients:</span>
                <span className="font-semibold text-green-600">
                  {state.rows.filter((_, idx) => !state.skippedRows.has(idx)).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Skipped:</span>
                <span className="font-semibold text-amber-600">{state.skippedRows.size}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <div className="flex gap-2">
          {state.pdfFiles.length === 0 && (
            <Button
              onClick={handleGenerateAll}
              disabled={!fieldMapping.recipientName || generating || (useCustomTemplate && !customTemplateFile)}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate All Certificates
                </>
              )}
            </Button>
          )}
          {state.pdfFiles.length > 0 && (
            <Button
              onClick={() => setStep(3)}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
            >
              Continue to Compose
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

