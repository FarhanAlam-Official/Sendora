"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FileUp, X, CheckCircle, AlertCircle, Settings, Save, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSendWizard, type PdfFile } from "./send-wizard-context"
import StepCertificateCreate from "./step-certificate-create"

const MAX_PDF_SIZE_MB = 20
const MAX_PDF_COUNT = 250

export default function StepPdfUploadMatch() {
  const { state, setStep, setPdfFiles, setPdfMatch, removePdfMatch, skipRow, unskipRow, setMapping, setCertificateLinkEnabled, setCertificateMode } = useSendWizard()
  const [pdfs, setPdfs] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState("")
  const [autoMatched, setAutoMatched] = useState(0)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Auto-match PDFs when they're uploaded
  useEffect(() => {
    if (pdfs.length > 0 && state.rows.length > 0 && state.mapping.name) {
      let matched = 0
      
      state.rows.forEach((row, idx) => {
        if (state.skippedRows.has(idx)) return

        const rowName = row[state.mapping.name || ""]?.toLowerCase().replace(/\s+/g, "") || ""
        
        // Find matching PDF
        for (const pdf of pdfs) {
          const pdfName = pdf.name.toLowerCase().replace(/\.pdf/i, "").replace(/\s+/g, "")
          
          if (rowName === pdfName || pdfName.includes(rowName) || rowName.includes(pdfName)) {
            setPdfMatch(idx, pdf.name)
            matched++
            break
          }
        }
      })
      
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

  // If certificate creation mode, render that component instead
  if (state.certificateMode === "create") {
    return <StepCertificateCreate />
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      {/* Mode Selector */}
      <div className="bg-card border border-border rounded-lg p-4">
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

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Upload & Match PDF Certificates</h2>
          <p className="text-muted-foreground">
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
      <div className="bg-card border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary transition-colors">
        <FileUp className="w-16 h-16 text-primary mx-auto mb-4" />
        <p className="text-xs text-muted-foreground mb-4">
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
          className={`border-2 border-dashed rounded-lg p-8 transition-all ${
            isDragging ? "border-primary bg-primary/5" : "border-border"
          }`}
        >
          <input
            type="file"
            multiple
            accept=".pdf"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
            id="pdf-input"
          />
          <label htmlFor="pdf-input" className="cursor-pointer">
            Drag and drop PDFs or click to browse
          </label>
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
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-left">
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
      </div>

      {/* Auto-match Success */}
      {autoMatched > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-600 text-sm">Auto-matched {autoMatched} recipients with PDFs</span>
        </motion.div>
      )}

      {/* Matching Preview */}
      {pdfs.length > 0 && state.rows.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-3 max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-2">Matching Preview</h3>
          {state.rows.slice(0, 20).map((row, idx) => {
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
                className={`flex items-center gap-4 p-4 rounded-lg border ${
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
                    className="w-6 h-6 border-2 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${isSkipped ? "line-through text-muted-foreground" : ""}`}>
                    {row[nameField] || "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">{row[emailField] || "No email"}</p>
                  {hasNoPdf && !isSkipped && (
                    <p className="text-xs text-amber-600 mt-1">⚠️ No PDF matched</p>
                  )}
                  {isSkipped && (
                    <p className="text-xs text-red-600 mt-1">⏭️ Skipped - will not receive email</p>
                  )}
                </div>
                <Select
                  value={currentMatch}
                  onValueChange={(value) => handleManualMatch(idx, value)}
                  disabled={isSkipped}
                >
                  <SelectTrigger className="w-64" disabled={isSkipped}>
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
                {currentMatch && currentMatch !== "__none__" && !isSkipped && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </motion.div>
            )
          })}
          {activeRows.length > 20 && (
            <p className="text-xs text-muted-foreground text-center">... and {activeRows.length - 20} more recipients</p>
          )}
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

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <div className="flex gap-2">
          {pdfs.length === 0 && (
            <Button variant="outline" onClick={() => setStep(3)} className="bg-transparent">
              Skip (No PDFs)
            </Button>
          )}
          <Button
            onClick={handleContinue}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
          >
            Continue to Compose
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

