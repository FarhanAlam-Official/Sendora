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
git clone <https://github.com/yourusername/sendora.git> .
npm install
\`\`\`

### Manual Installation

\`\`\`bash
git clone <https://github.com/yourusername/sendora.git>
cd sendora
npm install
npm run dev
\`\`\`

## Environment Variables

1. Copy `.env.example` to `.env.local`:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. Fill in your environment variables in `.env.local`:

   \`\`\`
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=<your-email@gmail.com>
   SMTP_PASSWORD=your-app-password
   ADMIN_EMAIL=<admin@sendora.app>
   SMTP_SECURE=false
   \`\`\`

### Required Variables

- **SMTP_HOST**: SMTP server hostname (e.g., `smtp.gmail.com`)
- **SMTP_PORT**: SMTP server port (typically `587` for TLS or `465` for SSL)
- **SMTP_USER**: Your email address or SMTP username
- **SMTP_PASSWORD**: Your email password or app-specific password
- **ADMIN_EMAIL**: Email address for receiving contact form submissions

### Optional Variables

- **SMTP_SECURE**: Set to `"true"` for SSL connections (port 465), `"false"` or omit for STARTTLS (port 587)

### Gmail Setup

For Gmail, you need to:

1. Enable 2-Step Verification
2. Generate an [App Password](https://support.google.com/accounts/answer/185833)
3. Use the app password (not your regular password) as `SMTP_PASSWORD`

### Production Deployment

Set these variables in your hosting platform's environment variables section:

- **Vercel**: Project Settings > Environment Variables
- **Netlify**: Site Settings > Build & Deploy > Environment
- **Railway**: Variables tab

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

## SEO Implementation

Sendora includes comprehensive SEO optimization out of the box:

### ✅ Implemented Features

- **robots.txt** - Search engine crawler instructions
- **sitemap.xml** - Dynamic sitemap for all pages
- **Structured Data** - JSON-LD schema markup (Organization, WebApplication, Product, HowTo)
- **Meta Tags** - Complete SEO metadata on all pages
- **Open Graph** - Social media sharing optimization
- **PWA Support** - Progressive Web App manifest
- **Security Headers** - X-Frame-Options, CSP, and more
- **Mobile Optimization** - Mobile-first responsive design

### 📚 SEO Documentation

- `SEO_IMPLEMENTATION_GUIDE.md` - Complete SEO documentation
- `SEO_QUICK_START.md` - Quick reference checklist
- `SEO_SUMMARY.md` - Implementation summary

### 🎯 Target Keywords

- bulk email sender
- certificate distribution
- email automation
- excel to email
- csv email sender
- smtp email sender

### 🚀 Getting Started with SEO

1. Verify ownership in [Google Search Console](https://search.google.com/search-console)
2. Submit sitemap: `https://sendora.vercel.app/sitemap.xml`
3. Set up [Google Analytics 4](https://analytics.google.com/)
4. Review `SEO_QUICK_START.md` for next steps

For detailed SEO information, see the SEO documentation files in the project root.

## Deployment

Deploy to Vercel:

\`\`\`bash
vercel
\`\`\`

## License

MIT

## Support

For issues and questions, visit `/contact` or open an issue on GitHub.
