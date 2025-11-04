/**
 * @fileoverview Step Compose Component - Email Template Selection and Composition
 * @module components/step-compose
 * @description
 * This component implements Step 3 of the email sending wizard, allowing users to:
 * - Select from pre-defined email templates or create custom templates
 * - Compose subject lines and message bodies with placeholder support
 * - Preview personalized emails with live data substitution
 * - Save custom templates to localStorage for reuse
 * - Manage certificate link placeholders based on configuration
 * 
 * Features:
 * - 4 built-in email templates for common certificate scenarios
 * - Custom template creation and persistence
 * - Real-time email preview with recipient data
 * - Automatic placeholder replacement ({{name}}, {{email}}, {{certificate_link}})
 * - Certificate link management with automatic cleanup
 * - Template highlighting and visual feedback
 * 
 * @requires react
 * @requires @/components/ui/button
 * @requires @/components/ui/input
 * @requires @/components/ui/textarea
 * @requires @/components/ui/dialog
 * @requires ./send-wizard-context
 * @requires lucide-react
 */

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useSendWizard } from "./send-wizard-context"
import { Info, Mail, Sparkles, Save, Star } from "lucide-react"

/**
 * Pre-defined email templates for common certificate distribution scenarios.
 * Each template includes a name, subject line, and body with placeholders.
 * 
 * @constant
 * @type {Array<{name: string, subject: string, body: string}>}
 */
const EMAIL_TEMPLATES = [
  {
    name: "Certificate Award",
    subject: "Congratulations {{name}} - Your Certificate is Ready!",
    body: `Dear {{name}},

Congratulations on completing the program! Your certificate is ready for download.

{{certificate_link}}

We're proud of your achievement and wish you continued success.

Best regards,
The Team`,
  },
  {
    name: "Completion Certificate",
    subject: "Certificate of Completion for {{name}}",
    body: `Hello {{name}},

We're pleased to inform you that you have successfully completed the course. Your certificate is attached to this email.

{{certificate_link}}

Thank you for your participation and dedication.

Best regards,
The Certification Team`,
  },
  {
    name: "Achievement Certificate",
    subject: "Your Achievement Certificate - {{name}}",
    body: `Dear {{name}},

Congratulations on your outstanding achievement! Your certificate is ready.

Certificate: {{certificate_link}}

Your hard work and dedication have paid off. Keep up the excellent work!

Warm regards,
The Award Committee`,
  },
  {
    name: "Simple Notification",
    subject: "Your Certificate - {{name}}",
    body: `Hi {{name}},

Your certificate is ready. You can download it from the link below:

{{certificate_link}}

Best,
The Team`,
  },
]

/**
 * LocalStorage key for persisting custom email templates.
 * @constant
 * @type {string}
 */
const TEMPLATE_STORAGE_KEY = "sendora_custom_templates"

/**
 * Loads custom email templates from localStorage.
 * Returns an empty array if no templates exist or if parsing fails.
 * 
 * @function
 * @returns {Array<{name: string, subject: string, body: string}>} Array of custom templates
 * 
 * @example
 * const templates = loadCustomTemplates()
 * // Returns: [{ name: "Monthly Award", subject: "...", body: "..." }]
 */
function loadCustomTemplates() {
  try {
    const stored = localStorage.getItem(TEMPLATE_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Saves a new custom email template to localStorage.
 * Appends the template to existing custom templates.
 * 
 * @function
 * @param {Object} template - The template to save
 * @param {string} template.name - Template name/identifier
 * @param {string} template.subject - Email subject line
 * @param {string} template.body - Email body content
 * 
 * @example
 * saveCustomTemplate({
 *   name: "Monthly Award",
 *   subject: "Congratulations {{name}}!",
 *   body: "Dear {{name}},\n\nYour certificate: {{certificate_link}}"
 * })
 */
function saveCustomTemplate(template: { name: string; subject: string; body: string }) {
  const templates = loadCustomTemplates()
  templates.push(template)
  localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates))
}

/**
 * Step Compose Component - Email template selection and composition wizard step.
 * 
 * This component provides a dual-panel interface for email composition:
 * - Left panel: Template selection, subject/body editing, template saving
 * - Right panel: Live preview of personalized email with actual recipient data
 * 
 * State Management:
 * - Manages local editing state (subject, messageBody)
 * - Syncs with wizard context on navigation
 * - Automatically handles certificate link placeholders
 * 
 * Features:
 * - Pre-defined template selection with hover effects
 * - Custom template creation and persistence
 * - Real-time placeholder substitution in preview
 * - Certificate link management based on wizard configuration
 * - Visual indicators for selected templates
 * 
 * @component
 * @returns {JSX.Element} Email composition interface with template selection and preview
 * 
 * @example
 * // Used within SendWizard flow
 * <SendWizardProvider>
 *   <StepCompose /> // Shows when currentStep === 3
 * </SendWizardProvider>
 */
export default function StepCompose() {
  const { state, setComposition, setStep } = useSendWizard()
  const [subject, setSubject] = useState(state.subject || EMAIL_TEMPLATES[0].subject)
  const [messageBody, setMessageBody] = useState(state.messageBody || EMAIL_TEMPLATES[0].body)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [customTemplates, setCustomTemplates] = useState<Array<{ name: string; subject: string; body: string }>>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [templateName, setTemplateName] = useState("")

  useEffect(() => {
    setCustomTemplates(loadCustomTemplates())
  }, [])

  // Remove certificate_link placeholder when certificate link is disabled
  useEffect(() => {
    if (!state.certificateLinkEnabled && messageBody.includes("{{certificate_link}}")) {
      // Remove certificate_link placeholder and clean up extra newlines
      const cleanedBody = messageBody
        .replace(/\{\{certificate_link\}\}/g, "")
        .replace(/\n\n\n+/g, "\n\n")
        .trim()
      if (cleanedBody !== messageBody) {
        setMessageBody(cleanedBody)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.certificateLinkEnabled])

  const allTemplates = [...EMAIL_TEMPLATES, ...customTemplates]

  // Get first active row for preview
  const firstActiveRowIndex = state.rows.findIndex((_, idx) => !state.skippedRows.has(idx))
  const previewRow =
    firstActiveRowIndex >= 0 ? state.rowEdits.get(firstActiveRowIndex) || state.rows[firstActiveRowIndex] : null

  // Render template with placeholder values
  const renderTemplate = (text: string) => {
    if (!previewRow) return text

    let rendered = text
    const emailField = state.mapping.email || "email"
    const nameField = state.mapping.name || "name"

    rendered = rendered.replace(/\{\{email\}\}/g, previewRow[emailField] || "[email]")
    rendered = rendered.replace(/\{\{name\}\}/g, previewRow[nameField] || "[name]")
    rendered = rendered.replace(/\{\{recipient_name\}\}/g, previewRow[nameField] || "[name]")

    // Only replace certificate_link if it's enabled
    if (state.certificateLinkEnabled) {
      const certificateField = state.mapping.certificateLink || ""
      if (certificateField) {
        rendered = rendered.replace(/\{\{certificate_link\}\}/g, previewRow[certificateField] || "[certificate link]")
      } else {
        rendered = rendered.replace(/\{\{certificate_link\}\}/g, "[certificate link]")
      }
    } else {
      // Remove certificate_link placeholder if not enabled
      rendered = rendered.replace(/\{\{certificate_link\}\}/g, "")
    }

    return rendered
  }

  const handleTemplateSelect = (template: { name: string; subject: string; body: string }) => {
    let selectedSubject = template.subject
    let selectedBody = template.body

    // Remove certificate_link placeholder if certificate link is not enabled
    if (!state.certificateLinkEnabled) {
      selectedBody = selectedBody.replace(/\{\{certificate_link\}\}/g, "").trim()
      // Clean up extra newlines
      selectedBody = selectedBody.replace(/\n\n\n+/g, "\n\n")
    }

    setSubject(selectedSubject)
    setMessageBody(selectedBody)
    setSelectedTemplate(template.name)
  }

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return
    const template = {
      name: templateName.trim(),
      subject,
      body: messageBody,
    }
    saveCustomTemplate(template)
    setCustomTemplates(loadCustomTemplates())
    setShowSaveDialog(false)
    setTemplateName("")
    setSelectedTemplate(template.name)
  }

  const handleNext = () => {
    // Remove certificate_link placeholder if disabled before saving
    let finalBody = messageBody
    if (!state.certificateLinkEnabled && finalBody.includes("{{certificate_link}}")) {
      finalBody = finalBody
        .replace(/\{\{certificate_link\}\}/g, "")
        .replace(/\n\n\n+/g, "\n\n")
        .trim()
    }
    setComposition(subject, finalBody)
    setStep(4)
  }

  const previewSubject = renderTemplate(subject)
  const previewBody = renderTemplate(messageBody)

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Compose Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Compose Email</h2>
          <p className="text-muted-foreground">Choose a template or write your own email with placeholders</p>
        </div>

        {/* Template Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <label className="text-sm font-medium">Choose a Template:</label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {allTemplates.map((template, idx) => {
              const isCustom = idx >= EMAIL_TEMPLATES.length
              return (
                <Button
                  key={`${template.name}-${idx}`}
                  variant={selectedTemplate === template.name ? "default" : "outline"}
                  onClick={() => handleTemplateSelect(template)}
                  className={`justify-start h-auto p-4 transition-all duration-200 ${
                    selectedTemplate === template.name
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md hover:shadow-lg scale-100"
                      : "bg-muted hover:bg-blue-100 hover:text-blue-600 hover:border-blue-300 hover:shadow-sm hover:scale-[1.02]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{template.name}</span>
                    {isCustom && <Star className="w-3 h-3 fill-current" />}
                  </div>
                </Button>
              )
            })}
          </div>
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full gap-2 bg-card hover:bg-green-100 hover:text-green-600 hover:border-green-300 hover:shadow-sm transition-all duration-200">
                <Save className="w-4 h-4" />
                Save as Custom Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Custom Template</DialogTitle>
                <DialogDescription>Save your current email as a reusable template</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Template Name</label>
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Monthly Certificate"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && templateName.trim()) {
                        handleSaveTemplate()
                      }
                    }}
                  />
                </div>
                <Button onClick={handleSaveTemplate} disabled={!templateName.trim()} className="w-full">
                  Save Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Subject Line</label>
            <Input
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value)
                setSelectedTemplate(null)
              }}
              placeholder="e.g., Congratulations {{name}}!"
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Message Body</label>
            <Textarea
              value={messageBody}
              onChange={(e) => {
                setMessageBody(e.target.value)
                setSelectedTemplate(null)
              }}
              placeholder={`Dear {{name}},\n\nYour message here...`}
              className="w-full h-48"
            />
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Available Placeholders:</p>
              <ul className="space-y-1 text-xs">
                <li>
                  • <code className="bg-blue-500/20 px-1 rounded">{"{{name}}"}</code> - Recipient name
                </li>
                <li>
                  • <code className="bg-blue-500/20 px-1 rounded">{"{{email}}"}</code> - Recipient email
                </li>
                {state.certificateLinkEnabled && state.mapping.certificateLink && (
                  <li>
                    • <code className="bg-blue-500/20 px-1 rounded">{"{{certificate_link}}"}</code> - Certificate URL
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(2)}>
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!subject.trim() || !messageBody.trim()}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
          >
            Next: SMTP Config
          </Button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Live Preview</h3>

        {previewRow ? (
          <div className="bg-white rounded-lg border border-border overflow-hidden shadow-lg">
            {/* Email Preview Header */}
            <div className="bg-muted/50 border-b border-border p-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">To: </span>
                  <span className="font-medium">{previewRow[state.mapping.email || "email"]}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Subject: </span>
                  <span className="font-medium text-foreground">{previewSubject || "(No subject)"}</span>
                </div>
              </div>
            </div>

            {/* Email Preview Body */}
            <div className="p-6 text-foreground prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {previewBody || "(No message body)"}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-muted/50 rounded-lg border border-border p-8 text-center">
            <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No active recipients to preview</p>
          </div>
        )}

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <p className="text-xs text-amber-700">
            <strong>Note:</strong> Preview shows the first active recipient. Actual emails will use data from each row.
          </p>
        </div>
      </div>
    </div>
  )
}
