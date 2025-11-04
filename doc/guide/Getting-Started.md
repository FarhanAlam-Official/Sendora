# Getting Started with Sendora

Welcome to Sendora - Smart Certificate Distribution Application! This guide will help you get started with installing and setting up Sendora.

## What is Sendora?

Sendora is a Next.js-based web application designed for bulk certificate and email distribution with personalization. It allows you to:

- Upload Excel/CSV files with recipient data
- Map data fields to email fields with smart field mapping
- Compose personalized emails with dynamic placeholders
- Upload or generate certificates
- Send bulk emails with PDF attachments
- Track progress and handle errors gracefully

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or later installed
- **npm** or **pnpm** package manager
- Basic understanding of Excel/CSV files
- SMTP credentials (Gmail, Outlook, or custom SMTP server)

## Installation

### Option 1: Clone from Repository (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd sendora

# Install dependencies
npm install
# or
pnpm install
```

### Option 2: Using shadcn CLI

```bash
npm create shadcn-ui@latest my-sendora-app -- --skip-git
cd my-sendora-app
git clone <repository-url> .
npm install
```

## Environment Setup

### Step 1: Create Environment File

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

### Step 2: Configure Environment Variables

Edit `.env.local` and add your SMTP configuration:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_SECURE=false

# Admin Email (for contact form submissions)
ADMIN_EMAIL=admin@sendora.app
```

### Step 3: Gmail Setup (If Using Gmail)

If you're using Gmail:

1. Enable **2-Step Verification** in your Google Account settings
2. Generate an **App Password**:
   - Go to [Google App Passwords](https://support.google.com/accounts/answer/185833)
   - Select "Mail" and "Other (Custom name)"
   - Enter "Sendora" as the app name
   - Copy the generated 16-character password
3. Use the app password (not your regular password) as `SMTP_PASSWORD`

### Step 4: Other Email Providers

#### Outlook/Office 365
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
SMTP_SECURE=false
```

#### Custom SMTP
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASSWORD=your-password
SMTP_SECURE=false  # Use true for SSL (port 465)
```

## Running the Application

### Development Mode

```bash
npm run dev
# or
pnpm dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## First Steps

### 1. Prepare Your Data File

Create an Excel or CSV file with recipient information. Minimum required columns:

- **Name** (or any column containing recipient names)
- **Email** (or any column containing email addresses)

Example CSV:

```csv
Name,Email,Course,Date
John Doe,john@example.com,Web Development,2024-01-15
Jane Smith,jane@example.com,Web Development,2024-01-15
```

### 2. Access the Send Wizard

1. Navigate to `http://localhost:3000`
2. Click **"Start Sending Now"** or go to `/send`
3. Follow the wizard steps:

   - **Step 1**: Upload your Excel/CSV file
   - **Step 2**: Upload and match PDF certificates (or create new ones)
   - **Step 3**: Compose your email with placeholders
   - **Step 4**: Configure SMTP settings
   - **Step 5**: Preview and send emails
   - **Step 6**: View summary and results

### 3. Email Placeholders

In your email composition, you can use these dynamic placeholders:

- `{{name}}` - Recipient's name
- `{{email}}` - Recipient's email
- `{{certificate_link}}` - Link to certificate (if applicable)

Example email body:

```
Hello {{name}},

Congratulations on completing the course! Your certificate is attached.

Best regards,
The Team
```

## Project Structure

```
sendora/
├── app/                    # Next.js app router pages
│   ├── page.tsx            # Home page
│   ├── send/               # Send wizard
│   ├── about/              # About page
│   ├── contact/            # Contact page
│   └── api/                # API routes
├── components/             # React components
│   ├── step-*.tsx          # Wizard step components
│   └── ui/                 # UI component library
├── lib/                    # Utility functions
│   ├── certificate-generator.ts
│   └── pdf-utils.ts
├── types/                  # TypeScript type definitions
└── public/                 # Static assets
```

## Troubleshooting

### Common Issues

#### SMTP Connection Failed

**Problem**: Cannot connect to SMTP server

**Solutions**:
- Verify SMTP credentials are correct
- Check firewall settings
- For Gmail: Ensure app password is used (not regular password)
- Verify SMTP_PORT is correct (587 for TLS, 465 for SSL)

#### Certificate Upload Fails

**Problem**: PDF certificates not uploading

**Solutions**:
- Check file size (max ~10MB recommended)
- Ensure files are valid PDFs
- Check browser console for errors

#### Email Not Sending

**Problem**: Emails stuck in sending state

**Solutions**:
- Check SMTP configuration
- Verify recipient email addresses are valid
- Check server logs for errors
- Try sending a test email first

#### Name Matching Issues

**Problem**: PDF certificates not matching recipients

**Solutions**:
- Ensure PDF filenames contain recipient names
- Use consistent naming (e.g., "JohnDoe.pdf" matches "John Doe")
- Review the [PDF Matching Guide](./technical/Pdf-Matching-Analysis.md) for details

## Next Steps

- Read the [User Guide](./User-Guide.md) for detailed usage instructions
- Check [Certificate Generation Guide](./Certificate-Generation-Guide.md) for creating certificates
- Review [API Documentation](../api/Api-Overview.md) for integration details
- Explore [Troubleshooting Guide](./Troubleshooting.md) for common issues

## Getting Help

- Visit the `/contact` page to reach out
- Check the [Troubleshooting Guide](./Troubleshooting.md)
- Review [Technical Documentation](../technical/Architecture-Overview.md)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

- **Netlify**: Similar to Vercel
- **Railway**: Supports Next.js with environment variables
- **Self-hosted**: Follow Next.js deployment guides

Make sure to set all environment variables in your hosting platform's environment variables section.

---

**Ready to start?** Head to the [User Guide](./User-Guide.md) to learn how to use Sendora!

