"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { notifications } from "@/lib/notifications"

/**
 * SMTP Configuration Page Component
 * 
 * This admin page allows users to configure custom SMTP settings for email delivery.
 * It provides functionality to:
 * - Input and save SMTP configuration details (host, port, email, password)
 * - Test the SMTP connection to verify settings
 * - Display success/error feedback for user actions
 * 
 * The component uses localStorage to persist settings between sessions and
 * communicates with the backend API to test SMTP connections.
 */
export default function SMTPConfigPage() {
  // State for SMTP configuration values
  const [smtp, setSMTP] = useState({
    host: "",
    port: "587",
    email: "",
    password: "",
  })
  
  // Loading state for connection testing
  const [testing, setTesting] = useState(false)
  
  // Result state for connection testing feedback
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  /**
   * Load saved SMTP configuration from localStorage on component mount
   */
  useEffect(() => {
    const saved = localStorage.getItem("sendora_smtp_custom")
    if (saved) {
      setSMTP(JSON.parse(saved))
    }
  }, [])

  /**
   * Save SMTP configuration to localStorage and show success notification
   */
  const handleSave = () => {
    localStorage.setItem("sendora_smtp_custom", JSON.stringify(smtp))
    notifications.showSuccess({
      title: 'SMTP configuration saved!',
      description: 'Your custom SMTP settings have been saved successfully.',
    })
  }

  /**
   * Test SMTP connection by sending configuration to backend API
   * Validates required fields before testing and handles success/error responses
   */
  const handleTest = async () => {
    // Validate required fields before testing
    if (!smtp.host || !smtp.email || !smtp.password) {
      setTestResult({ success: false, message: "Please fill in all fields" })
      return
    }

    setTesting(true)
    setTestResult(null)

    try {
      // Send SMTP configuration to backend for testing
      const response = await fetch("/api/testSMTP", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(smtp),
      })

      const data = await response.json()
      
      // Handle successful connection test
      if (response.ok) {
        setTestResult({ success: true, message: "Connection successful!" })
        notifications.showSuccess({
          title: 'SMTP connection successful!',
          description: 'Your SMTP settings are working correctly.',
        })
      } else {
        // Handle failed connection test
        const errorMessage = data.error || "Connection failed"
        setTestResult({ success: false, message: errorMessage })
        notifications.showError({
          title: 'SMTP connection failed',
          description: errorMessage,
        })
      }
    } catch (error) {
      // Handle network errors or other exceptions
      const errorMessage = "Failed to test connection"
      setTestResult({ success: false, message: errorMessage })
      notifications.showError({
        title: 'Connection test failed',
        description: 'Unable to connect to the SMTP server. Please check your settings.',
      })
    } finally {
      // Reset loading state regardless of test outcome
      setTesting(false)
    }
  }

  return (
    <main className="pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        {/* Default SMTP Info */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Default SMTP:</strong> The default SMTP option uses server-side environment variables (SMTP_HOST,
            SMTP_USER, SMTP_PASSWORD). If these are not configured, you must use custom SMTP settings below.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Custom SMTP Configuration</CardTitle>
            <CardDescription>
              Configure your custom SMTP settings. These will be used when "Use My Own SMTP" is selected.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* SMTP Host Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">SMTP Host</label>
              <Input
                value={smtp.host}
                onChange={(e) => setSMTP({ ...smtp, host: e.target.value })}
                placeholder="smtp.gmail.com"
              />
            </div>
            
            {/* Port Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">Port</label>
              <Input
                value={smtp.port}
                onChange={(e) => setSMTP({ ...smtp, port: e.target.value })}
                placeholder="587"
              />
            </div>
            
            {/* Email Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                type="email"
                value={smtp.email}
                onChange={(e) => setSMTP({ ...smtp, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>
            
            {/* Password Input with App Password guidance */}
            <div>
              <label className="text-sm font-medium mb-2 block">Password / App Password</label>
              <Input
                type="password"
                value={smtp.password}
                onChange={(e) => setSMTP({ ...smtp, password: e.target.value })}
                placeholder="••••••••"
              />
              <p className="text-xs text-muted-foreground mt-2">
                For Gmail: Use an{" "}
                <a
                  href="https://support.google.com/accounts/answer/185833"
                  target="_blank"
                  className="underline text-primary"
                  rel="noreferrer"
                >
                  App Password
                </a>
              </p>
            </div>

            {/* Test Result Feedback */}
            {testResult && (
              <Alert variant={testResult.success ? "default" : "destructive"}>
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{testResult.message}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={handleTest} disabled={testing || !smtp.host || !smtp.email || !smtp.password} variant="outline" className="flex-1">
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>
              <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-primary to-accent">
                Save Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}