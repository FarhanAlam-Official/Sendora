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

function SendWizardContent() {
  const { state } = useSendWizard()

  return (
    <main className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <WizardStepIndicator />

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

export default function SendWizard() {
  return (
    <SendWizardProvider>
      <SendWizardContent />
    </SendWizardProvider>
  )
}
