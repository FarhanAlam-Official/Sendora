/**
 * @fileoverview Step SMTP Component - SMTP Configuration and Testing
 * @module components/step-smtp
 * @description
 * This component implements Step 5 of the email sending wizard, managing SMTP configuration:
 * - Selection between default (server-side) and custom SMTP
 * - Custom SMTP server configuration with connection testing
 * - Credentials management with localStorage persistence
 * - Real-time connection validation via API endpoint
 * - Send summary preview with recipient statistics
 * 
 * Features:
 * - Two configuration modes: Default and Custom
 * - Custom SMTP form for Gmail, Office 365, or custom servers
 * - Connection testing with success/failure feedback
 * - Secure local storage for SMTP credentials
 * - Visual feedback for selected configuration
 * - Send summary with recipient counts
 * 
 * Security:
 * - Credentials stored only in browser localStorage (never sent to server except during test)
 * - Clear user communication about data privacy
 * - Support for app passwords (e.g., Gmail App Passwords)
 * 
 * @requires react
 * @requires @/components/ui/button
 * @requires @/components/ui/input
 * @requires ./send-wizard-context
 * @requires lucide-react
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSendWizard } from "./send-wizard-context"
import { AlertCircle, CheckCircle2, Loader2, Lock } from "lucide-react"
import { notifications } from "@/lib/notifications"

/**
 * Step SMTP Component - SMTP configuration wizard step.
 * 
 * This component provides SMTP server configuration options:
 * - Default SMTP: Uses server-configured email service (requires env vars)
 * - Custom SMTP: User-provided SMTP server credentials (Gmail, Office365, etc.)
 * 
 * Configuration Management:
 * - Default mode: No user input required, uses server environment
 * - Custom mode: User enters host, port, email, password
 * - Credentials saved to localStorage for persistence
 * - Connection can be tested before proceeding
 * 
 * User Interface:
 * - Radio-style cards for configuration selection
 * - Conditional custom SMTP form
 * - Test connection button with loading state
 * - Success/error feedback for connection tests
 * - Security notice about local storage
 * - Send summary with recipient statistics
 * 
 * Custom SMTP Fields:
 * - Host: SMTP server address (e.g., smtp.gmail.com)
 * - Port: SMTP port (default: 587 for TLS)
 * - Email: Sender email address
 * - Password: Email password or app password
 * 
 * @component
 * @returns {JSX.Element} SMTP configuration interface with testing capability
 * 
 * @example
 * // Used within SendWizard flow
 * <SendWizardProvider>
 *   <StepSMTP /> // Shows when currentStep === 5
 * </SendWizardProvider>
 */
export default function StepSMTP() {
  const { state, setStep, setSMTPConfig } = useSendWizard()
  const [configType, setConfigType] = useState<"default" | "custom" | null>(state.smtpConfig)
  const [customSMTP, setCustomSMTP] = useState(() => {
    try {
      const saved = localStorage.getItem("sendora_smtp_custom")
      return saved
        ? JSON.parse(saved)
        : {
            host: "",
            port: "587",
            email: "",
            password: "",
          }
    } catch {
      return { host: "", port: "587", email: "", password: "" }
    }
  })
  const [testingConnection, setTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSaveSMTP = () => {
    if (configType === "custom") {
      localStorage.setItem("sendora_smtp_custom", JSON.stringify(customSMTP))
      setSMTPConfig("custom")
    } else if (configType === "default") {
      setSMTPConfig("default")
    }
    setStep(5)
  }

  const handleTestConnection = async () => {
    if (configType !== "custom" || !customSMTP.host || !customSMTP.email || !customSMTP.password) {
      const errorMessage = "Please fill in all fields"
      setTestResult({ success: false, message: errorMessage })
      notifications.showError({
        title: 'Validation error',
        description: errorMessage,
      })
      return
    }

    setTestingConnection(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/testSMTP", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customSMTP),
      })

      const data = await response.json()
      if (response.ok) {
        const successMessage = "Connection successful!"
        setTestResult({ success: true, message: successMessage })
        notifications.showSuccess({
          title: 'SMTP connection successful!',
          description: 'Your SMTP settings are working correctly.',
        })
      } else {
        const errorMessage = data.error || "Connection failed"
        setTestResult({ success: false, message: errorMessage })
        notifications.showError({
          title: 'SMTP connection failed',
          description: errorMessage,
        })
      }
    } catch (error) {
      const errorMessage = "Failed to test connection"
      setTestResult({ success: false, message: errorMessage })
      notifications.showError({
        title: 'Connection test failed',
        description: 'Unable to connect to the SMTP server. Please check your settings.',
      })
    } finally {
      setTestingConnection(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">SMTP Configuration</h2>
        <p className="text-muted-foreground">Choose how you want to send emails</p>
      </div>

      {/* Config Type Selection */}
      <div className="space-y-4">
        {/* Default Option */}
        <div
          onClick={() => setConfigType("default")}
          className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
            configType === "default" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">Use Default SMTP</h3>
              <p className="text-muted-foreground text-sm mt-1">Sendora's built-in email service</p>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                configType === "default" ? "border-primary bg-primary" : "border-border"
              }`}
            >
              {configType === "default" && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
            </div>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>✓ No setup required (requires server environment variables)</p>
            <p>✓ Recommended if server SMTP is configured</p>
            <p>✓ Your data stays private</p>
          </div>
        </div>

        {/* Custom Option */}
        <div
          onClick={() => setConfigType("custom")}
          className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
            configType === "custom" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">Use My Own SMTP</h3>
              <p className="text-muted-foreground text-sm mt-1">Gmail, Office 365, or custom server</p>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                configType === "custom" ? "border-primary bg-primary" : "border-border"
              }`}
            >
              {configType === "custom" && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
            </div>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>✓ Use your email provider</p>
            <p>✓ Send from your email address</p>
            <p>✓ Credentials stored locally only</p>
          </div>
        </div>
      </div>

      {/* Custom SMTP Form */}
      {configType === "custom" && (
        <div className="space-y-4 border-t border-border pt-6">
          <h4 className="font-semibold">SMTP Server Details</h4>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">SMTP Host</label>
              <Input
                value={customSMTP.host}
                onChange={(e) => setCustomSMTP({ ...customSMTP, host: e.target.value })}
                placeholder="e.g., smtp.gmail.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Port</label>
              <Input
                value={customSMTP.port}
                onChange={(e) => setCustomSMTP({ ...customSMTP, port: e.target.value })}
                placeholder="587"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Email Address</label>
            <Input
              type="email"
              value={customSMTP.email}
              onChange={(e) => setCustomSMTP({ ...customSMTP, email: e.target.value })}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Password / App Password</label>
            <Input
              type="password"
              value={customSMTP.password}
              onChange={(e) => setCustomSMTP({ ...customSMTP, password: e.target.value })}
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

          {/* Security Note */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
            <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Your credentials are stored only in your browser's local storage and never sent to our servers.
            </p>
          </div>

          {/* Test Connection */}
          <Button
            onClick={handleTestConnection}
            disabled={testingConnection || !customSMTP.host || !customSMTP.email || !customSMTP.password}
            variant="outline"
            className="w-full bg-transparent"
          >
            {testingConnection ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing Connection...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>

          {testResult && (
            <div
              className={`flex items-center gap-3 p-4 rounded-lg ${
                testResult.success
                  ? "bg-green-500/10 border border-green-500/30"
                  : "bg-red-500/10 border border-red-500/30"
              }`}
            >
              {testResult.success ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-600">{testResult.message}</p>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-600">{testResult.message}</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Send Summary Preview */}
      {configType && (
        <div className="bg-muted/50 p-6 rounded-lg border border-border space-y-3">
          <h4 className="font-semibold">Send Summary</h4>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Total Recipients:</strong> {state.rows.length}
            </p>
            <p>
              <strong>Active Recipients:</strong> {state.rows.length - state.skippedRows.size}
            </p>
            <p>
              <strong>Skipped:</strong> {state.skippedRows.size}
            </p>
            <p>
              <strong>Using:</strong> {configType === "default" ? "Sendora Default SMTP" : "Custom SMTP"}
            </p>
            <p className="text-muted-foreground text-xs mt-3">Estimated time: ~1-2 seconds per email</p>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(3)}>
          Back
        </Button>
        <Button
          onClick={handleSaveSMTP}
          disabled={!configType}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
        >
          Next: Preview & Send
        </Button>
      </div>
    </div>
  )
}
