"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useSendWizard } from "./send-wizard-context"
import { AlertCircle, CheckCircle2, Loader2, Pause, RotateCcw, X } from "lucide-react"
import Link from "next/link"

interface SendProgress {
  sent: number
  failed: number
  skipped: number
  total: number
  currentIndex: number
  status: "idle" | "sending" | "paused" | "completed" | "error"
  failedEmails: Array<{ email: string; reason: string }>
}

export default function StepSend() {
  const { state, setStep, reset } = useSendWizard()
  const [progress, setProgress] = useState<SendProgress>({
    sent: 0,
    failed: 0,
    skipped: state.skippedRows.size,
    total: state.rows.length,
    currentIndex: 0,
    status: "idle",
    failedEmails: [],
  })
  const [isPaused, setIsPaused] = useState(false)

  const activeRows = state.rows.map((row, idx) => ({ row, idx })).filter(({ idx }) => !state.skippedRows.has(idx))

  const sendEmails = async () => {
    setProgress((prev) => ({ ...prev, status: "sending" }))
    setIsPaused(false)

    const failedEmails: Array<{ email: string; reason: string }> = []
    let sent = 0
    let failed = 0

    // Collect all emails to send
    const emailsToSend = await Promise.all(
      activeRows.map(async ({ row, idx }) => {
        let subject = state.subject
        let body = state.messageBody

        const nameField = state.mapping.name
        const certificateField = state.mapping.certificateLink

        if (nameField) {
          subject = subject.replace(/\{\{name\}\}/g, row[nameField])
          body = body.replace(/\{\{name\}\}/g, row[nameField])
          body = body.replace(/\{\{recipient_name\}\}/g, row[nameField])
        }

        if (certificateField) {
          body = body.replace(/\{\{certificate_link\}\}/g, row[certificateField])
        }

        return {
          to: row[state.mapping.email || "email"],
          subject,
          body,
        }
      }),
    )

    try {
      const batchResponse = await fetch("/api/sendEmails-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: emailsToSend,
          smtpConfig: state.smtpConfig,
          customSMTP:
            state.smtpConfig === "custom" ? JSON.parse(localStorage.getItem("sendora_smtp_custom") || "{}") : undefined,
          delayBetween: 500,
        }),
      })

      if (batchResponse.ok) {
        const batchData = await batchResponse.json()
        sent = batchData.success
        failed = batchData.failed
        batchData.results
          .filter((r: any) => !r.success)
          .forEach((r: any) => {
            failedEmails.push({ email: r.email, reason: r.error })
          })
      } else {
        throw new Error("Batch send failed")
      }
    } catch (error) {
      // Fallback to individual sends
      for (let i = 0; i < emailsToSend.length; i++) {
        if (isPaused) {
          setProgress((prev) => ({ ...prev, status: "paused" }))
          return
        }

        const email = emailsToSend[i]
        setProgress((prev) => ({
          ...prev,
          currentIndex: i + 1,
        }))

        try {
          const response = await fetch("/api/sendEmails", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: email.to,
              subject: email.subject,
              body: email.body,
              smtpConfig: state.smtpConfig,
              customSMTP:
                state.smtpConfig === "custom"
                  ? JSON.parse(localStorage.getItem("sendora_smtp_custom") || "{}")
                  : undefined,
            }),
          })

          if (response.ok) {
            sent++
            setProgress((prev) => ({ ...prev, sent }))
          } else {
            const errorData = await response.json()
            failed++
            failedEmails.push({ email: email.to, reason: errorData.error })
            setProgress((prev) => ({
              ...prev,
              failed,
              failedEmails: [...prev.failedEmails, { email: email.to, reason: errorData.error }],
            }))
          }
        } catch (err) {
          failed++
          failedEmails.push({
            email: email.to,
            reason: err instanceof Error ? err.message : "Unknown error",
          })
          setProgress((prev) => ({
            ...prev,
            failed,
            failedEmails: [
              ...prev.failedEmails,
              { email: email.to, reason: err instanceof Error ? err.message : "Unknown error" },
            ],
          }))
        }

        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    setProgress((prev) => ({
      ...prev,
      status: "completed",
      currentIndex: activeRows.length,
    }))
  }

  const percentComplete = (progress.currentIndex / activeRows.length) * 100

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Send Emails</h2>
        <p className="text-muted-foreground">Your emails are ready to send</p>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{progress.sent}</p>
          <p className="text-xs text-muted-foreground">Sent</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{progress.failed}</p>
          <p className="text-xs text-muted-foreground">Failed</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-muted-foreground">{progress.skipped}</p>
          <p className="text-xs text-muted-foreground">Skipped</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{progress.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
      </div>

      {/* Progress Bar */}
      {progress.status !== "idle" && (
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium">
              {progress.currentIndex} of {activeRows.length} sent
            </span>
            <span className="text-muted-foreground">{Math.round(percentComplete)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      )}

      {/* Status Display */}
      {progress.status === "completed" && (
        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-700">Sending Complete!</p>
            <p className="text-sm text-green-600">
              {progress.sent} sent, {progress.failed} failed
            </p>
          </div>
        </div>
      )}

      {progress.status === "paused" && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700">Sending paused</p>
        </div>
      )}

      {progress.failed > 0 && progress.status === "completed" && (
        <div className="space-y-3">
          <h4 className="font-semibold text-red-600">Failed Emails ({progress.failed})</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {progress.failedEmails.map((item, idx) => (
              <div key={idx} className="text-xs p-3 bg-red-500/10 border border-red-500/20 rounded">
                <p className="font-mono text-red-700">{item.email}</p>
                <p className="text-red-600 text-xs mt-1">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-3">
        {progress.status === "idle" && (
          <Button
            onClick={sendEmails}
            className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground"
          >
            <Loader2 className="w-4 h-4 mr-2" />
            Start Sending
          </Button>
        )}

        {progress.status === "sending" && (
          <>
            <Button onClick={() => setIsPaused(true)} variant="outline" className="flex-1">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
            <Button variant="destructive" className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancel All
            </Button>
          </>
        )}

        {progress.status === "paused" && (
          <>
            <Button
              onClick={sendEmails}
              className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Resume
            </Button>
            <Button variant="destructive" className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancel All
            </Button>
          </>
        )}

        {progress.status === "completed" && (
          <>
            <Button
              onClick={() => reset()}
              className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Send Again
            </Button>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Back to Home
              </Button>
            </Link>
          </>
        )}
      </div>

      {/* Contact & Support */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center text-sm text-blue-700">
        <p>
          Questions?{" "}
          <Link href="/contact" className="underline font-medium">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  )
}
