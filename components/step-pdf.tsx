"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useSendWizard } from "./send-wizard-context"
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react"

export default function StepPDF() {
  const { state, setStep, setPDFFiles, setPDFMatch } = useSendWizard()
  const [dragActive, setDragActive] = useState(false)
  const [autoMatching, setAutoMatching] = useState(false)
  const [matchedCount, setMatchedCount] = useState(0)

  // Extract name from PDF filename
  const extractNameFromPDF = (fileName: string): string => {
    // Remove .pdf extension
    let name = fileName.replace(/\.pdf$/i, "")
    // Remove common prefixes/suffixes
    name = name.replace(/certificate|cert|document|doc/i, "").trim()
    return name.toLowerCase()
  }

  // Auto-match PDFs with CSV rows
  const autoMatchPDFs = async () => {
    setAutoMatching(true)
    const nameField = state.mapping.name

    if (!nameField) {
      alert("Please map a Name field first to enable PDF matching")
      setAutoMatching(false)
      return
    }

    let matched = 0
    for (let i = 0; i < state.rows.length; i++) {
      if (state.skippedRows.has(i)) continue

      const row = state.rowEdits.get(i) || state.rows[i]
      const rowName = row[nameField].toLowerCase().trim()

      // Find matching PDF
      for (const pdfFile of state.pdfFiles) {
        const pdfName = extractNameFromPDF(pdfFile.name)

        // Check if names match (exact or partial)
        if (rowName === pdfName || pdfName.includes(rowName) || rowName.includes(pdfName)) {
          setPDFMatch(i, pdfFile)
          matched++
          break
        }
      }
    }

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files).filter((file) => file.type === "application/pdf")
    if (files.length > 0) {
      setPDFFiles(files as File[])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((file) => file.type === "application/pdf")
    if (files.length > 0) {
      setPDFFiles(files as File[])
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
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
        >
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm font-medium mb-2">Drag and drop PDF files here</p>
          <p className="text-xs text-muted-foreground mb-4">or click to select files</p>
          <input type="file" multiple accept=".pdf" onChange={handleFileSelect} className="hidden" id="pdf-upload" />
          <label htmlFor="pdf-upload">
            <Button as="span" variant="outline" className="cursor-pointer bg-transparent">
              Select PDFs
            </Button>
          </label>
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
              <label htmlFor="pdf-upload-more">
                <Button as="span" variant="outline" size="sm" className="cursor-pointer bg-transparent">
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
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-600 font-medium">{matchedCount} PDFs matched successfully</p>
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
