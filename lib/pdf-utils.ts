/**
 * Convert a File object to base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Extract base64 content from data URL
      const base64Content = result.split(",")[1]
      resolve(base64Content)
    }
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}

/**
 * Normalize a name for matching purposes
 * Removes separators, special characters, accents, and normalizes for comparison
 * @param name - The name to normalize
 * @returns Normalized name ready for matching (lowercase, no separators/special chars)
 */
export function normalizeNameForMatching(name: string): string {
  if (!name || typeof name !== "string") return ""

  return name
    .toLowerCase()
    .normalize("NFD") // Decompose accented characters (é → e + ´)
    .replace(/[\u0300-\u036f]/g, "") // Remove accent marks
    .replace(/[_\s-]+/g, "") // Replace underscores, spaces, hyphens with nothing
    .replace(/[^a-z0-9]/g, "") // Remove all remaining special characters
    .trim()
}

/**
 * Extract name from PDF filename for matching
 * Removes .pdf extension, common prefixes/suffixes, and normalizes
 */
export function extractNameFromPDF(fileName: string): string {
  if (!fileName || typeof fileName !== "string") return ""

  // Remove .pdf extension (case-insensitive)
  let name = fileName.replace(/\.pdf$/i, "")

  // Remove common prefixes/suffixes with any separator (underscore, space, hyphen)
  const prefixes = [
    "certificate",
    "cert",
    "document",
    "doc",
    "diploma",
    "award",
    "completion",
    "certificate_of",
    "certificate-",
    "cert_",
    "cert-",
    "diploma_of",
    "diploma-",
  ]

  // Create regex pattern to match prefixes with separators before/after
  // Handles: "Certificate_John", "Certificate-John", "Certificate John", "_Certificate_John_", etc.
  const separatorPattern = "[_\\s-]+"
  
  // Iteratively remove prefixes until no more matches
  let previousName = ""
  while (previousName !== name) {
    previousName = name
    const prefixPatterns = prefixes.map((prefix) => {
      // Match prefix at start, middle, or end with separators
      // Escape special regex characters
      const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      return `(^|${separatorPattern})${escapedPrefix}(${separatorPattern}|$)`
    })

    const prefixRegex = new RegExp(prefixPatterns.join("|"), "gi")
    name = name.replace(prefixRegex, " ")
    
    // Clean up multiple spaces
    name = name.replace(/\s+/g, " ").trim()
  }

  // Normalize using unified function (removes separators, special chars, accents)
  return normalizeNameForMatching(name)
}

/**
 * Match result with scoring information
 */
interface MatchResult {
  file: File
  score: number
  matchType: "exact" | "pdf_contains" | "name_contains" | "fuzzy"
  confidence: number // 0-100, match confidence percentage
}

/**
 * Match result with confidence information (for advanced usage)
 */
export interface MatchWithConfidence {
  file: File
  confidence: number // 0-100
  needsReview: boolean // true if confidence < 70%
  matchType: "exact" | "pdf_contains" | "name_contains" | "fuzzy"
  similarity?: number // For fuzzy matches, the similarity percentage
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching to handle typos and variations
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Levenshtein distance (number of edits needed)
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
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

/**
 * Calculate similarity percentage (0-100) between two strings
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity percentage (0-100)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length)
  if (maxLength === 0) return 100

  const distance = levenshteinDistance(str1, str2)
  return Math.max(0, ((maxLength - distance) / maxLength) * 100)
}

/**
 * Find the best matching PDF for a recipient name
 * Scores all potential matches and returns the best one
 * Includes fuzzy matching for typos and variations
 * @param recipientName - The recipient name to match
 * @param pdfFiles - Array of PDF files to search
 * @param fuzzyThreshold - Minimum similarity for fuzzy matches (0-100, default: 85)
 * @returns Matching PDF file or undefined if no match found
 */
export function findBestMatchingPDF(
  recipientName: string,
  pdfFiles: File[],
  fuzzyThreshold: number = 95, // Default 95% similarity for fuzzy matches
): File | undefined {
  const normalizedName = normalizeNameForMatching(recipientName)

  // Early return for empty or invalid names
  // Require minimum 2 characters to prevent false positives from single-character matches
  if (!normalizedName || normalizedName.length < 2) {
    return undefined
  }

  // Minimum length check for substring matches (exact matches can be shorter)
  const MIN_LENGTH_FOR_SUBSTRING_MATCH = 3

  const matches: MatchResult[] = []

  for (const pdfFile of pdfFiles) {
    const pdfName = extractNameFromPDF(pdfFile.name)

    if (!pdfName || pdfName.length === 0) continue

    let score = 0
    let matchType: MatchResult["matchType"] | null = null
    let similarity: number | undefined = undefined

    // Exact match gets highest score
    if (normalizedName === pdfName) {
      score = 100
      matchType = "exact"
      
      // For exact matches, prefer filenames where name appears earlier
      // Check original filename structure (before prefix removal)
      const originalName = pdfFile.name.replace(/\.pdf$/i, "").toLowerCase()
      const normalizedOriginal = normalizeNameForMatching(originalName)
      
      // Bonus if name appears at the start of original filename (better naming convention)
      if (normalizedOriginal.startsWith(normalizedName)) {
        score += 10 // Name was at the beginning of original filename
      } else if (normalizedOriginal.endsWith(normalizedName)) {
        score += 5 // Name was at the end of original filename
      }
      
      // Additional bonus: prefer shorter filenames (more precise match)
      const filenameLength = pdfFile.name.length
      if (filenameLength < 15) {
        score += 5 // Very short filename (direct match)
      } else if (filenameLength < 25) {
        score += 2 // Short filename
      }
    }
    // PDF contains full name (good match)
    else if (normalizedName.length >= MIN_LENGTH_FOR_SUBSTRING_MATCH && pdfName.includes(normalizedName)) {
      score = 80
      matchType = "pdf_contains"
      
      // Check position in normalized PDF name for better scoring
      // Bonus for starting with name (better match quality) - name appears early
      if (pdfName.startsWith(normalizedName)) {
        score += 15 // Higher bonus for starting position
      }
      // Bonus if name ends where PDF name ends (complete name match) - name appears at end
      else if (pdfName.endsWith(normalizedName)) {
        score += 10 // Good, but less than starting
      }
      
      // Additional scoring: prefer shorter filenames (less extra content)
      // This helps prefer "JohnDoe.pdf" over "Certificate_JohnDoe_2024_ID123.pdf"
      const lengthRatio = normalizedName.length / pdfName.length
      if (lengthRatio > 0.8) {
        score += 5 // Name is most of the filename (very good match)
      } else if (lengthRatio > 0.5) {
        score += 2 // Name is at least half (good match)
      }
      
      // Bonus: Check original filename structure (before prefix removal)
      // Prefer files where name appears earlier in the original filename
      const originalName = pdfFile.name.replace(/\.pdf$/i, "").toLowerCase()
      const normalizedOriginal = normalizeNameForMatching(originalName)
      
      // If normalized original starts with the name, it means name was at the start of original
      if (normalizedOriginal.startsWith(normalizedName)) {
        score += 10 // Name was at the beginning of original filename
      } else if (normalizedOriginal.endsWith(normalizedName)) {
        score += 5 // Name was at the end of original filename
      }
    }
    // Name contains PDF name (less ideal, but acceptable)
    else if (normalizedName.length >= MIN_LENGTH_FOR_SUBSTRING_MATCH && normalizedName.includes(pdfName)) {
      score = 60
      matchType = "name_contains"
    }
    // Fuzzy matching for typos and variations (only if no exact/substring match found)
    // Requires minimum length for both strings to avoid false positives
    else if (
      normalizedName.length >= MIN_LENGTH_FOR_SUBSTRING_MATCH &&
      pdfName.length >= MIN_LENGTH_FOR_SUBSTRING_MATCH
    ) {
      similarity = calculateSimilarity(normalizedName, pdfName)

      if (similarity >= fuzzyThreshold) {
        // Fuzzy matches: score range 50-99 (50 + similarity, capped at 99 to ensure exact matches always win)
        // Exact matches score 100+ (with bonuses up to ~122), so capping fuzzy at 99 ensures exact always wins
        score = Math.min(99, 50 + similarity) // Cap at 99 so exact matches (100+) always win
        matchType = "fuzzy"
      }
    }

    if (matchType) {
      // Calculate confidence based on match type and score
      let confidence = 0
      if (matchType === "exact") {
        confidence = 100
      } else if (matchType === "pdf_contains") {
        confidence = Math.min(95, 70 + Math.floor(score / 4)) // 70-95% range
      } else if (matchType === "name_contains") {
        confidence = Math.min(75, 50 + Math.floor(score / 3)) // 50-75% range
      } else if (matchType === "fuzzy" && similarity !== undefined) {
        confidence = Math.min(85, similarity) // Use similarity as confidence (capped at 85%)
      }

      matches.push({ file: pdfFile, score, matchType, confidence })
    }
  }

  if (matches.length === 0) return undefined

  // Return best match (highest score)
  matches.sort((a, b) => {
    // Primary sort: by score (descending)
    if (b.score !== a.score) {
      return b.score - a.score
    }
    // Tie-breaker: if scores are equal, prefer shorter filenames (more precise)
    return a.file.name.length - b.file.name.length
  })
  return matches[0].file
}

/**
 * Find the best matching PDF with confidence information (Phase 3)
 * @param recipientName - The recipient name to match
 * @param pdfFiles - Array of PDF files to search
 * @param fuzzyThreshold - Minimum similarity for fuzzy matches (0-100, default: 85)
 * @returns Match with confidence information or undefined if no match found
 */
export function findBestMatchingPDFWithConfidence(
  recipientName: string,
  pdfFiles: File[],
  fuzzyThreshold: number = 85,
): MatchWithConfidence | undefined {
  const normalizedName = normalizeNameForMatching(recipientName)

  // Require minimum 2 characters to prevent false positives
  if (!normalizedName || normalizedName.length < 2) {
    return undefined
  }

  const MIN_LENGTH_FOR_SUBSTRING_MATCH = 3
  const CONFIDENCE_REVIEW_THRESHOLD = 70 // Flag matches below 70% for manual review

  const matches: MatchResult[] = []

  for (const pdfFile of pdfFiles) {
    const pdfName = extractNameFromPDF(pdfFile.name)

    if (!pdfName || pdfName.length === 0) continue

    let score = 0
    let matchType: MatchResult["matchType"] | null = null
    let similarity: number | undefined = undefined

    // Exact match
    if (normalizedName === pdfName) {
      score = 100
      matchType = "exact"

      const originalName = pdfFile.name.replace(/\.pdf$/i, "").toLowerCase()
      const normalizedOriginal = normalizeNameForMatching(originalName)

      if (normalizedOriginal.startsWith(normalizedName)) {
        score += 10
      } else if (normalizedOriginal.endsWith(normalizedName)) {
        score += 5
      }

      const filenameLength = pdfFile.name.length
      if (filenameLength < 15) {
        score += 5
      } else if (filenameLength < 25) {
        score += 2
      }
    }
    // PDF contains full name
    else if (normalizedName.length >= MIN_LENGTH_FOR_SUBSTRING_MATCH && pdfName.includes(normalizedName)) {
      score = 80
      matchType = "pdf_contains"

      if (pdfName.startsWith(normalizedName)) {
        score += 15
      } else if (pdfName.endsWith(normalizedName)) {
        score += 10
      }

      const lengthRatio = normalizedName.length / pdfName.length
      if (lengthRatio > 0.8) {
        score += 5
      } else if (lengthRatio > 0.5) {
        score += 2
      }

      const originalName = pdfFile.name.replace(/\.pdf$/i, "").toLowerCase()
      const normalizedOriginal = normalizeNameForMatching(originalName)

      if (normalizedOriginal.startsWith(normalizedName)) {
        score += 10
      } else if (normalizedOriginal.endsWith(normalizedName)) {
        score += 5
      }
    }
    // Name contains PDF name
    else if (normalizedName.length >= MIN_LENGTH_FOR_SUBSTRING_MATCH && normalizedName.includes(pdfName)) {
      score = 60
      matchType = "name_contains"
    }
    // Fuzzy matching
    else if (
      normalizedName.length >= MIN_LENGTH_FOR_SUBSTRING_MATCH &&
      pdfName.length >= MIN_LENGTH_FOR_SUBSTRING_MATCH
    ) {
      similarity = calculateSimilarity(normalizedName, pdfName)

      if (similarity >= fuzzyThreshold) {
        // Cap fuzzy matches at 99 to ensure exact matches (100+) always win
        score = Math.min(99, 50 + similarity)
        matchType = "fuzzy"
      }
    }

    if (matchType) {
      let confidence = 0
      if (matchType === "exact") {
        confidence = 100
      } else if (matchType === "pdf_contains") {
        confidence = Math.min(95, 70 + Math.floor(score / 4))
      } else if (matchType === "name_contains") {
        confidence = Math.min(75, 50 + Math.floor(score / 3))
      } else if (matchType === "fuzzy") {
        confidence = Math.min(85, similarity!)
      }

      matches.push({ file: pdfFile, score, matchType, confidence })
    }
  }

  if (matches.length === 0) return undefined

  matches.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score
    }
    return a.file.name.length - b.file.name.length
  })

  const bestMatch = matches[0]

  return {
    file: bestMatch.file,
    confidence: bestMatch.confidence,
    needsReview: bestMatch.confidence < CONFIDENCE_REVIEW_THRESHOLD,
    matchType: bestMatch.matchType,
    similarity: bestMatch.matchType === "fuzzy" ? calculateSimilarity(normalizedName, extractNameFromPDF(bestMatch.file.name)) : undefined,
  }
}

/**
 * Match a recipient name with available PDF files
 * Uses normalized matching with validation to prevent false positives
 * Now uses best match selection with fuzzy matching support (Phase 2 & 3)
 * @param recipientName - The recipient name to match
 * @param pdfFiles - Array of PDF files to search
 * @param fuzzyThreshold - Minimum similarity for fuzzy matches (0-100, default: 85)
 * @returns Matching PDF file or undefined if no match found
 */
export function findMatchingPDF(
  recipientName: string,
  pdfFiles: File[],
  fuzzyThreshold?: number,
): File | undefined {
  // Use best match selection with fuzzy matching (Phase 2 & 3 improvements)
  return findBestMatchingPDF(recipientName, pdfFiles, fuzzyThreshold)
}
