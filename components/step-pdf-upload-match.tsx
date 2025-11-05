/**
 * @fileoverview Step PDF Upload Match Component - Combined Upload and Matching
 * @module components/step-pdf-upload-match
 * @description
 * This component implements Step 2 of the modern email wizard, combining:
 * - PDF certificate upload (drag-drop or browse)
 * - Automatic intelligent matching with recipients
 * - Manual match adjustment and skip functionality
 * - Certificate creation mode toggle
 * - Advanced settings for certificate link configuration
 * - Real-time match confidence display
 * 
 * Features:
 * - Dual mode: Upload PDFs or Create Certificates
 * - Auto-matching using Phase 3 fuzzy algorithm
 * - Confidence badges (High/Medium/Low)
 * - Manual PDF assignment per recipient
 * - Skip recipients without PDFs
 * - Advanced settings dialog for certificate links
 * - File validation (size, count, type)
 * - Match preview table with first 20 recipients
 * 
 * Modes:
 * - Upload Mode: Traditional PDF upload and matching
 * - Create Mode: Generate certificates using templates (StepCertificateCreate)
 * 
 * @requires react
 * @requires framer-motion
 * @requires lucide-react
 * @requires @/components/ui/button
 * @requires @/components/ui/badge
 * @requires @/components/ui/select
 * @requires @/components/ui/checkbox
 * @requires @/components/ui/dialog
 * @requires @/components/ui/input
 * @requires @/components/ui/label
 * @requires @/components/ui/tabs
 * @requires ./send-wizard-context
 * @requires ./step-certificate-create
 * @requires @/lib/pdf-utils
 * @requires ./confidence-badge
 */

"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { FileUp, X, CheckCircle, AlertCircle, Settings, Save, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSendWizard, type PdfFile } from "./send-wizard-context"
import StepCertificateCreate from "./step-certificate-create"
import { findBestMatchingPDFWithConfidence } from "@/lib/pdf-utils"
import { ConfidenceBadge } from "./confidence-badge"

/**
 * Maximum file size per PDF in megabytes.
 * @constant
 * @type {number}
 */
const MAX_PDF_SIZE_MB = 20

/**
 * Maximum number of PDF files that can be uploaded.
 * @constant
 * @type {number}
 */
const MAX_PDF_COUNT = 250

/**
 * Step PDF Upload Match Component - Modern combined upload and matching step.
 * 
 * This component unifies PDF upload and matching into a single, streamlined step:
 * - Mode selector (Upload PDFs vs Create Certificates)
 * - Drag-and-drop PDF upload with validation
 * - Automatic fuzzy matching on upload
 * - Manual match adjustment with confidence scores
 * - Skip functionality for recipients without PDFs
 * - Advanced certificate link settings
 * 
 * Component Flow:
 * 1. User selects mode (Upload or Create)
 * 2. If Upload: Upload PDFs via drag-drop or browse
 * 3. PDFs auto-match to recipients by name
 * 4. User reviews matches with confidence badges
 * 5. Manual adjustments or skip as needed
 * 6. Advanced settings for certificate link behavior
 * 7. Continue to mapping step
 * 
 * Auto-Matching Process:
 * - Triggered by useEffect when PDFs are uploaded
 * - Uses findBestMatchingPDFWithConfidence algorithm
 * - Matches based on recipient name field
 * - Stores confidence scores and match types
 * - Updates wizard context with PDF matches
 * - Displays success/warning alerts
 * 
 * Confidence Display:
 * - High (Green): >= 80% confidence
 * - Medium (Yellow): >= 60% confidence
 * - Low (Red): < 60% confidence, needs review
 * - Badge shows match type (exact, fuzzy, partial, token)
 * 
 * Manual Matching:
 * - Dropdown per recipient to select PDF
 * - "No PDF" option to clear match
 * - Unskips recipient when PDF is assigned
 * - Removes match when skipped
 * 
 * Skip Functionality:
 * - Checkbox per recipient to skip
 * - Automatically removes PDF match when skipped
 * - Updates skippedRows in wizard context
 * - Excluded from email sending
 * 
 * Advanced Settings:
 * - Certificate link field mapping
 * - Enable/disable certificate link placeholder
 * - Toggle embedding vs linking
 * - Persisted across wizard navigation
 * 
 * @component
 * @returns {JSX.Element} Combined upload/match interface with mode toggle
 * 
 * @example
 * // Used within SendWizard flow
 * <SendWizardProvider>
 *   <StepPdfUploadMatch /> // Shows when currentStep === 2
 * </SendWizardProvider>
 */
export default function StepPdfUploadMatch() {
  const { state, setStep, setPdfFiles, setPdfMatch, removePdfMatch, skipRow, unskipRow, setMapping, setCertificateLinkEnabled, setCertificateMode } = useSendWizard()
  const [pdfs, setPdfs] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState("")
  const [autoMatched, setAutoMatched] = useState(0)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [matchConfidences, setMatchConfidences] = useState<Map<number, { confidence: number; needsReview: boolean; matchType: string }>>(new Map())
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-match PDFs when they're uploaded using Phase 3 matching
  useEffect(() => {
    if (pdfs.length > 0 && state.rows.length > 0 && state.mapping.name) {
      let matched = 0
      const newConfidences = new Map<number, { confidence: number; needsReview: boolean; matchType: string }>()
      
      state.rows.forEach((row, idx) => {
        if (state.skippedRows.has(idx)) return

        const recipientName = row[state.mapping.name || ""]
        
        if (!recipientName) return

        // Use improved matching with confidence scoring (Phase 3)
        const matchResult = findBestMatchingPDFWithConfidence(recipientName, pdfs)
        
        if (matchResult) {
          setPdfMatch(idx, matchResult.file.name)
          newConfidences.set(idx, {
            confidence: matchResult.confidence,
            needsReview: matchResult.needsReview,
            matchType: matchResult.matchType,
          })
          matched++
        }
      })
      
      setMatchConfidences(newConfidences)
      setAutoMatched(matched)
    }
  }, [pdfs, state.rows.length, state.mapping.name])

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files)
    let errorMessage = ""

    fileArray.forEach((file) => {
      if (!file.name.endsWith(".pdf")) {
        errorMessage = "Only PDF files are supported"
        return
      }

      const fileSizeMB = file.size / (1024 * 1024)
      if (fileSizeMB > MAX_PDF_SIZE_MB) {
        errorMessage = `File "${file.name}" exceeds maximum size of ${MAX_PDF_SIZE_MB}MB`
        return
      }

      if (pdfs.length + fileArray.length > MAX_PDF_COUNT) {
        errorMessage = `Maximum ${MAX_PDF_COUNT} PDF files allowed`
        return
      }
    })

    if (errorMessage) {
      setError(errorMessage)
      return
    }

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

  const handleManualMatch = (recipientIdx: number, pdfName: string) => {
    if (pdfName && pdfName !== "__none__") {
      setPdfMatch(recipientIdx, pdfName)
      // Unskip if they match a PDF
      unskipRow(recipientIdx)
    } else {
      removePdfMatch(recipientIdx)
    }
  }

  const handleSkipToggle = (recipientIdx: number, skip: boolean) => {
    if (skip) {
      skipRow(recipientIdx)
      // Remove PDF match when skipping
      removePdfMatch(recipientIdx)
    } else {
      unskipRow(recipientIdx)
    }
  }

  const activeRows = state.rows.map((row, idx) => ({ row, idx })).filter(({ idx }) => !state.skippedRows.has(idx))
  const unmatchedCount = activeRows.length - Array.from(state.pdfMatches.entries())
    .filter(([idx, v]) => v && v !== "__none__" && !state.skippedRows.has(idx))
    .length

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      {/* Mode Selector - Always visible */}
      <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
        <Tabs value={state.certificateMode} onValueChange={(value) => setCertificateMode(value as "upload" | "create")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <FileUp className="w-4 h-4" />
              Upload PDFs
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Create Certificates
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* If certificate creation mode, render that component */}
      {state.certificateMode === "create" ? (
        <StepCertificateCreate />
      ) : (
        <>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Upload & Match PDF Certificates</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Upload PDF certificates. They will be automatically matched with recipients by name.
          </p>
        </div>
        <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Advanced Settings
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Advanced Settings</DialogTitle>
              <DialogDescription>
                Configure additional field mappings and certificate link settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Checkbox
                  id="enable-cert-link"
                  checked={state.certificateLinkEnabled}
                  onCheckedChange={(checked) => {
                    setCertificateLinkEnabled(checked === true)
                    if (!checked) {
                      setMapping({
                        ...state.mapping,
                        certificateLink: undefined,
                      })
                    }
                  }}
                />
                <Label htmlFor="enable-cert-link" className="cursor-pointer flex-1">
                  Enable Certificate Link
                </Label>
              </div>
              {state.certificateLinkEnabled && (
                <div>
                  <Label htmlFor="cert-link-field">Certificate Link Field</Label>
                  <Select
                    value={state.mapping.certificateLink || "none"}
                    onValueChange={(value) => {
                      setMapping({
                        ...state.mapping,
                        certificateLink: value === "none" ? undefined : value,
                      })
                    }}
                  >
                    <SelectTrigger id="cert-link-field" className="mt-2">
                      <SelectValue placeholder="Select certificate link column" />
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
                  <p className="text-xs text-muted-foreground mt-2">
                    Map a column that contains certificate URLs. Use {"{{certificate_link}}"} placeholder in email template.
                  </p>
                </div>
              )}
              <div>
                <Label htmlFor="custom-message-field">Custom Message Field (Optional)</Label>
                <Select
                  value={state.mapping.customMessage || "none"}
                  onValueChange={(value) => {
                    setMapping({
                      ...state.mapping,
                      customMessage: value === "none" ? undefined : value,
                    })
                  }}
                >
                  <SelectTrigger id="custom-message-field" className="mt-2">
                    <SelectValue placeholder="Select custom message column" />
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
                <p className="text-xs text-muted-foreground mt-2">
                  Map a column with custom messages for each recipient.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* PDF Upload Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 dark:from-primary/20 dark:via-primary/10 dark:to-accent/20 border-2 border-primary/30 dark:border-primary/40 rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative">
          <p className="text-xs text-muted-foreground mb-4 text-center">
            Limits: Max {MAX_PDF_SIZE_MB}MB per file, {MAX_PDF_COUNT} files maximum
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
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-3 border-dashed rounded-xl p-8 sm:p-12 md:p-16 text-center transition-all cursor-pointer group ${
              isDragging 
                ? "border-primary bg-primary/20 scale-[1.02] shadow-xl" 
                : "border-primary/50 hover:border-primary bg-primary/5 hover:bg-primary/10 hover:scale-[1.01] hover:shadow-lg"
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <FileUp className="w-12 h-12 sm:w-16 sm:h-16 text-primary relative z-10 group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
              </div>
              <div className="space-y-2">
                <p className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
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
              ref={fileInputRef}
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
          className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-600 text-sm">{error}</span>
        </motion.div>
      )}

      {pdfs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 sm:mt-8 text-left">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            <span className="font-semibold text-sm sm:text-base text-green-600">{pdfs.length} PDF files uploaded</span>
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

      {/* Auto-match Success */}
      {autoMatched > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-600 text-sm">Auto-matched {autoMatched} recipients with PDFs</span>
          </div>
          {Array.from(matchConfidences.values()).some((c) => c.needsReview) && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-600 text-sm">
                {Array.from(matchConfidences.values()).filter((c) => c.needsReview).length} match(es) need review (low confidence)
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Matching Preview */}
      {pdfs.length > 0 && state.rows.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-3 max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-base sm:text-lg mb-2">Matching Preview</h3>
          {state.rows.map((row, idx) => {
            const nameField = state.mapping.name || ""
            const emailField = state.mapping.email || ""
            const currentMatch = state.pdfMatches.get(idx) || "__none__"
            const isSkipped = state.skippedRows.has(idx)
            const hasNoPdf = currentMatch === "__none__"

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border ${
                  isSkipped ? "bg-red-50/50 border-red-200 opacity-60" : "bg-muted/50 border-border"
                }`}
              >
                <div className="flex-shrink-0 flex items-center justify-center">
                  <Checkbox
                    id={`skip-${idx}`}
                    checked={isSkipped}
                    onCheckedChange={(checked) => {
                      // Handle both boolean and "indeterminate" states
                      const shouldSkip = checked === true
                      handleSkipToggle(idx, shouldSkip)
                    }}
                    className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground cursor-pointer"
                  />
                </div>
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <p className={`font-semibold text-sm sm:text-base truncate ${isSkipped ? "line-through text-muted-foreground" : ""}`}>
                    {row[nameField] || "Unknown"}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{row[emailField] || "No email"}</p>
                  {hasNoPdf && !isSkipped && (
                    <p className="text-xs text-amber-600 mt-1">⚠️ No PDF matched</p>
                  )}
                  {isSkipped && (
                    <p className="text-xs text-red-600 mt-1">⏭️ Skipped - will not receive email</p>
                  )}
                </div>
                <div className="w-full sm:w-auto sm:flex-shrink-0">
                  <Select
                    value={currentMatch}
                    onValueChange={(value) => handleManualMatch(idx, value)}
                    disabled={isSkipped}
                  >
                    <SelectTrigger className="w-full sm:w-64" disabled={isSkipped}>
                      <SelectValue placeholder="Select PDF..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No PDF</SelectItem>
                      {pdfs.map((pdf) => (
                        <SelectItem key={pdf.name} value={pdf.name}>
                          {pdf.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {currentMatch && currentMatch !== "__none__" && !isSkipped && (
                  <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-start sm:justify-end">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    {matchConfidences.has(idx) && (
                      <ConfidenceBadge
                        confidence={matchConfidences.get(idx)!.confidence}
                        needsReview={matchConfidences.get(idx)!.needsReview}
                        matchType={matchConfidences.get(idx)!.matchType as any}
                      />
                    )}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {unmatchedCount > 0 && pdfs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-600 text-sm font-medium">
              {unmatchedCount} recipient{unmatchedCount > 1 ? "s" : ""} without PDF match
            </span>
          </div>
          <p className="text-xs text-yellow-700 ml-7">
            You can manually match a PDF or skip these recipients by checking the box. Skipped recipients will not
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

      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
        <Button variant="outline" onClick={() => setStep(1)} className="w-full sm:w-auto">
          Back
        </Button>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {pdfs.length === 0 && (
            <Button variant="outline" onClick={() => setStep(3)} className="bg-transparent w-full sm:w-auto">
              Skip (No PDFs)
            </Button>
          )}
          <Button
            onClick={handleContinue}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground w-full sm:w-auto"
          >
            Continue to Compose
          </Button>
        </div>
      </div>
        </>
      )}
    </motion.div>
  )
}

