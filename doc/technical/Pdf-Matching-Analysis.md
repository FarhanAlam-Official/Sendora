# Name Mapping Logic Analysis Report

## Overview

This document analyzes the name matching logic used to automatically match recipient names from CSV/Excel files with uploaded PDF certificate filenames.

## Core Matching Logic

### 1. Name Normalization Process

#### PDF Filename Normalization (`extractNameFromPDF`)

**Location**: `lib/pdf-utils.ts:21-27`

**Steps**:

1. Remove `.pdf` extension (case-insensitive)
2. Remove common prefixes/suffixes: `certificate`, `cert`, `document`, `doc` (case-insensitive)
3. Trim whitespace
4. Convert to lowercase

**Example Transformations**:

```bash
"John_Doe_Certificate.pdf" → "john_doe"
"Jane Smith Cert.pdf" → "jane smith"
"Certificate_Document_Alice_Brown.pdf" → "_alice_brown"
```

#### Recipient Name Normalization

**Locations**: Multiple files with slight variations

**Variation 1** (`step-pdf-upload-match.tsx:35`):

- `.toLowerCase().replace(/\s+/g, "")` - Removes ALL spaces
- Example: `"John Doe"` → `"johndoe"`

**Variation 2** (`lib/pdf-utils.ts:33`):

- `.toLowerCase().trim()` - Only trims leading/trailing spaces, preserves internal spaces
- Example: `"John Doe"` → `"john doe"`

**Variation 3** (`step-pdf-match.tsx:24`):

- `.toLowerCase().replace(/\s+/g, "")` - Removes ALL spaces
- Example: `"John Doe"` → `"johndoe"`

### 2. Matching Algorithm

**Location**: `lib/pdf-utils.ts:39` and `step-pdf-upload-match.tsx:41`

**Matching Conditions** (OR logic - matches if ANY condition is true):

1. **Exact Match**: `normalizedName === pdfName`
2. **Substring Match (PDF contains recipient)**: `pdfName.includes(normalizedName)`
3. **Substring Match (Recipient contains PDF)**: `normalizedName.includes(pdfName)`

**Important**: The matching stops at the **first match found** (not best match).

## Matching Examples

### ✅ WILL MATCH

| CSV Name | PDF Filename | How it Matches |
|----------|--------------|----------------|
| `John Doe` | `John_Doe.pdf` | After space removal: `"johndoe" === "john_doe"` → NO, but `"john_doe".includes("johndoe")` → NO, `"johndoe".includes("john_doe")` → NO. **Actually won't match unless underscores are removed** |
| `John Doe` | `JohnDoe.pdf` | `"johndoe" === "johndoe"` → ✅ **Exact match** |
| `John Doe` | `Certificate_John_Doe.pdf` | After cleaning: `"johndoe"` vs `"_john_doe"`, `"_john_doe".includes("johndoe")` → ❌ **Won't match due to underscores** |
| `John Doe` | `JohnDoeCertificate.pdf` | After cleaning PDF: `"johndoecertificate"`, `"johndoecertificate".includes("johndoe")` → ✅ **Substring match** |
| `Mary Jane Watson` | `MaryJane.pdf` | `"maryjanewatson".includes("maryjane")` → ✅ **Substring match** |
| `Smith` | `John_Smith_Certificate.pdf` | After cleaning: `"smith"` vs `"_john_smith_"`, `"_john_smith_".includes("smith")` → ✅ **Substring match** |

### ❌ WILL NOT MATCH

| CSV Name | PDF Filename | Reason |
|----------|--------------|--------|
| `John Doe` | `John_Doe.pdf` | Underscores vs spaces - `"johndoe"` ≠ `"john_doe"` |
| `Dr. John Doe` | `JohnDoe.pdf` | Special characters removed but `"drjohndoe"` ≠ `"johndoe"` |
| `John-Michael Doe` | `JohnMichaelDoe.pdf` | Hyphens vs no separators - `"john-michaeldoe"` ≠ `"johnmichaeldoe"` |
| `J. Doe` | `John Doe.pdf` | Abbreviations don't match - `"jdoe"` ≠ `"johndoe"` |
| `Doe, John` | `JohnDoe.pdf` | Comma/formatting - `"doe,john"` ≠ `"johndoe"` |
| `João Silva` | `Joao_Silva.pdf` | Accented characters - `"joãosilva"` ≠ `"joao_silva"` |
| `John  Doe` (double space) | `John Doe.pdf` | Spaces handled differently in normalization |

## Limitations

### 1. **No Fuzzy Matching**

- No handling of typos, misspellings, or similar-sounding names
- `"John"` won't match `"Jon"`
- `"Smith"` won't match `"Smyth"`
- `"Maria"` won't match `"Mary"`

### 2. **Inconsistent Space Handling**

- **Problem**: Different components handle spaces differently:
  - Some remove ALL spaces: `replace(/\s+/g, "")`
  - Some only trim: `trim()`
- **Impact**: PDF with `"John_Doe.pdf"` vs CSV `"John Doe"` creates `"johndoe"` vs `"john_doe"` → no match

### 3. **Character Encoding Issues**

- Accented characters (é, á, ñ, etc.) may not match
- Special Unicode characters may cause mismatches
- `"José"` ≠ `"Jose"` after normalization

### 4. **Order Dependency**

- Matching stops at first match
- If multiple PDFs could match, only the first one in the array is used
- No "best match" selection

### 5. **Incomplete Prefix/Suffix Removal**

- Only removes: `certificate`, `cert`, `document`, `doc`
- Doesn't remove other common terms like:
  - `diploma`, `award`, `completion`, `certificate_of`, `cert_`, etc.
- Doesn't handle variations: `Certificate-`, `CERT-`, etc.

### 6. **No Special Character Normalization**

- Doesn't handle:
  - Underscores (`_`) vs spaces vs hyphens (`-`)
  - Special characters in names (periods, commas, apostrophes)
  - Leading/trailing special characters after prefix removal

### 7. **Case Sensitivity After Normalization**

- All comparisons are case-insensitive (good)
- But case variations before normalization could still cause issues

### 8. **Multiple Matching Logic Issues**

- `pdfName.includes(normalizedName)` can cause false positives:
  - `"JohnSmith".includes("John")` → ✅ matches, but might be wrong person
  - `"MaryJaneWatson".includes("Mary")` → ✅ matches, but might want full name

### 9. **No Levenshtein Distance**

- No similarity scoring
- `"Jon"` and `"John"` (1 character difference) won't match

### 10. **Partial Name Matching Ambiguity**

- First name only matches could be ambiguous
- `"Smith"` could match multiple people named "John Smith", "Jane Smith", etc.

## Edge Cases

### Edge Case 1: Empty/Null Names

- If recipient name is empty/null: Returns empty string `""`
- Empty string matches many things with `includes("")` → `true`
- **Risk**: Could cause incorrect matches

### Edge Case 2: Very Short Names

- Single character names: `"A"` would match `"Alice.pdf"`, `"Andrew.pdf"`, etc.
- Two character names have similar issues

### Edge Case 3: Names with Numbers

- `"John Doe 2"` vs `"JohnDoe2.pdf"` - Numbers are preserved, might match
- `"John Doe II"` vs `"JohnDoe2.pdf"` - Roman numerals vs numbers won't match

### Edge Case 4: File Naming Conventions

- If PDFs are named: `"Certificate_2024_John_Doe_ID123.pdf"`
- After cleaning: `"_2024_john_doe_id123"`
- CSV `"John Doe"` becomes `"johndoe"`
- `"_2024_john_doe_id123".includes("johndoe")` → ✅ Would match (good!)
- But `"_2024_john_doe_id123"` would also match `"2024"`, `"id123"`, etc.

## Recommendations

### Immediate Fixes

1. **Consistent Space/Normalization**:

   ```typescript
   function normalizeName(name: string): string {
     return name
       .toLowerCase()
       .replace(/[_\s-]+/g, "")  // Replace underscores, spaces, hyphens with empty
       .replace(/[^a-z0-9]/g, "") // Remove all special characters
       .trim()
   }
   ```

2. **Enhanced Prefix/Suffix Removal**:

   ```typescript
   const prefixes = ["certificate", "cert", "document", "doc", "diploma", 
                     "award", "completion", "certificate_of", "cert_"]
   // Remove with case-insensitive regex, handle underscores/hyphens
   ```

3. **Better Matching Logic**:
   - Use Levenshtein distance for fuzzy matching
   - Implement similarity scoring
   - Consider "best match" rather than "first match"

4. **Handle Special Characters**:
   - Normalize accented characters
   - Handle common name separators uniformly

### Advanced Improvements

1. **Fuzzy Matching Library**: Use libraries like `fuse.js` or `fuzzy-search`
2. **Confidence Scoring**: Return match confidence scores
3. **Manual Review Flag**: Flag low-confidence matches for manual review
4. **Multiple Match Handling**: Show all potential matches if ambiguous
5. **Name Parsing**: Split full names into first/last for better matching

## Code Locations Summary

| Function | File | Lines | Normalization Method |
|----------|------|-------|---------------------|
| `extractNameFromPDF` | `lib/pdf-utils.ts` | 21-27 | Remove `.pdf`, remove prefixes, lowercase |
| `findMatchingPDF` | `lib/pdf-utils.ts` | 32-45 | `.toLowerCase().trim()` (preserves spaces) |
| Auto-match logic | `step-pdf-upload-match.tsx` | 35-41 | `.toLowerCase().replace(/\s+/g, "")` (removes all spaces) |
| Auto-match logic | `step-pdf-match.tsx` | 24-28 | `.toLowerCase().replace(/\s+/g, "")` (removes all spaces) |
| Auto-match logic | `step-pdf.tsx` | 41-48 | Uses `extractNameFromPDF` + `.toLowerCase().trim()` |

## Conclusion

The current name mapping logic is **basic substring matching** with simple normalization. It works well for:

- ✅ Simple, consistent naming: `"JohnDoe.pdf"` matches `"John Doe"`
- ✅ Files with certificate prefixes: `"Certificate_JohnDoe.pdf"` matches `"John Doe"`

It fails for:

- ❌ Inconsistent separators: underscores vs spaces vs hyphens
- ❌ Typos or variations: `"Jon"` vs `"John"`
- ❌ Special characters: accents, punctuation
- ❌ Complex filenames with dates/IDs mixed in
- ❌ Names with abbreviations: `"J. Doe"` vs `"John Doe"`

**Recommendation**: Implement fuzzy matching with similarity scoring for production use.
