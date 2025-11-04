# Testing Overview

Overview of testing strategy and test coverage for Sendora.

## Testing Philosophy

Sendora uses a multi-layered testing approach:

1. **Unit Tests**: Test individual functions and utilities
2. **Integration Tests**: Test component interactions
3. **Manual Tests**: User workflow validation
4. **E2E Tests**: Full user journey testing

## Test Structure

```
lib/__tests__/
├── pdf-utils.test.ts    # PDF matching tests
└── run-tests.ts         # Test runner
```

## Unit Tests

### PDF Utilities Tests

**Location**: `lib/__tests__/pdf-utils.test.ts`

**Coverage**:
- Name normalization
- PDF filename extraction
- Matching algorithms
- Edge cases

**Test Categories**:
1. Normalization tests (9 tests)
2. PDF extraction tests (8 tests)
3. Basic matching tests (13 tests)
4. Integration tests (5 tests)
5. Edge cases (4 tests)
6. Phase 2 best match tests (6 tests)

**Total**: 45 tests

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run specific test file
npm test pdf-utils.test.ts
```

## Integration Tests

### Wizard Flow Tests

Test the complete wizard flow:

1. Upload Excel file
2. Upload/match PDFs
3. Compose email
4. Configure SMTP
5. Send emails
6. View summary

### API Route Tests

Test API endpoints:

- Email sending
- Batch processing
- SMTP testing
- Error handling

## Manual Test Cases

### Test Case Documentation

See [PDF Matching Manual Tests](./Pdf-Matching-Manual-Tests.md) for comprehensive manual test cases.

**Coverage**:
- Basic exact matches
- Separator variations
- Certificate prefixes
- Accented characters
- Special characters
- Edge cases

### Test Checklist

**Before Release**:

- [ ] Upload Excel file works
- [ ] PDF matching works correctly
- [ ] Email composition works
- [ ] SMTP configuration works
- [ ] Email sending works
- [ ] Error handling works
- [ ] Certificate generation works
- [ ] All browser compatibility checked

## Test Cases

See [PDF Matching Test Cases](./Pdf-Matching-Test-Cases.md) for detailed test scenarios.

**Coverage Areas**:
- Simple exact matches
- Partial/substring matches
- Separator issues
- Special characters
- Typos and variations
- Edge cases
- Multiple matches
- Real-world scenarios

## Performance Testing

### Metrics to Monitor

1. **File Upload**: Time to parse Excel/CSV
2. **PDF Matching**: Time to match PDFs
3. **Certificate Generation**: Time per certificate
4. **Email Sending**: Time per email
5. **Batch Processing**: Total time for batch

### Performance Targets

- File parsing: < 1 second for 1000 rows
- PDF matching: < 500ms per recipient
- Certificate generation: < 2 seconds per certificate
- Email sending: < 5 seconds per email (including delay)

## Browser Testing

### Supported Browsers

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### Testing Checklist

For each browser:

- [ ] File upload works
- [ ] PDF preview works
- [ ] Email composition works
- [ ] Email sending works
- [ ] Certificate generation works
- [ ] All UI interactions work

## Continuous Integration

### CI/CD Pipeline

1. **Linting**: ESLint checks
2. **Type Checking**: TypeScript validation
3. **Unit Tests**: Automated test suite
4. **Build**: Production build verification

### Pre-deployment Checks

- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Build succeeds
- [ ] Manual smoke tests pass

## Test Data

### Sample Files

Maintain sample files for testing:

- `sample-recipients.csv`: Test recipient data
- `sample-certificates/`: Test PDF certificates
- `sample-templates/`: Test certificate templates

### Data Privacy

- Use fake/test data only
- Never commit real user data
- Sanitize test files before commit

## Future Testing

### Planned Tests

1. **E2E Tests**: Playwright/Cypress
2. **Visual Regression**: Screenshot comparisons
3. **Accessibility Tests**: WCAG compliance
4. **Load Testing**: Performance under load
5. **Security Tests**: Vulnerability scanning

---

**Related**:
- [PDF Matching Tests](./Pdf-Matching-Tests.md)
- [Manual Testing Guide](./Manual-Testing-Guide.md)
- [Test Cases](./Pdf-Matching-Test-Cases.md)

