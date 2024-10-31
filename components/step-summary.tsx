"use client"

import { motion } from "framer-motion"
import { CheckCircle, AlertCircle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSendWizard } from "./send-wizard-context"
import Link from "next/link"

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
        <h2 className="text-2xl font-bold mb-2">Summary</h2>
        <p className="text-muted-foreground">Email sending completed. Review the results below.</p>
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
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Delivery Results</h3>
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
      <div className="flex gap-4">
        {results.length > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={exportLogs}
            className="flex-1 px-6 py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Logs (CSV)
          </motion.button>
        )}
        <Button variant="outline" onClick={() => setStep(5)} className="flex-1">
          Back to Preview
        </Button>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => {
            reset()
            setStep(1)
          }}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          Start New Send
        </motion.button>
        <Link href="/" className="flex-1">
          <Button variant="outline" className="w-full">
            Back to Home
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}

