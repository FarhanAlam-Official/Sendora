"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import { Upload, File, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSendWizard } from "./send-wizard-context"
import * as XLSX from "xlsx"

// Auto-detect column names for name and email
function autoDetectColumns(headers: string[]): { name?: string; email?: string } {
  const mapping: { name?: string; email?: string } = {}

  for (const header of headers) {
    const lowerHeader = header.toLowerCase().trim()
    
    // Detect email
    if (!mapping.email && (lowerHeader.includes("email") || lowerHeader.includes("e-mail") || lowerHeader === "mail")) {
      mapping.email = header
    }
    
    // Detect name
    if (!mapping.name) {
      if (lowerHeader === "name" || lowerHeader === "full name" || lowerHeader === "fullname") {
        mapping.name = header
      } else if (lowerHeader.includes("name") && !lowerHeader.includes("email") && !lowerHeader.includes("user")) {
        mapping.name = header
      }
    }
  }

  return mapping
}

export default function StepUpload() {
  const { state, setFile, setStep, setMapping } = useSendWizard()
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string>("")
  const [detectedMapping, setDetectedMapping] = useState<{ name?: string; email?: string }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseFile = (file: File) => {
    try {
      if (!file.name.match(/\.(xlsx|csv|xls)$/)) {
        setError("Please upload a valid Excel or CSV file")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const data = e.target?.result
        if (!data) return

        let workbook: XLSX.WorkBook
        if (file.name.endsWith(".csv")) {
          const text = data as string
          workbook = XLSX.read(text, { type: "string" })
        } else {
          workbook = XLSX.read(data, { type: "array" })
        }

        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as FileRow[]

        if (jsonData.length === 0) {
          setError("File appears to be empty")
          return
        }

        const headers = Object.keys(jsonData[0])
        if (!headers.some((h) => h.toLowerCase().includes("email"))) {
          setError("File must contain an email column")
          return
        }

        // Auto-detect name and email columns
        const autoMapping = autoDetectColumns(headers)
        setDetectedMapping(autoMapping)
        
        // Set the mapping in context
        setMapping(autoMapping)
        
        setFile(file, headers, jsonData)
        setError("")
      }

      reader.readAsArrayBuffer(file)
    } catch (err) {
      setError("Failed to parse file. Please check the format.")
      console.error(err)
    }
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

    const file = e.dataTransfer.files?.[0]
    if (file) parseFile(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) parseFile(file)
  }

  const activeRows = state.rows.filter((_, idx) => !state.skippedRows.has(idx))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Upload Your Data</h2>
        <p className="text-muted-foreground">Upload an Excel or CSV file with recipient information</p>
      </div>

      {!state.file && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
            dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex justify-center mb-4">
            <Upload className="w-12 h-12 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Drag and drop your file here</p>
            <p className="text-sm text-muted-foreground mt-1">Or click to browse (XLSX, CSV)</p>
          </div>
          <input ref={fileInputRef} type="file" accept=".xlsx,.csv,.xls" onChange={handleFileSelect} className="hidden" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {state.file && state.rows.length > 0 && (
        <div className="space-y-4">
          {/* Detection Summary */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-700">Auto-detected Fields</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Email Column: </span>
                <span className="font-semibold text-foreground">{detectedMapping.email || "Not detected"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Name Column: </span>
                <span className="font-semibold text-foreground">{detectedMapping.name || "Not detected"}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Detected {activeRows.length} recipients. You can review and edit below if needed.
            </p>
          </div>

          {/* File Info */}
          <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg">
            <File className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="font-semibold text-foreground">{state.file.name}</p>
              <p className="text-sm text-muted-foreground">
                {state.rows.length} rows • {state.headers.length} columns
              </p>
            </div>
          </div>

          {/* Preview Table */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-4">
              Recipients Preview ({state.rows.length} total)
            </h3>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-semibold bg-muted/50">#</th>
                    {detectedMapping.name && (
                      <th className="text-left py-2 px-3 font-semibold bg-muted/50">Name ({detectedMapping.name})</th>
                    )}
                    {detectedMapping.email && (
                      <th className="text-left py-2 px-3 font-semibold bg-muted/50">Email ({detectedMapping.email})</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {state.rows.slice(0, 20).map((row, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/50">
                      <td className="py-2 px-3 text-muted-foreground">{idx + 1}</td>
                      {detectedMapping.name && (
                        <td className="py-2 px-3">{row[detectedMapping.name] || "-"}</td>
                      )}
                      {detectedMapping.email && (
                        <td className="py-2 px-3 font-mono text-xs">{row[detectedMapping.email] || "-"}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {state.rows.length > 20 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Showing first 20 of {state.rows.length} rows. Scroll to see more in the table above.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
        <Button
          onClick={() => setStep(2)}
          disabled={state.rows.length === 0 || !detectedMapping.email}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
        >
          Continue to PDF Upload
        </Button>
      </div>
    </div>
  )
}

interface FileRow {
  [key: string]: string
}
