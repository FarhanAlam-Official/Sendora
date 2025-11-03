"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import { Upload, File, AlertCircle, CheckCircle2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSendWizard } from "./send-wizard-context"
import * as XLSX from "xlsx"
import { notifications } from "@/lib/notifications"

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
          const errorMsg = "File appears to be empty"
          setError(errorMsg)
          notifications.showError({
            title: 'Empty file',
            description: errorMsg,
          })
          return
        }

        const headers = Object.keys(jsonData[0])
        const hasEmail = headers.some((h) => h.toLowerCase().includes("email"))
        const hasName = headers.some((h) => {
          const lowerH = h.toLowerCase().trim()
          return lowerH === "name" || lowerH === "full name" || lowerH === "fullname" || (lowerH.includes("name") && !lowerH.includes("email"))
        })
        
        if (!hasEmail) {
          const errorMsg = "File must contain an Email column (mandatory)"
          setError(errorMsg)
          notifications.showError({
            title: 'Missing email column',
            description: errorMsg,
          })
          return
        }
        
        if (!hasName) {
          const errorMsg = "File must contain a Name column (mandatory for PDF matching)"
          setError(errorMsg)
          notifications.showError({
            title: 'Missing name column',
            description: errorMsg,
          })
          return
        }

        // Auto-detect name and email columns
        const autoMapping = autoDetectColumns(headers)
        setDetectedMapping(autoMapping)
        
        // Set the mapping in context
        setMapping(autoMapping)
        
        setFile(file, headers, jsonData)
        setError("")
        notifications.showSuccess({
          title: 'File uploaded successfully!',
          description: `Loaded ${jsonData.length} recipients from ${file.name}`,
        })
      }

      reader.readAsArrayBuffer(file)
    } catch (err) {
      const errorMsg = "Failed to parse file. Please check the format."
      setError(errorMsg)
      notifications.showError({
        title: 'File parsing error',
        description: errorMsg,
      })
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

      {/* File Upload Component - Prominent */}
      {!state.file && (
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
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                  <Upload className="w-16 h-16 text-primary relative z-10 group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
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
                ref={fileInputRef} 
                type="file" 
                accept=".xlsx,.csv,.xls" 
                onChange={handleFileSelect} 
                className="hidden" 
              />
            </div>
          </div>
        </div>
      )}

      {/* Format Guide - Below Upload, Less Prominent */}
      {!state.file && (
        <details className="relative overflow-hidden bg-gradient-to-br from-blue-50/30 via-purple-50/15 to-pink-50/30 dark:from-blue-950/10 dark:via-purple-950/5 dark:to-pink-950/10 border border-blue-200/30 dark:border-blue-800/20 rounded-xl shadow-md">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <summary className="relative cursor-pointer p-4 flex items-center gap-3 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
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
                
              <div className="overflow-x-auto rounded-lg border border-border/50 bg-background/80 backdrop-blur-sm shadow-inner">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-muted/60 to-muted/40 border-b border-border">
                      <th className="text-left py-2 px-3 font-semibold text-foreground">Column Name</th>
                      <th className="text-left py-2 px-3 font-semibold text-foreground">Status</th>
                      <th className="text-left py-2 px-3 font-semibold text-foreground">Description</th>
                      <th className="text-left py-2 px-3 font-semibold text-foreground">Example</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="py-2 px-3 font-mono font-medium text-foreground">Email</td>
                      <td className="py-2 px-3">
                        <Badge variant="destructive" className="text-[10px] font-semibold px-1.5 py-0.5">Mandatory</Badge>
                      </td>
                      <td className="py-2 px-3 text-xs text-muted-foreground">Recipient email address</td>
                      <td className="py-2 px-3 font-mono text-[10px] text-muted-foreground bg-muted/30 rounded px-1.5 py-0.5 inline-block">john@example.com</td>
                    </tr>
                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="py-2 px-3 font-mono font-medium text-foreground">Name</td>
                      <td className="py-2 px-3">
                        <Badge variant="destructive" className="text-[10px] font-semibold px-1.5 py-0.5">Mandatory</Badge>
                      </td>
                      <td className="py-2 px-3 text-xs text-muted-foreground">Recipient name (for PDF matching)</td>
                      <td className="py-2 px-3 font-mono text-[10px] text-muted-foreground bg-muted/30 rounded px-1.5 py-0.5 inline-block">John Doe</td>
                    </tr>
                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="py-2 px-3 font-mono font-medium text-foreground">Certificate Link</td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0.5">Optional</Badge>
                      </td>
                      <td className="py-2 px-3 text-xs text-muted-foreground">PDF link (use {"{{certificate_link}}"})</td>
                      <td className="py-2 px-3 font-mono text-[10px] text-muted-foreground bg-muted/30 rounded px-1.5 py-0.5 inline-block break-all">https://...</td>
                    </tr>
                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="py-2 px-3 font-mono font-medium text-foreground">Custom Message</td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className="text-[10px] font-semibold px-1.5 py-0.5">Optional</Badge>
                      </td>
                      <td className="py-2 px-3 text-xs text-muted-foreground">Custom message per recipient</td>
                      <td className="py-2 px-3 font-mono text-[10px] text-muted-foreground bg-muted/30 rounded px-1.5 py-0.5 inline-block">Congratulations!</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-3 p-2 rounded bg-blue-50/30 dark:bg-blue-950/15 border border-blue-200/30 dark:border-blue-800/20">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">💡</strong> Column names are auto-detected. 
                  <strong className="text-foreground"> Email</strong> and <strong className="text-foreground">Name</strong> are required.
                </p>
              </div>
            </div>
          </div>
        </details>
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
          disabled={state.rows.length === 0 || !detectedMapping.email || !detectedMapping.name}
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
