/**
 * @fileoverview Wizard Step Indicator Component
 * 
 * This component displays a visual progress indicator for the multi-step email
 * sending wizard. It shows the user's current position in the workflow and
 * provides context for completed and upcoming steps.
 * 
 * **Key Features:**
 * - Visual step progression indicator
 * - Numbered step circles with gradient for active/completed steps
 * - Connecting lines between steps showing progress
 * - Step titles for context
 * - Responsive design for various screen sizes
 * - Smooth transitions between states
 * 
 * **Wizard Steps:**
 * 1. Upload Excel: Import recipient data
 * 2. Upload & Match PDFs: Associate certificates with recipients
 * 3. Compose Email: Create email subject and body
 * 4. SMTP Config: Configure email server settings
 * 5. Preview & Send: Review and send emails
 * 6. Summary: View send results and statistics
 * 
 * **Visual States:**
 * - Active/Completed: Gradient background (primary to accent)
 * - Inactive/Upcoming: Muted background
 * - Progress Lines: Colored for completed segments
 * 
 * **Integration:**
 * Reads current step from SendWizardContext and updates visual
 * state accordingly. Does not handle navigation.
 * 
 * @module components/wizard-step-indicator
 * @requires components/send-wizard-context - Wizard state management
 * 
 * @author Farhan Alam
 * @version 1.0.0
 */

"use client"

import { useSendWizard } from "./send-wizard-context"

/**
 * Step configuration interface
 * 
 * Defines the structure for wizard step metadata.
 * 
 * @interface Step
 * @property {number} number - Step number (1-based index)
 * @property {string} title - Display title for the step
 */
interface Step {
  number: number
  title: string
}

/**
 * Wizard Step Indicator Component
 * 
 * Renders a horizontal progress indicator showing all wizard steps with
 * visual feedback for current position and completed steps.
 * 
 * **Visual Design:**
 * - Numbered circles for each step
 * - Step titles below circles
 * - Connecting lines between steps
 * - Gradient colors for active/completed steps
 * - Muted colors for upcoming steps
 * 
 * **State Management:**
 * - Reads current step from wizard context
 * - No local state (purely presentational)
 * - Updates automatically when step changes
 * 
 * **Responsive Behavior:**
 * - Horizontal layout on all screen sizes
 * - Adjusts spacing based on viewport
 * - Text scales appropriately
 * 
 * @component
 * @returns {JSX.Element} Rendered step indicator
 * 
 * @example
 * // Usage in wizard layout
 * export default function SendPage() {
 *   return (
 *     <SendWizardProvider>
 *       <WizardStepIndicator />
 *       <WizardContent />
 *     </SendWizardProvider>
 *   )
 * }
 */
export default function WizardStepIndicator() {
  const { state } = useSendWizard()

  /**
   * Wizard steps configuration
   * 
   * Defines all steps in the wizard workflow with their display titles.
   * Order matters - matches the sequential wizard flow.
   * 
   * @constant {Step[]}
   */
  const steps: Step[] = [
    { number: 1, title: "Upload Excel" },
    { number: 2, title: "Upload & Match PDFs" },
    { number: 3, title: "Compose Email" },
    { number: 4, title: "SMTP Config" },
    { number: 5, title: "Preview & Send" },
    { number: 6, title: "Summary" },
  ]

  return (
    <div className="flex items-center justify-between mb-4 sm:mb-8 px-2 sm:px-4">
      {steps.map((step, idx) => (
        <div key={step.number} className="flex items-center flex-1">
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
              step.number <= state.step
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {step.number}
          </div>
          <div className="ml-2 sm:ml-3 mr-auto hidden md:block">
            <p
              className={`text-xs sm:text-sm font-medium ${
                step.number <= state.step ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.title}
            </p>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`h-0.5 flex-1 mx-1 sm:mx-2 transition-all ${step.number < state.step ? "bg-primary" : "bg-border"}`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
