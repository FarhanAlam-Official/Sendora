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
  Info,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import { CustomTemplateInfoModal } from "@/components/custom-template-info-modal"
import type { PdfFile, FileRow } from "./send-wizard-context"
import type { CertificateStyles } from "@/types/certificate"
import { notifications } from "@/lib/notifications"
import {
  getAvailableFonts,
  loadFontFromJsPDFFile,
  removeCustomFont,
  getRegisteredFonts,
} from "@/lib/font-manager"

export default function StepCertificateCreate() {
  const {
    state,
    setStep,
    setPdfFiles,
    setPdfMatch,
    removePdfMatch,
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
    fontFamily: "helvetica" as string, // Allow any font name (built-in or custom)
    fontWeight: "bold" as "normal" | "bold",
    italic: false,
    underline: false,
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
  // Font style overrides for template-based certificates (fontFamily, italic, underline per field)
  const [customFontStyles, setCustomFontStyles] = useState<{
    [key: string]: {
      fontFamily?: string // Allow any font name (built-in or custom)
      italic?: boolean
      underline?: boolean
    }
  }>({})
  const [availableFonts, setAvailableFonts] = useState(getAvailableFonts())
  const [showFontUpload, setShowFontUpload] = useState(false)
  const [uploadingFont, setUploadingFont] = useState(false)
  const [showTemplateInfo, setShowTemplateInfo] = useState(false)

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

  // Refresh available fonts when custom fonts change
  useEffect(() => {
    const refreshFonts = () => {
      setAvailableFonts(getAvailableFonts())
    }
    refreshFonts()
    // Refresh fonts periodically to catch changes from other tabs/components
    const interval = setInterval(refreshFonts, 1000)
    return () => clearInterval(interval)
  }, [])

  // Handle font file upload
  const handleFontUpload = async (file: File) => {
    const fileName = file.name.toLowerCase()
    
    // Accept jsPDF font files (.js) or text files
    if (!fileName.endsWith(".js") && !fileName.endsWith(".txt") && !fileName.endsWith(".json")) {
      setError("Please upload a font file in jsPDF format (.js file from jsPDF font converter)")
      notifications.showError({
        title: 'Invalid font file',
        description: 'Please upload a .js file generated by jsPDF font converter.',
      })
      return
    }

    setUploadingFont(true)
    setError("")

    try {
      const fontName = await loadFontFromJsPDFFile(file)
      setAvailableFonts(getAvailableFonts())
      notifications.showSuccess({
        title: 'Font uploaded successfully!',
        description: `Font "${fontName}" is now available for use.`,
      })
      setShowFontUpload(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load font file"
      setError(errorMessage)
      notifications.showError({
        title: 'Font upload failed',
        description: errorMessage,
      })
    } finally {
      setUploadingFont(false)
    }
  }

  // Handle font removal
  const handleRemoveFont = (fontName: string) => {
    removeCustomFont(fontName)
    setAvailableFonts(getAvailableFonts())
    notifications.showSuccess({
      title: 'Font removed',
      description: `Font "${fontName}" has been removed.`,
    })
  }

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

  // Get template with custom font styles applied
  const getTemplateWithCustomFonts = () => {
    const template = getTemplate(selectedTemplate)
    if (!template) return null

    // Deep clone the template
    const clonedTemplate = JSON.parse(JSON.stringify(template)) as typeof template

    // Apply custom font styles to each field
    Object.keys(customFontStyles).forEach((fieldKey) => {
      const field = fieldKey as keyof typeof clonedTemplate.fields
      const customStyle = customFontStyles[fieldKey]
      const fieldValue = clonedTemplate.fields[field]
      
      // Skip if field is an array (like customFields) or doesn't exist
      if (fieldValue && !Array.isArray(fieldValue) && customStyle) {
        if (customStyle.fontFamily !== undefined) {
          fieldValue.fontFamily = customStyle.fontFamily
        }
        if (customStyle.italic !== undefined) {
          fieldValue.italic = customStyle.italic
        }
        if (customStyle.underline !== undefined) {
          fieldValue.underline = customStyle.underline
        }
      }
    })

    return clonedTemplate
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
        const template = getTemplateWithCustomFonts()
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
      const errorMsg = validation.errors.join(", ")
      setError(errorMsg)
      notifications.showError({
        title: 'Validation error',
        description: errorMsg,
      })
      return
    }

    const activeRows = state.rows.filter((_, idx) => !state.skippedRows.has(idx))
    if (activeRows.length === 0) {
      const errorMsg = "No active recipients to generate certificates for"
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
        const template = getTemplateWithCustomFonts()
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
          template, // Pass the template with custom fonts
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
      
      // Show success notification
      const generatedCount = pdfFiles.length
      notifications.showSuccess({
        title: 'Certificates generated successfully!',
        description: `Generated ${generatedCount} certificate${generatedCount > 1 ? 's' : ''} for your recipients.`,
        duration: 5000,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate certificates"
      setError(errorMessage)
      console.error("Certificate generation error:", err)
      notifications.showError({
        title: 'Certificate generation failed',
        description: errorMessage,
        duration: 5000,
      })
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

      <div className="space-y-6">
        {/* Template Selection (Top - Full Width) */}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

        {/* Preview Section (Middle - Full Width) */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Certificate Preview</h3>
            {previewRow && (
              <Button 
                onClick={generatePreview} 
                variant="outline" 
                size="sm"
                disabled={!fieldMapping.recipientName || (useCustomTemplate && !customTemplateFile)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Generate Preview
              </Button>
            )}
          </div>
          {showPreview && previewPdf ? (
            <div className="border border-border rounded-lg overflow-hidden">
              <iframe
                src={`data:application/pdf;base64,${previewPdf}`}
                className="w-full h-[600px]"
                title="Certificate Preview"
              />
            </div>
          ) : (
            <div className="border border-border rounded-lg p-12 text-center">
              <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Click "Generate Preview" to see your certificate</p>
            </div>
          )}
          {showPreview && previewPdf && (
            <p className="text-xs text-muted-foreground mt-2">
              Preview for: {previewRow?.[fieldMapping.recipientName || ""] || "First recipient"}
            </p>
          )}
        </div>

        {/* Custom Template Full Width Preview */}
        {useCustomTemplate && customTemplatePreview && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Template Preview</h3>
              <Button
                variant="destructive"
                size="sm"
                className="ml-auto"
                onClick={() => {
                  setCustomTemplateFile(null)
                  setCustomTemplatePreview(null)
                  setImageDimensions(null)
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Remove Template
              </Button>
            </div>
            <div className="relative border border-border rounded-lg overflow-hidden bg-muted/20 min-h-[500px] max-h-[700px] flex items-center justify-center p-4">
              {/* Image Preview with Position Overlay */}
              <div 
                className="relative w-full h-full cursor-crosshair flex items-center justify-center"
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
                  className="max-w-full max-h-[650px] w-auto h-auto object-contain pointer-events-none"
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
                  // for the typical display scale. Reduced by ~15% to better match actual preview.
                  const fontSizePt = namePosition.fontSize
                  // Convert pt to px: accounting for display scale to match PDF preview
                  const fontSizePx = Math.max(10, Math.min(fontSizePt * 0.55, 50))
                  
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
                
                <div className="absolute bottom-2 left-2 right-2 pointer-events-none z-20">
                  <div className="bg-background/90 backdrop-blur-sm rounded-lg p-2 text-xs text-muted-foreground text-center">
                    💡 Click on the image to position the name, or drag the <span className="text-primary font-semibold">●</span> handle
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Name Position Settings for Custom Template - Full Width */}
        {useCustomTemplate && customTemplatePreview && (
          <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-primary/10">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Name Position Settings</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Adjust the position manually or use the preview above
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">X Position (mm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={namePosition.x.toFixed(1)}
                  onChange={(e) => setNamePosition((prev) => ({ ...prev, x: Number.parseFloat(e.target.value) || 0 }))}
                  className="h-10"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Y Position (mm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={namePosition.y.toFixed(1)}
                  onChange={(e) => setNamePosition((prev) => ({ ...prev, y: Number.parseFloat(e.target.value) || 0 }))}
                  className="h-10"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">X Offset (mm)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    value={xOffset.toFixed(1)}
                    onChange={(e) => setXOffset(Number.parseFloat(e.target.value) || 0)}
                    className="h-10"
                  />
                  <Button variant="outline" size="sm" onClick={() => setXOffset(-25)} className="h-10 px-4">
                    -25
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls Section (Bottom - Two Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Custom Template Upload - Always show when in custom mode */}
            {useCustomTemplate && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Upload Custom Template</h3>
                  <CustomTemplateInfoModal
                    open={showTemplateInfo}
                    onOpenChange={setShowTemplateInfo}
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full border-2 hover:border-primary hover:bg-primary/10 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowTemplateInfo(true)
                        }}
                        title="Learn about custom templates"
                      >
                        <Info className="h-4 w-4 text-primary" />
                      </Button>
                    }
                  />
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
                        e.target.value = ""
                      }}
                      className="hidden"
                      id="custom-template-upload"
                    />
                  </div>
                ) : (
                  <div className="border border-border rounded-lg p-4 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Template uploaded</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCustomTemplateFile(null)
                          setCustomTemplatePreview(null)
                          setImageDimensions(null)
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Field Mapping - Only Name for Custom Template */}
            {useCustomTemplate && (
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Map Fields</h3>
                </div>
                {!customTemplatePreview && (
                  <p className="text-sm text-muted-foreground mb-4">Upload a template to map fields</p>
                )}
                <div className={`flex-1 flex flex-col justify-center ${!customTemplatePreview ? 'opacity-50 pointer-events-none' : ''}`}>
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
                    disabled={!customTemplatePreview}
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
              </div>
            )}

            {/* Field Mapping - Regular Template */}
            {!useCustomTemplate && (
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
            )}

            {/* Recipients Card - Below Map Fields for Custom Template */}
            {useCustomTemplate && (
              <div className="bg-card border border-border rounded-lg p-6 flex flex-col min-h-[280px]">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Recipients</h3>
                </div>
                <div className="flex-1 flex flex-col justify-center space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Total Recipients</span>
                    <span className="font-semibold text-base">{state.rows.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Active Recipients</span>
                    <span className="font-semibold text-base text-green-600">
                      {state.rows.filter((_, idx) => !state.skippedRows.has(idx)).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Skipped</span>
                    <span className="font-semibold text-base text-amber-600">{state.skippedRows.size}</span>
                  </div>
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

          </div>

          {/* Right Column */}
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

            {/* Font Settings for Custom Template - Always show when in custom mode */}
            {useCustomTemplate && (
              <div className="bg-card border border-border rounded-lg p-6 min-h-[360px] flex flex-col">
                <div className="flex items-center gap-2 mb-5">
                  <Settings className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Font Settings</h3>
                </div>
                {!customTemplatePreview ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Upload a template to configure font settings</p>
                  </div>
                ) : (
                  <div className="flex-1 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Font Size</Label>
                        <Input
                          type="number"
                          value={namePosition.fontSize}
                          onChange={(e) => setNamePosition((prev) => ({ ...prev, fontSize: Number.parseInt(e.target.value) || 32 }))}
                          className="h-10"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Text Color</Label>
                        <Input
                          type="color"
                          value={namePosition.fontColor}
                          onChange={(e) => setNamePosition((prev) => ({ ...prev, fontColor: e.target.value }))}
                          className="h-10 w-full cursor-pointer"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Font Weight</Label>
                        <Select
                          value={namePosition.fontWeight}
                          onValueChange={(value: "normal" | "bold") => setNamePosition((prev) => ({ ...prev, fontWeight: value }))}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="bold">Bold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Alignment</Label>
                        <Select
                          value={namePosition.align}
                          onValueChange={(value: "left" | "center" | "right") => setNamePosition((prev) => ({ ...prev, align: value }))}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-sm font-medium mb-2 block">Font Family</Label>
                        <Select
                          value={namePosition.fontFamily}
                          onValueChange={(value: string) => setNamePosition((prev) => ({ ...prev, fontFamily: value }))}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableFonts.map((font) => (
                              <SelectItem key={font.value} value={font.value}>
                                {font.label} {font.isCustom && "⭐"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-6 pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="italic-checkbox-custom"
                          checked={namePosition.italic}
                          onCheckedChange={(checked) => setNamePosition((prev) => ({ ...prev, italic: checked === true }))}
                        />
                        <Label htmlFor="italic-checkbox-custom" className="text-sm cursor-pointer font-medium">
                          Italic
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="underline-checkbox-custom"
                          checked={namePosition.underline}
                          onCheckedChange={(checked) => setNamePosition((prev) => ({ ...prev, underline: checked === true }))}
                        />
                        <Label htmlFor="underline-checkbox-custom" className="text-sm cursor-pointer font-medium">
                          Underline
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Font Management */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Custom Fonts</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFontUpload(!showFontUpload)}
                >
                  {showFontUpload ? <X className="w-4 h-4 mr-2" /> : <FileUp className="w-4 h-4 mr-2" />}
                  {showFontUpload ? "Cancel" : "Upload Font"}
                </Button>
              </div>
              
              {showFontUpload && (
                <div className="mb-4 p-4 border border-border rounded-lg bg-muted/50">
                  <Label className="text-sm font-semibold mb-2 block">Upload Custom Font</Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Upload a font file converted using{" "}
                    <a
                      href="https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      jsPDF Font Converter
                    </a>
                    . First convert your TTF file, then upload the generated .js file.
                  </p>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept=".js,.txt,.json"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFontUpload(file)
                        e.target.value = ""
                      }}
                      className="hidden"
                      id="font-upload"
                      disabled={uploadingFont}
                    />
                    <label htmlFor="font-upload" className={`cursor-pointer ${uploadingFont ? "opacity-50" : ""}`}>
                      <FileUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {uploadingFont ? "Uploading..." : "Click to upload font file"}
                      </p>
                      <p className="text-xs text-muted-foreground">.js file from jsPDF font converter</p>
                    </label>
                  </div>
                </div>
              )}
              
              {getRegisteredFonts().length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold mb-2 block">Uploaded Fonts</Label>
                  {getRegisteredFonts().map((fontName) => (
                    <div key={fontName} className="flex items-center justify-between p-2 border border-border rounded">
                      <span className="text-sm">{fontName}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFont(fontName)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Font Style Controls */}
            {!useCustomTemplate && (
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Font Styles</h3>
                </div>
                <div className="space-y-4">
                  {selectedTemplate && getTemplate(selectedTemplate)?.fields.certificateTitle && (
                    <div className="border-b border-border pb-4">
                      <Label className="text-sm font-semibold mb-2 block">Certificate Title</Label>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs mb-1 block">Font Family</Label>
                          <Select
                            value={customFontStyles.certificateTitle?.fontFamily || getTemplate(selectedTemplate)?.fields.certificateTitle?.fontFamily || "helvetica"}
                            onValueChange={(value: string) => {
                              setCustomFontStyles((prev) => ({
                                ...prev,
                                certificateTitle: { ...prev.certificateTitle, fontFamily: value },
                              }))
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableFonts.map((font) => (
                                <SelectItem key={font.value} value={font.value}>
                                  {font.label} {font.isCustom && "⭐"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="cert-title-italic"
                            checked={customFontStyles.certificateTitle?.italic ?? getTemplate(selectedTemplate)?.fields.certificateTitle?.italic ?? false}
                            onCheckedChange={(checked) => {
                              setCustomFontStyles((prev) => ({
                                ...prev,
                                certificateTitle: { ...prev.certificateTitle, italic: checked === true },
                              }))
                            }}
                          />
                          <Label htmlFor="cert-title-italic" className="text-xs cursor-pointer">Italic</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="cert-title-underline"
                            checked={customFontStyles.certificateTitle?.underline ?? getTemplate(selectedTemplate)?.fields.certificateTitle?.underline ?? false}
                            onCheckedChange={(checked) => {
                              setCustomFontStyles((prev) => ({
                                ...prev,
                                certificateTitle: { ...prev.certificateTitle, underline: checked === true },
                              }))
                            }}
                          />
                          <Label htmlFor="cert-title-underline" className="text-xs cursor-pointer">Underline</Label>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedTemplate && getTemplate(selectedTemplate)?.fields.awardMessage && (
                    <div className="border-b border-border pb-4">
                      <Label className="text-sm font-semibold mb-2 block">Award Message</Label>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs mb-1 block">Font Family</Label>
                          <Select
                            value={customFontStyles.awardMessage?.fontFamily || getTemplate(selectedTemplate)?.fields.awardMessage?.fontFamily || "helvetica"}
                            onValueChange={(value: string) => {
                              setCustomFontStyles((prev) => ({
                                ...prev,
                                awardMessage: { ...prev.awardMessage, fontFamily: value },
                              }))
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableFonts.map((font) => (
                                <SelectItem key={font.value} value={font.value}>
                                  {font.label} {font.isCustom && "⭐"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="award-msg-italic"
                            checked={customFontStyles.awardMessage?.italic ?? getTemplate(selectedTemplate)?.fields.awardMessage?.italic ?? false}
                            onCheckedChange={(checked) => {
                              setCustomFontStyles((prev) => ({
                                ...prev,
                                awardMessage: { ...prev.awardMessage, italic: checked === true },
                              }))
                            }}
                          />
                          <Label htmlFor="award-msg-italic" className="text-xs cursor-pointer">Italic</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="award-msg-underline"
                            checked={customFontStyles.awardMessage?.underline ?? getTemplate(selectedTemplate)?.fields.awardMessage?.underline ?? false}
                            onCheckedChange={(checked) => {
                              setCustomFontStyles((prev) => ({
                                ...prev,
                                awardMessage: { ...prev.awardMessage, underline: checked === true },
                              }))
                            }}
                          />
                          <Label htmlFor="award-msg-underline" className="text-xs cursor-pointer">Underline</Label>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedTemplate && getTemplate(selectedTemplate)?.fields.recipientName && (
                    <div className="border-b border-border pb-4">
                      <Label className="text-sm font-semibold mb-2 block">Recipient Name</Label>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs mb-1 block">Font Family</Label>
                          <Select
                            value={customFontStyles.recipientName?.fontFamily || getTemplate(selectedTemplate)?.fields.recipientName?.fontFamily || "helvetica"}
                            onValueChange={(value: string) => {
                              setCustomFontStyles((prev) => ({
                                ...prev,
                                recipientName: { ...prev.recipientName, fontFamily: value },
                              }))
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableFonts.map((font) => (
                                <SelectItem key={font.value} value={font.value}>
                                  {font.label} {font.isCustom && "⭐"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="recipient-name-italic"
                            checked={customFontStyles.recipientName?.italic ?? getTemplate(selectedTemplate)?.fields.recipientName?.italic ?? false}
                            onCheckedChange={(checked) => {
                              setCustomFontStyles((prev) => ({
                                ...prev,
                                recipientName: { ...prev.recipientName, italic: checked === true },
                              }))
                            }}
                          />
                          <Label htmlFor="recipient-name-italic" className="text-xs cursor-pointer">Italic</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="recipient-name-underline"
                            checked={customFontStyles.recipientName?.underline ?? getTemplate(selectedTemplate)?.fields.recipientName?.underline ?? false}
                            onCheckedChange={(checked) => {
                              setCustomFontStyles((prev) => ({
                                ...prev,
                                recipientName: { ...prev.recipientName, underline: checked === true },
                              }))
                            }}
                          />
                          <Label htmlFor="recipient-name-underline" className="text-xs cursor-pointer">Underline</Label>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedTemplate && getTemplate(selectedTemplate)?.fields.subMessage && (
                    <div className="border-b border-border pb-4">
                      <Label className="text-sm font-semibold mb-2 block">Sub Message</Label>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs mb-1 block">Font Family</Label>
                          <Select
                            value={customFontStyles.subMessage?.fontFamily || getTemplate(selectedTemplate)?.fields.subMessage?.fontFamily || "helvetica"}
                            onValueChange={(value: string) => {
                              setCustomFontStyles((prev) => ({
                                ...prev,
                                subMessage: { ...prev.subMessage, fontFamily: value },
                              }))
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableFonts.map((font) => (
                                <SelectItem key={font.value} value={font.value}>
                                  {font.label} {font.isCustom && "⭐"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="sub-msg-italic"
                            checked={customFontStyles.subMessage?.italic ?? getTemplate(selectedTemplate)?.fields.subMessage?.italic ?? false}
                            onCheckedChange={(checked) => {
                              setCustomFontStyles((prev) => ({
                                ...prev,
                                subMessage: { ...prev.subMessage, italic: checked === true },
                              }))
                            }}
                          />
                          <Label htmlFor="sub-msg-italic" className="text-xs cursor-pointer">Italic</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="sub-msg-underline"
                            checked={customFontStyles.subMessage?.underline ?? getTemplate(selectedTemplate)?.fields.subMessage?.underline ?? false}
                            onCheckedChange={(checked) => {
                              setCustomFontStyles((prev) => ({
                                ...prev,
                                subMessage: { ...prev.subMessage, underline: checked === true },
                              }))
                            }}
                          />
                          <Label htmlFor="sub-msg-underline" className="text-xs cursor-pointer">Underline</Label>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedTemplate && getTemplate(selectedTemplate)?.fields.courseTitle && (
                    <div className="border-b border-border pb-4">
                      <Label className="text-sm font-semibold mb-2 block">Course Title</Label>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs mb-1 block">Font Family</Label>
                          <Select
                            value={customFontStyles.courseTitle?.fontFamily || getTemplate(selectedTemplate)?.fields.courseTitle?.fontFamily || "helvetica"}
                            onValueChange={(value: string) => {
                              setCustomFontStyles((prev) => ({
                                ...prev,
                                courseTitle: { ...prev.courseTitle, fontFamily: value },
                              }))
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableFonts.map((font) => (
                                <SelectItem key={font.value} value={font.value}>
                                  {font.label} {font.isCustom && "⭐"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="course-title-italic"
                            checked={customFontStyles.courseTitle?.italic ?? getTemplate(selectedTemplate)?.fields.courseTitle?.italic ?? false}
                            onCheckedChange={(checked) => {
                              setCustomFontStyles((prev) => ({
                                ...prev,
                                courseTitle: { ...prev.courseTitle, italic: checked === true },
                              }))
                            }}
                          />
                          <Label htmlFor="course-title-italic" className="text-xs cursor-pointer">Italic</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="course-title-underline"
                            checked={customFontStyles.courseTitle?.underline ?? getTemplate(selectedTemplate)?.fields.courseTitle?.underline ?? false}
                            onCheckedChange={(checked) => {
                              setCustomFontStyles((prev) => ({
                                ...prev,
                                courseTitle: { ...prev.courseTitle, underline: checked === true },
                              }))
                            }}
                          />
                          <Label htmlFor="course-title-underline" className="text-xs cursor-pointer">Underline</Label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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

          </div>
        </div>
      </div>

      {/* Certificate Matching Preview */}
      {state.pdfFiles.length > 0 && state.rows.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg mb-1">Certificate Matching Preview</h3>
              <p className="text-sm text-muted-foreground">
                Review and adjust certificate assignments. You can skip recipients or manually change matches.
              </p>
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {state.rows.slice(0, 50).map((row, idx) => {
              const nameField = state.mapping.name || fieldMapping.recipientName || ""
              const emailField = state.mapping.email || ""
              const currentMatch = state.pdfMatches.get(idx) || "__none__"
              const isSkipped = state.skippedRows.has(idx)
              const hasNoCert = currentMatch === "__none__"

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${
                    isSkipped ? "bg-red-50/50 border-red-200 opacity-60" : "bg-muted/50 border-border"
                  }`}
                >
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <Checkbox
                      id={`skip-cert-${idx}`}
                      checked={isSkipped}
                      onCheckedChange={(checked) => {
                        const shouldSkip = checked === true
                        if (shouldSkip) {
                          skipRow(idx)
                          // Remove certificate match when skipping
                          removePdfMatch(idx)
                        } else {
                          unskipRow(idx)
                        }
                      }}
                      className="w-6 h-6 border-2 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground cursor-pointer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${isSkipped ? "line-through text-muted-foreground" : ""}`}>
                      {row[nameField] || "Unknown"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{row[emailField] || "No email"}</p>
                    {hasNoCert && !isSkipped && (
                      <p className="text-xs text-amber-600 mt-1">⚠️ No certificate matched</p>
                    )}
                    {isSkipped && (
                      <p className="text-xs text-red-600 mt-1">⏭️ Skipped - will not receive email</p>
                    )}
                  </div>
                  <Select
                    value={currentMatch}
                    onValueChange={(value) => {
                      if (value && value !== "__none__") {
                        setPdfMatch(idx, value)
                        // Unskip if they match a certificate
                        unskipRow(idx)
                      } else {
                        removePdfMatch(idx)
                      }
                    }}
                    disabled={isSkipped}
                  >
                    <SelectTrigger className="w-64" disabled={isSkipped}>
                      <SelectValue placeholder="Select certificate..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No Certificate</SelectItem>
                      {state.pdfFiles.map((pdf) => (
                        <SelectItem key={pdf.name} value={pdf.name}>
                          {pdf.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {currentMatch && currentMatch !== "__none__" && !isSkipped && (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  )}
                </motion.div>
              )
            })}
            {state.rows.length > 50 && (
              <p className="text-xs text-muted-foreground text-center">
                ... and {state.rows.length - 50} more recipients
              </p>
            )}
          </div>

          {/* Stats and Warnings */}
          {(() => {
            const activeRows = state.rows.filter((_, idx) => !state.skippedRows.has(idx))
            const matchedCount = Array.from(state.pdfMatches.entries()).filter(
              ([idx, v]) => v && v !== "__none__" && !state.skippedRows.has(idx)
            ).length
            const unmatchedCount = activeRows.length - matchedCount

            return (
              <>
                {unmatchedCount > 0 && state.pdfFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <span className="text-yellow-600 text-sm font-medium">
                        {unmatchedCount} recipient{unmatchedCount > 1 ? "s" : ""} without certificate match
                      </span>
                    </div>
                    <p className="text-xs text-yellow-700 ml-7">
                      You can manually match a certificate or skip these recipients by checking the box. Skipped recipients will not
                      receive an email.
                    </p>
                  </motion.div>
                )}

                {state.skippedRows.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-2"
                  >
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-600 text-sm">
                      {state.skippedRows.size} recipient{state.skippedRows.size > 1 ? "s" : ""} will be skipped (no email sent)
                    </span>
                  </motion.div>
                )}

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{matchedCount}</p>
                    <p className="text-xs text-muted-foreground">Matched</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600">{unmatchedCount}</p>
                    <p className="text-xs text-muted-foreground">Unmatched</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{state.skippedRows.size}</p>
                    <p className="text-xs text-muted-foreground">Skipped</p>
                  </div>
                </div>
              </>
            )
          })()}
        </div>
      )}

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

