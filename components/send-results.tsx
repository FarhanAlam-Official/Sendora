"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface SendResult {
  email: string
  success: boolean
  messageId?: string
  error?: string
}

interface SendResultsProps {
  results: SendResult[]
  totalTime: number
  onReset: () => void
}

export function SendResults({ results, totalTime, onReset }: SendResultsProps) {
  const successful = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length
  const successRate = ((successful / results.length) * 100).toFixed(1)
  const timePerEmail = (totalTime / results.length).toFixed(0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{successful}</p>
              <p className="text-xs text-muted-foreground mt-1">Successful</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{failed}</p>
              <p className="text-xs text-muted-foreground mt-1">Failed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{successRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">Success Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{timePerEmail}ms</p>
              <p className="text-xs text-muted-foreground mt-1">Per Email</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Send Timeline
          </CardTitle>
          <CardDescription>Completed in {(totalTime / 1000).toFixed(2)}s</CardDescription>
        </CardHeader>
      </Card>

      {/* Detailed Results */}
      {failed > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              Failed Emails ({failed})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results
                .filter((r) => !r.success)
                .map((result, idx) => (
                  <div key={idx} className="p-3 bg-white rounded border border-red-200 text-sm">
                    <p className="font-mono text-red-600">{result.email}</p>
                    <p className="text-red-500 text-xs mt-1">{result.error}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={onReset} className="flex-1 bg-gradient-to-r from-primary to-accent">
          Send More Emails
        </Button>
        <Link href="/" className="flex-1">
          <Button variant="outline" className="w-full bg-transparent">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
