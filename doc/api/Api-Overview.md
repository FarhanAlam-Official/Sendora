# API Overview

Complete reference for all Sendora API endpoints.

## Base URL

All API endpoints are relative to your deployment:

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

Currently, Sendora API endpoints do not require authentication. However, SMTP credentials are required for email sending functionality.

## API Endpoints

### Email Sending

- [`POST /api/sendEmails`](./Send-Emails-Api.md) - Send a single email
- [`POST /api/sendEmails-batch`](./Batch-Email-Api.md) - Send multiple emails in batch

### Testing & Configuration

- [`POST /api/testSMTP`](./Smtp-Test-Api.md) - Test SMTP connection
- [`GET /api/health`](./Health-Check-Api.md) - Health check endpoint

### Contact & Support

- [`POST /api/contact`](./Contact-Api.md) - Submit contact form

## Response Format

All API responses follow this structure:

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Optional detailed error information"
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (invalid input) |
| 500 | Server Error |

## Rate Limiting

- **Single Email**: No rate limiting
- **Batch Email**: 500ms delay between emails (configurable)
- **SMTP Test**: Rate limited to prevent abuse

## Error Handling

All endpoints include comprehensive error handling:

- Input validation
- SMTP connection errors
- File upload errors
- Network errors

Error responses include:
- Human-readable error message
- Error code for programmatic handling
- Optional details for debugging

## CORS

CORS is enabled for all endpoints. Cross-origin requests are allowed from the same domain.

## Request/Response Examples

See individual endpoint documentation for detailed examples.

## Versioning

Current API version: **v1** (implicit)

Future versions will use URL-based versioning: `/api/v2/...`

---

**Next**: Read detailed documentation for each endpoint:
- [Send Emails API](./Send-Emails-Api.md)
- [Batch Email API](./Batch-Email-Api.md)
- [SMTP Test API](./Smtp-Test-Api.md)

