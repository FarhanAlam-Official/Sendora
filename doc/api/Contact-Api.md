# Contact API

API endpoint for submitting contact form messages.

## Endpoint

```
POST /api/contact
```

## Description

Handles contact form submissions, sends notification emails to admin and confirmation to the user. Includes HTML email templates with proper formatting.

## Request Body

FormData with the following fields:

```typescript
{
  name: string      // Sender's name (required)
  email: string     // Sender's email address (required)
  message: string   // Message content (required)
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Sender's full name |
| `email` | string | Yes | Valid email address for reply |
| `message` | string | Yes | Message content (supports newlines) |

## Response

### Success Response (200)

```json
{
  "success": true,
  "message": "Contact form submitted successfully"
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "error": "Missing required fields"
}
```

#### 500 Server Error

```json
{
  "error": "Failed to send email",
  "details": "..."
}
```

## Examples

### Example 1: Basic Form Submission

```javascript
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('email', 'john@example.com');
formData.append('message', 'Hello, I have a question about Sendora.');

const response = await fetch('/api/contact', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.message);
```

### Example 2: HTML Form

```html
<form id="contactForm">
  <input type="text" name="name" placeholder="Your Name" required>
  <input type="email" name="email" placeholder="Your Email" required>
  <textarea name="message" placeholder="Your Message" required></textarea>
  <button type="submit">Send Message</button>
</form>

<script>
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  
  const response = await fetch('/api/contact', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  if (result.success) {
    alert('Message sent successfully!');
    e.target.reset();
  } else {
    alert('Error: ' + result.error);
  }
});
</script>
```

### Example 3: React Component

```tsx
function ContactForm() {
  const [status, setStatus] = useState('');
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStatus('Message sent successfully!');
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus('Error: ' + result.error);
      }
    } catch (error) {
      setStatus('Network error. Please try again.');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Your Name" required />
      <input name="email" type="email" placeholder="Your Email" required />
      <textarea name="message" placeholder="Your Message" required />
      <button type="submit">Send</button>
      {status && <p>{status}</p>}
    </form>
  );
}
```

## Email Templates

The API sends two emails:

### 1. Admin Notification Email

Sent to `ADMIN_EMAIL` (from environment variables):

- **Subject**: `📧 New Contact Form Submission from [Name]`
- **Content**: Professional HTML email with:
  - Sender's name
  - Sender's email (clickable mailto link)
  - Message content (formatted)
  - Quick reply button

### 2. User Confirmation Email

Sent to the form submitter:

- **Subject**: `Thank you for contacting Sendora`
- **Content**: Confirmation that message was received

## Email Formatting

- **HTML emails** with responsive design
- **XSS protection**: All user input is escaped
- **Newline support**: Newlines in message converted to `<br>` tags
- **Logo included**: Sendora logo in email header
- **Styled layout**: Professional gradient headers and card layout

## Environment Variables

Required environment variable:

- `ADMIN_EMAIL`: Email address to receive contact form submissions
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`: SMTP configuration for sending emails
- `NEXT_PUBLIC_BASE_URL`: Base URL for logo/images (optional)

## Security Features

### XSS Protection

All user input is escaped to prevent XSS attacks:

```typescript
const escapeHtml = (text: string) => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
```

### Input Validation

- **Required fields**: All fields are validated
- **Email format**: Email address is validated (basic format check)
- **Message length**: No maximum length enforced (consider adding for production)

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Missing required fields" | One or more fields missing | Ensure all fields are provided |
| "Failed to send email" | SMTP error | Check SMTP configuration |
| Network error | Connection issue | Retry request |

### Retry Logic

No automatic retry. Consider implementing client-side retry for network errors.

## Rate Limiting

Consider implementing rate limiting to prevent spam:

- Limit submissions per IP address
- Limit submissions per email address
- Add CAPTCHA for production use

## Integration Example

```javascript
// Contact form handler
async function submitContactForm(name, email, message) {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('message', message);
  
  const response = await fetch('/api/contact', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit contact form');
  }
  
  return await response.json();
}

// Usage
try {
  const result = await submitContactForm(
    'John Doe',
    'john@example.com',
    'Hello, I need help with...'
  );
  console.log('Success:', result.message);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

**Note**: This endpoint requires SMTP configuration in environment variables.

