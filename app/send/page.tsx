"use client"

import { SendWizardProvider } from "@/components/send-wizard-context"
import WizardStepIndicator from "@/components/wizard-step-indicator"
import StepUpload from "@/components/step-upload"
import StepPdfUploadMatch from "@/components/step-pdf-upload-match"
import StepCompose from "@/components/step-compose"
import StepSMTP from "@/components/step-smtp"
import StepPreviewSend from "@/components/step-preview-send"
import StepSummary from "@/components/step-summary"
import { useSendWizard } from "@/components/send-wizard-context"

/**
 * Send Wizard Content Component
 * 
 * This component renders the main content of the send wizard, displaying
 * the appropriate step component based on the current wizard state.
 * 
 * The wizard follows a 6-step process:
 * 1. Upload data file (StepUpload)
 * 2. Upload and match PDF certificates (StepPdfUploadMatch)
 * 3. Compose email content (StepCompose)
 * 4. Configure SMTP settings (StepSMTP)
 * 5. Preview and send (StepPreviewSend)
 * 6. View summary (StepSummary)
 */
function SendWizardContent() {
  const { state } = useSendWizard()

  return (
    <main className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Wizard Step Indicator - shows progress through the steps */}
        <WizardStepIndicator />

        {/* Step Content Container */}
        <div className="bg-card border border-border rounded-xl p-8">
          {state.step === 1 && <StepUpload />}
          {state.step === 2 && <StepPdfUploadMatch />}
          {state.step === 3 && <StepCompose />}
          {state.step === 4 && <StepSMTP />}
          {state.step === 5 && <StepPreviewSend />}
          {state.step === 6 && <StepSummary />}
        </div>
      </div>
    </main>
  )
}

/**
 * Send Wizard Page Component
 * 
 * This is the main entry point for the certificate/email sending workflow.
 * It wraps the SendWizardContent component with the SendWizardProvider
 * to manage the wizard state and provide it to all step components.
 * 
 * The wizard guides users through the complete process of:
 * - Uploading recipient data
 * - Matching certificates to recipients
 * - Composing email content
 * - Configuring SMTP settings
 * - Previewing and sending emails
 * - Viewing results
 */
export default function SendWizard() {
  return (
    <SendWizardProvider>
      <SendWizardContent />
    </SendWizardProvider>
  )
}