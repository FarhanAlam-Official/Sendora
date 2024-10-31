"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSendWizard } from "./send-wizard-context"

export default function StepPreview() {
  const { state, setStep } = useSendWizard()
  const [selectedIdx, setSelectedIdx] = useState(0)

  const activeRows = state.rows.map((row, idx) => ({ row, idx })).filter(({ idx }) => !state.skippedRows.has(idx))

  if (activeRows.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No recipients to preview</p>
      </div>
    )
  }

  const selected = activeRows[selectedIdx]
  const nameField = state.mapping.name || ""
  const emailField = state.mapping.email || ""
  const certificateField = state.mapping.certificateLink || ""

  let previewSubject = state.subject
  let previewBody = state.messageBody

  // Replace placeholders
  if (nameField && selected.row[nameField]) {
    previewSubject = previewSubject.replace(/\{\{name\}\}/g, selected.row[nameField])
    previewBody = previewBody.replace(/\{\{name\}\}/g, selected.row[nameField])
    previewBody = previewBody.replace(/\{\{recipient_name\}\}/g, selected.row[nameField])
  }

  if (certificateField && selected.row[certificateField]) {
    previewBody = previewBody.replace(/\{\{certificate_link\}\}/g, selected.row[certificateField])
  }

  const selectedPdfName = state.pdfMatches.get(selected.idx) || ""

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Preview & Confirm</h2>
        <p className="text-muted-foreground">
          Review how your emails will look before sending. Click on any recipient to preview their personalized email.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recipient List */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold mb-4">Recipients ({activeRows.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {activeRows.map(({ row, idx }) => (
                <motion.button
                  key={idx}
                  onClick={() => setSelectedIdx(activeRows.findIndex((r) => r.idx === idx))}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    idx === selected.idx
                      ? "bg-gradient-to-r from-primary/20 to-accent/20 border border-primary"
                      : "bg-muted/50 hover:bg-muted border border-border"
                  }`}
                >
                  <p className="font-semibold text-sm">{row[nameField] || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{row[emailField] || "No email"}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Email Preview */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold mb-4">Email Preview</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted p-4 border-b border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-muted-foreground">
                    To: {selected.row[emailField] || "No email"}
                  </span>
                </div>
                <div className="text-sm font-semibold break-all">{previewSubject}</div>
              </div>
              <div className="p-6 bg-card min-h-64 whitespace-pre-wrap text-sm font-mono">
                {previewBody}
              </div>
            </div>

            {selectedPdfName && (
              <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <p className="text-sm">
                  <span className="font-semibold text-primary">Attachment:</span>{" "}
                  <span className="text-primary/80">{selectedPdfName}</span>
                </p>
              </div>
            )}

            {!selectedPdfName && state.pdfFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <span className="text-sm text-yellow-600">No PDF matched for this recipient</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Delay Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg"
        >
          <p className="text-sm text-primary">
            <span className="font-semibold">⏱️ Sending Time:</span> A 1-second delay is added after each email to
            prevent rate limiting by email providers.
            <br />
            <span className="mt-1 block">
              Estimated time: ~{Math.ceil(activeRows.length * 1.2)} seconds ({activeRows.length} recipients)
            </span>
          </p>
        </motion.div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(6)}>
          Back
        </Button>
        <Button
          onClick={() => setStep(8)}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
        >
          Send Now
        </Button>
      </div>
    </motion.div>
  )
}

