"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { CertificateMode, CertificateFieldMapping, CertificateConfig } from "@/types/certificate"

export interface FileRow {
  [key: string]: string
}

export interface FieldMapping {
  name?: string
  email?: string
  certificateLink?: string
  customMessage?: string
  [key: string]: string | undefined
}

export interface PdfFile {
  name: string
  blob: string // base64
  size: number
}

export interface SendWizardState {
  step: 1 | 2 | 3 | 4 | 5 | 6
  file: File | null
  headers: string[]
  rows: FileRow[]
  mapping: FieldMapping
  skippedRows: Set<number>
  rowEdits: Map<number, FileRow>
  subject: string
  messageBody: string
  smtpConfig: "default" | "custom" | null
  pdfFiles: PdfFile[]
  pdfMatches: Map<number, string> // row index -> pdf name
  sendResults: Array<{ name: string; email: string; status: "sent" | "failed"; message?: string }>
  autoDetectedMapping: boolean
  certificateLinkEnabled: boolean
  // Certificate generation state
  certificateMode: CertificateMode
  certificateTemplate: string | null // template ID
  certificateFieldMapping: CertificateFieldMapping
  certificateConfig: CertificateConfig | null
}

interface SendWizardContextType {
  state: SendWizardState
  setStep: (step: SendWizardState["step"]) => void
  setFile: (file: File | null, headers: string[], rows: FileRow[]) => void
  setMapping: (mapping: FieldMapping) => void
  updateRowEdit: (index: number, row: FileRow) => void
  skipRow: (index: number) => void
  unskipRow: (index: number) => void
  setComposition: (subject: string, messageBody: string) => void
  setSMTPConfig: (config: "default" | "custom") => void
  setPdfFiles: (files: PdfFile[]) => void
  setPdfMatch: (rowIndex: number, pdfName: string) => void
  removePdfMatch: (rowIndex: number) => void
  setSendResults: (results: Array<{ name: string; email: string; status: "sent" | "failed"; message?: string }>) => void
  setCertificateLinkEnabled: (enabled: boolean) => void
  // Certificate generation functions
  setCertificateMode: (mode: CertificateMode) => void
  setCertificateTemplate: (templateId: string) => void
  setCertificateFieldMapping: (mapping: CertificateFieldMapping) => void
  setCertificateConfig: (config: CertificateConfig | null) => void
  reset: () => void
}

const SendWizardContext = createContext<SendWizardContextType | undefined>(undefined)

export function SendWizardProvider({ children }: { children: ReactNode }) {
  const initialState: SendWizardState = {
    step: 1,
    file: null,
    headers: [],
    rows: [],
    mapping: {},
    skippedRows: new Set(),
    rowEdits: new Map(),
    subject: "",
    messageBody: "",
    smtpConfig: null,
    pdfFiles: [],
    pdfMatches: new Map(),
    sendResults: [],
    autoDetectedMapping: false,
    certificateLinkEnabled: false,
    certificateMode: "upload",
    certificateTemplate: null,
    certificateFieldMapping: {},
    certificateConfig: null,
  }

  const [state, setState] = useState<SendWizardState>(initialState)

  const setStep = (step: SendWizardState["step"]) => {
    setState((prev) => ({ ...prev, step }))
  }

  const setFile = (file: File | null, headers: string[], rows: FileRow[]) => {
    setState((prev) => ({
      ...prev,
      file,
      headers,
      rows,
      skippedRows: new Set(),
      rowEdits: new Map(),
    }))
    // Clear send completion flag when uploading a new file
    if (typeof window !== "undefined") {
      localStorage.removeItem("sendora_send_completed")
      localStorage.removeItem("sendora_send_results")
    }
  }

  const setMapping = (mapping: FieldMapping) => {
    setState((prev) => ({ ...prev, mapping }))
  }

  const updateRowEdit = (index: number, row: FileRow) => {
    setState((prev) => {
      const newRowEdits = new Map(prev.rowEdits)
      newRowEdits.set(index, row)
      return { ...prev, rowEdits: newRowEdits }
    })
  }

  const skipRow = (index: number) => {
    setState((prev) => {
      const newSkipped = new Set(prev.skippedRows)
      newSkipped.add(index)
      return { ...prev, skippedRows: newSkipped }
    })
  }

  const unskipRow = (index: number) => {
    setState((prev) => {
      const newSkipped = new Set(prev.skippedRows)
      newSkipped.delete(index)
      return { ...prev, skippedRows: newSkipped }
    })
  }

  const setComposition = (subject: string, messageBody: string) => {
    setState((prev) => ({ ...prev, subject, messageBody }))
  }

  const setSMTPConfig = (config: "default" | "custom") => {
    setState((prev) => ({ ...prev, smtpConfig: config }))
  }

  const setPdfFiles = (files: PdfFile[]) => {
    setState((prev) => ({ ...prev, pdfFiles: files }))
  }

  const setPdfMatch = (rowIndex: number, pdfName: string) => {
    setState((prev) => {
      const newMatches = new Map(prev.pdfMatches)
      newMatches.set(rowIndex, pdfName)
      return { ...prev, pdfMatches: newMatches }
    })
  }

  const removePdfMatch = (rowIndex: number) => {
    setState((prev) => {
      const newMatches = new Map(prev.pdfMatches)
      newMatches.delete(rowIndex)
      return { ...prev, pdfMatches: newMatches }
    })
  }

  const setSendResults = (results: Array<{ name: string; email: string; status: "sent" | "failed"; message?: string }>) => {
    setState((prev) => ({ ...prev, sendResults: results }))
  }

  const setCertificateLinkEnabled = (enabled: boolean) => {
    setState((prev) => ({ ...prev, certificateLinkEnabled: enabled }))
  }

  const setCertificateMode = (mode: CertificateMode) => {
    // Clear PDFs and matches when switching modes
    setState((prev) => ({
      ...prev,
      certificateMode: mode,
      pdfFiles: [],
      pdfMatches: new Map(),
    }))
  }

  const setCertificateTemplate = (templateId: string) => {
    setState((prev) => ({ ...prev, certificateTemplate: templateId }))
  }

  const setCertificateFieldMapping = (mapping: CertificateFieldMapping) => {
    setState((prev) => ({ ...prev, certificateFieldMapping: mapping }))
  }

  const setCertificateConfig = (config: CertificateConfig | null) => {
    setState((prev) => ({ ...prev, certificateConfig: config }))
  }

  const reset = () => {
    setState(initialState)
    // Clear send completion flag when resetting
    if (typeof window !== "undefined") {
      localStorage.removeItem("sendora_send_completed")
      localStorage.removeItem("sendora_send_results")
    }
  }

  return (
    <SendWizardContext.Provider
      value={{
        state,
        setStep,
        setFile,
        setMapping,
        updateRowEdit,
        skipRow,
        unskipRow,
        setComposition,
        setSMTPConfig,
        setPdfFiles,
        setPdfMatch,
        removePdfMatch,
        setSendResults,
        setCertificateLinkEnabled,
        setCertificateMode,
        setCertificateTemplate,
        setCertificateFieldMapping,
        setCertificateConfig,
        reset,
      }}
    >
      {children}
    </SendWizardContext.Provider>
  )
}

export function useSendWizard() {
  const context = useContext(SendWizardContext)
  if (!context) {
    throw new Error("useSendWizard must be used within SendWizardProvider")
  }
  return context
}
