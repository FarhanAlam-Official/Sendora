"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSendWizard } from "./send-wizard-context"
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react"
import { findBestMatchingPDFWithConfidence } from "@/lib/pdf-utils"
import { ConfidenceBadge } from "./confidence-badge"
import { notifications } from "@/lib/notifications"

export default function StepPDF() {
  const { state, setStep, setPdfFiles, setPdfMatch } = useSendWizard()
  const [dragActive, setDragActive] = useState(false)
  const [autoMatching, setAutoMatching] = useState(false)
  const [matchedCount, setMatchedCount] = useState(0)
  const [matchConfidences, setMatchConfidences] = useState<Map<number, { confidence: number; needsReview: boolean; matchType: string }>>(new Map())

  // Auto-match PDFs with CSV rows
  const autoMatchPDFs = async () => {
    setAutoMatching(true)
    const nameField = state.mapping.name

    if (!nameField) {
      notifications.showWarning("Please map a Name field first to enable PDF matching")
      setAutoMatching(false)
      return
    }

    let matched = 0
    const newConfidences = new Map<number, { confidence: number; needsReview: boolean; matchType: string }>()
    
    // Convert PdfFile[] to File[] for matching
    const pdfFiles: File[] = state.pdfFiles.map((pdfFile) => {
      // Convert base64 blob back to File for matching
      const byteCharacters = atob(pdfFile.blob)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      return new File([byteArray], pdfFile.name, { type: "application/pdf" })
    })

    for (let i = 0; i < state.rows.length; i++) {
      if (state.skippedRows.has(i)) continue

      const row = state.rowEdits.get(i) || state.rows[i]
      const recipientName = row[nameField]
      
      if (!recipientName) continue

      // Use improved matching with confidence scoring (Phase 3)
      const matchResult = findBestMatchingPDFWithConfidence(recipientName, pdfFiles)
      
      if (matchResult) {
        // Find the corresponding PdfFile by name
        const matchedPdfFile = state.pdfFiles.find((pf) => pf.name === matchResult.file.name)
        if (matchedPdfFile) {
          setPdfMatch(i, matchedPdfFile.name)
          newConfidences.set(i, {
            confidence: matchResult.confidence,
            needsReview: matchResult.needsReview,
            matchType: matchResult.matchType,
          })
          matched++
        }
      }
    }

    setMatchConfidences(newConfidences)
    setMatchedCount(matched)
    setAutoMatching(false)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files).filter((file) => file.type === "application/pdf")
    if (files.length > 0) {
      // Convert File[] to PdfFile[] format
      const pdfData = await Promise.all(
        files.map(async (file) => {
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
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((file) => file.type === "application/pdf")
    if (files.length > 0) {
      // Convert File[] to PdfFile[] format
      const pdfData = await Promise.all(
        files.map(async (file) => {
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
    }
  }

  const isMappingComplete = state.pdfMatches.size > 0 || state.pdfFiles.length === 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Attach Certificates</h2>
        <p className="text-muted-foreground">
          Upload PDFs to attach to each email. They will be matched by recipient name.
        </p>
      </div>

      {/* PDF Upload Section */}
      {state.pdfFiles.length === 0 ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 dark:from-primary/20 dark:via-primary/10 dark:to-accent/20 border-2 border-primary/30 dark:border-primary/40 rounded-2xl p-8 shadow-2xl">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-3 border-dashed rounded-xl p-16 text-center transition-all cursor-pointer group ${
                dragActive 
                  ? "border-primary bg-primary/20 scale-[1.02] shadow-xl" 
                  : "border-primary/50 hover:border-primary bg-primary/5 hover:bg-primary/10 hover:scale-[1.01] hover:shadow-lg"
              }`}
              onClick={() => document.getElementById("pdf-upload")?.click()}
            >
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                  <Upload className="w-16 h-16 text-primary relative z-10 group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
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
              <input type="file" multiple accept=".pdf" onChange={handleFileSelect} className="hidden" id="pdf-upload" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* PDF List */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Uploaded PDFs ({state.pdfFiles.length})</h3>
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload-more"
              />
              <label htmlFor="pdf-upload-more" className="cursor-pointer">
                <Button variant="outline" size="sm" className="bg-transparent pointer-events-none">
                  Add More
                </Button>
              </label>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {state.pdfFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{(file.size / 1024).toFixed(0)} KB</span>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-Match Button */}
          <Button
            onClick={autoMatchPDFs}
            disabled={autoMatching}
            className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground"
          >
            {autoMatching ? "Matching PDFs..." : "Auto-Match PDFs by Name"}
          </Button>

          {/* Match Results */}
          {matchedCount > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-600 font-medium">{matchedCount} PDFs matched successfully</p>
              </div>
              {/* Confidence Summary */}
              {Array.from(matchConfidences.values()).some((c) => c.needsReview) && (
                <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <p className="text-sm text-yellow-600 font-medium">
                    {Array.from(matchConfidences.values()).filter((c) => c.needsReview).length} match(es) need review (low confidence)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Manual Matching Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">PDF Matching:</p>
                <p className="text-xs">
                  PDFs are automatically matched to recipients by name. You can manually adjust matches in the next step
                  if needed.
                </p>
              </div>
            </div>
          </div>

          {/* Matching Summary */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm">
              <strong>Total Uploads:</strong> {state.pdfFiles.length} • <strong>Matched:</strong>{" "}
              {state.pdfMatches.size}
            </p>
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(3)}>
          Back
        </Button>
        <Button onClick={() => setStep(5)} className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
          {state.pdfFiles.length > 0 ? "Next: Review & Send" : "Skip: Send Without PDFs"}
        </Button>
      </div>
    </div>
  )
}
