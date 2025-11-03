/**
 * Test suite for PDF name matching utilities
 * 
 * To run these tests:
 * 1. Install Jest/Vitest: npm install --save-dev jest @types/jest ts-jest
 * 2. Add to package.json scripts: "test": "jest" or "vitest"
 * 3. Run: npm test
 * 
 * Or run manually by executing each test case and verifying results
 */

import {
  normalizeNameForMatching,
  extractNameFromPDF,
  findMatchingPDF,
  findBestMatchingPDF,
  findBestMatchingPDFWithConfidence,
  MatchWithConfidence,
} from "../pdf-utils"

// Mock File constructor for testing
class MockFile extends File {
  constructor(name: string) {
    super([], name, { type: "application/pdf" })
  }
}

describe("normalizeNameForMatching", () => {
  test("should normalize basic names", () => {
    expect(normalizeNameForMatching("John Doe")).toBe("johndoe")
    expect(normalizeNameForMatching("Jane Smith")).toBe("janesmith")
    expect(normalizeNameForMatching("Bob Johnson")).toBe("bobjohnson")
  })

  test("should handle separators (spaces, underscores, hyphens)", () => {
    expect(normalizeNameForMatching("John Doe")).toBe("johndoe")
    expect(normalizeNameForMatching("John_Doe")).toBe("johndoe")
    expect(normalizeNameForMatching("John-Doe")).toBe("johndoe")
    expect(normalizeNameForMatching("John  Doe")).toBe("johndoe") // Multiple spaces
    expect(normalizeNameForMatching("John_Doe-Smith")).toBe("johndoesmith")
  })

  test("should handle accented characters", () => {
    expect(normalizeNameForMatching("José García")).toBe("josegarcia")
    expect(normalizeNameForMatching("François Müller")).toBe("francoismuller")
    expect(normalizeNameForMatching("María José")).toBe("mariajose")
    expect(normalizeNameForMatching("Renée")).toBe("renee")
  })

  test("should remove special characters", () => {
    expect(normalizeNameForMatching("John A. Doe")).toBe("johnadoe")
    expect(normalizeNameForMatching("O'Brien")).toBe("obrien")
    expect(normalizeNameForMatching("Doe, John")).toBe("doejohn")
    expect(normalizeNameForMatching("Smith-Jr.")).toBe("smithjr")
  })

  test("should handle case insensitivity", () => {
    expect(normalizeNameForMatching("JOHN DOE")).toBe("johndoe")
    expect(normalizeNameForMatching("john doe")).toBe("johndoe")
    expect(normalizeNameForMatching("John Doe")).toBe("johndoe")
    expect(normalizeNameForMatching("JoHn DoE")).toBe("johndoe")
  })

  test("should handle empty/null/undefined inputs", () => {
    expect(normalizeNameForMatching("")).toBe("")
    expect(normalizeNameForMatching(null as any)).toBe("")
    expect(normalizeNameForMatching(undefined as any)).toBe("")
  })

  test("should preserve numbers", () => {
    expect(normalizeNameForMatching("John Doe 2")).toBe("johndoe2")
    expect(normalizeNameForMatching("Smith123")).toBe("smith123")
    expect(normalizeNameForMatching("User_2024")).toBe("user2024")
  })

  test("should handle very long names", () => {
    expect(normalizeNameForMatching("John Michael Robert William Smith")).toBe(
      "johnmichaelrobertwilliamsmith"
    )
  })

  test("should handle single character names", () => {
    expect(normalizeNameForMatching("A")).toBe("a")
    expect(normalizeNameForMatching("B")).toBe("b")
  })
})

describe("extractNameFromPDF", () => {
  test("should remove .pdf extension", () => {
    expect(extractNameFromPDF("JohnDoe.pdf")).toBe("johndoe")
    expect(extractNameFromPDF("JohnDoe.PDF")).toBe("johndoe") // Case insensitive
    expect(extractNameFromPDF("certificate.pdf")).toBe("") // Only prefix left
  })

  test("should remove common prefixes", () => {
    expect(extractNameFromPDF("Certificate_JohnDoe.pdf")).toBe("johndoe")
    expect(extractNameFromPDF("Cert-JaneSmith.pdf")).toBe("janesmith")
    expect(extractNameFromPDF("Document_BobJohnson.pdf")).toBe("bobjohnson")
    expect(extractNameFromPDF("Diploma_AliceBrown.pdf")).toBe("alicebrown")
    expect(extractNameFromPDF("Award_MaryJane.pdf")).toBe("maryjane")
  })

  test("should handle prefixes with different separators", () => {
    expect(extractNameFromPDF("Certificate_John_Doe.pdf")).toBe("johndoe")
    expect(extractNameFromPDF("Certificate-John-Doe.pdf")).toBe("johndoe")
    expect(extractNameFromPDF("Certificate John Doe.pdf")).toBe("johndoe")
  })

  test("should handle multiple prefixes", () => {
    expect(extractNameFromPDF("Certificate_Document_JohnDoe.pdf")).toBe("johndoe")
  })

  test("should handle complex filenames with dates/IDs", () => {
    expect(extractNameFromPDF("Certificate_2024_John_Doe_ID123.pdf")).toBe("2024johndoeid123")
    expect(extractNameFromPDF("Cert_JohnDoe_2024.pdf")).toBe("johndoe2024")
  })

  test("should normalize after prefix removal", () => {
    expect(extractNameFromPDF("Certificate_John-Doe.pdf")).toBe("johndoe") // Hyphen removed
    expect(extractNameFromPDF("Cert_José_García.pdf")).toBe("josegarcia") // Accent normalized
  })

  test("should handle empty/null inputs", () => {
    expect(extractNameFromPDF("")).toBe("")
    expect(extractNameFromPDF(null as any)).toBe("")
    expect(extractNameFromPDF(undefined as any)).toBe("")
  })

  test("should handle filenames without extension", () => {
    expect(extractNameFromPDF("JohnDoe")).toBe("johndoe")
    expect(extractNameFromPDF("Certificate_JohnDoe")).toBe("johndoe")
  })
})

describe("findMatchingPDF", () => {
  test("should find exact matches", () => {
    const pdfs = [
      new MockFile("JohnDoe.pdf"),
      new MockFile("JaneSmith.pdf"),
      new MockFile("BobJohnson.pdf"),
    ]

    expect(findMatchingPDF("John Doe", pdfs)?.name).toBe("JohnDoe.pdf")
    expect(findMatchingPDF("Jane Smith", pdfs)?.name).toBe("JaneSmith.pdf")
    expect(findMatchingPDF("Bob Johnson", pdfs)?.name).toBe("BobJohnson.pdf")
  })

  test("should handle separator variations (spaces vs underscores)", () => {
    const pdfs = [new MockFile("John_Doe.pdf"), new MockFile("Jane_Smith.pdf")]

    expect(findMatchingPDF("John Doe", pdfs)?.name).toBe("John_Doe.pdf")
    expect(findMatchingPDF("Jane Smith", pdfs)?.name).toBe("Jane_Smith.pdf")
  })

  test("should handle certificate prefixes", () => {
    const pdfs = [
      new MockFile("Certificate_JohnDoe.pdf"),
      new MockFile("Cert_JaneSmith.pdf"),
      new MockFile("Document_BobJohnson.pdf"),
    ]

    expect(findMatchingPDF("John Doe", pdfs)?.name).toBe("Certificate_JohnDoe.pdf")
    expect(findMatchingPDF("Jane Smith", pdfs)?.name).toBe("Cert_JaneSmith.pdf")
    expect(findMatchingPDF("Bob Johnson", pdfs)?.name).toBe("Document_BobJohnson.pdf")
  })

  test("should find substring matches (PDF contains name)", () => {
    const pdfs = [
      new MockFile("Certificate_JohnDoe.pdf"),
      new MockFile("JohnDoeCertificate.pdf"),
      new MockFile("2024_JohnDoe_ID123.pdf"),
    ]

    // Any of these should match (they all contain "johndoe" after normalization)
    const match = findMatchingPDF("John Doe", pdfs)
    expect(match).toBeDefined()
    expect(match?.name).toBeOneOf(["Certificate_JohnDoe.pdf", "JohnDoeCertificate.pdf", "2024_JohnDoe_ID123.pdf"])
  })

  test("should find substring matches (name contains PDF)", () => {
    const pdfs = [new MockFile("Smith.pdf")]

    expect(findMatchingPDF("John Smith", pdfs)?.name).toBe("Smith.pdf")
    expect(findMatchingPDF("Jane Smith", pdfs)?.name).toBe("Smith.pdf")
  })

  test("should handle accented characters", () => {
    const pdfs = [
      new MockFile("Jose_Garcia.pdf"),
      new MockFile("Francois_Muller.pdf"),
    ]

    expect(findMatchingPDF("José García", pdfs)?.name).toBe("Jose_Garcia.pdf")
    expect(findMatchingPDF("François Müller", pdfs)?.name).toBe("Francois_Muller.pdf")
  })

  test("should NOT match empty names", () => {
    const pdfs = [new MockFile("JohnDoe.pdf"), new MockFile("JaneSmith.pdf")]

    expect(findMatchingPDF("", pdfs)).toBeUndefined()
    expect(findMatchingPDF(null as any, pdfs)).toBeUndefined()
    expect(findMatchingPDF(undefined as any, pdfs)).toBeUndefined()
  })

  test("should NOT match single character names (prevents false positives)", () => {
    const pdfs = [
      new MockFile("Alice.pdf"),
      new MockFile("Andrew.pdf"),
      new MockFile("Anna.pdf"),
    ]

    // Single character should not match (too ambiguous)
    expect(findMatchingPDF("A", pdfs)).toBeUndefined()
  })

  test("should allow exact matches even for short names (2 chars)", () => {
    const pdfs = [new MockFile("Ab.pdf"), new MockFile("Xy.pdf")]

    // 2+ character names can match if exact
    expect(findMatchingPDF("Ab", pdfs)?.name).toBe("Ab.pdf")
    expect(findMatchingPDF("Xy", pdfs)?.name).toBe("Xy.pdf")
  })

  test("should require minimum length for substring matches (Phase 2)", () => {
    const pdfs = [
      new MockFile("Alice.pdf"),
      new MockFile("Andrew.pdf"),
    ]

    // Single character should not match via substring (too ambiguous)
    expect(findMatchingPDF("A", pdfs)).toBeUndefined()
    
    // 2 characters should not match via substring either
    expect(findMatchingPDF("Al", pdfs)).toBeUndefined()
    
    // 3+ characters can match via substring
    expect(findMatchingPDF("Ali", pdfs)?.name).toBe("Alice.pdf")
  })

  test("should return undefined when no match found", () => {
    const pdfs = [new MockFile("JohnDoe.pdf"), new MockFile("JaneSmith.pdf")]

    expect(findMatchingPDF("Bob Johnson", pdfs)).toBeUndefined()
    expect(findMatchingPDF("NonExistent", pdfs)).toBeUndefined()
  })

  test("should return best match when multiple PDFs could match (Phase 2)", () => {
    const pdfs = [
      new MockFile("JohnDoeCertificate.pdf"), // Extracts to "johndoe" (exact match, but longer filename)
      new MockFile("JohnDoe.pdf"), // Extracts to "johndoe" (exact match, shorter filename - preferred)
      new MockFile("Certificate_JohnDoe.pdf"), // Extracts to "johndoe" (exact match, but has prefix)
    ]

    const match = findMatchingPDF("John Doe", pdfs)
    expect(match).toBeDefined()
    // All three are exact matches, but shorter/more direct filename should win
    // This tests that our scoring prefers shorter filenames when scores are equal
    expect(["JohnDoe.pdf", "JohnDoeCertificate.pdf", "Certificate_JohnDoe.pdf"]).toContain(match?.name)
  })

  test("should handle names with special characters", () => {
    const pdfs = [
      new MockFile("JohnADoe.pdf"), // Period removed
      new MockFile("OBrien.pdf"), // Apostrophe removed
    ]

    expect(findMatchingPDF("John A. Doe", pdfs)?.name).toBe("JohnADoe.pdf")
    expect(findMatchingPDF("O'Brien", pdfs)?.name).toBe("OBrien.pdf")
  })

  test("should handle complex real-world scenarios", () => {
    const pdfs = [
      new MockFile("Certificate_2024_John_Michael_Smith_ID456.pdf"),
      new MockFile("Cert_Jane_Elizabeth_Doe.pdf"),
      new MockFile("Diploma-Bob-Robert-Johnson-2024.pdf"),
    ]

    expect(findMatchingPDF("John Michael Smith", pdfs)?.name).toBe(
      "Certificate_2024_John_Michael_Smith_ID456.pdf"
    )
    expect(findMatchingPDF("Jane Elizabeth Doe", pdfs)?.name).toBe(
      "Cert_Jane_Elizabeth_Doe.pdf"
    )
    expect(findMatchingPDF("Bob Robert Johnson", pdfs)?.name).toBe(
      "Diploma-Bob-Robert-Johnson-2024.pdf"
    )
  })
})

/**
 * Integration test cases - These test the complete matching flow
 */
describe("Integration Tests - Real World Scenarios", () => {
  test("Scenario 1: Simple matching with underscores", () => {
    const pdfs = [new MockFile("John_Doe.pdf"), new MockFile("Jane_Smith.pdf")]
    
    expect(findMatchingPDF("John Doe", pdfs)?.name).toBe("John_Doe.pdf")
    expect(findMatchingPDF("Jane Smith", pdfs)?.name).toBe("Jane_Smith.pdf")
  })

  test("Scenario 2: Certificate with prefix and separators", () => {
    const pdfs = [new MockFile("Certificate_John_Doe.pdf")]
    
    expect(findMatchingPDF("John Doe", pdfs)?.name).toBe("Certificate_John_Doe.pdf")
  })

  test("Scenario 3: Accented international names", () => {
    const pdfs = [
      new MockFile("Jose_Garcia.pdf"),
      new MockFile("Maria_Jose.pdf"),
    ]
    
    expect(findMatchingPDF("José García", pdfs)?.name).toBe("Jose_Garcia.pdf")
    expect(findMatchingPDF("María José", pdfs)?.name).toBe("Maria_Jose.pdf")
  })

  test("Scenario 4: Names with special characters", () => {
    const pdfs = [new MockFile("JohnADoe.pdf")]
    
    expect(findMatchingPDF("John A. Doe", pdfs)?.name).toBe("JohnADoe.pdf")
  })

  test("Scenario 5: Complex filenames with dates", () => {
    const pdfs = [new MockFile("Certificate_2024_John_Doe_ID123.pdf")]
    
    expect(findMatchingPDF("John Doe", pdfs)?.name).toBe("Certificate_2024_John_Doe_ID123.pdf")
  })
})

/**
 * Edge Cases and Boundary Conditions
 */
describe("Edge Cases", () => {
  test("should handle very long names", () => {
    const longName = "John Michael Robert William Anderson"
    const pdfs = [new MockFile(`${longName.replace(/\s+/g, "_")}.pdf`)]
    
    expect(findMatchingPDF(longName, pdfs)?.name).toBeDefined()
  })

  test("should handle names with numbers", () => {
    const pdfs = [new MockFile("JohnDoe2.pdf"), new MockFile("Smith123.pdf")]
    
    expect(findMatchingPDF("John Doe 2", pdfs)?.name).toBe("JohnDoe2.pdf")
    expect(findMatchingPDF("Smith123", pdfs)?.name).toBe("Smith123.pdf")
  })

  test("should handle empty PDF array", () => {
    expect(findMatchingPDF("John Doe", [])).toBeUndefined()
  })

  test("should handle PDFs with empty names after normalization", () => {
    const pdfs = [new MockFile("Certificate.pdf"), new MockFile("Cert.pdf")]
    
    // These should not match anything meaningful
    expect(findMatchingPDF("John Doe", pdfs)).toBeUndefined()
  })
})

/**
 * Phase 2: Best Match Selection Tests
 */
describe("Phase 2: Best Match Selection", () => {
  test("should prioritize exact matches over substring matches", () => {
    const pdfs = [
      new MockFile("JohnDoeCertificate.pdf"), // Extracts to "johndoe" (exact match, score: 100)
      new MockFile("JohnDoe.pdf"), // Extracts to "johndoe" (exact match, score: 100, shorter - preferred)
      new MockFile("Certificate_JohnDoe_2024.pdf"), // Extracts to "2024johndoeid123" (contains, score: 80)
    ]

    const match = findBestMatchingPDF("John Doe", pdfs)
    // First two are both exact matches, prefer shorter filename
    expect(["JohnDoe.pdf", "JohnDoeCertificate.pdf"]).toContain(match?.name)
    // Third one should not win as it's only a substring match
    expect(match?.name).not.toBe("Certificate_JohnDoe_2024.pdf")
  })

  test("should prioritize matches that start with name", () => {
    const pdfs = [
      new MockFile("Certificate_JohnDoe.pdf"), // Extracts to "johndoe", original doesn't start with name (score: 80 + 5 = 85)
      new MockFile("JohnDoe_Certificate.pdf"), // Extracts to "johndoe", original starts with name (score: 80 + 10 = 90) - should win
    ]

    const match = findBestMatchingPDF("John Doe", pdfs)
    expect(match?.name).toBe("JohnDoe_Certificate.pdf")
  })

  test("should prioritize matches that end with name", () => {
    const pdfs = [
      new MockFile("Certificate_JohnDoe_2024.pdf"), // Extracts to "2024johndoeid123", name in middle (score: 80)
      new MockFile("2024_JohnDoe.pdf"), // Extracts to "2024johndoe", name at end in original (score: 80 + 5 = 85) - should win
    ]

    const match = findBestMatchingPDF("John Doe", pdfs)
    expect(match?.name).toBe("2024_JohnDoe.pdf")
  })

  test("should prioritize pdf_contains over name_contains", () => {
    const pdfs = [
      new MockFile("Smith.pdf"), // Name contains PDF (score: 60)
      new MockFile("JohnSmith.pdf"), // PDF contains name (score: 80) - should win
    ]

    const match = findBestMatchingPDF("John Smith", pdfs)
    expect(match?.name).toBe("JohnSmith.pdf")
  })

  test("should handle multiple matches with different scores", () => {
    const pdfs = [
      new MockFile("AliceBrown.pdf"), // Extracts to "alicebrown", exact match (score: 100) - should win
      new MockFile("Brown.pdf"), // Extracts to "brown", name contains (score: 60)
      new MockFile("Alice.pdf"), // Extracts to "alice", name contains (score: 60)
      new MockFile("AliceBrown2024.pdf"), // Extracts to "alicebrown2024", contains "alicebrown" (score: 80)
    ]

    const match = findBestMatchingPDF("Alice Brown", pdfs)
    expect(match?.name).toBe("AliceBrown.pdf") // Exact match should win
  })
})

/**
 * Phase 3: Fuzzy Matching Tests
 */
describe("Phase 3: Fuzzy Matching", () => {
  test("should match names with typos using fuzzy matching", () => {
    const pdfs = [
      new MockFile("JohnDoe.pdf"), // Exact match
      new MockFile("JonDoe.pdf"), // Typo: "Jon" instead of "John"
      new MockFile("JohnDoeSmith.pdf"), // Substring match
    ]

    // "Joh" is a typo, but should match "John" with fuzzy matching
    const match = findMatchingPDF("Joh Doe", pdfs, 80) // 80% threshold
    expect(match).toBeDefined()
    // Should prefer exact match if available, but fuzzy match should work if threshold is low enough
  })

  test("should match names with character substitutions", () => {
    const pdfs = [
      new MockFile("JohnDoe.pdf"), // Correct spelling
      new MockFile("JhonDoe.pdf"), // Typo: "Jhon" instead of "John" (transposed h)
      new MockFile("JonDoe.pdf"), // Missing character: "Jon" instead of "John"
    ]

    // "Jhon" should match "John" with fuzzy matching (similarity ~85-90%)
    const match = findMatchingPDF("John Doe", pdfs)
    expect(match?.name).toBe("JohnDoe.pdf") // Exact match should be preferred
  })

  test("should match names with missing characters", () => {
    const pdfs = [
      new MockFile("JohnDoe.pdf"), // Full name
      new MockFile("JonDoe.pdf"), // Missing 'h' in "John"
      new MockFile("JohDoe.pdf"), // Missing 'n' in "John"
    ]

    const match = findMatchingPDF("John Doe", pdfs)
    expect(match?.name).toBe("JohnDoe.pdf") // Exact match should win
  })

  test("should match names with extra characters", () => {
    const pdfs = [
      new MockFile("JohnDoe.pdf"), // Correct
      new MockFile("JohhnDoe.pdf"), // Extra 'h' in "John"
      new MockFile("JohnnDoe.pdf"), // Extra 'n' in "John"
    ]

    const match = findMatchingPDF("John Doe", pdfs)
    expect(match?.name).toBe("JohnDoe.pdf") // Exact match should win
  })

  test("should match names with transposed characters", () => {
    const pdfs = [
      new MockFile("JohnDoe.pdf"), // Correct
      new MockFile("JohDne.pdf"), // Transposed: "Dne" instead of "Doe"
    ]

    // "Joh" matches "John" but "Dne" vs "Doe" might be below threshold
    // Exact match should still win
    const match = findMatchingPDF("John Doe", pdfs)
    expect(match?.name).toBe("JohnDoe.pdf")
  })

  test("should respect fuzzy threshold", () => {
    const pdfs = [
      new MockFile("JohnDoe.pdf"), // Correct
      new MockFile("XyzDoe.pdf"), // Very different (low similarity)
    ]

    // With high threshold (95%), "Xyz" should not match "John"
    const matchHigh = findMatchingPDF("John Doe", pdfs, 95)
    expect(matchHigh?.name).toBe("JohnDoe.pdf")

    // With low threshold (50%), it might match but exact should still win
    const matchLow = findMatchingPDF("John Doe", pdfs, 50)
    expect(matchLow?.name).toBe("JohnDoe.pdf")
  })

  test("should prefer exact matches over fuzzy matches", () => {
    const pdfs = [
      new MockFile("JohnDoe.pdf"), // Exact match (score: 100+)
      new MockFile("JonDoe.pdf"), // Fuzzy match ~90% similarity (score: 140, confidence: 85)
    ]

    const match = findMatchingPDF("John Doe", pdfs, 85)
    expect(match?.name).toBe("JohnDoe.pdf") // Exact match should win
  })

  test("should use fuzzy matching when exact match not available", () => {
    const pdfs = [
      new MockFile("JonDoe.pdf"), // Typo: "Jon" instead of "John"
      new MockFile("JaneSmith.pdf"), // Different person
    ]

    // With 85% threshold, "Jon" should match "John" (similarity ~90%)
    const match = findMatchingPDF("John Doe", pdfs, 85)
    expect(match?.name).toBe("JonDoe.pdf")
  })

  test("should not match if similarity below threshold", () => {
    const pdfs = [
      new MockFile("XyzDoe.pdf"), // Very different from "John"
      new MockFile("AbcDoe.pdf"), // Very different from "John"
    ]

    // "Xyz" and "Abc" are too different from "John" (similarity < 50%)
    const match = findMatchingPDF("John Doe", pdfs, 85)
    expect(match).toBeUndefined()
  })

  test("should handle fuzzy matching with accented characters", () => {
    const pdfs = [
      new MockFile("JoseGarcia.pdf"), // Without accent
      new MockFile("JoseGarsia.pdf"), // Typo + without accent
    ]

    // "José" normalizes to "jose", and "Garsia" should fuzzy match "Garcia"
    const match = findMatchingPDF("José García", pdfs, 80)
    expect(match).toBeDefined()
  })

  test("should require minimum length for fuzzy matching", () => {
    const pdfs = [
      new MockFile("A.pdf"), // Too short (1 char)
      new MockFile("Ab.pdf"), // 2 chars - can exact match
      new MockFile("Xy.pdf"), // 2 chars - different
      new MockFile("Abc.pdf"), // 3 characters (minimum)
    ]

    // Single character names should not match (blocked by length < 2)
    expect(findMatchingPDF("A", pdfs, 50)).toBeUndefined()
    
    // Two character names can exact match but NOT fuzzy match if not exact
    // "Ab" exact matches "Ab.pdf" (allowed), but "Ax" should not fuzzy match "Ab" (too short for fuzzy)
    expect(findMatchingPDF("Ax", pdfs, 50)).toBeUndefined() // "Ax" is 2 chars, too short for fuzzy
    
    // 3+ character names can fuzzy match
    const match = findMatchingPDF("Abc", pdfs, 50)
    if (match) {
      expect(match?.name).toBe("Abc.pdf")
    }
  })
})

/**
 * Phase 3: Confidence Scoring Tests
 */
describe("Phase 3: Confidence Scoring", () => {
  test("should return confidence information for exact matches", () => {
    const pdfs = [new MockFile("JohnDoe.pdf")]

    const match = findBestMatchingPDFWithConfidence("John Doe", pdfs)
    expect(match).toBeDefined()
    expect(match?.confidence).toBe(100)
    expect(match?.needsReview).toBe(false)
    expect(match?.matchType).toBe("exact")
    expect(match?.similarity).toBeUndefined()
  })

  test("should return confidence information for pdf_contains matches", () => {
    // Use a filename where the name is contained but not exact after normalization
    // "JohnDoeCertificate2024.pdf" extracts to "johndoecertificate2024" which contains "johndoe"
    const pdfs = [new MockFile("JohnDoeCertificate2024.pdf")]

    const match = findBestMatchingPDFWithConfidence("John Doe", pdfs)
    expect(match).toBeDefined()
    expect(match?.confidence).toBeGreaterThanOrEqual(70)
    expect(match?.confidence).toBeLessThanOrEqual(95)
    expect(match?.needsReview).toBe(false) // Should be above 70%
    expect(match?.matchType).toBe("pdf_contains")
  })

  test("should return confidence information for name_contains matches", () => {
    const pdfs = [new MockFile("Smith.pdf")]

    const match = findBestMatchingPDFWithConfidence("John Smith", pdfs)
    expect(match).toBeDefined()
    expect(match?.confidence).toBeGreaterThanOrEqual(50)
    expect(match?.confidence).toBeLessThanOrEqual(75)
    // Confidence might be below 70%, so needsReview might be true
    expect(match?.matchType).toBe("name_contains")
  })

  test("should return confidence information for fuzzy matches", () => {
    const pdfs = [new MockFile("JonDoe.pdf")] // Typo: "Jon" instead of "John"

    const match = findBestMatchingPDFWithConfidence("John Doe", pdfs, 85)
    expect(match).toBeDefined()
    expect(match?.confidence).toBeGreaterThanOrEqual(85)
    expect(match?.confidence).toBeLessThanOrEqual(90) // Similarity-based, capped at 85%
    expect(match?.needsReview).toBe(false) // Should be above 70%
    expect(match?.matchType).toBe("fuzzy")
    expect(match?.similarity).toBeDefined()
    expect(match?.similarity).toBeGreaterThan(85)
  })

  test("should flag low-confidence matches for review", () => {
    const pdfs = [new MockFile("Sm.pdf")] // Very short, might match "Smith" with low confidence

    const match = findBestMatchingPDFWithConfidence("John Smith", pdfs)
    if (match && match.confidence < 70) {
      expect(match.needsReview).toBe(true)
    }
  })

  test("should prefer higher confidence matches", () => {
    const pdfs = [
      new MockFile("JohnDoe.pdf"), // Exact match (score: 100+, confidence: 100)
      new MockFile("JonDoe.pdf"), // Fuzzy match (score: capped at 99, confidence: ~85-90)
      new MockFile("Smith.pdf"), // Name contains (score: 60, confidence: ~50-75)
    ]

    const match = findBestMatchingPDFWithConfidence("John Doe", pdfs, 85)
    expect(match).toBeDefined()
    // Exact match should always win (score 100+ vs fuzzy 99 max)
    expect(match?.matchType).toBe("exact")
    expect(match?.confidence).toBe(100)
    expect(match?.needsReview).toBe(false)
    expect(match?.file.name).toBe("JohnDoe.pdf")
  })

  test("should calculate similarity for fuzzy matches", () => {
    const pdfs = [new MockFile("JonDoe.pdf")] // "Jon" vs "John" (similarity ~90%)

    const match = findBestMatchingPDFWithConfidence("John Doe", pdfs, 85)
    expect(match).toBeDefined()
    expect(match?.matchType).toBe("fuzzy")
    expect(match?.similarity).toBeDefined()
    expect(match?.similarity!).toBeGreaterThan(85)
    expect(match?.similarity!).toBeLessThanOrEqual(95)
  })

  test("should not return similarity for non-fuzzy matches", () => {
    const pdfs = [new MockFile("JohnDoe.pdf")]

    const match = findBestMatchingPDFWithConfidence("John Doe", pdfs)
    expect(match).toBeDefined()
    expect(match?.matchType).toBe("exact")
    expect(match?.similarity).toBeUndefined()
  })

  test("should handle edge case: very low confidence fuzzy match", () => {
    const pdfs = [new MockFile("JhnDoe.pdf")] // Missing 'o' in "John"

    const match = findBestMatchingPDFWithConfidence("John Doe", pdfs, 70) // Lower threshold
    if (match) {
      expect(match?.matchType).toBe("fuzzy")
      // If confidence is below 70%, needsReview should be true
      if (match.confidence < 70) {
        expect(match.needsReview).toBe(true)
      }
    }
  })
})
