# Send Emails API

API endpoint for sending individual emails with optional PDF attachments.

## Endpoint

```
POST /api/sendEmails
```

## Description

Sends a single email to one recipient with optional PDF certificate attachment. Supports both default (server-configured) and custom SMTP configurations.

## Request Body

```typescript
{
  to: string                    // Recipient email address (required)
  subject: string               // Email subject line (required)
  body: string                  // Email body (HTML supported) (required)
  smtpConfig: "default" | "custom"  // SMTP configuration choice (required)
  customSMTP?: {                 // Custom SMTP settings (required if smtpConfig === "custom")
    host: string
    port: string
    email: string
    password: string
  }
  pdfAttachment?: {              // Optional PDF attachment
    filename: string
    content: string              // Base64-encoded PDF content
  }
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `to` | string | Yes | Recipient email address. Must be valid email format. |
| `subject` | string | Yes | Email subject line. Supports placeholders. |
| `body` | string | Yes | Email body content. HTML is supported. |
| `smtpConfig` | string | Yes | Either `"default"` or `"custom"` |
| `customSMTP` | object | Conditional | Required if `smtpConfig === "custom"` |
| `pdfAttachment` | object | No | Optional PDF certificate attachment |

### Custom SMTP Object

```typescript
{
  host: string      // SMTP server hostname (e.g., "smtp.gmail.com")
  port: string      // SMTP server port (e.g., "587" or "465")
  email: string     // SMTP username/email
  password: string  // SMTP password or app password
}
```

## Response

### Success Response (200)

```json
{
  "success": true,
  "messageId": "unique-message-id",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "recipient": "recipient@example.com"
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "error": "Missing required fields: to, subject, body"
}
```

```json
{
  "error": "Invalid email format"
}
```

```json
{
  "error": "Missing custom SMTP configuration"
}
```

#### 500 Server Error

```json
{
  "error": "Default SMTP is not configured...",
  "details": "The default SMTP option requires server-side environment variables..."
}
```

```json
{
  "error": "Failed to send email",
  "code": "SEND_ERROR"
}
```

## Examples

### Example 1: Send Email with Default SMTP

```bash
curl -X POST https://your-domain.com/api/sendEmails \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Your Certificate",
    "body": "<h1>Hello!</h1><p>Your certificate is attached.</p>",
    "smtpConfig": "default"
  }'
```

### Example 2: Send Email with Custom SMTP

```bash
curl -X POST https://your-domain.com/api/sendEmails \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Your Certificate",
    "body": "<h1>Hello!</h1><p>Your certificate is attached.</p>",
    "smtpConfig": "custom",
    "customSMTP": {
      "host": "smtp.gmail.com",
      "port": "587",
      "email": "your-email@gmail.com",
      "password": "your-app-password"
    }
  }'
```

### Example 3: Send Email with PDF Attachment

```javascript
// Convert PDF to base64
const pdfFile = await fetch('/path/to/certificate.pdf');
const pdfBuffer = await pdfFile.arrayBuffer();
const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

const response = await fetch('/api/sendEmails', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'recipient@example.com',
    subject: 'Your Certificate',
    body: '<h1>Hello!</h1><p>Your certificate is attached.</p>',
    smtpConfig: 'default',
    pdfAttachment: {
      filename: 'certificate.pdf',
      content: base64Pdf
    }
  })
});
```

## Retry Logic

The API includes automatic retry logic:

- **Max Retries**: 3 attempts
- **Retry Delay**: 1000ms (1 second) between retries
- **Retry Conditions**: Network errors, temporary SMTP failures

Retries are automatic and transparent to the client.

## Rate Limiting

No rate limiting for single email sends. For bulk sending, use the [Batch Email API](./Batch-Email-Api.md).

## Error Codes

| Code | Description |
|------|-------------|
| `SEND_ERROR` | Generic email sending error |
| `SMTP_AUTH_FAILED` | SMTP authentication failed |
| `SMTP_CONNECTION_ERROR` | Cannot connect to SMTP server |
| `INVALID_EMAIL` | Invalid email format |

## Notes

1. **Email Format**: The `to` field must be a valid email address (validated with regex)
2. **HTML Support**: The `body` field supports full HTML content
3. **Base64 Encoding**: PDF attachments must be base64-encoded
4. **Security**: SMTP credentials are never stored (custom SMTP) or use environment variables (default SMTP)
5. **Logging**: All email sends are logged with recipient and timestamp

## Implementation Details

- Uses Nodemailer for email sending
- Supports both TLS (port 587) and SSL (port 465)
- Automatically detects secure connections based on port
- Handles SMTP connection pooling

---

**Related**: [Batch Email API](./Batch-Email-Api.md) for sending multiple emails

