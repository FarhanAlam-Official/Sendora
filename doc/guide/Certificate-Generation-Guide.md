# Certificate Generation Guide

Complete guide to generating certificates in Sendora.

## Overview

Sendora supports two methods for certificate handling:

1. **Upload Existing PDFs**: Upload pre-made certificate PDFs and match them to recipients
2. **Generate New Certificates**: Create certificates on-the-fly using templates

## Upload Method

### Step 1: Prepare PDF Files

**File Requirements**:
- Format: PDF only
- Size: Maximum ~10MB per file
- Naming: Include recipient names in filenames

**Naming Convention**:
- ✅ Good: `JohnDoe.pdf`, `Jane_Smith.pdf`, `Bob-Johnson.pdf`
- ❌ Bad: `Certificate.pdf`, `File123.pdf`, `Doc 1.pdf`

### Step 2: Upload PDFs

1. Go to Step 2 in the wizard
2. Click "Upload PDFs"
3. Select certificate files
4. Files are uploaded and parsed

### Step 3: Automatic Matching

The system automatically matches PDFs to recipients:

- **High Confidence (90-100%)**: Exact match
- **Medium Confidence (70-89%)**: Likely match, review recommended
- **Low Confidence (<70%)**: Manual review required

### Step 4: Manual Matching

If automatic matching fails:

1. Click on recipient row
2. Select PDF from dropdown
3. Match is saved automatically

## Generate Method

### Step 1: Select Template

Choose from available templates:

- **Classic**: Traditional certificate with elegant border
- **Modern**: Clean, minimalist design
- **Elegant**: Sophisticated design with subtle styling

### Step 2: Map Fields

Map Excel columns to certificate fields:

**Required Fields**:
- Recipient Name (must be mapped)

**Optional Fields**:
- Certificate Title
- Award Message
- Sub Message
- Course Title
- Date
- Organization
- Signature Position
- Certificate Number
- Custom Fields

### Step 3: Configure Style

Customize certificate appearance:

**Colors**:
- Primary Color: Main text color
- Secondary Color: Supporting text color
- Background Color: Certificate background
- Border Color: Border color (if applicable)

**Fonts**:
- Adjust font sizes for each field
- Set font weights (normal/bold)
- Choose alignment (left/center/right)

**Logos & Signatures**:
- Upload organization logo
- Upload signature image
- Position images on certificate

### Step 4: Generate

Click "Generate Certificates" to create PDFs:

- Certificates generated for all recipients
- Preview available before sending
- Can regenerate if needed

## Template Details

### Classic Template

- **Layout**: Landscape A4 (297mm × 210mm)
- **Style**: Traditional with decorative border
- **Best For**: Formal certificates, awards
- **Features**: Corner decorations, elegant border

### Modern Template

- **Layout**: Landscape A4
- **Style**: Clean, minimalist
- **Best For**: Contemporary certificates
- **Features**: Top accent line, modern typography

### Elegant Template

- **Layout**: Landscape A4
- **Style**: Sophisticated, professional
- **Best For**: Professional certifications
- **Features**: Subtle border inset, refined styling

## Custom Templates

### Upload Custom Template

1. Select "Custom Template" option
2. Upload image file (PNG/JPG)
3. Set dimensions (mm)
4. Position recipient name field
5. Generate certificates

**Requirements**:
- Image format: PNG or JPG
- Recommended size: A4 dimensions (297mm × 210mm)
- High resolution for quality

### Positioning Fields

For custom templates:

- **X Position**: Distance from left edge (mm)
- **Y Position**: Distance from top edge (mm)
- **Font Size**: Text size (points)
- **Alignment**: left, center, or right
- **Font Color**: Hex color code

## Field Mapping Examples

### Example 1: Basic Certificate

**Excel Columns**:
```
Name, Email
John Doe, john@example.com
Jane Smith, jane@example.com
```

**Field Mapping**:
- Recipient Name → Name
- (Other fields use defaults)

### Example 2: Course Completion Certificate

**Excel Columns**:
```
Name, Email, Course, Date
John Doe, john@example.com, Web Development, 2024-01-15
```

**Field Mapping**:
- Recipient Name → Name
- Course Title → Course
- Date → Date
- Award Message → Default: "This certificate is awarded to"
- Sub Message → Default: "for completion of"

### Example 3: Custom Fields

**Excel Columns**:
```
Name, Email, Score, Instructor
John Doe, john@example.com, 95%, Dr. Smith
```

**Field Mapping**:
- Recipient Name → Name
- Custom Field: Score → Score
- Custom Field: Instructor → Instructor

## Best Practices

### 1. Data Preparation

- Ensure recipient names are accurate
- Use consistent naming in Excel
- Include all required fields

### 2. Template Selection

- Choose template that matches occasion
- Consider recipient demographics
- Maintain brand consistency

### 3. Field Mapping

- Map required fields first
- Use defaults when appropriate
- Test with sample data

### 4. Styling

- Use brand colors if available
- Ensure text is readable
- Test certificate appearance

### 5. Quality Control

- Preview certificates before sending
- Check recipient names are correct
- Verify all fields populated

## Troubleshooting

### Certificate Not Generating

**Solutions**:
- Check field mapping
- Verify data in mapped columns
- Try different template

### Layout Issues

**Solutions**:
- Check template dimensions
- Adjust field positions
- Verify custom template image size

### Text Overflow

**Solutions**:
- Reduce font size
- Shorten text content
- Adjust field position

---

**Next Steps**: 
- [User Guide](./User-Guide.md) for sending emails
- [Template Documentation](../template/Template-Overview.md) for template details

