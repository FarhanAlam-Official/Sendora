# Certificate Template Overview

Overview of certificate templates available in Sendora.

## Available Templates

Sendora includes three built-in certificate templates:

1. **Classic** - Traditional certificate design
2. **Modern** - Clean, minimalist design
3. **Elegant** - Sophisticated professional design

## Template Specifications

All templates share:

- **Layout**: Landscape A4 (297mm × 210mm)
- **Orientation**: Landscape
- **Format**: PDF output

### Classic Template

**Design**: Traditional certificate with elegant border

**Features**:
- Decorative corner elements
- Golden border (customizable)
- Formal typography
- Classic certificate layout

**Best For**:
- Formal awards
- Traditional certificates
- Academic achievements
- Professional certifications

**Color Scheme**:
- Primary: Dark gray/black
- Border: Gold (#d4af37)
- Background: White

### Modern Template

**Design**: Clean, minimalist contemporary design

**Features**:
- Top accent line
- Minimal decorative elements
- Modern typography
- Clean spacing

**Best For**:
- Contemporary certificates
- Tech certifications
- Modern awards
- Startup/innovation certificates

**Color Scheme**:
- Primary: Blue (#1e40af)
- Background: White
- Accent: Subtle gradient

### Elegant Template

**Design**: Sophisticated professional design

**Features**:
- Subtle border inset
- Refined typography
- Professional styling
- Balanced layout

**Best For**:
- Professional certifications
- Corporate training
- Executive programs
- Premium certificates

**Color Scheme**:
- Primary: Dark slate
- Secondary: Gray
- Background: White

## Template Fields

All templates support these fields:

### Required Fields

- **Recipient Name**: Always required, displayed prominently

### Optional Fields

- **Certificate Title**: "Certificate of Completion", etc.
- **Award Message**: "This certificate is awarded to"
- **Sub Message**: "for completion of..."
- **Course Title**: Name of course/program
- **Date**: Completion date
- **Organization**: Issuing organization
- **Signature Position**: Title below signature
- **Certificate Number**: Unique certificate ID
- **Custom Fields**: User-defined fields

## Customization Options

### Colors

Customize:
- Primary color (main text)
- Secondary color (supporting text)
- Background color
- Border color (if applicable)

### Fonts

Adjust:
- Font sizes per field
- Font weights (normal/bold)
- Font families (Helvetica available)

### Images

Add:
- Organization logo
- Signature image
- Custom graphics

## Creating Custom Templates

See [Creating Custom Templates](./Creating-Custom-Templates.md) for detailed instructions.

**Basic Steps**:
1. Upload background image (PNG/JPG)
2. Set dimensions in millimeters
3. Position recipient name field
4. Configure font properties
5. Save template configuration

## Template Selection Guide

### For Academic Certificates

**Recommended**: Classic or Elegant

- Formal appearance
- Traditional layout
- Suitable for educational institutions

### For Professional Training

**Recommended**: Modern or Elegant

- Professional appearance
- Contemporary design
- Suitable for corporate training

### For Awards

**Recommended**: Classic

- Prestigious appearance
- Traditional styling
- Suitable for recognition

### For Tech Certifications

**Recommended**: Modern

- Contemporary design
- Clean layout
- Suitable for technical certifications

## Template Configuration

Templates are configured via `CertificateConfig`:

```typescript
interface CertificateConfig {
  templateId: string
  fieldMapping: CertificateFieldMapping
  customStyles?: Partial<CertificateStyles>
  organizationName?: string
  defaultCertificateTitle?: string
  defaultAwardMessage?: string
  defaultSubMessage?: string
  defaultSignaturePosition?: string
  logo?: CertificateLogo
  signature?: CertificateSignature
  customFontSizes?: CertificateFontSizes
}
```

## Best Practices

1. **Choose Appropriate Template**: Match template to occasion
2. **Maintain Consistency**: Use same template across batch
3. **Customize Carefully**: Don't over-customize
4. **Test Before Sending**: Preview certificates first
5. **Brand Alignment**: Match organizational branding

---

**Related**:
- [Available Templates](./Available-Templates.md)
- [Creating Custom Templates](./Creating-Custom-Templates.md)
- [Template Configuration](./Template-Configuration.md)

