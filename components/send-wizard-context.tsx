/**
 * @fileoverview Send Wizard Context and State Management
 * 
 * This module provides comprehensive state management for the multi-step email
 * sending wizard using React Context. It handles all wizard state including file
 * uploads, field mapping, email composition, PDF matching, certificate generation,
 * and send results.
 * 
 * **Key Responsibilities:**
 * - Centralized state for the entire wizard workflow
 * - Step navigation and progression
 * - Excel/CSV file processing and data storage
 * - Field mapping configuration (name, email, custom fields)
 * - Row-level editing and skipping
 * - PDF file storage and recipient matching
 * - Email composition (subject and body)
 * - SMTP configuration selection
 * - Certificate generation settings
 * - Send results tracking
 * 
 * **Wizard Flow:**
 * 1. Upload Excel → Parse and store data
 * 2. Upload & Match PDFs → Associate PDFs with recipients
 * 3. Compose Email → Create email content with templates
 * 4. SMTP Config → Select email server configuration
 * 5. Preview & Send → Review and send emails
 * 6. Summary → Display send results and statistics
 * 
 * **State Structure:**
 * - Step tracking (1-6)
 * - File data (headers, rows, original file)
 * - Field mapping (email, name, certificate link, custom fields)
 * - Row management (edits, skips)
 * - Email composition (subject, body)
 * - PDF management (files, matches)
 * - Certificate generation (mode, template, field mapping, config)
 * - Results (send status per recipient)
 * 
 * **Certificate Modes:**
 * - upload: User uploads pre-made PDFs
 * - generate: System generates certificates from templates
 * 
 * @module components/send-wizard-context
 * @requires react - React hooks and context
 * @requires @/types/certificate - Certificate type definitions
 * 
 * @author Farhan Alam
 * @version 2.0.0
 */

"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { CertificateMode, CertificateFieldMapping, CertificateConfig } from "@/types/certificate"

/**
 * File row interface representing a single recipient record
 * 
 * Represents a row from the uploaded Excel/CSV file with dynamic columns.
 * Keys are column headers, values are cell contents.
 * 
 * @interface FileRow
 * @example
 * const row: FileRow = {
 *   "Name": "John Doe",
 *   "Email": "john@example.com",
 *   "Course": "Web Development"
 * }
 */
export interface FileRow {
  [key: string]: string
}

/**
 * Field mapping configuration interface
 * 
 * Maps Excel/CSV column names to email template variables.
 * Used for personalizing emails with recipient data.
 * 
 * **Standard Fields:**
 * - name: Recipient's name (e.g., "{{name}}" in template)
 * - email: Recipient's email address
 * - certificateLink: Link to attached PDF certificate
 * - customMessage: Personalized message field
 * 
 * **Custom Fields:**
 * Any additional fields can be mapped using string keys.
 * 
 * @interface FieldMapping
 * @example
 * const mapping: FieldMapping = {
 *   name: "Full Name",
 *   email: "Email Address",
 *   certificateLink: "Certificate URL",
 *   course: "Course Name"
 * }
 */
export interface FieldMapping {
  name?: string
  email?: string
  certificateLink?: string
  customMessage?: string
  [key: string]: string | undefined
}

/**
 * PDF file interface for certificate storage
 * 
 * Represents a PDF file (certificate) stored as base64 data.
 * Used for both uploaded PDFs and generated certificates.
 * 
 * @interface PdfFile
 * @property {string} name - PDF filename
 * @property {string} blob - Base64 encoded PDF data
 * @property {number} size - File size in bytes
 * 
 * @example
 * const pdfFile: PdfFile = {
 *   name: "john_doe_certificate.pdf",
 *   blob: "JVBERi0xLjQKJeLjz9MKMyAwIG9iaiA8PC...",
 *   size: 45678
 * }
 */
export interface PdfFile {
  name: string
  blob: string // base64
  size: number
}

/**
 * Complete wizard state interface
 * 
 * Defines the entire state structure for the send wizard, including all
 * data needed for the multi-step workflow.
 * 
 * **State Categories:**
 * 
 * **Navigation:**
 * @property {(1|2|3|4|5|6)} step - Current wizard step
 * 
 * **File Data:**
 * @property {File | null} file - Original uploaded Excel/CSV file
 * @property {string[]} headers - Column headers from file
 * @property {FileRow[]} rows - All data rows from file
 * 
 * **Field Configuration:**
 * @property {FieldMapping} mapping - Column to template variable mapping
 * @property {boolean} autoDetectedMapping - Whether mapping was auto-detected
 * 
 * **Row Management:**
 * @property {Set<number>} skippedRows - Indices of rows to skip
 * @property {Map<number, FileRow>} rowEdits - Row-level edits (index → edited row)
 * 
 * **Email Composition:**
 * @property {string} subject - Email subject line
 * @property {string} messageBody - Email body content (supports template variables)
 * 
 * **SMTP Configuration:**
 * @property {("default" | "custom" | null)} smtpConfig - Selected SMTP configuration
 * 
 * **PDF Management:**
 * @property {PdfFile[]} pdfFiles - All uploaded/generated PDF files
 * @property {Map<number, string>} pdfMatches - Row index → PDF filename mapping
 * @property {boolean} certificateLinkEnabled - Whether to include certificate links
 * 
 * **Certificate Generation:**
 * @property {CertificateMode} certificateMode - "upload" or "generate"
 * @property {string | null} certificateTemplate - Selected template ID
 * @property {CertificateFieldMapping} certificateFieldMapping - Field mapping for certificates
 * @property {CertificateConfig | null} certificateConfig - Complete certificate configuration
 * 
 * **Results:**
 * @property {Array} sendResults - Send status for each recipient
 * 
 * @interface SendWizardState
 */
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
