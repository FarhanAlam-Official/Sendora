# SMTP Test API

API endpoint for testing SMTP connection before sending emails.

## Endpoint

```
POST /api/testSMTP
```

## Description

Verifies SMTP connection and credentials without actually sending an email. Useful for validating SMTP settings before attempting to send emails.

## Request Body

```typescript
{
  host: string      // SMTP server hostname (required)
  port: string      // SMTP server port (required)
  email: string     // SMTP username/email (required)
  password: string  // SMTP password or app password (required)
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `host` | string | Yes | SMTP server hostname (e.g., "smtp.gmail.com") |
| `port` | string | Yes | SMTP server port (e.g., "587" or "465") |
| `email` | string | Yes | SMTP username/email address |
| `password` | string | Yes | SMTP password or app-specific password |

## Response

### Success Response (200)

```json
{
  "success": true,
  "message": "SMTP connection verified"
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "error": "Missing required SMTP fields"
}
```

#### 500 Server Error

```json
{
  "error": "SMTP verification failed: Invalid credentials"
}
```

Common error messages:
- `"Invalid credentials"` - Wrong username/password
- `"Connection timeout"` - Cannot reach SMTP server
- `"EHLO/HELO command failed"` - SMTP server rejected connection
- `"Authentication failed"` - Credentials rejected

## Examples

### Example 1: Test Gmail SMTP

```bash
curl -X POST https://your-domain.com/api/testSMTP \
  -H "Content-Type: application/json" \
  -d '{
    "host": "smtp.gmail.com",
    "port": "587",
    "email": "your-email@gmail.com",
    "password": "your-app-password"
  }'
```

### Example 2: Test Office 365 SMTP

```bash
curl -X POST https://your-domain.com/api/testSMTP \
  -H "Content-Type: application/json" \
  -d '{
    "host": "smtp.office365.com",
    "port": "587",
    "email": "your-email@outlook.com",
    "password": "your-password"
  }'
```

### Example 3: JavaScript Usage

```javascript
async function testSMTP(smtpConfig) {
  try {
    const response = await fetch('/api/testSMTP', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: smtpConfig.host,
        port: smtpConfig.port,
        email: smtpConfig.email,
        password: smtpConfig.password
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('SMTP connection verified!');
      return true;
    } else {
      console.error('SMTP test failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Error testing SMTP:', error);
    return false;
  }
}

// Usage
const smtpValid = await testSMTP({
  host: 'smtp.gmail.com',
  port: '587',
  email: 'your-email@gmail.com',
  password: 'your-app-password'
});
```

## How It Works

The API uses Nodemailer's `verify()` method which:

1. **Establishes connection** to SMTP server
2. **Sends EHLO/HELO** command
3. **Attempts authentication** with provided credentials
4. **Closes connection** (no email sent)

This is a "dry run" - no actual email is sent during verification.

## Common SMTP Settings

### Gmail

```json
{
  "host": "smtp.gmail.com",
  "port": "587",
  "email": "your-email@gmail.com",
  "password": "16-character-app-password"
}
```

**Note**: Must use app password, not regular password.

### Office 365 / Outlook

```json
{
  "host": "smtp.office365.com",
  "port": "587",
  "email": "your-email@outlook.com",
  "password": "your-password"
}
```

### Yahoo Mail

```json
{
  "host": "smtp.mail.yahoo.com",
  "port": "587",
  "email": "your-email@yahoo.com",
  "password": "your-password"
}
```

### SendGrid

```json
{
  "host": "smtp.sendgrid.net",
  "port": "587",
  "email": "apikey",
  "password": "your-sendgrid-api-key"
}
```

### Mailgun

```json
{
  "host": "smtp.mailgun.org",
  "port": "587",
  "email": "your-mailgun-username",
  "password": "your-mailgun-password"
}
```

## Port Configuration

### TLS (Recommended)

- **Port**: `587`
- **Secure**: `false` (STARTTLS is used)
- **Protocol**: SMTP over TLS

### SSL

- **Port**: `465`
- **Secure**: `true` (implicit SSL)
- **Protocol**: SMTP over SSL

The API automatically detects secure connections based on port:
- Port `465` → SSL enabled
- Other ports → STARTTLS (TLS upgrade)

## Error Troubleshooting

### "Invalid credentials"

- Verify username and password are correct
- For Gmail: Ensure app password is used (not regular password)
- Check if 2FA is enabled (required for Gmail app passwords)

### "Connection timeout"

- Verify SMTP host is correct
- Check firewall/network settings
- Ensure port is not blocked
- Try different port (587 vs 465)

### "EHLO/HELO command failed"

- SMTP server rejected connection
- May indicate server is down or blocking connections
- Verify hostname is correct

### "Authentication failed"

- Credentials are incorrect
- Account may be locked or suspended
- App password may have expired (Gmail)

## Security Considerations

1. **Never log passwords**: Passwords are not stored or logged
2. **Use HTTPS**: Always call API over HTTPS
3. **App passwords**: Use app-specific passwords for services that support it
4. **Rate limiting**: API may rate limit to prevent abuse

## Use Cases

### Before Bulk Sending

Test SMTP before sending large batches:

```javascript
// Test before sending 1000 emails
const isValid = await testSMTP(smtpConfig);
if (!isValid) {
  alert('SMTP configuration invalid. Please check settings.');
  return;
}
// Proceed with sending
```

### Settings Validation

Validate user-provided SMTP settings:

```javascript
function validateSMTP(formData) {
  return testSMTP({
    host: formData.host,
    port: formData.port,
    email: formData.email,
    password: formData.password
  });
}
```

### Debugging Connection Issues

Use test endpoint to debug SMTP connection problems without sending actual emails.

---

**Related**: [Send Emails API](./Send-Emails-Api.md) for actually sending emails

