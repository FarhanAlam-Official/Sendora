# Architecture Overview

High-level architecture and design decisions for Sendora.

## System Architecture

Sendora is built as a **Next.js 15** application using the **App Router** architecture pattern.

```
┌─────────────────────────────────────────────────┐
│              Next.js Application                 │
│                                                  │
│  ┌──────────────┐      ┌──────────────┐       │
│  │   Pages      │      │   API Routes │       │
│  │   (App)      │◄─────►│   (Server)   │       │
│  └──────────────┘      └──────────────┘       │
│         │                      │                │
│         ▼                      ▼                │
│  ┌──────────────┐      ┌──────────────┐       │
│  │  Components  │      │  Utilities   │       │
│  │   (React)    │      │   (Node.js)   │       │
│  └──────────────┘      └──────────────┘       │
└─────────────────────────────────────────────────┘
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│   Browser       │    │   SMTP Server   │
│   (Client)      │    │   (Email)       │
└─────────────────┘    └─────────────────┘
```

## Technology Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **State Management**: React Context API
- **Forms**: React Hook Form + Zod
- **UI Components**: Radix UI (via shadcn/ui)

### Backend

- **Runtime**: Node.js (via Next.js API routes)
- **Email**: Nodemailer
- **File Processing**: SheetJS (xlsx), jsPDF
- **PDF Processing**: jsPDF, PDF parsing libraries

### Build Tools

- **Package Manager**: npm/pnpm
- **TypeScript**: Type safety
- **PostCSS**: CSS processing
- **Vite**: Testing (Vitest)

## Project Structure

```
sendora/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Home page
│   ├── layout.tsx            # Root layout
│   ├── send/                 # Send wizard page
│   ├── about/                # About page
│   ├── contact/              # Contact page
│   └── api/                  # API routes
│       ├── sendEmails/       # Single email API
│       ├── sendEmails-batch/ # Batch email API
│       ├── testSMTP/         # SMTP test API
│       ├── contact/          # Contact form API
│       └── health/           # Health check API
├── components/                # React components
│   ├── step-*.tsx            # Wizard step components
│   ├── send-wizard-context.tsx  # State management
│   └── ui/                   # Reusable UI components
├── lib/                       # Utility functions
│   ├── certificate-generator.ts  # Certificate PDF generation
│   ├── pdf-utils.ts          # PDF matching utilities
│   └── utils.ts              # General utilities
├── types/                     # TypeScript definitions
│   ├── certificate.ts        # Certificate types
│   └── nodemailer.d.ts       # Nodemailer types
└── public/                    # Static assets
```

## Key Architectural Decisions

### 1. State Management

**Decision**: React Context API for wizard state

**Rationale**:
- Single-page wizard flow
- Shared state across multiple steps
- No need for complex state management (Redux, etc.)
- Simple and sufficient for use case

**Implementation**:
- `SendWizardContext` manages all wizard state
- Provider wraps wizard components
- Custom hook (`useSendWizard`) for access

### 2. File Processing

**Decision**: Client-side processing for Excel/CSV files

**Rationale**:
- Privacy: Data never leaves user's browser
- Performance: No server upload/processing
- Scalability: No server file storage needed

**Implementation**:
- SheetJS (`xlsx`) parses files in browser
- Data stored in React state (memory only)
- PDFs converted to base64 for API transmission

### 3. Email Sending

**Decision**: Server-side email sending via API routes

**Rationale**:
- SMTP credentials must remain server-side
- Rate limiting and retry logic easier on server
- Security: Credentials never exposed to client

**Implementation**:
- Nodemailer on server (API routes)
- Client sends email payload to API
- API handles SMTP communication

### 4. Certificate Generation

**Decision**: Client-side PDF generation with jsPDF

**Rationale**:
- Real-time preview before sending
- No server storage needed
- Privacy: Certificates generated on user's device

**Implementation**:
- jsPDF generates PDFs in browser
- Converted to base64 for email attachment
- Template system for different designs

## Data Flow

### Email Sending Flow

```
1. User uploads Excel/CSV
   └─> Client parses file (SheetJS)
       └─> Store in React state

2. User uploads/matches PDFs
   └─> Client matches PDFs to recipients
       └─> Store matches in state

3. User composes email
   └─> Template with placeholders
       └─> Store in state

4. User sends batch
   └─> For each recipient:
       ├─> Replace placeholders
       ├─> Attach PDF (if matched)
       └─> POST /api/sendEmails-batch
           └─> Server sends via SMTP
```

### Certificate Generation Flow

```
1. User selects template
   └─> Load template configuration

2. User maps fields
   └─> Map Excel columns to certificate fields

3. User configures style
   └─> Colors, fonts, logos, etc.

4. Generate certificates
   └─> For each recipient:
       ├─> Extract data from Excel row
       ├─> Generate PDF (jsPDF)
       └─> Convert to base64
           └─> Store in state
```

## State Management Architecture

### SendWizardContext Structure

```typescript
interface SendWizardState {
  step: 1 | 2 | 3 | 4 | 5 | 6
  file: File | null
  headers: string[]
  rows: FileRow[]
  mapping: FieldMapping
  skippedRows: Set<number>
  rowEdits: Map<number, FileRow>
  subject: string
  messageBody: string
  smtpConfig: "default" | "custom" | null
  pdfFiles: PdfFile[]
  pdfMatches: Map<number, string>
  sendResults: Array<{...}>
  certificateMode: CertificateMode
  certificateTemplate: string | null
  certificateFieldMapping: CertificateFieldMapping
  certificateConfig: CertificateConfig | null
}
```

### State Updates

- **Immutable updates**: Always create new state objects
- **Batch updates**: Multiple state changes in single update
- **Persistence**: Some state saved to localStorage (send completion)

## Security Considerations

### Client-Side

1. **No credential storage**: SMTP passwords never stored client-side
2. **Input validation**: Zod schemas validate all inputs
3. **XSS prevention**: HTML escaping in email templates
4. **File size limits**: Client-side validation before upload

### Server-Side

1. **Environment variables**: SMTP credentials in env vars only
2. **Email validation**: Regex validation before sending
3. **Error handling**: Errors don't expose sensitive info
4. **Rate limiting**: Configurable delays between emails

## Performance Optimizations

### Client-Side

1. **Lazy loading**: Components loaded on demand
2. **Memoization**: React.memo for expensive components
3. **Virtual scrolling**: For large recipient lists (future)
4. **Base64 optimization**: PDFs compressed before encoding

### Server-Side

1. **Connection pooling**: Nodemailer reuses SMTP connections
2. **Batch processing**: Sequential sending with delays
3. **Error recovery**: Retry logic for failed sends
4. **Async operations**: Non-blocking email sends

## Scalability Considerations

### Current Limitations

- **Single instance**: Not designed for horizontal scaling
- **State in memory**: React state cleared on page refresh
- **No database**: All state is ephemeral
- **SMTP limits**: Bound by email provider limits

### Future Scalability

1. **Database**: Store batch history and results
2. **Queue system**: Redis/Bull for email queue
3. **Multiple workers**: Process emails in parallel
4. **Caching**: Cache template configurations
5. **CDN**: Serve static assets via CDN

## Deployment Architecture

### Vercel (Recommended)

```
User Request
    │
    ▼
┌─────────────┐
│   Vercel    │  (Edge Network)
│   CDN       │
└─────────────┘
    │
    ▼
┌─────────────┐
│   Next.js   │  (Serverless Functions)
│   Server    │
└─────────────┘
    │
    ▼
┌─────────────┐
│   SMTP      │  (Email Provider)
│   Server    │
└─────────────┘
```

### Environment Variables

Required for deployment:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_SECURE=false
ADMIN_EMAIL=admin@sendora.app
```

## Testing Strategy

### Unit Tests

- **Utilities**: PDF matching, name normalization
- **Components**: Individual component tests
- **API routes**: Mock SMTP for testing

### Integration Tests

- **Wizard flow**: End-to-end wizard steps
- **Email sending**: Mock SMTP, verify payloads
- **File processing**: Excel parsing, PDF generation

### E2E Tests

- **Full workflow**: Upload → Match → Send
- **Error scenarios**: Invalid files, SMTP errors
- **UI interactions**: Form submissions, navigation

## Future Improvements

1. **Authentication**: User accounts and session management
2. **Database**: Persistent storage for batches and history
3. **Real-time updates**: WebSocket for progress tracking
4. **Template library**: User-created templates
5. **Analytics**: Sending statistics and reports

---

**Related Documentation**:
- [State Management](./State-Management.md)
- [PDF Matching Algorithm](./Pdf-Matching-Algorithm.md)
- [Certificate Generation](./Certificate-Generation.md)

