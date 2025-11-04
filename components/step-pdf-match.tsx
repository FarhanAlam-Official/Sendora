/**
 * @fileoverview Step PDF Match Component - Intelligent PDF-to-Recipient Matching
 * @module components/step-pdf-match
 * @description
 * This component implements automatic and manual PDF matching for the email wizard:
 * - Auto-matches PDFs to recipients using intelligent fuzzy matching algorithms
 * - Displays confidence scores for each match (High/Medium/Low)
 * - Allows manual override for low-confidence or incorrect matches
 * - Converts base64 PDF data to File objects for matching
 * - Shows visual indicators for match quality
 * 
 * Features:
 * - Automatic matching on component mount using Phase 3 matching algorithm
 * - Confidence-based match quality indicators (High/Medium/Low badges)
 * - Manual PDF selection dropdown for each recipient
 * - Visual feedback for auto-matched recipients
 * - Warning alerts for low-confidence matches needing review
 * - Staggered animations for smooth UI transitions
 * 
 * Matching Algorithm:
 * - Uses findBestMatchingPDFWithConfidence from pdf-utils
 * - Converts base64 PdfFile data to File objects for matching
 * - Matches based on recipient name field
 * - Returns confidence score (0-1), needsReview flag, and matchType
 * - Skips recipients marked as skipped
 * 
 * @requires react
 * @requires framer-motion
 * @requires lucide-react
 * @requires @/components/ui/button
 * @requires @/components/ui/select
 * @requires ./send-wizard-context
 * @requires @/lib/pdf-utils
 * @requires ./confidence-badge
 */

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSendWizard } from "./send-wizard-context"
import { findBestMatchingPDFWithConfidence } from "@/lib/pdf-utils"
import { ConfidenceBadge } from "./confidence-badge"

/**
 * Step PDF Match Component - Automatic and manual PDF matching wizard step.
 * 
 * This component handles the intelligent matching of uploaded PDF certificates
 * to recipients based on their names:
 * - Auto-matches PDFs using fuzzy name matching on mount
 * - Displays confidence scores for each match
 * - Allows manual correction of matches
 * - Provides visual feedback for match quality
 * 
 * Auto-Matching Process:
 * 1. Converts base64 PdfFile data to File objects
 * 2. Iterates through active recipients (non-skipped)
 * 3. Extracts recipient name from mapped name field
 * 4. Calls findBestMatchingPDFWithConfidence for each recipient
 * 5. Stores match results with confidence metrics
 * 6. Updates context with PDF matches
 * 
 * Confidence Levels:
 * - High (Green): Exact or very close match (confidence >= 0.8)
 * - Medium (Yellow): Decent match (confidence >= 0.6)
 * - Low (Red): Poor match, needs review (confidence < 0.6)
 * 
 * Match Types:
 * - exact: Exact filename match
 * - fuzzy: Levenshtein distance-based match
 * - partial: Substring match
 * - token: Token-based match
 * 
 * User Interface:
 * - Success Alert: Shows count of auto-matched recipients
 * - Review Alert: Warns about low-confidence matches
 * - Unmatched Alert: Shows count of recipients needing manual matching
 * - Recipient Cards: Animated cards with name, email, PDF selector
 * - Confidence Badges: Visual indicators of match quality
 * 
 * Manual Matching:
 * - Dropdown selector for each recipient
 * - "No PDF" option to clear a match
 * - Updates both local state and wizard context
 * - Immediate visual feedback with checkmark icon
 * 
 * @component
 * @returns {JSX.Element} PDF matching interface with auto-match and manual controls
 * 
 * @example
 * // Used within SendWizard flow after PDF upload
 * <SendWizardProvider>
 *   <StepPdfMatch /> // Shows when currentStep === 3 (legacy flow)
 * </SendWizardProvider>
 */
export default function StepPdfMatch() {
  const { state, setStep, setPdfMatch, removePdfMatch } = useSendWizard()
  const [matches, setMatches] = useState<Record<number, string>>({})
  const [autoMatched, setAutoMatched] = useState(0)
  const [matchConfidences, setMatchConfidences] = useState<Map<number, { confidence: number; needsReview: boolean; matchType: string }>>(new Map())

  useEffect(() => {
    // Auto-match based on filename using Phase 3 matching
    if (state.rows.length > 0 && state.pdfFiles.length > 0 && state.mapping.name) {
      const newMatches: Record<number, string> = {}
      const newConfidences = new Map<number, { confidence: number; needsReview: boolean; matchType: string }>()
      let matched = 0

      // Convert PdfFile[] to File[] for matching
      const pdfFiles: File[] = state.pdfFiles.map((pdfFile) => {
        const byteCharacters = atob(pdfFile.blob)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        return new File([byteArray], pdfFile.name, { type: "application/pdf" })
      })

      state.rows.forEach((row, idx) => {
        if (state.skippedRows.has(idx)) return

        const recipientName = row[state.mapping.name || ""]
        
        if (!recipientName) return

        // Use improved matching with confidence scoring (Phase 3)
        const matchResult = findBestMatchingPDFWithConfidence(recipientName, pdfFiles)

        if (matchResult) {
          // Find the corresponding PdfFile by name
          const matchedPdf = state.pdfFiles.find((pf) => pf.name === matchResult.file.name)
          if (matchedPdf) {
            newMatches[idx] = matchedPdf.name
            setPdfMatch(idx, matchedPdf.name)
            newConfidences.set(idx, {
              confidence: matchResult.confidence,
              needsReview: matchResult.needsReview,
              matchType: matchResult.matchType,
            })
            matched++
          }
        }
      })

      setMatches(newMatches)
      setMatchConfidences(newConfidences)
      setAutoMatched(matched)
    }
  }, [])

  const handleManualMatch = (recipientIdx: number, pdfName: string) => {
    const newMatches = { ...matches }
    if (pdfName && pdfName !== "__none__") {
      newMatches[recipientIdx] = pdfName
      setPdfMatch(recipientIdx, pdfName)
    } else {
      delete newMatches[recipientIdx]
      removePdfMatch(recipientIdx)
    }
    setMatches(newMatches)
  }

  const handleContinue = () => {
    setStep(4)
  }

  const activeRows = state.rows.map((row, idx) => ({ row, idx })).filter(({ idx }) => !state.skippedRows.has(idx))
  const unmatchedCount = activeRows.length - Object.keys(matches).length

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Match Recipients with Certificates</h2>
        <p className="text-muted-foreground">
          Match each recipient with their corresponding certificate PDF. We've automatically matched some for you.
        </p>
      </div>

      {autoMatched > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-600 text-sm">Auto-matched {autoMatched} recipients</span>
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

      {unmatchedCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <span className="text-yellow-600 text-sm">{unmatchedCount} recipients need manual matching</span>
        </motion.div>
      )}

      <div className="bg-card border border-border rounded-lg p-6 space-y-3 max-h-96 overflow-y-auto">
        {activeRows.map(({ row, idx }) => {
          const nameField = state.mapping.name || ""
          const emailField = state.mapping.email || ""
          const currentMatch = matches[idx] || state.pdfMatches.get(idx) || "__none__"

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border border-border"
            >
              <div className="flex-1">
                <p className="font-semibold">{row[nameField] || "Unknown"}</p>
                <p className="text-sm text-muted-foreground">{row[emailField] || "No email"}</p>
              </div>
              <Select value={currentMatch} onValueChange={(value) => handleManualMatch(idx, value)}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select PDF..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No PDF</SelectItem>
                  {state.pdfFiles.map((pdf) => (
                    <SelectItem key={pdf.name} value={pdf.name}>
                      {pdf.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentMatch && currentMatch !== "__none__" && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
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

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(2)}>
          Back
        </Button>
        <Button
          onClick={handleContinue}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
        >
          Continue to Mapping
        </Button>
      </div>
    </motion.div>
  )
}

