"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Mail, AlertCircle, CheckCircle, Clock, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSendWizard } from "./send-wizard-context"
import { notifications } from "@/lib/notifications"

const SEND_COMPLETED_KEY = "sendora_send_completed"

export default function StepPreviewSend() {
  const { state, setStep, setSendResults, reset } = useSendWizard()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [sending, setSending] = useState(false)
  const [results, setResults] = useState<
    Array<{ name: string; email: string; status: "sent" | "failed"; message?: string }>
  >([])
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    failed: 0,
    progress: 0,
  })
  const [error, setError] = useState("")
  
  // Check localStorage for send completion status
  const [hasSent, setHasSent] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(SEND_COMPLETED_KEY) === "true"
    }
    return false
  })
  
  // Load results from localStorage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sendCompleted = localStorage.getItem(SEND_COMPLETED_KEY) === "true"
      if (sendCompleted) {
        setHasSent(true)
        const savedResults = localStorage.getItem("sendora_send_results")
        if (savedResults) {
          try {
            const parsed = JSON.parse(savedResults)
            setResults(parsed)
            setSendResults(parsed)
            const sentCount = parsed.filter((r: any) => r.status === "sent").length
            const failedCount = parsed.filter((r: any) => r.status === "failed").length
            setStats({
              total: parsed.length,
              sent: sentCount,
              failed: failedCount,
              progress: 100,
            })
          } catch (e) {
            console.error("Failed to load saved results", e)
          }
        }
      }
    }
  }, [setSendResults])

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

  const sendEmails = async () => {
    // Check localStorage as well
    if (hasSent || (typeof window !== "undefined" && localStorage.getItem(SEND_COMPLETED_KEY) === "true")) {
      const errorMsg = "Emails have already been sent. Please start a new send to send again."
      setError(errorMsg)
      setHasSent(true)
      notifications.showWarning(errorMsg)
      return
    }

    try {
      setSending(true)
      setError("")
      
      notifications.showInfo(`Starting to send ${activeRows.length} emails...`)
      
      const recipientCount = activeRows.length
      // Initialize stats before sending
      setStats({
        total: recipientCount,
        sent: 0,
        failed: 0,
        progress: 0,
      })

      // Prepare emails to send
      const emailsToSend = activeRows.map(({ row, idx }) => {
        const nameField = state.mapping.name || ""
        const emailField = state.mapping.email || ""
        const certificateField = state.mapping.certificateLink || ""

        let subject = state.subject
        let body = state.messageBody

        // Replace placeholders
        if (nameField && row[nameField]) {
          subject = subject.replace(/\{\{name\}\}/g, row[nameField])
          body = body.replace(/\{\{name\}\}/g, row[nameField])
          body = body.replace(/\{\{recipient_name\}\}/g, row[nameField])
        }

        // Handle certificate_link placeholder based on enabled state
        if (state.certificateLinkEnabled && certificateField && row[certificateField]) {
          body = body.replace(/\{\{certificate_link\}\}/g, row[certificateField])
        } else {
          // Remove certificate_link placeholder if not enabled
          body = body.replace(/\{\{certificate_link\}\}/g, "")
        }

        // Convert plain text to HTML (replace newlines with <br>)
        body = body.replace(/\n/g, "<br>")

        // Get PDF attachment
        const pdfName = state.pdfMatches.get(idx)
        const pdfFile = pdfName ? state.pdfFiles.find((pdf) => pdf.name === pdfName) : undefined

        return {
          to: row[emailField] || "",
          subject,
          body,
          name: row[nameField] || "Unknown",
          email: row[emailField] || "",
          pdfAttachment: pdfFile,
        }
      })

      setHasSent(true)

      // Send emails
      const sendResults: Array<{ name: string; email: string; status: "sent" | "failed"; message?: string }> = []

      for (let i = 0; i < emailsToSend.length; i++) {
        const email = emailsToSend[i]

        try {
          // Prepare payload
          const payload: any = {
            to: email.to,
            subject: email.subject,
            body: email.body,
            smtpConfig: state.smtpConfig,
          }

          if (state.smtpConfig === "custom") {
            const customSMTP = localStorage.getItem("sendora_smtp_custom")
            if (customSMTP) {
              payload.customSMTP = JSON.parse(customSMTP)
            }
          }

          // Add PDF attachment if available
          if (email.pdfAttachment) {
            payload.pdfAttachment = {
              filename: email.pdfAttachment.name,
              content: email.pdfAttachment.blob,
            }
          }

          const response = await fetch("/api/sendEmails", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })

          if (response.ok) {
            sendResults.push({
              name: email.name,
              email: email.to,
              status: "sent",
              message: "Email sent successfully",
            })
            setStats((prev) => ({
              ...prev,
              sent: prev.sent + 1,
              progress: Math.round(((i + 1) / recipientCount) * 100),
            }))
          } else {
            const errorData = await response.json().catch(() => ({}))
            sendResults.push({
              name: email.name,
              email: email.to,
              status: "failed",
              message: errorData.error || "Failed to send email",
            })
            setStats((prev) => ({
              ...prev,
              failed: prev.failed + 1,
              progress: Math.round(((i + 1) / recipientCount) * 100),
            }))
          }
        } catch (err) {
          sendResults.push({
            name: email.name,
            email: email.to,
            status: "failed",
            message: err instanceof Error ? err.message : "Unknown error",
          })
          setStats((prev) => ({
            ...prev,
            failed: prev.failed + 1,
            progress: Math.round(((i + 1) / recipientCount) * 100),
          }))
        }

        // Add delay between emails
        if (i < emailsToSend.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      setResults(sendResults)
      setSendResults(sendResults)
      
      // Calculate final stats
      const finalSent = sendResults.filter(r => r.status === "sent").length
      const finalFailed = sendResults.filter(r => r.status === "failed").length
      
      setStats({
        total: recipientCount,
        sent: finalSent,
        failed: finalFailed,
        progress: 100,
      })
      
      // Save to localStorage to persist across navigation
      if (typeof window !== "undefined") {
        localStorage.setItem("sendora_send_results", JSON.stringify(sendResults))
        localStorage.setItem(SEND_COMPLETED_KEY, "true")
      }

      // Show completion toast based on actual results
      if (finalSent > 0 && finalFailed === 0) {
        notifications.showSuccess({
          title: 'All emails sent successfully!',
          description: `Successfully sent ${finalSent} email${finalSent > 1 ? 's' : ''} to all recipients.`,
          duration: 5000,
        })
      } else if (finalSent > 0 && finalFailed > 0) {
        notifications.showWarning({
          title: 'Email sending completed with errors',
          description: `${finalSent} sent successfully, ${finalFailed} failed. Check the results below for details.`,
          duration: 6000,
        })
      } else if (finalFailed > 0) {
        notifications.showError({
          title: 'Failed to send emails',
          description: `All ${finalFailed} email${finalFailed > 1 ? 's' : ''} failed to send. Please check your SMTP settings and try again.`,
          duration: 6000,
        })
      }
    } catch (err) {
      console.error("Send error:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to send emails"
      setError(errorMessage)
      setStats((prev) => ({ ...prev, progress: 100 }))
      setHasSent(false) // Allow retry on error
      notifications.showError({
        title: 'Email sending failed',
        description: errorMessage,
        duration: 5000,
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{sending ? "Sending Emails..." : "Preview & Send"}</h2>
        <p className="text-muted-foreground">
          {sending
            ? "Your emails are being sent. Please wait..."
            : "Review how your emails will look, then send them to all recipients."}
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-red-600 text-sm">{error}</span>
        </motion.div>
      )}

      {!sending && results.length === 0 && (
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
      )}

      {/* Stats - Show during sending and after */}
      {(sending || results.length > 0) && (
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="p-6 bg-primary/10 rounded-lg border border-primary/30">
            <div className="text-3xl font-bold text-primary">{stats.total || activeRows.length}</div>
            <p className="text-sm text-primary/80 mt-1">Total Recipients</p>
          </div>
          <div className="p-6 bg-green-500/10 rounded-lg border border-green-500/30">
            <div className="text-3xl font-bold text-green-600">{stats.sent}</div>
            <p className="text-sm text-green-600/80 mt-1">Successfully Sent</p>
          </div>
          <div className="p-6 bg-red-500/10 rounded-lg border border-red-500/30">
            <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-sm text-red-600/80 mt-1">Failed</p>
          </div>
          <div className="p-6 bg-amber-500/10 rounded-lg border border-amber-500/30">
            <div className="text-3xl font-bold text-amber-600">{state.skippedRows.size}</div>
            <p className="text-sm text-amber-600/80 mt-1">Skipped</p>
          </div>
        </div>
      )}

      {/* Sending Progress */}
      {sending && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="font-semibold">Sending in progress...</span>
              {stats.total > 0 && (
                <span className="text-muted-foreground ml-2">
                  (Estimated: ~{Math.ceil(stats.total * 1.2)} seconds with 1s delay per email)
                </span>
              )}
            </div>
            <Clock className="w-4 h-4 text-primary animate-spin" />
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${stats.progress}%` }}
              className="h-full bg-gradient-to-r from-primary to-accent"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            ⏱️ A 1-second delay is added after each email to prevent rate limiting by email providers.
          </p>
        </div>
      )}

      {/* Delay Notice */}
      {!sending && results.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-primary/10 border border-primary/30 rounded-lg"
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
      )}

      {/* Completion Message */}
      {results.length > 0 && !sending && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="font-medium text-green-700">Email sending completed</p>
          </div>
          <div className="text-sm text-green-600 space-y-1 ml-7">
            {stats.sent > 0 && (
              <p>
                <span className="font-semibold">{stats.sent}</span> email{stats.sent > 1 ? "s" : ""} sent successfully
              </p>
            )}
            {stats.failed > 0 && (
              <p>
                <span className="font-semibold">{stats.failed}</span> email{stats.failed > 1 ? "s" : ""} failed
              </p>
            )}
            {state.skippedRows.size > 0 && (
              <p>
                <span className="font-semibold">{state.skippedRows.size}</span> recipient{state.skippedRows.size > 1 ? "s" : ""} skipped
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(4)} disabled={sending}>
          Back
        </Button>
        {!sending && results.length === 0 && !hasSent && (
          <Button
            onClick={sendEmails}
            disabled={!state.smtpConfig}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
          >
            <Send className="w-4 h-4 mr-2" />
            Send {activeRows.length} Emails
          </Button>
        )}
        {hasSent && results.length > 0 && (
          <>
            <Button variant="outline" disabled className="opacity-50 cursor-not-allowed">
              <Send className="w-4 h-4 mr-2" />
              Already Sent
            </Button>
            <Button onClick={() => setStep(6)} className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
              View Summary
            </Button>
          </>
        )}
        {results.length === 0 && hasSent && (
          <Button variant="outline" disabled className="opacity-50 cursor-not-allowed">
            Emails already sent
          </Button>
        )}
      </div>
    </motion.div>
  )
}

