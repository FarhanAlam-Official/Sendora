# Component Overview

Overview of React components in Sendora.

## Component Structure

```
components/
├── send-wizard-context.tsx        # State management
├── wizard-step-indicator.tsx      # Step navigation
├── step-upload.tsx                # Step 1: File upload
├── step-pdf-upload-match.tsx      # Step 2: PDF upload/matching
├── step-compose.tsx               # Step 3: Email composition
├── step-smtp.tsx                 # Step 4: SMTP configuration
├── step-preview-send.tsx         # Step 5: Preview and send
├── step-summary.tsx               # Step 6: Summary
├── certificate-*.tsx             # Certificate components
└── ui/                           # Reusable UI components
```

## Core Components

### SendWizardContext

**Location**: `components/send-wizard-context.tsx`

**Purpose**: Global state management for the wizard

**Key Features**:
- Manages all wizard state
- Provides context to all wizard components
- Handles state updates and persistence

**Usage**:
```tsx
import { useSendWizard } from '@/components/send-wizard-context'

function MyComponent() {
  const { state, setStep, setFile } = useSendWizard()
  // ...
}
```

### WizardStepIndicator

**Location**: `components/wizard-step-indicator.tsx`

**Purpose**: Visual indicator of current wizard step

**Features**:
- Shows all 6 steps
- Highlights current step
- Visual progress indication

### Step Components

#### StepUpload (Step 1)

**Purpose**: Upload and parse Excel/CSV files

**Features**:
- File drag-and-drop
- File parsing with SheetJS
- Data preview
- Validation

#### StepPdfUploadMatch (Step 2)

**Purpose**: Upload PDFs and match to recipients

**Features**:
- PDF file upload
- Automatic matching
- Manual matching interface
- Confidence badges
- Skip recipient option

#### StepCompose (Step 3)

**Purpose**: Compose email with placeholders

**Features**:
- Subject line editor
- HTML email body editor
- Placeholder support
- Template saving/loading
- Preview

#### StepSMTP (Step 4)

**Purpose**: Configure SMTP settings

**Features**:
- Default SMTP option
- Custom SMTP input
- SMTP connection test
- Credential validation

#### StepPreviewSend (Step 5)

**Purpose**: Preview and send emails

**Features**:
- Email preview
- Batch sending controls
- Progress tracking
- Pause/resume/cancel
- Retry failed

#### StepSummary (Step 6)

**Purpose**: Display sending results

**Features**:
- Sending statistics
- Success/failure counts
- Failed email list
- Export results
- Start new batch

## Certificate Components

### CertificateGeneratorStandalone

**Location**: `components/certificate-generator-standalone.tsx`

**Purpose**: Standalone certificate generation interface

**Features**:
- Template selection
- Field mapping
- Style customization
- Logo/signature upload
- Certificate preview

### CertificateTemplates

**Location**: `components/certificate-templates.tsx`

**Purpose**: Certificate template definitions

**Features**:
- Template configurations
- Field definitions
- Style presets
- Template metadata

## UI Components

### Component Library

Located in `components/ui/`, these are reusable shadcn/ui components:

- **Button**: Various button styles
- **Input**: Form inputs
- **Textarea**: Multi-line inputs
- **Select**: Dropdown selects
- **Dialog**: Modal dialogs
- **Toast**: Notification toasts
- **Card**: Content containers
- **Progress**: Progress indicators
- **Badge**: Status badges
- **Table**: Data tables
- And many more...

## Component Patterns

### State Management

**Pattern**: Context API

```tsx
// Provider wraps application
<SendWizardProvider>
  <WizardComponent />
</SendWizardProvider>

// Components consume context
const { state, setStep } = useSendWizard()
```

### Form Handling

**Pattern**: React Hook Form + Zod

```tsx
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: {...}
})
```

### Styling

**Pattern**: Tailwind CSS

```tsx
<div className="bg-card border border-border rounded-xl p-8">
  {/* Content */}
</div>
```

## Component Communication

### Parent-Child Communication

- Props for configuration
- Callbacks for actions
- State lifted to context

### Sibling Communication

- Shared context state
- Event handlers via parent
- State updates through context

## Best Practices

### 1. Component Composition

- Small, focused components
- Reusable UI components
- Composition over inheritance

### 2. State Management

- Local state for UI-only
- Context for shared state
- Props for configuration

### 3. Performance

- React.memo for expensive renders
- useMemo for computed values
- useCallback for stable functions

### 4. Type Safety

- TypeScript for all components
- Proper prop types
- Type-safe context

---

**Related**:
- [Wizard Components](./Wizard-Components.md)
- [UI Components](./Ui-Components.md)
- [Certificate Components](./Certificate-Components.md)

