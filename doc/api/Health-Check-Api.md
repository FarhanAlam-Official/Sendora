# Health Check API

API endpoint for checking application and SMTP status.

## Endpoint

```
GET /api/health
```

## Description

Provides health status of the API and SMTP configuration. Useful for monitoring and debugging.

## Request

No request body required.

## Response

### Success Response (200)

#### SMTP Configured and Verified

```json
{
  "api": "operational",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "smtp": {
    "configured": true,
    "verified": true,
    "host": "smtp.gmail.com",
    "port": 587
  }
}
```

#### SMTP Configured but Not Verified

```json
{
  "api": "operational",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "smtp": {
    "configured": true,
    "verified": false,
    "host": "smtp.gmail.com",
    "port": 587,
    "error": "Invalid credentials"
  }
}
```

#### SMTP Not Configured

```json
{
  "api": "operational",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "smtp": {
    "configured": false,
    "host": "smtp.gmail.com",
    "port": 587
  }
}
```

### Error Response (500)

```json
{
  "api": "error",
  "error": "Internal server error"
}
```

## Examples

### Example 1: Basic Health Check

```bash
curl https://your-domain.com/api/health
```

### Example 2: JavaScript Usage

```javascript
async function checkHealth() {
  try {
    const response = await fetch('/api/health');
    const status = await response.json();
    
    console.log('API Status:', status.api);
    console.log('SMTP Configured:', status.smtp?.configured);
    console.log('SMTP Verified:', status.smtp?.verified);
    
    if (status.smtp?.error) {
      console.error('SMTP Error:', status.smtp.error);
    }
    
    return status;
  } catch (error) {
    console.error('Health check failed:', error);
    return null;
  }
}

// Usage
const health = await checkHealth();
```

### Example 3: Monitoring Script

```javascript
// Monitor health every 30 seconds
setInterval(async () => {
  const health = await checkHealth();
  
  if (health?.api !== 'operational') {
    // Alert: API is down
    alert('API health check failed!');
  }
  
  if (health?.smtp?.configured && !health?.smtp?.verified) {
    // Alert: SMTP misconfigured
    console.warn('SMTP not verified:', health.smtp.error);
  }
}, 30000);
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `api` | string | API status: "operational" or "error" |
| `timestamp` | string | ISO 8601 timestamp of check |
| `smtp` | object | SMTP configuration status |
| `smtp.configured` | boolean | Whether SMTP is configured |
| `smtp.verified` | boolean | Whether SMTP connection verified (if configured) |
| `smtp.host` | string | SMTP hostname |
| `smtp.port` | number | SMTP port |
| `smtp.error` | string | Error message (if verification failed) |

## SMTP Verification

If SMTP is configured (environment variables present), the API attempts to verify the connection:

1. Creates Nodemailer transporter with configured SMTP
2. Calls `transporter.verify()` to test connection
3. Returns verification status

**Note**: Verification only tests connection, doesn't send an email.

## Use Cases

### Monitoring

Use for health monitoring and alerting:

```javascript
// Health check endpoint for monitoring services
// Returns 200 if operational, 500 if error
```

### Debugging

Check SMTP configuration status:

```bash
# Quick check of SMTP setup
curl /api/health | jq '.smtp'
```

### Uptime Monitoring

Integrate with uptime monitoring services:

- UptimeRobot
- Pingdom
- StatusCake
- Custom monitoring scripts

### Pre-flight Checks

Check system status before sending emails:

```javascript
async function canSendEmails() {
  const health = await fetch('/api/health').then(r => r.json());
  return health?.smtp?.configured && health?.smtp?.verified;
}

if (await canSendEmails()) {
  // Proceed with sending
} else {
  alert('SMTP not configured or verified');
}
```

## Environment Variables

The health check reads these environment variables:

- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASSWORD` - SMTP password

If these are not set, `smtp.configured` will be `false`.

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | API is operational |
| 500 | API error occurred |

## Performance

- **Response time**: <100ms typically
- **SMTP verification**: Adds ~500-1000ms if configured
- **No caching**: Always returns current status

## Security

- **No sensitive data**: Does not expose passwords
- **Read-only**: Does not modify any configuration
- **Safe to expose**: Can be used publicly for monitoring

---

**Note**: This endpoint does not require authentication.

