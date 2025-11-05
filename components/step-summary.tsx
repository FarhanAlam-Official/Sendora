/**
 * @fileoverview Step Summary Component - Email Sending Results and Statistics
 * @module components/step-summary
 * @description
 * This component implements the final summary step of the email sending wizard:
 * - Displays comprehensive sending statistics (total, sent, failed, skipped)
 * - Shows detailed delivery results in a table format
 * - Provides CSV export functionality for sending logs
 * - Offers navigation to restart wizard or return home
 * - Uses animated stat cards with staggered transitions
 * 
 * Features:
 * - 4 animated stat cards (Total, Sent, Failed, Skipped)
 * - Detailed results table with status indicators
 * - CSV export with timestamp for record-keeping
 * - Multiple navigation options (Back, New Send, Home)
 * - Framer Motion animations for visual polish
 * - Success/failure visual indicators (CheckCircle/AlertCircle)
 * 
 * Data Display:
 * - Total Recipients: Count of all emails attempted
 * - Successfully Sent: Emails delivered without errors
 * - Failed: Emails that encountered sending errors
 * - Skipped: Recipients excluded during wizard setup
 * 
 * @requires react
 * @requires framer-motion
 * @requires lucide-react
 * @requires @/components/ui/button
 * @requires ./send-wizard-context
 * @requires next/link
 */

"use client"

import { motion } from "framer-motion"
import { CheckCircle, AlertCircle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSendWizard } from "./send-wizard-context"
import Link from "next/link"

/**
 * Step Summary Component - Final wizard step displaying send results.
 * 
 * This component presents the final results of the email sending operation:
 * - Statistics overview with color-coded cards
 * - Detailed table of individual recipient results
 * - Export functionality for audit logs
 * - Navigation options for next actions
 * 
 * Statistics Cards:
 * - Blue (Primary): Total recipients processed
 * - Green: Successfully sent emails
 * - Red: Failed email attempts
 * - Amber: Skipped recipients
 * - Each card animates in with staggered timing
 * 
 * Results Table Columns:
 * - Name: Recipient name from uploaded data
 * - Email: Recipient email address
 * - Status: Visual indicator (Sent/Failed) with icon
 * - Message: Success confirmation or error details
 * 
 * Export Functionality:
 * - Creates CSV file with all sending results
 * - Includes timestamp in filename (sendora-logs-{timestamp}.csv)
 * - Contains: Name, Email, Status, Message columns
 * - Properly escapes CSV fields with quotes
 * 
 * Navigation Options:
 * - Back to Preview: Review before re-sending (disabled)
 * - Start New Send: Resets wizard to step 1
 * - Back to Home: Returns to main application page
 * - Export Logs: Downloads CSV of results
 * 
 * @component
 * @returns {JSX.Element} Summary interface with statistics, results table, and actions
 * 
 * @example
 * // Used as final step in SendWizard
 * <SendWizardProvider>
 *   <StepSummary /> // Shows when currentStep === 6
 * </SendWizardProvider>
 */
export default function StepSummary() {
  const { state, setStep, reset } = useSendWizard()
  const results = state.sendResults || []
  const stats = {
    total: results.length,
    sent: results.filter((r) => r.status === "sent").length,
    failed: results.filter((r) => r.status === "failed").length,
    progress: 100,
  }


  const exportLogs = () => {
    const csv = [
      ["Name", "Email", "Status", "Message"],
      ...results.map((r) => [r.name, r.email, r.status, r.message || ""]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sendora-logs-${Date.now()}.csv`
    a.click()
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Summary</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Email sending completed. Review the results below.</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-6 bg-primary/10 rounded-lg border border-primary/30"
        >
          <div className="text-3xl font-bold text-primary">{stats.total}</div>
          <p className="text-sm text-primary/80 mt-1">Total Recipients</p>
        </motion.div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-green-500/10 rounded-lg border border-green-500/30"
        >
          <div className="text-3xl font-bold text-green-600">{stats.sent}</div>
          <p className="text-sm text-green-600/80 mt-1">Successfully Sent</p>
        </motion.div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-red-500/10 rounded-lg border border-red-500/30"
        >
          <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
          <p className="text-sm text-red-600/80 mt-1">Failed</p>
        </motion.div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-amber-500/10 rounded-lg border border-amber-500/30"
        >
          <div className="text-3xl font-bold text-amber-600">{state.skippedRows.size}</div>
          <p className="text-sm text-amber-600/80 mt-1">Skipped</p>
        </motion.div>
      </div>


      {/* Results Table */}
      {results.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <h3 className="font-semibold text-base sm:text-lg mb-4">Delivery Results</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Name</th>
                  <th className="px-4 py-2 text-left font-semibold">Email</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                  <th className="px-4 py-2 text-left font-semibold">Message</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-t border-border"
                  >
                    <td className="px-4 py-3">{result.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{result.email}</td>
                    <td className="px-4 py-3">
                      {result.status === "sent" ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>Sent</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span>Failed</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{result.message}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {results.length > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={exportLogs}
            className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Download className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Export Logs (CSV)</span>
          </motion.button>
        )}
        <Button variant="outline" onClick={() => setStep(5)} className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base h-auto">
          Back to Preview
        </Button>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => {
            reset()
            setStep(1)
          }}
          className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
        >
          Start New Send
        </motion.button>
        <Link href="/" className="w-full sm:flex-1">
          <Button variant="outline" className="w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base h-auto">
            Back to Home
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}

