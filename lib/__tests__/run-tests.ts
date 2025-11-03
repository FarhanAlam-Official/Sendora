/**
 * Standalone test runner for PDF name matching utilities
 * Run with: npx tsx lib/__tests__/run-tests.ts
 * Or: node --loader ts-node/esm lib/__tests__/run-tests.ts
 */

import {
  normalizeNameForMatching,
  extractNameFromPDF,
  findMatchingPDF,
} from "../pdf-utils"

// Mock File constructor for testing
class MockFile extends File {
  constructor(name: string) {
    super([], name, { type: "application/pdf" })
  }
}

// Test runner
let testsPassed = 0
let testsFailed = 0
const failedTests: string[] = []

function test(name: string, fn: () => void) {
  try {
    fn()
    testsPassed++
    console.log(`✅ ${name}`)
  } catch (error: any) {
    testsFailed++
    failedTests.push(`${name}: ${error.message}`)
    console.log(`❌ ${name}`)
    console.log(`   Error: ${error.message}`)
  }
}

function expect(actual: any) {
  return {
    toBe: (expected: any) => {
      if (actual !== expected) {
        throw new Error(`Expected "${actual}" to be "${expected}"`)
      }
    },
    toBeDefined: () => {
      if (actual === undefined || actual === null) {
        throw new Error(`Expected value to be defined, got ${actual}`)
      }
    },
    toBeUndefined: () => {
      if (actual !== undefined) {
        throw new Error(`Expected value to be undefined, got "${actual}"`)
      }
    },
  }
}

console.log("🧪 Running PDF Name Matching Tests...\n")

// ==================== normalizeNameForMatching Tests ====================
console.log("📋 Testing normalizeNameForMatching...")

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

// ==================== extractNameFromPDF Tests ====================
console.log("\n📋 Testing extractNameFromPDF...")

test("should remove .pdf extension", () => {
  expect(extractNameFromPDF("JohnDoe.pdf")).toBe("johndoe")
  expect(extractNameFromPDF("JohnDoe.PDF")).toBe("johndoe") // Case insensitive
})

test("should remove common prefixes", () => {
  expect(extractNameFromPDF("Certificate_JohnDoe.pdf")).toBe("johndoe")
  expect(extractNameFromPDF("Cert-JaneSmith.pdf")).toBe("janesmith")
  expect(extractNameFromPDF("Document_BobJohnson.pdf")).toBe("bobjohnson")
  expect(extractNameFromPDF("Diploma_AliceBrown.pdf")).toBe("alicebrown")
})

test("should handle prefixes with different separators", () => {
  expect(extractNameFromPDF("Certificate_John_Doe.pdf")).toBe("johndoe")
  expect(extractNameFromPDF("Certificate-John-Doe.pdf")).toBe("johndoe")
  expect(extractNameFromPDF("Certificate John Doe.pdf")).toBe("johndoe")
})

test("should handle complex filenames with dates/IDs", () => {
  const result = extractNameFromPDF("Certificate_2024_John_Doe_ID123.pdf")
  expect(result).toBe("2024johndoeid123")
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

// ==================== findMatchingPDF Tests ====================
console.log("\n📋 Testing findMatchingPDF...")

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

test("should handle separator variations (CRITICAL FIX)", () => {
  const pdfs = [
    new MockFile("John_Doe.pdf"),
    new MockFile("Jane_Smith.pdf"),
  ]

  expect(findMatchingPDF("John Doe", pdfs)?.name).toBe("John_Doe.pdf")
  expect(findMatchingPDF("Jane Smith", pdfs)?.name).toBe("Jane_Smith.pdf")
})

test("should handle certificate prefixes", () => {
  const pdfs = [
    new MockFile("Certificate_JohnDoe.pdf"),
    new MockFile("Cert_JaneSmith.pdf"),
  ]

  expect(findMatchingPDF("John Doe", pdfs)?.name).toBe("Certificate_JohnDoe.pdf")
  expect(findMatchingPDF("Jane Smith", pdfs)?.name).toBe("Cert_JaneSmith.pdf")
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
  const pdfs = [new MockFile("JohnDoe.pdf")]

  expect(findMatchingPDF("", pdfs)).toBeUndefined()
  expect(findMatchingPDF(null as any, pdfs)).toBeUndefined()
  expect(findMatchingPDF(undefined as any, pdfs)).toBeUndefined()
})

test("should NOT match single character names", () => {
  const pdfs = [
    new MockFile("Alice.pdf"),
    new MockFile("Andrew.pdf"),
  ]

  expect(findMatchingPDF("A", pdfs)).toBeUndefined()
})

test("should allow exact matches even for short names (2 chars)", () => {
  const pdfs = [new MockFile("Ab.pdf")]

  expect(findMatchingPDF("Ab", pdfs)?.name).toBe("Ab.pdf")
})

test("should return undefined when no match found", () => {
  const pdfs = [new MockFile("JohnDoe.pdf")]

  expect(findMatchingPDF("Bob Johnson", pdfs)).toBeUndefined()
})

test("should handle names with special characters", () => {
  const pdfs = [
    new MockFile("JohnADoe.pdf"),
    new MockFile("OBrien.pdf"),
  ]

  expect(findMatchingPDF("John A. Doe", pdfs)?.name).toBe("JohnADoe.pdf")
  expect(findMatchingPDF("O'Brien", pdfs)?.name).toBe("OBrien.pdf")
})

// ==================== Integration Tests ====================
console.log("\n📋 Testing Real-World Scenarios...")

test("Real-world: Separator variations work", () => {
  const pdfs = [new MockFile("John_Doe.pdf"), new MockFile("Jane_Smith.pdf")]

  expect(findMatchingPDF("John Doe", pdfs)?.name).toBe("John_Doe.pdf")
  expect(findMatchingPDF("Jane Smith", pdfs)?.name).toBe("Jane_Smith.pdf")
})

test("Real-world: Certificate with prefix and separators", () => {
  const pdfs = [new MockFile("Certificate_John_Doe.pdf")]

  expect(findMatchingPDF("John Doe", pdfs)?.name).toBe("Certificate_John_Doe.pdf")
})

test("Real-world: Accented international names", () => {
  const pdfs = [new MockFile("Jose_Garcia.pdf")]

  expect(findMatchingPDF("José García", pdfs)?.name).toBe("Jose_Garcia.pdf")
})

test("Real-world: Complex filenames with dates", () => {
  const pdfs = [new MockFile("Certificate_2024_John_Doe_ID123.pdf")]

  expect(findMatchingPDF("John Doe", pdfs)?.name).toBe("Certificate_2024_John_Doe_ID123.pdf")
})

// ==================== Summary ====================
console.log("\n" + "=".repeat(50))
console.log("📊 Test Results")
console.log("=".repeat(50))
console.log(`✅ Passed: ${testsPassed}`)
console.log(`❌ Failed: ${testsFailed}`)
console.log(`📈 Total: ${testsPassed + testsFailed}`)

if (failedTests.length > 0) {
  console.log("\n❌ Failed Tests:")
  failedTests.forEach((test) => console.log(`   - ${test}`))
}

if (testsFailed === 0) {
  console.log("\n🎉 All tests passed! The name matching fixes are working correctly.")
} else {
  console.log("\n⚠️  Some tests failed. Please review the errors above.")
  process.exit(1)
}

