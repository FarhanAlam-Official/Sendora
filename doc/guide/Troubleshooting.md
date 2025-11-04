# Troubleshooting Guide

Common issues and solutions for Sendora.

## Table of Contents

1. [SMTP Issues](#smtp-issues)
2. [File Upload Issues](#file-upload-issues)
3. [PDF Matching Issues](#pdf-matching-issues)
4. [Email Sending Issues](#email-sending-issues)
5. [Certificate Generation Issues](#certificate-generation-issues)
6. [Browser Compatibility](#browser-compatibility)

## SMTP Issues

### Issue: "SMTP connection failed"

**Symptoms**:
- Cannot connect to SMTP server
- Test connection fails
- Authentication errors

**Solutions**:

1. **Verify SMTP Settings**:
   - Check host, port, email, and password
   - Ensure no extra spaces or characters
   - Verify port matches security setting (587 for TLS, 465 for SSL)

2. **Gmail Specific**:
   - Must use App Password (not regular password)
   - Enable 2-Step Verification first
   - Generate new app password if expired

3. **Firewall/Network**:
   - Check if port is blocked
   - Try different network
   - Verify SMTP server is accessible

4. **Provider Limits**:
   - Check if account is locked
   - Verify sending limits not exceeded
   - Contact email provider support

### Issue: "Invalid credentials"

**Solutions**:

1. **Gmail**: Use App Password (16 characters)
2. **Office 365**: Verify password is correct
3. **Custom SMTP**: Check username format
4. **Try Test Connection**: Use `/api/testSMTP` endpoint

### Issue: "Rate limit exceeded"

**Solutions**:

1. **Reduce sending speed**: Increase `delayBetween` in batch API
2. **Split batches**: Send smaller batches
3. **Wait**: Gmail limits reset daily
4. **Use different account**: For large volumes

## File Upload Issues

### Issue: "File not uploading"

**Symptoms**:
- File picker doesn't work
- File shows but doesn't process
- Error message on upload

**Solutions**:

1. **File Format**:
   - Ensure file is `.xlsx` or `.csv`
   - Check file is not corrupted
   - Try opening in Excel first

2. **File Size**:
   - Keep files under 10MB
   - Split large files into smaller batches
   - Remove unnecessary data

3. **Browser Issues**:
   - Clear browser cache
   - Try different browser
   - Disable browser extensions
   - Check browser console for errors

### Issue: "Cannot parse file"

**Solutions**:

1. **Excel Format**:
   - Save as `.xlsx` (not `.xls`)
   - Remove merged cells
   - Ensure valid data structure

2. **CSV Format**:
   - Use UTF-8 encoding
   - Consistent delimiter (comma)
   - No special characters in headers

3. **Data Issues**:
   - Remove empty rows at top
   - Ensure headers in first row
   - Check for invalid characters

### Issue: "No data in file"

**Solutions**:

1. **Check file content**: Open in Excel/CSV viewer
2. **Verify headers**: First row must contain column names
3. **Check encoding**: Use UTF-8 for CSV files
4. **Remove empty rows**: Clean data before uploading

## PDF Matching Issues

### Issue: "PDFs not matching recipients"

**Symptoms**:
- PDFs upload but don't match
- Low confidence matches
- Manual matching required

**Solutions**:

1. **Filename Convention**:
   - Use: `FirstNameLastName.pdf`
   - Avoid: Spaces, special characters
   - Examples: `JohnDoe.pdf`, `Jane_Smith.pdf`

2. **Name Matching**:
   - Ensure recipient name in filename
   - Match case-insensitive
   - Supports spaces, underscores, hyphens

3. **Manual Matching**:
   - Click on recipient row
   - Select PDF from dropdown
   - Match saved automatically

4. **Check Matching Algorithm**:
   - Review [PDF Matching Guide](../technical/Pdf-Matching-Algorithm.md)
   - Understand confidence scores
   - Review match types

### Issue: "Wrong PDF matched"

**Solutions**:

1. **Review matches**: Check confidence badges
2. **Manual override**: Manually assign correct PDF
3. **Rename PDFs**: Use exact recipient names
4. **Check data**: Verify recipient names in Excel

## Email Sending Issues

### Issue: "Emails not sending"

**Symptoms**:
- Sending stuck in progress
- No emails received
- Error messages

**Solutions**:

1. **Check SMTP Configuration**:
   - Test connection first
   - Verify credentials
   - Check provider limits

2. **Verify Recipients**:
   - Check email addresses are valid
   - Remove invalid emails
   - Test with your own email first

3. **Check Error Messages**:
   - Review failed emails list
   - Check error details
   - Common errors:
     - Invalid email format
     - SMTP authentication failed
     - Rate limit exceeded

4. **Retry Failed**:
   - Use "Retry Failed" button
   - Only retries failed emails
   - Successful emails skipped

### Issue: "Emails going to spam"

**Solutions**:

1. **Email Content**:
   - Avoid spam trigger words
   - Include unsubscribe link
   - Professional formatting

2. **Sender Reputation**:
   - Use verified email domain
   - Warm up email account
   - Avoid spam-like patterns

3. **SPF/DKIM**:
   - Configure SPF records
   - Set up DKIM signing
   - Use dedicated email service

### Issue: "Attachment too large"

**Solutions**:

1. **Compress PDFs**:
   - Reduce PDF file size
   - Remove unnecessary images
   - Optimize PDF settings

2. **Size Limits**:
   - Gmail: 25MB total
   - Outlook: 20MB total
   - Consider external storage for large files

## Certificate Generation Issues

### Issue: "Certificate not generating"

**Symptoms**:
- Generation fails
- Blank certificates
- Error messages

**Solutions**:

1. **Field Mapping**:
   - Verify required fields mapped
   - Check field names match Excel columns
   - Ensure data in mapped columns

2. **Template Issues**:
   - Try different template
   - Check template configuration
   - Verify template fields

3. **Browser Issues**:
   - Check browser console for errors
   - Try different browser
   - Clear cache and cookies

### Issue: "Certificate layout incorrect"

**Solutions**:

1. **Template Selection**:
   - Try different template
   - Check template preview
   - Verify template dimensions

2. **Field Positions**:
   - Adjust field positions
   - Check coordinate system
   - Test with sample data

3. **Custom Template**:
   - Verify image dimensions
   - Check image format (PNG/JPG)
   - Ensure proper aspect ratio

### Issue: "Fonts not rendering"

**Solutions**:

1. **Font Support**:
   - jsPDF supports limited fonts
   - Use default fonts (Helvetica)
   - Check font size settings

2. **Special Characters**:
   - Some characters may not render
   - Check encoding
   - Use ASCII when possible

## Browser Compatibility

### Supported Browsers

- **Chrome**: Latest 2 versions ✅
- **Firefox**: Latest 2 versions ✅
- **Safari**: Latest 2 versions ✅
- **Edge**: Latest 2 versions ✅

### Known Issues

1. **Internet Explorer**: Not supported
2. **Older Safari**: May have PDF issues
3. **Mobile Browsers**: Limited file upload size

### Browser-Specific Solutions

#### Chrome
- Works best with Sendora
- Full feature support
- Recommended browser

#### Safari
- May need to enable file access
- PDF preview may differ
- Check privacy settings

#### Firefox
- Generally works well
- May need to enable file upload
- Check security settings

## Getting More Help

### Debugging Steps

1. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Look for error messages
   - Check Network tab for failed requests

2. **Check Server Logs**:
   - View deployment logs
   - Check API error responses
   - Review SMTP connection logs

3. **Test Individual Components**:
   - Test SMTP connection separately
   - Verify file parsing works
   - Test email sending with single email

### Contact Support

1. **Contact Form**: Use `/contact` page
2. **Include Information**:
   - Browser and version
   - Error messages
   - Steps to reproduce
   - Screenshots if possible

3. **Check Documentation**:
   - [User Guide](./User-Guide.md)
   - [API Documentation](../api/Api-Overview.md)
   - [Technical Docs](../technical/Architecture-Overview.md)

---

**Still having issues?** Contact us through the contact form with detailed error information.

