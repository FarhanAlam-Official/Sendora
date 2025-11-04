/**
 * @fileoverview Step PDF Upload Component - PDF Certificate File Upload
 * @module components/step-pdf-upload
 * @description
 * This component implements PDF certificate upload for the email wizard:
 * - Drag-and-drop file upload interface
 * - Multiple PDF file handling
 * - File size and count validation
 * - Base64 conversion for storage and transmission
 * - Visual file list with remove functionality
 * - Skip option for sending without PDFs
 * 
 * Features:
 * - Drag-and-drop zone with visual feedback
 * - Click-to-browse alternative
 * - File validation (type, size, count)
 * - Uploaded file list with remove buttons
 * - Error handling with user-friendly messages
 * - Gradient styling with animated effects
 * - Skip option to proceed without PDFs
 * 
 * Validation Rules:
 * - File Type: Only .pdf files allowed
 * - Size Limit: 20MB per PDF (configurable)
 * - Count Limit: 250 PDFs maximum (configurable)
 * - Browser memory and email provider capacity warnings
 * 
 * @requires react
 * @requires framer-motion
 * @requires lucide-react
 * @requires @/components/ui/button
 * @requires @/components/ui/badge
 * @requires ./send-wizard-context
 */

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileUp, X, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSendWizard, type PdfFile } from "./send-wizard-context"

/**
 * Maximum file size per PDF in megabytes.
 * @constant
 * @type {number}
 */
const MAX_PDF_SIZE_MB = 20 // 20MB per PDF

/**
 * Maximum number of PDF files that can be uploaded.
 * @constant
 * @type {number}
 */
const MAX_PDF_COUNT = 250 // Maximum number of PDFs

/**
 * Step PDF Upload Component - PDF certificate upload wizard step.
 * 
 * This component provides a user-friendly interface for uploading PDF certificates:
 * - Prominent drag-and-drop zone with gradient styling
 * - File validation for type, size, and count
 * - Base64 conversion for data storage
 * - Uploaded file management
 * 
 * Upload Flow:
 * 1. User drags PDFs or clicks to browse
 * 2. Files are validated (type, size, count)
 * 3. Valid files are added to local state
 * 4. On continue, files are converted to base64
 * 5. Base64 data stored in wizard context
 * 6. Navigation to matching step
 * 
 * File Processing:
 * - Reads file as ArrayBuffer
 * - Converts to Uint8Array
 * - Converts bytes to binary string
 * - Encodes as base64 using btoa()
 * - Stores as PdfFile object (name, blob, size)
 * 
 * Validation Errors:
 * - "Only PDF files are supported" - Wrong file type
 * - "File exceeds maximum size" - File too large
 * - "Maximum PDF files allowed" - Too many files
 * 
 * User Interface:
 * - Gradient background with decorative blur elements
 * - Drag state visual feedback (border color, scale)
 * - Upload icon with hover animation
 * - File limit warnings
 * - Uploaded file list with remove buttons
 * - Success indicator (green checkmark)
 * - Error alert (red with icon)
 * 
 * Navigation Options:
 * - Back: Return to previous step
 * - Skip: Proceed without PDFs
 * - Continue: Convert and proceed to matching
 * 
 * @component
 * @returns {JSX.Element} PDF upload interface with drag-drop and validation
 * 
 * @example
 * // Used within SendWizard flow
 * <SendWizardProvider>
 *   <StepPdfUpload /> // Shows when currentStep === 2 (legacy flow)
 * </SendWizardProvider>
 */
export default function StepPdfUpload() {
  const { state, setStep, setPdfFiles } = useSendWizard()
  const [pdfs, setPdfs] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState("")

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files)
    let errorMessage = ""

    fileArray.forEach((file) => {
      if (!file.name.endsWith(".pdf")) {
        errorMessage = "Only PDF files are supported"
        return
      }

      // Check individual file size
      const fileSizeMB = file.size / (1024 * 1024)
      if (fileSizeMB > MAX_PDF_SIZE_MB) {
        errorMessage = `File "${file.name}" exceeds maximum size of ${MAX_PDF_SIZE_MB}MB`
        return
      }

      // Check total count
      if (pdfs.length + fileArray.length > MAX_PDF_COUNT) {
        errorMessage = `Maximum ${MAX_PDF_COUNT} PDF files allowed`
        return
      }
    })

    if (errorMessage) {
      setError(errorMessage)
      return
    }

    // All checks passed, add files
    setPdfs((prev) => [...prev, ...fileArray])
    setError("")
  }

  const removePdf = (idx: number) => {
    setPdfs((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleContinue = async () => {
    // Convert PDFs to base64 format
    const pdfData: PdfFile[] = await Promise.all(
      pdfs.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer()
        const bytes = new Uint8Array(arrayBuffer)
        let binary = ""
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i])
        }
        const base64 = btoa(binary)

        return {
          name: file.name,
          blob: base64,
          size: file.size,
        }
      }),
    )

    setPdfFiles(pdfData)
    setStep(3)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Upload PDF Certificates</h2>
        <p className="text-muted-foreground">
          Upload all certificate PDFs that you want to distribute. Files will be matched with recipient names in the next
          step.
        </p>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 dark:from-primary/20 dark:via-primary/10 dark:to-accent/20 border-2 border-primary/30 dark:border-primary/40 rounded-2xl p-8 shadow-2xl">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative">
          <p className="text-xs text-muted-foreground mb-4 text-center">
            Limits: Max {MAX_PDF_SIZE_MB}MB per file, {MAX_PDF_COUNT} files maximum
            <br />
            <span className="text-amber-600">Note: Total size limited by browser memory and email provider capacity</span>
          </p>
          
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              handleFiles(e.dataTransfer.files)
            }}
            onClick={() => document.getElementById("pdf-input")?.click()}
            className={`relative border-3 border-dashed rounded-xl p-16 text-center transition-all cursor-pointer group ${
              isDragging 
                ? "border-primary bg-primary/20 scale-[1.02] shadow-xl" 
                : "border-primary/50 hover:border-primary bg-primary/5 hover:bg-primary/10 hover:scale-[1.01] hover:shadow-lg"
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <FileUp className="w-16 h-16 text-primary relative z-10 group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  Drag and drop PDF files here
                </p>
                <p className="text-sm text-muted-foreground">
                  Or click to browse
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Badge variant="outline" className="font-semibold">PDF</Badge>
                </div>
              </div>
            </div>
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
              id="pdf-input"
            />
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-600 text-sm">{error}</span>
        </motion.div>
      )}

      {pdfs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-left">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-600">{pdfs.length} PDF files uploaded</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {pdfs.map((pdf, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm truncate">{pdf.name}</span>
                <button
                  onClick={() => removePdf(idx)}
                  className="text-muted-foreground hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <div className="flex gap-2">
          {pdfs.length === 0 && (
            <Button variant="outline" onClick={() => setStep(4)} className="bg-transparent">
              Skip (No PDFs)
            </Button>
          )}
          <Button
            onClick={handleContinue}
            disabled={pdfs.length === 0}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
          >
            {pdfs.length === 0 ? "Upload PDFs to Continue" : "Continue to Matching"}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

