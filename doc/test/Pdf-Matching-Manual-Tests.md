# Manual Test Cases for Name Matching

This document provides specific test cases you can manually verify after the fixes are implemented.

## How to Test

1. Start your development server
2. Navigate to the PDF upload/matching flow
3. Upload test PDFs and CSV files as described below
4. Verify that matches work as expected

---

## Test Case 1: Basic Exact Match ✅

**CSV Data:**
```
Name
John Doe
Jane Smith
```

**PDF Files:**
- `JohnDoe.pdf`
- `JaneSmith.pdf`

**Expected Result**: Both should match correctly

**Verification**: ✅ Both recipients should have PDFs matched

---

## Test Case 2: Separator Variations (Critical Fix) ✅

**CSV Data:**
```
Name
John Doe
Jane Smith
```

**PDF Files:**
- `John_Doe.pdf` (with underscore)
- `Jane-Smith.pdf` (with hyphen)
- `Bob Johnson.pdf` (with space)

**Expected Result**: All should match despite different separators

**Verification**: ✅ All three should match (this was failing before!)

---

## Test Case 3: Certificate Prefixes ✅

**CSV Data:**
```
Name
John Doe
Jane Smith
```

**PDF Files:**
- `Certificate_John_Doe.pdf`
- `Cert_Jane_Smith.pdf`
- `Document_Bob_Johnson.pdf`

**Expected Result**: All should match after prefix removal

**Verification**: ✅ All should match correctly

---

## Test Case 4: Accented Characters ✅

**CSV Data:**
```
Name
José García
François Müller
María José
```

**PDF Files:**
- `Jose_Garcia.pdf` (no accents)
- `Francois_Muller.pdf` (no accents)
- `Maria_Jose.pdf` (no accents)

**Expected Result**: All should match (accents normalized)

**Verification**: ✅ Should match despite accent differences

---

## Test Case 5: Special Characters ✅

**CSV Data:**
```
Name
John A. Doe
O'Brien
Doe, John
```

**PDF Files:**
- `JohnADoe.pdf` (no period)
- `OBrien.pdf` (no apostrophe)
- `DoeJohn.pdf` (no comma)

**Expected Result**: Should match (special chars removed)

**Verification**: ✅ All should match

---

## Test Case 6: Empty Names (Edge Case) ❌

**CSV Data:**
```
Name
John Doe
(empty cell)
Jane Smith
```

**PDF Files:**
- `JohnDoe.pdf`
- `SomePDF.pdf`

**Expected Result**: Empty name should NOT match anything

**Verification**: ✅ Empty name should show "No PDF matched"

---

## Test Case 7: Very Short Names ❌

**CSV Data:**
```
Name
A
B
John Doe
```

**PDF Files:**
- `Alice.pdf`
- `Bob.pdf`
- `JohnDoe.pdf`

**Expected Result**: Single character names should NOT match

**Verification**: ✅ "A" and "B" should not match (too ambiguous)

---

## Test Case 8: Complex Filenames ✅

**CSV Data:**
```
Name
John Doe
Jane Smith
```

**PDF Files:**
- `Certificate_2024_John_Doe_ID123.pdf`
- `Cert_Jane_Smith_2024.pdf`

**Expected Result**: Should still match despite extra content

**Verification**: ✅ Both should match (name is substring of filename)

---

## Test Case 9: Multiple Prefixes ✅

**CSV Data:**
```
Name
John Doe
```

**PDF Files:**
- `Certificate_Document_John_Doe.pdf`

**Expected Result**: Should match after removing both prefixes

**Verification**: ✅ Should match

---

## Test Case 10: Case Insensitivity ✅

**CSV Data:**
```
Name
john doe
JANE SMITH
Bob Johnson
```

**PDF Files:**
- `JohnDoe.pdf`
- `janesmith.pdf`
- `BOBJOHNSON.pdf`

**Expected Result**: Should match regardless of case

**Verification**: ✅ All should match

---

## Test Case 11: Numbers in Names ✅

**CSV Data:**
```
Name
John Doe 2
Smith123
```

**PDF Files:**
- `JohnDoe2.pdf`
- `Smith123.pdf`

**Expected Result**: Should match (numbers preserved)

**Verification**: ✅ Both should match

---

## Test Case 12: No Match Found ❌

**CSV Data:**
```
Name
John Doe
Bob Johnson
```

**PDF Files:**
- `JaneSmith.pdf`
- `AliceBrown.pdf`

**Expected Result**: Should show "No PDF matched" for both

**Verification**: ✅ Both should show as unmatched

---

## Test Case 13: Partial Match (Substring) ✅

**CSV Data:**
```
Name
Smith
```

**PDF Files:**
- `JohnSmith.pdf`
- `JaneSmith.pdf`
- `BobSmith.pdf`

**Expected Result**: Should match first PDF found (JohnSmith.pdf)

**Verification**: ✅ Should match one of them (first in list)

---

## Test Case 14: Real-World Scenario ✅

**CSV Data:**
```
Name,Email
Dr. John Michael Smith,john@example.com
José María García,jose@example.com
Mary-Jane Watson,mary@example.com
```

**PDF Files:**
- `Certificate_Dr_John_Michael_Smith_2024.pdf`
- `Jose_Maria_Garcia.pdf`
- `MaryJaneWatson.pdf`

**Expected Result**: All should match correctly

**Verification**: ✅ All three should match

---

## Before vs After Comparison

### Before (Old Behavior)
- ❌ `John Doe` vs `John_Doe.pdf` → No match (separator issue)
- ❌ `José García` vs `Jose_Garcia.pdf` → No match (accent issue)
- ⚠️ Empty name → Matches everything (bug)
- ⚠️ Single character → Matches everything (bug)

### After (New Behavior)
- ✅ `John Doe` vs `John_Doe.pdf` → Matches! (separator normalized)
- ✅ `José García` vs `Jose_Garcia.pdf` → Matches! (accent normalized)
- ✅ Empty name → No match (validated)
- ✅ Single character → No match (validated, prevents false positives)

---

## Success Criteria

After running these tests, you should see:

1. ✅ **Separator variations work**: Spaces, underscores, hyphens all match
2. ✅ **Accented characters work**: José matches Jose
3. ✅ **Prefix removal works**: Certificate_JohnDoe matches John Doe
4. ✅ **Empty names handled**: No false matches
5. ✅ **Short names handled**: No ambiguous matches
6. ✅ **Special characters handled**: Periods, apostrophes, commas removed
7. ✅ **Case insensitive**: Works regardless of case
8. ✅ **Complex filenames work**: Dates/IDs don't break matching

---

## Regression Testing

Also verify these existing features still work:

1. ✅ Manual PDF selection still works
2. ✅ Skip row functionality still works
3. ✅ PDF preview still works
4. ✅ Certificate generation still works
5. ✅ Email sending with PDFs still works

---

## Quick Verification Script

Run this in browser console after uploading test data:

```javascript
// Check normalization function
import { normalizeNameForMatching, extractNameFromPDF } from '@/lib/pdf-utils'

// Test cases
console.log("Test 1:", normalizeNameForMatching("John Doe") === "johndoe")
console.log("Test 2:", normalizeNameForMatching("John_Doe") === "johndoe")
console.log("Test 3:", normalizeNameForMatching("José García") === "josegarcia")
console.log("Test 4:", extractNameFromPDF("Certificate_John_Doe.pdf") === "johndoe")
console.log("Test 5:", extractNameFromPDF("John_Doe.pdf") === "johndoe")
```

All should return `true`.

