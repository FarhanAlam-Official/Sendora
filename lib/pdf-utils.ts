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
 * Extract name from PDF filename for matching
 */
export function extractNameFromPDF(fileName: string): string {
  // Remove .pdf extension
  let name = fileName.replace(/\.pdf$/i, "")
  // Remove common prefixes/suffixes
  name = name.replace(/certificate|cert|document|doc/i, "").trim()
  return name.toLowerCase()
}

/**
 * Match a recipient name with available PDF files
 */
export function findMatchingPDF(recipientName: string, pdfFiles: File[]): File | undefined {
  const normalizedName = recipientName.toLowerCase().trim()

  for (const pdfFile of pdfFiles) {
    const pdfName = extractNameFromPDF(pdfFile.name)

    // Check if names match (exact or partial)
    if (normalizedName === pdfName || pdfName.includes(normalizedName) || normalizedName.includes(pdfName)) {
      return pdfFile
    }
  }

  return undefined
}
