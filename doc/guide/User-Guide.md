# User Guide

Complete guide to using Sendora for bulk certificate and email distribution.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Send Wizard Steps](#send-wizard-steps)
3. [Certificate Handling](#certificate-handling)
4. [Email Composition](#email-composition)
5. [SMTP Configuration](#smtp-configuration)
6. [Sending Emails](#sending-emails)
7. [Best Practices](#best-practices)

## Quick Start

### Overview

Sendora uses a 6-step wizard to guide you through the email sending process:

1. **Upload Excel/CSV** - Upload recipient data
2. **Upload & Match PDFs** - Upload certificates and match to recipients
3. **Compose Email** - Write personalized email content
4. **SMTP Config** - Configure email server settings
5. **Preview & Send** - Review and send emails
6. **Summary** - View sending results

### Quick Example

```csv
# recipients.csv
Name,Email,Course
John Doe,john@example.com,Web Development
Jane Smith,jane@example.com,Web Development
```

**Email Template:**
```
Subject: Certificate for {{name}}

Hello {{name}},

Congratulations on completing {{Course}}! Your certificate is attached.

Best regards,
The Team
```

## Send Wizard Steps

### Step 1: Upload Excel/CSV

**Purpose**: Upload a spreadsheet with recipient data

**Supported Formats**:
- `.xlsx` (Excel)
- `.csv` (Comma-separated values)

**File Requirements**:
- Must contain at least **Name** and **Email** columns
- Column names are case-insensitive
- Maximum file size: ~10MB recommended

**Process**:
1. Click "Choose File" or drag and drop
2. File is parsed automatically
3. Preview of first few rows is shown
4. Click "Next" to proceed

**Tips**:
- Use clear column names (e.g., "Name", "Email", "Course")
- Remove empty rows before uploading
- Ensure email addresses are valid

### Step 2: Upload & Match PDFs

**Purpose**: Upload certificate PDFs and match them to recipients

**Options**:

#### Option A: Upload Existing PDFs

1. **Upload PDFs**: Click "Upload PDFs" and select certificate files
2. **Auto-Matching**: System automatically matches PDFs to recipients by name
3. **Manual Matching**: Review matches and manually assign if needed
4. **Confidence Badges**: 
   - 🟢 Green: High confidence match
   - 🟡 Yellow: Medium confidence (review recommended)
   - 🔴 Red: Low confidence (manual review required)

#### Option B: Create New Certificates

1. **Select Template**: Choose from available certificate templates
2. **Map Fields**: Map Excel columns to certificate fields
3. **Configure Style**: Customize colors, fonts, and layout
4. **Generate**: Certificates are generated automatically

**Matching Logic**:
- PDFs are matched by filename (e.g., "JohnDoe.pdf" matches "John Doe")
- Supports variations: underscores, spaces, hyphens
- Fuzzy matching handles typos (Phase 2+)

**Skipping Recipients**:
- Click "Skip" on any row to exclude from sending
- Skipped recipients won't receive emails

### Step 3: Compose Email

**Purpose**: Write personalized email content

**Components**:

#### Subject Line
- Plain text only
- Supports placeholders: `{{name}}`, `{{email}}`

#### Email Body
- HTML supported
- Supports placeholders: `{{name}}`, `{{email}}`, `{{certificate_link}}`
- Rich text editor available

**Placeholders**:

| Placeholder | Description | Example |
|------------|-------------|---------|
| `{{name}}` | Recipient name | "John Doe" |
| `{{email}}` | Recipient email | "john@example.com" |
| `{{certificate_link}}` | Certificate download link | URL to certificate |
| `{{column_name}}` | Any Excel column | Use column name directly |

**Example Email**:

```html
<h2>Congratulations {{name}}!</h2>

<p>Hello {{name}},</p>

<p>Congratulations on completing the course! Your certificate is attached to this email.</p>

<p>If you have any questions, contact us at support@example.com.</p>

<p>Best regards,<br>
The Certificate Team</p>
```

**Saved Templates**:
- Save frequently used templates
- Load saved templates for quick reuse
- Templates are stored in browser localStorage

### Step 4: SMTP Configuration

**Purpose**: Configure email server for sending

**Options**:

#### Default SMTP (Server-Configured)

- Uses environment variables set on server
- Requires: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`
- Best for: Production deployments with configured servers

#### Custom SMTP (User-Configured)

- Enter your own SMTP credentials
- Credentials are **never stored** (only used for sending)
- Best for: Personal use or testing

**SMTP Settings**:

```
Host: smtp.gmail.com (or your SMTP server)
Port: 587 (TLS) or 465 (SSL)
Email: your-email@gmail.com
Password: your-app-password
```

**Testing**:
- Click "Test Connection" to verify SMTP settings
- Sends a test email to your configured address

### Step 5: Preview & Send

**Purpose**: Review emails before sending and manage sending process

**Features**:

#### Preview
- View sample email for first recipient
- See how placeholders are replaced
- Preview certificate attachment

#### Batch Sending
- Send to all recipients at once
- Progress bar shows sending status
- Real-time updates on success/failure

#### Controls
- **Pause**: Pause sending (can resume later)
- **Resume**: Continue paused sending
- **Cancel**: Stop sending (cannot resume)
- **Retry Failed**: Retry emails that failed

**Progress Tracking**:
- Shows: Sent, Failed, Skipped, Total
- Real-time count updates
- Failed emails listed with error messages

### Step 6: Summary

**Purpose**: View sending results and statistics

**Information Displayed**:

- **Total Sent**: Number of successful sends
- **Total Failed**: Number of failed sends
- **Failed Recipients**: List with error messages
- **Timing**: Total time taken for sending

**Actions**:
- **View Details**: See full results list
- **Export Results**: Download CSV of results
- **Send Again**: Start new batch
- **Return Home**: Go back to homepage

## Certificate Handling

### Uploading PDF Certificates

**File Requirements**:
- Format: PDF only
- Size: Maximum ~10MB per file
- Naming: Use recipient names in filenames (e.g., "JohnDoe.pdf")

**Best Practices**:
- Use consistent naming convention
- Include recipient name in filename
- Remove special characters from filenames
- Use underscores or no separators (avoid spaces)

**Naming Examples**:
- ✅ Good: `JohnDoe.pdf`, `Jane_Smith.pdf`, `Bob-Johnson.pdf`
- ❌ Bad: `Certificate.pdf`, `File123.pdf`, `Doc 1.pdf`

### Certificate Matching

**Automatic Matching**:
- System matches by recipient name
- Handles variations in separators (spaces, underscores, hyphens)
- Supports fuzzy matching for typos

**Match Confidence**:
- **High (90-100%)**: Exact match or very close
- **Medium (70-89%)**: Likely correct, but review recommended
- **Low (<70%)**: Manual review required

**Manual Matching**:
1. Click on recipient row
2. Select PDF from dropdown
3. Match is saved automatically

### Creating Certificates

**Available Templates**:
- **Classic**: Traditional certificate with border
- **Modern**: Clean, minimalist design
- **Elegant**: Sophisticated design with subtle styling

**Field Mapping**:
- Map Excel columns to certificate fields:
  - Recipient Name (required)
  - Course Title
  - Date
  - Organization
  - Certificate Number
  - Custom fields

**Customization**:
- Colors: Primary, secondary, background, border
- Fonts: Sizes and weights for each field
- Logo: Upload organization logo
- Signature: Upload signature image

## Email Composition

### Writing Effective Emails

**Subject Line Tips**:
- Keep it concise (50 characters or less)
- Include recipient name: "Certificate for {{name}}"
- Avoid spam trigger words

**Body Content Tips**:
- Start with greeting: "Hello {{name}},"
- Be clear and concise
- Include next steps or contact information
- End with professional closing

**HTML Formatting**:
- Use basic HTML tags: `<h1>`, `<h2>`, `<p>`, `<strong>`, `<em>`
- Avoid complex CSS
- Test rendering in email clients

### Placeholder Usage

**Basic Placeholders**:
```
{{name}} → John Doe
{{email}} → john@example.com
```

**Custom Column Placeholders**:
```
{{Course}} → Web Development
{{Date}} → 2024-01-15
{{Certificate Number}} → CERT-12345
```

**Conditional Logic** (not yet supported):
- Future feature: `{{#if Course}}Course: {{Course}}{{/if}}`

## SMTP Configuration

### Gmail Setup

1. **Enable 2-Step Verification**
2. **Generate App Password**:
   - Go to Google Account → Security → 2-Step Verification → App Passwords
   - Select "Mail" and device
   - Copy 16-character password
3. **Use in Sendora**:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Email: Your Gmail address
   - Password: App password (not regular password)

### Office 365 Setup

```
Host: smtp.office365.com
Port: 587
Email: your-email@outlook.com
Password: Your Office 365 password
```

### Custom SMTP

**Common Providers**:
- **SendGrid**: `smtp.sendgrid.net:587`
- **Mailgun**: `smtp.mailgun.org:587`
- **AWS SES**: Varies by region
- **Postmark**: `smtp.postmarkapp.com:587`

**Security**:
- Use TLS (port 587) when possible
- Use SSL (port 465) if TLS not available
- Never share SMTP credentials
- Rotate passwords regularly

## Sending Emails

### Batch Sending Process

1. **Preparation**:
   - Verify all recipients are correct
   - Check email content
   - Test SMTP connection

2. **Sending**:
   - Click "Start Sending"
   - Monitor progress bar
   - Review failed emails

3. **Completion**:
   - Review summary
   - Retry failed emails if needed
   - Export results for records

### Rate Limiting

**Default Behavior**:
- Small delay between emails (prevents rate limiting)
- Configurable delay in batch API
- Recommended: 500ms between emails

**Gmail Limits**:
- 500 emails per day (free account)
- 2000 emails per day (workspace)
- Consider using batch email service for large volumes

### Error Handling

**Common Errors**:

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid email | Bad email format | Check email column |
| SMTP auth failed | Wrong credentials | Verify SMTP settings |
| Connection timeout | Network/server issue | Check connection |
| Rate limit exceeded | Too many emails | Reduce sending speed |
| Attachment too large | PDF too big | Compress PDF |

**Retry Failed**:
- Click "Retry Failed" button
- Only failed emails are resent
- Successful emails are skipped

## Best Practices

### Data Preparation

1. **Clean Your Data**:
   - Remove duplicates
   - Validate email addresses
   - Standardize name formatting

2. **File Organization**:
   - Use consistent column names
   - Keep file size manageable (<1000 rows recommended)
   - Backup original files

### Certificate Management

1. **Naming Convention**:
   - Use: `FirstNameLastName.pdf`
   - Avoid: Spaces, special characters
   - Consistent format across all files

2. **File Size**:
   - Keep PDFs under 2MB when possible
   - Compress if necessary
   - Test email delivery with large files

### Email Content

1. **Personalization**:
   - Always use `{{name}}` in greeting
   - Include relevant details from spreadsheet
   - Make content relevant to recipient

2. **Testing**:
   - Send test email to yourself first
   - Verify placeholders work correctly
   - Check attachment delivery

### Security

1. **Credentials**:
   - Never share SMTP passwords
   - Use app-specific passwords (Gmail)
   - Rotate passwords regularly

2. **Data Privacy**:
   - Don't store sensitive data unnecessarily
   - Clear browser cache after use
   - Follow GDPR/privacy regulations

### Performance

1. **Batch Size**:
   - Start with small batches (<100)
   - Increase gradually
   - Monitor for errors

2. **Sending Speed**:
   - Use default delays
   - Don't send too fast (rate limiting)
   - Pause/resume for long batches

---

**Ready to send?** Start with Step 1: Upload your Excel/CSV file!

