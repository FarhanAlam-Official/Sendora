"use client"

import { useSendWizard } from "./send-wizard-context"

interface Step {
  number: number
  title: string
}

export default function WizardStepIndicator() {
  const { state } = useSendWizard()

  const steps: Step[] = [
    { number: 1, title: "Upload Excel" },
    { number: 2, title: "Upload & Match PDFs" },
    { number: 3, title: "Compose Email" },
    { number: 4, title: "SMTP Config" },
    { number: 5, title: "Preview & Send" },
    { number: 6, title: "Summary" },
  ]

  return (
    <div className="flex items-center justify-between mb-8 px-4">
      {steps.map((step, idx) => (
        <div key={step.number} className="flex items-center flex-1">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              step.number <= state.step
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {step.number}
          </div>
          <div className="ml-3 mr-auto">
            <p
              className={`text-xs font-medium ${
                step.number <= state.step ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.title}
            </p>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`h-0.5 flex-1 mx-2 transition-all ${step.number < state.step ? "bg-primary" : "bg-border"}`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
