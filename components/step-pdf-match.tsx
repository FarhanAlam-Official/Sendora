"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSendWizard } from "./send-wizard-context"

export default function StepPdfMatch() {
  const { state, setStep, setPdfMatch, removePdfMatch } = useSendWizard()
  const [matches, setMatches] = useState<Record<number, string>>({})
  const [autoMatched, setAutoMatched] = useState(0)

  useEffect(() => {
    // Auto-match based on filename
    if (state.rows.length > 0 && state.pdfFiles.length > 0 && state.mapping.name) {
      const newMatches: Record<number, string> = {}
      let matched = 0

      state.rows.forEach((row, idx) => {
        if (state.skippedRows.has(idx)) return

        const rowName = row[state.mapping.name || ""]?.toLowerCase().replace(/\s+/g, "") || ""
        const matchedPdf = state.pdfFiles.find((pdf) => {
          const pdfName = pdf.name.toLowerCase().replace(/\.pdf/i, "").replace(/\s+/g, "")
          return pdfName.includes(rowName) || rowName.includes(pdfName)
        })

        if (matchedPdf) {
          newMatches[idx] = matchedPdf.name
          setPdfMatch(idx, matchedPdf.name)
          matched++
        }
      })

      setMatches(newMatches)
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
          className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-600 text-sm">Auto-matched {autoMatched} recipients</span>
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
              {currentMatch && currentMatch !== "__none__" && <CheckCircle className="w-5 h-5 text-green-600" />}
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

