# Name Mapping Fix Implementation Plan

## Overview

This plan addresses the inconsistencies and limitations in the name matching logic across the application. The fixes are prioritized by impact and complexity.

---

## Phase 1: Critical Fixes (High Priority, Low-Medium Complexity)

### 1.1 Create Unified Normalization Function ⚡ **CRITICAL**

**Problem**: Different files use different normalization methods, causing inconsistent matches.

**Solution**: Create a single, centralized normalization function used everywhere.

**Implementation**:

- Create `normalizeNameForMatching()` in `lib/pdf-utils.ts`
- Replace all inline normalization logic with this function
- Handle: spaces, underscores, hyphens, special characters uniformly

**Files to Update**:

- `lib/pdf-utils.ts` - Create function, update `extractNameFromPDF()` and `findMatchingPDF()`
- `components/step-pdf-upload-match.tsx` - Replace inline normalization (line 35)
- `components/step-pdf-match.tsx` - Replace inline normalization (line 24)
- `components/step-pdf.tsx` - Update matching logic (line 41-48)

**Code**:

```typescript
/**
 * Normalize a name for matching purposes
 * Removes separators, special characters, and normalizes for comparison
 */
export function normalizeNameForMatching(name: string): string {
  if (!name || typeof name !== 'string') return ''
  
  return name
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters (é → e + ´)
    .replace(/[\u0300-\u036f]/g, '') // Remove accent marks
    .replace(/[_\s-]+/g, '') // Replace underscores, spaces, hyphens with nothing
    .replace(/[^a-z0-9]/g, '') // Remove all remaining special characters
    .trim()
}
```

**Estimated Time**: 2-3 hours
**Risk**: Low (isolated change, easy to test)

---

### 1.2 Fix Prefix/Suffix Removal ⚡ **CRITICAL**

**Problem**: Only removes 4 basic prefixes, leaves underscores/separators after removal.

**Solution**: Enhanced prefix/suffix removal that handles variations and separators.

**Implementation**:

- Update `extractNameFromPDF()` to use better prefix removal
- Remove prefixes with any separator (underscore, hyphen, space)
- Handle more common terms

**Code**:

```typescript
/**
 * Extract name from PDF filename for matching
 */
export function extractNameFromPDF(fileName: string): string {
  // Remove .pdf extension (case-insensitive)
  let name = fileName.replace(/\.pdf$/i, '')
  
  // Remove common prefixes/suffixes with any separator
  const prefixes = [
    'certificate', 'cert', 'document', 'doc', 'diploma',
    'award', 'completion', 'certificate_of', 'cert_',
    'cert-', 'diploma_of', 'diploma-'
  ]
  
  // Create regex pattern: (prefix)(separator) or (separator)(prefix)(separator)
  const separatorPattern = '[_\\s-]+'
  const prefixPattern = prefixes
    .map(p => `(^|${separatorPattern})${p}(${separatorPattern}|$)`)
    .join('|')
  
  const prefixRegex = new RegExp(prefixPattern, 'gi')
  name = name.replace(prefixRegex, ' ')
  
  // Now normalize for matching
  return normalizeNameForMatching(name)
}
```

**Estimated Time**: 1-2 hours
**Risk**: Low

---

### 1.3 Fix Empty Name Edge Case ⚡ **CRITICAL**

**Problem**: Empty strings match everything with `.includes("")`.

**Solution**: Add validation to prevent matching empty/null names.

**Implementation**:

- Add early return in matching functions for empty names
- Validate in `findMatchingPDF()` and auto-match logic

**Code**:

```typescript
export function findMatchingPDF(recipientName: string, pdfFiles: File[]): File | undefined {
  const normalizedName = normalizeNameForMatching(recipientName)
  
  // Early return for empty names
  if (!normalizedName || normalizedName.length === 0) {
    return undefined
  }
  
  // Minimum length check to prevent single character false matches
  if (normalizedName.length < 2) {
    return undefined // Or implement fuzzy matching later
  }

  for (const pdfFile of pdfFiles) {
    const pdfName = extractNameFromPDF(pdfFile.name)
    
    if (!pdfName || pdfName.length === 0) continue

    // Check if names match (exact or partial)
    if (normalizedName === pdfName || 
        pdfName.includes(normalizedName) || 
        normalizedName.includes(pdfName)) {
      return pdfFile
    }
  }

  return undefined
}
```

**Estimated Time**: 1 hour
**Risk**: Very Low

---

## Phase 2: Important Improvements (Medium Priority, Medium Complexity)

### 2.1 Implement Best Match Selection 🎯 **IMPORTANT**

**Problem**: Current logic stops at first match, which might not be the best match.

**Solution**: Score all potential matches and return the best one.

**Implementation**:

- Create scoring system (exact match > substring match)
- Return best match instead of first match
- Consider match position and length

**Code**:

```typescript
interface MatchResult {
  file: File
  score: number
  matchType: 'exact' | 'pdf_contains' | 'name_contains'
}

export function findBestMatchingPDF(
  recipientName: string, 
  pdfFiles: File[]
): File | undefined {
  const normalizedName = normalizeNameForMatching(recipientName)
  
  if (!normalizedName || normalizedName.length < 2) {
    return undefined
  }

  const matches: MatchResult[] = []

  for (const pdfFile of pdfFiles) {
    const pdfName = extractNameFromPDF(pdfFile.name)
    if (!pdfName || pdfName.length === 0) continue

    let score = 0
    let matchType: MatchResult['matchType'] | null = null

    // Exact match gets highest score
    if (normalizedName === pdfName) {
      score = 100
      matchType = 'exact'
    }
    // PDF contains full name (good match)
    else if (pdfName.includes(normalizedName)) {
      score = 80
      matchType = 'pdf_contains'
      // Bonus for starting with name
      if (pdfName.startsWith(normalizedName)) {
        score += 10
      }
    }
    // Name contains PDF name (less ideal, but acceptable)
    else if (normalizedName.includes(pdfName)) {
      score = 60
      matchType = 'name_contains'
    }

    if (matchType) {
      matches.push({ file: pdfFile, score, matchType })
    }
  }

  if (matches.length === 0) return undefined

  // Return best match (highest score)
  matches.sort((a, b) => b.score - a.score)
  return matches[0].file
}
```

**Estimated Time**: 2-3 hours
**Risk**: Medium (requires updating all call sites)

---

### 2.2 Add Minimum Length Check for Partial Matches 🎯 **IMPORTANT**

**Problem**: Single character or very short names match too many things.

**Solution**: Require minimum length for substring matches.

**Implementation**:

- Only allow substring matches if normalized name is >= 3 characters
- Exact matches can still work with shorter names

**Code**:

```typescript
// In findMatchingPDF or findBestMatchingPDF
const MIN_LENGTH_FOR_SUBSTRING_MATCH = 3

if (normalizedName === pdfName) {
  // Always allow exact matches
  return pdfFile
} else if (normalizedName.length >= MIN_LENGTH_FOR_SUBSTRING_MATCH) {
  // Only substring match if name is long enough
  if (pdfName.includes(normalizedName) || normalizedName.includes(pdfName)) {
    return pdfFile
  }
}
```

**Estimated Time**: 30 minutes
**Risk**: Very Low

---

## Phase 3: Advanced Features (Lower Priority, Higher Complexity)

### 3.1 Implement Fuzzy Matching with Levenshtein Distance 🔮 **ADVANCED**

**Problem**: Typos and variations (Jon vs John) don't match.

**Solution**: Implement fuzzy matching with similarity threshold.

**Implementation Options**:

1. **Simple**: Calculate Levenshtein distance, match if similarity > 80%
2. **Advanced**: Use library like `fuse.js` or `fuzzy-search`

**Option 1 - Simple Implementation**:

```typescript
/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

/**
 * Calculate similarity percentage (0-100)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length)
  if (maxLength === 0) return 100
  
  const distance = levenshteinDistance(str1, str2)
  return ((maxLength - distance) / maxLength) * 100
}

// Usage in matching
const similarity = calculateSimilarity(normalizedName, pdfName)
if (similarity >= 85) { // 85% similarity threshold
  matches.push({ file: pdfFile, score: 50 + similarity, matchType: 'fuzzy' })
}
```

**Option 2 - Use Library**:

```bash
npm install fuse.js
# or
npm install fuzzy-search
```

**Estimated Time**: 4-6 hours (simple) or 2-3 hours (library)
**Risk**: Medium (requires testing thresholds)

---

### 3.2 Add Confidence Scoring & Manual Review Flags 🔮 **ADVANCED**

**Problem**: Low-confidence matches aren't flagged for review.

**Solution**: Return match confidence and allow manual review.

**Implementation**:

- Extend match results to include confidence score
- Flag matches below threshold (e.g., < 70% confidence)
- Show confidence in UI for manual review

**Code**:

```typescript
interface MatchWithConfidence {
  file: File
  confidence: number // 0-100
  needsReview: boolean
  matchType: string
}

// In UI, show confidence badge:
// 🟢 High (90-100%)
// 🟡 Medium (70-89%)
// 🔴 Low (<70%) - Flag for review
```

**Estimated Time**: 3-4 hours
**Risk**: Medium (requires UI changes)

---

## Implementation Order & Timeline

### Week 1: Critical Fixes (Phase 1)

**Days 1-2**:

- ✅ Create `normalizeNameForMatching()` function
- ✅ Update `extractNameFromPDF()` to use new normalization
- ✅ Update all matching logic to use unified function

**Days 3-4**:

- ✅ Fix prefix/suffix removal
- ✅ Fix empty name edge case
- ✅ Add minimum length checks

**Day 5**:

- ✅ Testing & bug fixes
- ✅ Update documentation

**Total**: ~8-10 hours

---

### Week 2: Important Improvements (Phase 2)

**Days 1-2**:

- ✅ Implement best match selection
- ✅ Update all call sites

**Day 3**:

- ✅ Testing
- ✅ Performance optimization

**Total**: ~6-8 hours

---

### Week 3: Advanced Features (Phase 3) - Optional

**Days 1-3**:

- ✅ Implement fuzzy matching (if needed)
- ✅ Add confidence scoring
- ✅ Update UI for manual review

**Total**: ~10-12 hours

---

## Testing Strategy

### Unit Tests Needed

1. ✅ `normalizeNameForMatching()` - Test all edge cases
2. ✅ `extractNameFromPDF()` - Test various filename formats
3. ✅ `findBestMatchingPDF()` - Test matching scenarios
4. ✅ Empty/null name handling
5. ✅ Accent normalization
6. ✅ Separator normalization (spaces, underscores, hyphens)

### Integration Tests

1. ✅ End-to-end matching in upload flow
2. ✅ Verify UI updates correctly
3. ✅ Test with real-world file naming patterns

### Test Cases to Cover

- ✅ Simple exact matches
- ✅ Underscore vs space variations
- ✅ Accented characters
- ✅ Empty names
- ✅ Very short names
- ✅ Multiple potential matches
- ✅ Typos and variations (if fuzzy matching implemented)

---

## Migration Strategy

### Backward Compatibility

- ✅ New normalization should handle old patterns
- ✅ Existing matches should still work
- ✅ Gradual rollout: Test in dev/staging first

### Rollout Plan

1. **Dev Environment**: Implement all Phase 1 fixes
2. **Testing**: Comprehensive testing with real data
3. **Staging**: Deploy and test with sample files
4. **Production**: Deploy Phase 1 fixes
5. **Monitor**: Watch for matching issues
6. **Iterate**: Add Phase 2/3 features based on needs

---

## Files to Modify

### Core Files

1. ✅ `lib/pdf-utils.ts` - Add normalization functions, update matching
2. ✅ `components/step-pdf-upload-match.tsx` - Use new functions
3. ✅ `components/step-pdf-match.tsx` - Use new functions
4. ✅ `components/step-pdf.tsx` - Use new functions

### Optional (Phase 3)

5.✅ Create `lib/fuzzy-matcher.ts` - Fuzzy matching logic
6.✅ Update UI components to show confidence scores

---

## Success Metrics

After implementation, we should see:

- ✅ **80%+ match rate** for properly formatted names
- ✅ **Consistent behavior** across all matching components
- ✅ **No false positives** from empty/short names
- ✅ **Better handling** of separators and special characters

---

## Quick Start - Minimal Viable Fix

If you want the **fastest fix with biggest impact**, implement just Phase 1:

1. **Create unified normalization function** (2 hours)
2. **Replace all inline normalization** (1 hour)
3. **Fix prefix removal** (1 hour)
4. **Add empty name check** (30 min)

*Total: ~4.5 hours for critical fixes**

This will fix:

- ✅ Inconsistent normalization
- ✅ Separator handling (underscores, spaces, hyphens)
- ✅ Empty name edge cases
- ✅ Better prefix removal

---

## Recommendation

**Start with Phase 1** - These fixes address the most critical issues with minimal risk and maximum impact.

After Phase 1 is deployed and tested, evaluate if Phase 2/3 are needed based on actual usage patterns.

Would you like me to start implementing Phase 1 fixes now?
