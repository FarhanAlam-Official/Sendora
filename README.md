# Sendora - Smart Certificate Distribution App

A Next.js 15-based web application for bulk certificate and email distribution with personalization.

## Features

✓ **Excel Upload & Parsing** - Upload XLSX/CSV files with recipient data
✓ **Smart Field Mapping** - Map columns to email fields with inline editing
✓ **Email Composition** - Write personalized emails with dynamic placeholders
✓ **SMTP Configuration** - Use default Sendora SMTP or custom SMTP
✓ **Progress Tracking** - Real-time progress bar and status updates
✓ **Error Handling** - Capture and display failed sends
✓ **Retry Support** - Pause, resume, or restart sending

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 + Framer Motion
- **File Parsing**: SheetJS (xlsx)
- **Email**: Nodemailer
- **State**: React Context API
- **Hosting**: Vercel

## Installation

### Using shadcn CLI (Recommended)

\`\`\`bash
npm create shadcn-ui@latest my-sendora-app -- --skip-git
cd my-sendora-app
git clone https://github.com/yourusername/sendora.git .
npm install
\`\`\`

### Manual Installation

\`\`\`bash
git clone https://github.com/yourusername/sendora.git
cd sendora
npm install
npm run dev
\`\`\`

## Environment Variables

Create a `.env.local` file with:

\`\`\`
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ADMIN_EMAIL=admin@sendora.app
\`\`\`

For Gmail: Use an [App Password](https://support.google.com/accounts/answer/185833)

## Usage

1. **Home** - Introduction and feature overview
2. **How It Works** - Step-by-step guide
3. **Send** - 4-step wizard:
   - Upload Excel/CSV file
   - Map fields (Name, Email, etc.)
   - Compose email with placeholders
   - Configure SMTP and send

### Placeholders

Use these in your email body:
- `{{name}}` - Recipient name
- `{{email}}` - Recipient email
- `{{certificate_link}}` - Certificate URL

## Project Structure

\`\`\`
├── app/
│   ├── page.tsx                 # Home page
│   ├── send/
│   │   └── page.tsx            # Send wizard
│   ├── how-it-works/
│   │   └── page.tsx
│   ├── about/
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   ├── api/
│   │   ├── sendEmails/
│   │   ├── testSMTP/
│   │   └── contact/
│   └── layout.tsx
├── components/
│   ├── navbar.tsx
│   ├── send-wizard-context.tsx
│   ├── wizard-step-indicator.tsx
│   ├── step-upload.tsx
│   ├── step-mapping.tsx
│   ├── step-compose.tsx
│   ├── step-smtp.tsx
│   └── step-send.tsx
└── public/
\`\`\`

## Future Enhancements

- User authentication & dashboards
- Google Sheets integration
- Email template gallery
- PDF generation
- Logs export (CSV)
- Multi-language support
- Dark mode improvements

## Deployment

Deploy to Vercel:

\`\`\`bash
vercel
\`\`\`

## License

MIT

## Support

For issues and questions, visit `/contact` or open an issue on GitHub.
