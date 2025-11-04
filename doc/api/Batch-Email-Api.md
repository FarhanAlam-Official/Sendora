# Batch Email API

API endpoint for sending multiple emails in a batch with configurable delays.

## Endpoint

```
POST /api/sendEmails-batch
```

## Description

Sends multiple emails in a single batch request. Includes automatic retry logic, progress tracking, and configurable delays between emails to prevent rate limiting.

## Request Body

```typescript
{
  emails: Array<{
    to: string                    // Recipient email address
    subject: string               // Email subject line
    body: string                  // Email body (HTML supported)
    pdfAttachment?: {             // Optional PDF attachment
      filename: string
      content: string             // Base64-encoded PDF content
    }
  }>
  smtpConfig: "default" | "custom"  // SMTP configuration choice
  customSMTP?: {                   // Custom SMTP settings (required if smtpConfig === "custom")
    host: string
    port: string
    email: string
    password: string
  }
  delayBetween?: number            // Delay between emails in milliseconds (default: 500)
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `emails` | Array | Yes | Array of email objects to send (minimum 1) |
| `smtpConfig` | string | Yes | Either `"default"` or `"custom"` |
| `customSMTP` | object | Conditional | Required if `smtpConfig === "custom"` |
| `delayBetween` | number | No | Milliseconds to wait between emails (default: 500) |

### Email Object

```typescript
{
  to: string           // Recipient email address
  subject: string      // Email subject line
  body: string         // Email body (HTML supported)
  pdfAttachment?: {    // Optional PDF attachment
    filename: string
    content: string    // Base64-encoded PDF content
  }
}
```

## Response

### Success Response (200)

```json
{
  "success": 10,           // Number of successful sends
  "failed": 2,              // Number of failed sends
  "results": [
    {
      "email": "recipient1@example.com",
      "success": true,
      "messageId": "unique-message-id-1"
    },
    {
      "email": "recipient2@example.com",
      "success": false,
      "error": "Invalid email format"
    }
  ],
  "totalTime": 15234        // Total time in milliseconds
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "error": "No emails provided"
}
```

#### 500 Server Error

```json
{
  "error": "SMTP configuration error",
  "details": "..."
}
```

## Examples

### Example 1: Basic Batch Send

```bash
curl -X POST https://your-domain.com/api/sendEmails-batch \
  -H "Content-Type: application/json" \
  -d '{
    "emails": [
      {
        "to": "recipient1@example.com",
        "subject": "Your Certificate",
        "body": "<h1>Hello!</h1><p>Your certificate is attached.</p>"
      },
      {
        "to": "recipient2@example.com",
        "subject": "Your Certificate",
        "body": "<h1>Hello!</h1><p>Your certificate is attached.</p>"
      }
    ],
    "smtpConfig": "default",
    "delayBetween": 500
  }'
```

### Example 2: Batch Send with PDF Attachments

```javascript
const emails = recipients.map(recipient => ({
  to: recipient.email,
  subject: `Certificate for ${recipient.name}`,
  body: `<h1>Hello ${recipient.name}!</h1><p>Your certificate is attached.</p>`,
  pdfAttachment: {
    filename: `${recipient.name}_certificate.pdf`,
    content: recipient.pdfBase64
  }
}));

const response = await fetch('/api/sendEmails-batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    emails,
    smtpConfig: 'default',
    delayBetween: 1000  // 1 second delay between emails
  })
});

const result = await response.json();
console.log(`Sent: ${result.success}, Failed: ${result.failed}`);
```

### Example 3: Custom SMTP with Batch Send

```javascript
const response = await fetch('/api/sendEmails-batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    emails: [
      { to: 'user1@example.com', subject: 'Test', body: 'Hello' },
      { to: 'user2@example.com', subject: 'Test', body: 'Hello' }
    ],
    smtpConfig: 'custom',
    customSMTP: {
      host: 'smtp.gmail.com',
      port: '587',
      email: 'your-email@gmail.com',
      password: 'your-app-password'
    },
    delayBetween: 750  // 750ms delay
  })
});
```

## Delay Configuration

The `delayBetween` parameter controls how long to wait between sending each email:

- **Default**: 500ms (0.5 seconds)
- **Recommended**: 500-1000ms for most SMTP providers
- **Gmail**: 500ms is usually sufficient
- **Custom SMTP**: Adjust based on provider limits

### Why Delay?

Email servers often have rate limits:
- Gmail: ~500 emails/day (free), ~2000/day (workspace)
- Most providers: Rate limit based on sending speed
- Delays prevent hitting rate limits and getting blocked

## Error Handling

The API continues sending even if individual emails fail:

- **Failed emails** are included in the `results` array with `success: false`
- **Error messages** are provided for each failed email
- **Successful emails** still send even if others fail

### Partial Success

The response indicates partial success:

```json
{
  "success": 8,
  "failed": 2,
  "results": [
    { "email": "user1@example.com", "success": true },
    { "email": "invalid-email", "success": false, "error": "Invalid email format" },
    ...
  ]
}
```

## Performance

### Timing

- **Total time** includes all delays and processing
- **Per-email time**: Approximately delayBetween + SMTP send time
- **Example**: 100 emails × 500ms = ~50 seconds minimum (plus SMTP processing)

### Optimization Tips

1. **Adjust delay**: Lower delays for faster sending (but risk rate limits)
2. **Parallel batches**: Split large lists into smaller batches
3. **Off-peak sending**: Send during low-traffic periods

## Rate Limiting Considerations

### Provider Limits

| Provider | Free Tier Limit | Workspace/Business Limit |
|----------|----------------|-------------------------|
| Gmail | 500/day | 2000/day |
| Outlook | 300/day | 10000/day |
| Custom SMTP | Varies | Varies |

### Best Practices

1. **Start small**: Test with 10-20 emails first
2. **Monitor failures**: Watch for rate limit errors
3. **Adjust delays**: Increase if hitting limits
4. **Use dedicated services**: For >1000 emails, consider SendGrid, Mailgun, etc.

## Implementation Details

- Emails are sent sequentially (one at a time)
- Each email uses the same SMTP configuration
- Failed emails don't stop the batch
- Results are collected and returned together

## Comparison with Single Email API

| Feature | Single Email API | Batch Email API |
|---------|----------------|-----------------|
| Use Case | Single email | Multiple emails |
| Delay | None | Configurable |
| Results | Single result | Array of results |
| Performance | Fast | Slower (sequential) |
| Error Handling | All-or-nothing | Per-email |

---

**Related**: [Send Emails API](./Send-Emails-Api.md) for single emails

