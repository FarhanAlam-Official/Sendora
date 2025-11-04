# Name Mapping Test Cases & Examples

## Test Case Format

Each test case shows:

- **CSV Name**: The recipient name from the spreadsheet
- **PDF Filename**: The uploaded PDF file name
- **Normalized CSV**: After normalization
- **Normalized PDF**: After normalization (with prefix removal)
- **Match Result**: ✅ Will match or ❌ Won't match
- **Match Reason**: Explanation

---

## Category 1: Simple Exact Matches

### Test Case 1.1: Basic Match ✅

- **CSV Name**: `John Doe`
- **PDF Filename**: `JohnDoe.pdf`
- **Normalized CSV**: `johndoe`
- **Normalized PDF**: `johndoe`
- **Match Result**: ✅ **WILL MATCH**
- **Match Reason**: Exact match after normalization

### Test Case 1.2: With Certificate Prefix ✅

- **CSV Name**: `Jane Smith`
- **PDF Filename**: `Certificate_JaneSmith.pdf`
- **Normalized CSV**: `janesmith`
- **Normalized PDF**: `_janesmith` (underscore remains after prefix removal)
- **Match Result**: ❌ **WON'T MATCH** (underscore issue)
- **Note**: This exposes a bug - underscore handling is inconsistent

### Test Case 1.3: With Certificate Prefix (No Underscore) ✅

- **CSV Name**: `Bob Johnson`
- **PDF Filename**: `CertificateBobJohnson.pdf`
- **Normalized CSV**: `bobjohnson`
- **Normalized PDF**: `bobjohnson`
- **Match Result**: ✅ **WILL MATCH**
- **Match Reason**: Prefix removed correctly, exact match

---

## Category 2: Partial/Substring Matches

### Test Case 2.1: PDF Contains Full Name ✅

- **CSV Name**: `Alice Brown`
- **PDF Filename**: `AliceBrownCertificate.pdf`
- **Normalized CSV**: `alicebrown`
- **Normalized PDF**: `alicebrown`
- **Match Result**: ✅ **WILL MATCH**
- **Match Reason**: Exact match (prefix removed from end)

### Test Case 2.2: First Name Only Match ⚠️

- **CSV Name**: `Mary`
- **PDF Filename**: `MaryJaneWatson.pdf`
- **Normalized CSV**: `mary`
- **Normalized PDF**: `maryjanewatson`
- **Match Result**: ✅ **WILL MATCH** (but potentially wrong person!)
- **Match Reason**: `"maryjanewatson".includes("mary")` → true
- **Risk**: Could match wrong person if multiple "Mary" names exist

### Test Case 2.3: Last Name Only Match ⚠️

- **CSV Name**: `Smith`
- **PDF Filename**: `JohnSmith.pdf`
- **Normalized CSV**: `smith`
- **Normalized PDF**: `johnsmith`
- **Match Result**: ✅ **WILL MATCH** (but potentially wrong person!)
- **Match Reason**: `"johnsmith".includes("smith")` → true
- **Risk**: Could match "John Smith" when looking for "Jane Smith"

### Test Case 2.4: Full Name in Longer String ✅

- **CSV Name**: `Michael Chen`
- **PDF Filename**: `2024_Certificate_MichaelChen_ID456.pdf`
- **Normalized CSV**: `michaelchen`
- **Normalized PDF**: `_2024__michaelchen_id456`
- **Match Result**: ✅ **WILL MATCH**
- **Match Reason**: `"_2024__michaelchen_id456".includes("michaelchen")` → true

---

## Category 3: Separator Issues

### Test Case 3.1: Underscore vs Space ❌

- **CSV Name**: `John Doe`
- **PDF Filename**: `John_Doe.pdf`
- **Normalized CSV**: `johndoe` (spaces removed)
- **Normalized PDF**: `john_doe` (underscore preserved)
- **Match Result**: ❌ **WON'T MATCH**
- **Issue**: Underscores not normalized consistently

### Test Case 3.2: Hyphen vs Space ❌

- **CSV Name**: `Mary Jane`
- **PDF Filename**: `Mary-Jane.pdf`
- **Normalized CSV**: `maryjane` (spaces removed)
- **Normalized PDF**: `mary-jane` (hyphen preserved in some implementations)
- **Match Result**: ❌ **WON'T MATCH** (inconsistent normalization)

### Test Case 3.3: Mixed Separators ❌

- **CSV Name**: `Robert Lee`
- **PDF Filename**: `Robert_Lee-2024.pdf`
- **Normalized CSV**: `robertlee`
- **Normalized PDF**: `robert_lee-2024` or `robertlee2024` (depending on implementation)
- **Match Result**: ❌ **WON'T MATCH** (separator confusion)

---

## Category 4: Special Characters & Formatting

### Test Case 4.1: Accented Characters ❌

- **CSV Name**: `José García`
- **PDF Filename**: `Jose_Garcia.pdf`
- **Normalized CSV**: `joségarcía` or `josegarcia` (depending on normalization)
- **Normalized PDF**: `jose_garcia`
- **Match Result**: ❌ **WON'T MATCH** (accent differences)

### Test Case 4.2: Abbreviations ❌

- **CSV Name**: `J. Smith`
- **PDF Filename**: `JohnSmith.pdf`
- **Normalized CSV**: `jsmith` (period removed)
- **Normalized PDF**: `johnsmith`
- **Match Result**: ❌ **WON'T MATCH** (abbreviation vs full name)

### Test Case 4.3: Middle Initials ❌

- **CSV Name**: `John A. Doe`
- **PDF Filename**: `JohnDoe.pdf`
- **Normalized CSV**: `jadoe` (spaces and period removed)
- **Normalized PDF**: `johndoe`
- **Match Result**: ❌ **WON'T MATCH** (middle initial causes mismatch)

### Test Case 4.4: Comma Format ❌

- **CSV Name**: `Doe, John`
- **PDF Filename**: `JohnDoe.pdf`
- **Normalized CSV**: `doe,john` (comma preserved)
- **Normalized PDF**: `johndoe`
- **Match Result**: ❌ **WON'T MATCH** (comma causes mismatch)

### Test Case 4.5: Apostrophes ❌

- **CSV Name**: `O'Brien`
- **PDF Filename**: `OBrien.pdf`
- **Normalized CSV**: `o'brien` (apostrophe preserved)
- **Normalized PDF**: `obrien`
- **Match Result**: ❌ **WON'T MATCH** (apostrophe causes mismatch)

---

## Category 5: Typos & Variations

### Test Case 5.1: Common Typo ❌

- **CSV Name**: `John`
- **PDF Filename**: `Jon.pdf` (typo)
- **Normalized CSV**: `john`
- **Normalized PDF**: `jon`
- **Match Result**: ❌ **WON'T MATCH** (no fuzzy matching)

### Test Case 5.2: Misspelling ❌

- **CSV Name**: `Smyth`
- **PDF Filename**: `Smith.pdf`
- **Normalized CSV**: `smyth`
- **Normalized PDF**: `smith`
- **Match Result**: ❌ **WON'T MATCH** (1 character difference not handled)

### Test Case 5.3: Common Name Variation ❌

- **CSV Name**: `Robert`
- **PDF Filename**: `Bob.pdf` (nickname)
- **Normalized CSV**: `robert`
- **Normalized PDF**: `bob`
- **Match Result**: ❌ **WON'T MATCH** (no nickname handling)

---

## Category 6: Edge Cases

### Test Case 6.1: Empty Name ⚠️

- **CSV Name**: `` (empty)
- **PDF Filename**: `Certificate.pdf`
- **Normalized CSV**: `""` (empty string)
- **Normalized PDF**: `""` (empty after prefix removal)
- **Match Result**: ⚠️ **MATCHES EVERYTHING**
- **Issue**: `"anything".includes("")` → true (empty string matches everything)

### Test Case 6.2: Single Character ⚠️

- **CSV Name**: `A`
- **PDF Filename**: `Alice.pdf`
- **Normalized CSV**: `a`
- **Normalized PDF**: `alice`
- **Match Result**: ✅ **WILL MATCH** (but too ambiguous)
- **Issue**: Single characters match too many things

### Test Case 6.3: Numbers in Names ✅

- **CSV Name**: `John Doe 2`
- **PDF Filename**: `JohnDoe2.pdf`
- **Normalized CSV**: `johndoe2`
- **Normalized PDF**: `johndoe2`
- **Match Result**: ✅ **WILL MATCH**
- **Note**: Numbers are preserved, works correctly

### Test Case 6.4: Very Long Names ✅

- **CSV Name**: `John Michael Robert William Smith`
- **PDF Filename**: `JohnMichaelRobertWilliamSmith.pdf`
- **Normalized CSV**: `johnmichaelrobertwilliamsmith`
- **Normalized PDF**: `johnmichaelrobertwilliamsmith`
- **Match Result**: ✅ **WILL MATCH**
- **Note**: Works as long as no separators cause issues

---

## Category 7: Multiple Matches Issue

### Test Case 7.1: First Match Only ⚠️

- **CSV Name**: `Smith`
- **PDF Files**:
  - `JohnSmith.pdf`
  - `JaneSmith.pdf`
  - `BobSmith.pdf`
- **Normalized CSV**: `smith`
- **Match Result**: ⚠️ **MATCHES FIRST ONE ONLY** (JohnSmith.pdf)
- **Issue**: No way to choose best match; stops at first match

### Test Case 7.2: Overlapping Names ⚠️

- **CSV Name**: `Mary Jane`
- **PDF Files**:
  - `MaryJaneWatson.pdf` (for "Mary Jane Watson")
  - `MaryJaneSmith.pdf` (for "Mary Jane Smith")
- **Normalized CSV**: `maryjane`
- **Match Result**: ⚠️ **MATCHES FIRST ONE ONLY**
- **Issue**: Both PDFs would match, but only first is selected

---

## Category 8: Real-World Scenarios

### Test Case 8.1: Professional Certificates ✅

- **CSV Name**: `Dr. Sarah Johnson`
- **PDF Filename**: `Certificate_DrSarahJohnson.pdf`
- **Normalized CSV**: `drsarahjohnson` (period removed)
- **Normalized PDF**: `_drsarahjohnson` (underscore remains)
- **Match Result**: ❌ **WON'T MATCH** (underscore issue)
- **Workaround**: Use `DrSarahJohnson.pdf` or `Dr_Sarah_Johnson.pdf` → match depends on normalization

### Test Case 8.2: International Names ❌

- **CSV Name**: `François Müller`
- **PDF Filename**: `Francois_Muller.pdf`
- **Normalized CSV**: `françoismüller` (accents preserved)
- **Normalized PDF**: `francois_muller` (no accents)
- **Match Result**: ❌ **WON'T MATCH** (accent differences)

### Test Case 8.3: Company Certificates ✅

- **CSV Name**: `ABC Corp Employee: John Doe`
- **PDF Filename**: `Certificate_JohnDoe.pdf`
- **Normalized CSV**: `abccorpemployeejohndoe` (spaces removed)
- **Normalized PDF**: `johndoe` (prefix removed)
- **Match Result**: ✅ **WILL MATCH**
- **Match Reason**: `"abccorpemployeejohndoe".includes("johndoe")` → true

---

## Summary Statistics

| Category | Total Cases | Will Match | Won't Match | Ambiguous/Warning |
|----------|-------------|------------|-------------|-------------------|
| Simple Exact | 3 | 2 | 1 | 0 |
| Partial/Substring | 4 | 4 | 0 | 2 |
| Separator Issues | 3 | 0 | 3 | 0 |
| Special Characters | 5 | 0 | 5 | 0 |
| Typos & Variations | 3 | 0 | 3 | 0 |
| Edge Cases | 4 | 2 | 0 | 2 |
| Multiple Matches | 2 | 0 | 0 | 2 |
| Real-World | 3 | 1 | 2 | 0 |
| **TOTAL** | **27** | **9** | **14** | **6** |

**Match Success Rate**: ~33% (9/27 exact matches, 6 potentially correct but ambiguous)

**Main Issues**:

1. Separator inconsistencies (underscores, hyphens, spaces)
2. No fuzzy matching (typos, misspellings)
3. Accented characters not normalized
4. First match only (no best match selection)
5. Partial matches can be ambiguous/wrong

---

## Recommendations by Priority

### Priority 1 (Critical)

1. Normalize all separators uniformly (`_`, `-`, spaces → all removed)
2. Handle empty name edge case
3. Implement consistent normalization across all components

### Priority 2 (High)

4. Normalize accented characters
5. Remove special characters (commas, apostrophes, periods) from names
6. Better prefix/suffix removal (handle variations)

### Priority 3 (Medium)

7. Implement fuzzy matching for typos
8. Best match selection instead of first match
9. Confidence scoring for matches

### Priority 4 (Nice to Have)

10. Nickname/variation handling
11. Manual review flag for low-confidence matches
12. Multiple match suggestions when ambiguous
