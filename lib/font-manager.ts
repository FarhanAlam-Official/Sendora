/**
 * @fileoverview Custom Font Management System
 * 
 * This module provides a comprehensive font management system for the Sendora application,
 * enabling users to upload and use custom fonts in their certificates. It handles font
 * registration, persistence, and integration with jsPDF for certificate generation.
 * 
 * **Key Features:**
 * - Custom font registration and storage
 * - LocalStorage-based persistence across sessions
 * - Support for multiple font styles (normal, bold, italic, bolditalic)
 * - Integration with jsPDF font system
 * - TTF to base64 conversion utilities
 * - Font availability checking
 * - Built-in and custom font management
 * 
 * **Font System Architecture:**
 * 1. Fonts are registered with base64-encoded data in jsPDF format
 * 2. Font registry stored in localStorage for persistence
 * 3. Fonts registered per-document when used in PDF generation
 * 4. Support for font families with multiple styles
 * 
 * **Important Notes:**
 * - jsPDF requires fonts in a specific binary format (not just base64 TTF)
 * - Use jsPDF font converter tool to convert TTF files:
 *   https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html
 * - Direct TTF upload requires conversion before use
 * - Each font style (normal, bold, italic, bolditalic) needs separate registration
 * 
 * **Workflow:**
 * 1. User uploads TTF font file
 * 2. Font is converted using jsPDF converter (external tool or API)
 * 3. Converted font data is registered with this manager
 * 4. Font becomes available for certificate generation
 * 5. Font persists across sessions via localStorage
 * 
 * @module lib/font-manager
 * @requires jspdf - PDF generation library with font support
 * 
 * @see {@link https://github.com/parallax/jsPDF jsPDF Documentation}
 * @see {@link https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html Font Converter Tool}
 * 
 * @author Farhan Alam
 * @version 1.5.0
 */

import { jsPDF } from "jspdf"

/**
 * Custom font data structure for font registration
 * 
 * Represents a complete font family with support for multiple styles.
 * Each style (normal, bold, italic, bolditalic) can be registered independently.
 * 
 * **Font Data Format:**
 * - Data must be in jsPDF-compatible format (from font converter)
 * - Base64 encoding expected
 * - Not raw TTF base64 (requires conversion first)
 * 
 * @interface CustomFont
 * @property {string} name - Font family name (e.g., "Montserrat", "Roboto")
 * @property {string} normal - Base64 encoded font data for normal weight/style (required)
 * @property {string} [bold] - Base64 encoded font data for bold weight (optional)
 * @property {string} [italic] - Base64 encoded font data for italic style (optional)
 * @property {string} [bolditalic] - Base64 encoded font data for bold+italic style (optional)
 * @property {string} [originalFileName] - Original TTF filename for reference (optional)
 */
export interface CustomFont {
  name: string
  normal: string // base64 encoded font data for normal style (jsPDF format)
  bold?: string // base64 encoded font data for bold style
  italic?: string // base64 encoded font data for italic style
  bolditalic?: string // base64 encoded font data for bolditalic style
  originalFileName?: string // Original TTF file name if uploaded
}

/**
 * LocalStorage key for persisting custom fonts across sessions
 * 
 * All custom fonts are stored under this key as a JSON string.
 * @constant {string}
 * @private
 */
const STORAGE_KEY = "sendora_custom_fonts"

/**
 * Loads registered fonts from browser localStorage
 * 
 * This function retrieves previously registered custom fonts from localStorage,
 * enabling font persistence across browser sessions. It includes error handling
 * for corrupted data or storage access issues.
 * 
 * **Storage Structure:**
 * - Fonts stored as JSON object: { fontName: CustomFont }
 * - Keys are lowercase font names
 * - Values are complete CustomFont objects
 * 
 * **Error Handling:**
 * - Returns empty Map if localStorage unavailable (SSR)
 * - Returns empty Map if storage data is corrupted
 * - Logs errors to console for debugging
 * 
 * @returns {Map<string, CustomFont>} Map of registered fonts (key: lowercase font name)
 * 
 * @example
 * const fonts = loadFontsFromStorage()
 * console.log(`Loaded ${fonts.size} custom fonts`)
 * 
 * @private
 */
function loadFontsFromStorage(): Map<string, CustomFont> {
  if (typeof window === "undefined") return new Map()
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const fonts = JSON.parse(stored) as Record<string, CustomFont>
      return new Map(Object.entries(fonts))
    }
  } catch (error) {
    console.error("Failed to load fonts from storage:", error)
  }
  return new Map()
}

/**
 * Persists font registry to browser localStorage
 * 
 * This function saves the current font registry to localStorage, ensuring
 * custom fonts remain available across browser sessions and page reloads.
 * 
 * **Persistence Strategy:**
 * - Convert Map to plain object for JSON serialization
 * - Store under STORAGE_KEY
 * - Graceful failure (doesn't throw errors)
 * 
 * **Storage Limitations:**
 * - localStorage typically has 5-10MB limit per domain
 * - Large font files may exceed this limit
 * - Consider limiting number of custom fonts
 * 
 * @param {Map<string, CustomFont>} fonts - Font registry to persist
 * @returns {void}
 * 
 * @example
 * fontRegistry.set("roboto", robotoFont)
 * saveFontsToStorage(fontRegistry)
 * 
 * @private
 */
function saveFontsToStorage(fonts: Map<string, CustomFont>): void {
  if (typeof window === "undefined") return
  
  try {
    const obj = Object.fromEntries(fonts)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj))
  } catch (error) {
    console.error("Failed to save fonts to storage:", error)
  }
}

/**
 * In-memory font registry
 * 
 * Stores all registered custom fonts for quick access during PDF generation.
 * Initialized from localStorage on module load.
 * 
 * @type {Map<string, CustomFont>}
 * @private
 */
const fontRegistry = loadFontsFromStorage()

/**
 * Registers a custom font for use in certificate generation
 * 
 * This function adds a new custom font to the registry and persists it to localStorage.
 * Once registered, the font becomes available for use in all certificate templates.
 * 
 * **Registration Process:**
 * 1. Add font to in-memory registry
 * 2. Persist to localStorage for future sessions
 * 3. Font becomes immediately available for PDF generation
 * 
 * **Font Data Requirements:**
 * - Must be in jsPDF format (use font converter tool)
 * - Base64 encoded string
 * - At minimum, 'normal' style is required
 * - Additional styles (bold, italic, bolditalic) are optional
 * 
 * **Usage Notes:**
 * - Font names are case-insensitive (stored as lowercase)
 * - Duplicate names overwrite existing fonts
 * - Font data persists until explicitly removed or localStorage cleared
 * 
 * @param {CustomFont} font - The font data to register
 * @returns {void}
 * 
 * @example
 * // Register a font with normal style only
 * registerCustomFont({
 *   name: "Montserrat",
 *   normal: "base64EncodedFontData...",
 *   originalFileName: "Montserrat-Regular.ttf"
 * })
 * 
 * @example
 * // Register a font with multiple styles
 * registerCustomFont({
 *   name: "Roboto",
 *   normal: "base64Normal...",
 *   bold: "base64Bold...",
 *   italic: "base64Italic...",
 *   bolditalic: "base64BoldItalic..."
 * })
 * 
 * @see {@link https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html Font Converter Tool}
 * @public
 */
export function registerCustomFont(font: CustomFont): void {
  fontRegistry.set(font.name.toLowerCase(), font)
  saveFontsToStorage(fontRegistry)
}

/**
 * Retrieves a list of all registered custom font names
 * 
 * Returns an array of font family names that have been registered and are
 * available for use in certificate generation.
 * 
 * **Return Format:**
 * - Array of lowercase font names
 * - Names are as registered (e.g., "montserrat", "roboto")
 * - Empty array if no custom fonts registered
 * 
 * @returns {string[]} Array of registered custom font names
 * 
 * @example
 * const fonts = getRegisteredFonts()
 * console.log("Available fonts:", fonts)
 * // => ["montserrat", "roboto", "opensans"]
 * 
 * @example
 * // Use in a dropdown/select
 * const fontOptions = getRegisteredFonts().map(font => ({
 *   label: font.charAt(0).toUpperCase() + font.slice(1),
 *   value: font
 * }))
 * 
 * @public
 */
export function getRegisteredFonts(): string[] {
  return Array.from(fontRegistry.keys())
}

/**
 * Checks if a specific font is registered and available
 * 
 * This function verifies whether a font has been registered in the font manager
 * before attempting to use it in PDF generation. Useful for validation and
 * conditional font application.
 * 
 * **Case Insensitivity:**
 * - Font name lookup is case-insensitive
 * - "Montserrat", "montserrat", "MONTSERRAT" all match the same font
 * 
 * @param {string} fontName - The font family name to check
 * @returns {boolean} True if font is registered, false otherwise
 * 
 * @example
 * if (isFontRegistered("Montserrat")) {
 *   // Use Montserrat
 *   setFont("Montserrat", "normal")
 * } else {
 *   // Fallback to default
 *   setFont("helvetica", "normal")
 * }
 * 
 * @example
 * // Validation before registration
 * if (!isFontRegistered("CustomFont")) {
 *   registerCustomFont(customFontData)
 * }
 * 
 * @public
 */
export function isFontRegistered(fontName: string): boolean {
  return fontRegistry.has(fontName.toLowerCase())
}

/**
 * Registers a custom font with a specific jsPDF document instance
 * 
 * This function adds a registered custom font to a jsPDF document, making it
 * available for text rendering in that document. It must be called before
 * using the font with doc.setFont().
 * 
 * **Document-Level Registration:**
 * - Each jsPDF document requires separate font registration
 * - Fonts must be registered before use (typically at document creation)
 * - Multiple styles (normal, bold, italic, bolditalic) registered separately
 * - Duplicate registration is safely handled (no-op if already registered)
 * 
 * **Registration Process:**
 * 1. Check if font exists in registry
 * 2. Check if already registered in document (avoid duplicates)
 * 3. Register available styles (normal, bold, italic, bolditalic)
 * 4. Font becomes usable with doc.setFont(fontName, style)
 * 
 * **Error Handling:**
 * - Returns false if font not found in registry
 * - Returns true if already registered (safe duplicate call)
 * - Logs errors to console if registration fails
 * - Graceful failure (doesn't throw exceptions)
 * 
 * @param {jsPDF} doc - The jsPDF document instance to register the font with
 * @param {string} fontName - The font family name to register (case-insensitive)
 * @returns {boolean} True if font successfully registered or already registered, false if font not found
 * 
 * @example
 * // Register font before use
 * const doc = new jsPDF()
 * if (registerFontWithDocument(doc, "Montserrat")) {
 *   doc.setFont("Montserrat", "bold")
 *   doc.text("Hello World", 10, 10)
 * } else {
 *   // Font not available, use fallback
 *   doc.setFont("helvetica", "bold")
 *   doc.text("Hello World", 10, 10)
 * }
 * 
 * @example
 * // Register multiple fonts
 * const doc = new jsPDF()
 * registerFontWithDocument(doc, "Montserrat")
 * registerFontWithDocument(doc, "Roboto")
 * registerFontWithDocument(doc, "OpenSans")
 * 
 * @see {@link registerCustomFont} to register fonts in the manager
 * @see {@link isFontRegistered} to check font availability
 * @public
 */
export function registerFontWithDocument(doc: jsPDF, fontName: string): boolean {
  const fontKey = fontName.toLowerCase()
  const font = fontRegistry.get(fontKey)
  
  if (!font) {
    return false
  }

  try {
    // Check if font is already registered in this document
    const fontList = (doc as any).getFontList() || {}
    if (fontList[font.name]) {
      return true // Already registered
    }

    // Register normal style
    if (font.normal) {
      // jsPDF's addFont expects the font data in a specific format
      // The font.normal should be the base64 string from jsPDF font converter
      doc.addFont(font.normal, font.name, "normal")
    }
    
    // Register bold style if available
    if (font.bold) {
      doc.addFont(font.bold, font.name, "bold")
    }
    
    // Register italic style if available
    if (font.italic) {
      doc.addFont(font.italic, font.name, "italic")
    }
    
    // Register bolditalic style if available
    if (font.bolditalic) {
      doc.addFont(font.bolditalic, font.name, "bolditalic")
    }
    
    return true
  } catch (error) {
    console.error(`Failed to register font ${fontName} with document:`, error)
    return false
  }
}

/**
 * Converts a TTF font file to base64 string
 * 
 * This utility function reads a TTF font file and converts it to a base64 string.
 * However, note that this base64 representation is NOT directly usable by jsPDF.
 * TTF files must be converted to jsPDF format using the jsPDF font converter tool.
 * 
 * **Important Limitations:**
 * - Output is base64 TTF, NOT jsPDF format
 * - Cannot be directly used with jsPDF's addFont() method
 * - Requires additional conversion via jsPDF font converter
 * - This function is primarily for storage/transmission purposes
 * 
 * **Proper Workflow:**
 * 1. User uploads TTF file
 * 2. Convert to base64 (this function)
 * 3. Send to jsPDF font converter (external tool or API)
 * 4. Receive jsPDF format back
 * 5. Register with registerCustomFont()
 * 
 * @param {File} file - The TTF font file to convert
 * @returns {Promise<string>} Base64 encoded font data (without data URL prefix)
 * 
 * @example
 * // Convert TTF file to base64
 * const base64 = await ttfToBase64(fontFile)
 * console.log("Font size:", base64.length)
 * // Note: This still needs jsPDF conversion before use!
 * 
 * @example
 * // File input handler
 * async function handleFontUpload(event) {
 *   const file = event.target.files[0]
 *   if (file && file.name.endsWith('.ttf')) {
 *     const base64 = await ttfToBase64(file)
 *     // Send to conversion service...
 *   }
 * }
 * 
 * @throws {Error} If file reading fails
 * @see {@link https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html jsPDF Font Converter}
 * @public
 */
export async function ttfToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data URL prefix if present
      const base64 = result.includes(",") ? result.split(",")[1] : result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Loads a font from a jsPDF format file and registers it
 * 
 * This function processes JavaScript font files generated by the jsPDF font converter
 * tool. It extracts the font name and base64 data, then automatically registers the
 * font for immediate use.
 * 
 * **Expected File Format:**
 * - JavaScript file from jsPDF font converter
 * - Contains font name and base64 encoded font data
 * - Typical structure: `jsPDF.API.events.push(['addFonts', function() { ... }])`
 * - Or: Simple variable assignment with font data
 * 
 * **Extraction Strategy:**
 * 1. Try to extract font name from file content (fontName property)
 * 2. Fall back to variable name extraction
 * 3. Fall back to filename without extension
 * 4. Search for base64 font data using multiple patterns
 * 5. Select longest matching base64 string (likely the font data)
 * 
 * **Pattern Matching:**
 * - Looks for fontData, normal, or long base64 strings
 * - Validates base64 length (minimum 100 characters)
 * - Handles various code formatting styles
 * 
 * @param {File} file - JavaScript font file from jsPDF converter
 * @param {string} [fontName] - Optional explicit font name (overrides auto-detection)
 * @returns {Promise<string>} The registered font name
 * 
 * @example
 * // Load font from converter output file
 * const fontName = await loadFontFromJsPDFFile(fontFile)
 * console.log(`Registered font: ${fontName}`)
 * // Font is now ready to use in certificates
 * 
 * @example
 * // Load with explicit name
 * const fontName = await loadFontFromJsPDFFile(fontFile, "MyCustomFont")
 * registerFontWithDocument(doc, fontName)
 * 
 * @example
 * // File input handler with validation
 * async function handleJsPDFFontUpload(event) {
 *   const file = event.target.files[0]
 *   try {
 *     const fontName = await loadFontFromJsPDFFile(file)
 *     alert(`Font "${fontName}" loaded successfully!`)
 *   } catch (error) {
 *     alert(`Failed to load font: ${error.message}`)
 *   }
 * }
 * 
 * @throws {Error} If font data cannot be extracted from file
 * @see {@link https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html jsPDF Font Converter}
 * @see {@link registerCustomFont} for manual font registration
 * @public
 */
export async function loadFontFromJsPDFFile(file: File, fontName?: string): Promise<string> {
  const text = await file.text()
  
  // Extract font name from the file if not provided
  let extractedFontName = fontName
  const fontNameMatch = text.match(/fontName['"]?\s*[:=]\s*['"]([^'"]+)['"]/)
  if (fontNameMatch && !extractedFontName) {
    extractedFontName = fontNameMatch[1]
  }
  
  if (!extractedFontName) {
    // Try to extract from variable name
    const varMatch = text.match(/(?:var|const|let)\s+(\w+)\s*=/)
    if (varMatch) {
      extractedFontName = varMatch[1].replace(/Font|font/, "").toLowerCase()
    } else {
      extractedFontName = file.name.replace(/\.[^.]*$/, "").toLowerCase()
    }
  }
  
  // Extract base64 font data
  // jsPDF font files have format like: 'base64string' or "base64string"
  const patterns = [
    /fontData\s*=\s*['"]([^'"]+)['"]/, // fontData = "base64"
    /normal\s*:\s*['"]([^'"]+)['"]/, // normal: "base64"
    /['"]([A-Za-z0-9+/=]{100,})['"]/, // Any long base64 string
  ]
  
  let base64Data = ""
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1] && match[1].length > 100) {
      base64Data = match[1]
      break
    }
  }
  
  if (!base64Data) {
    // Last resort: try to find the longest base64-like string
    const base64Regex = /([A-Za-z0-9+/]{100,}={0,2})/g
    const matches = text.match(base64Regex)
    if (matches && matches.length > 0) {
      // Get the longest match (likely the font data)
      base64Data = matches.reduce((a, b) => a.length > b.length ? a : b)
    }
  }
  
  if (!base64Data) {
    throw new Error("Could not extract font data from file. Please ensure it's a valid jsPDF font file.")
  }
  
  registerCustomFont({
    name: extractedFontName,
    normal: base64Data,
    originalFileName: file.name,
  })
  
  return extractedFontName
}

/**
 * Removes a custom font from the registry
 * 
 * This function permanently removes a custom font from both the in-memory registry
 * and localStorage. Once removed, the font will no longer be available for use
 * until re-registered.
 * 
 * **Removal Scope:**
 * - Removes from in-memory registry (immediate effect)
 * - Removes from localStorage (permanent deletion)
 * - Font name lookup is case-insensitive
 * 
 * **Use Cases:**
 * - User wants to delete unused fonts
 * - Clearing space in localStorage
 * - Removing outdated font versions
 * - Application cleanup/reset
 * 
 * **Safety Notes:**
 * - Does not affect already generated PDFs
 * - Only prevents future use of the font
 * - Silently succeeds even if font not found
 * - Can be re-registered if needed later
 * 
 * @param {string} fontName - The font family name to remove (case-insensitive)
 * @returns {void}
 * 
 * @example
 * // Remove a single font
 * removeCustomFont("Montserrat")
 * console.log("Montserrat removed")
 * 
 * @example
 * // Remove all custom fonts
 * const fonts = getRegisteredFonts()
 * fonts.forEach(font => removeCustomFont(font))
 * console.log("All custom fonts removed")
 * 
 * @example
 * // User action handler
 * function handleDeleteFont(fontName) {
 *   if (confirm(`Remove "${fontName}" font?`)) {
 *     removeCustomFont(fontName)
 *     refreshFontList()
 *   }
 * }
 * 
 * @see {@link getRegisteredFonts} to list all fonts
 * @see {@link registerCustomFont} to re-register a font
 * @public
 */
export function removeCustomFont(fontName: string): void {
  fontRegistry.delete(fontName.toLowerCase())
  saveFontsToStorage(fontRegistry)
}

/**
 * Retrieves all available fonts (built-in + custom) for UI display
 * 
 * This function provides a complete list of fonts available for certificate generation,
 * combining jsPDF's built-in fonts with registered custom fonts. The return format is
 * optimized for use in dropdown menus, select components, and font pickers.
 * 
 * **Built-in Fonts:**
 * - Helvetica: Clean sans-serif, widely supported
 * - Times: Classic serif font
 * - Courier: Monospace font
 * 
 * **Return Format:**
 * - Array of font objects with value, label, and isCustom flag
 * - Built-in fonts listed first for consistency
 * - Custom fonts follow in registry order
 * - Labels are title-cased for UI display
 * 
 * **UI Integration:**
 * Perfect for dropdown menus, allowing users to distinguish between
 * built-in fonts (always available) and custom fonts (user-uploaded).
 * 
 * @returns {Array<{value: string; label: string; isCustom: boolean}>} Complete font list
 * 
 * @example
 * // Use in a select component
 * const fonts = getAvailableFonts()
 * 
 * <select>
 *   {fonts.map(font => (
 *     <option key={font.value} value={font.value}>
 *       {font.label} {font.isCustom && "(Custom)"}
 *     </option>
 *   ))}
 * </select>
 * 
 * @example
 * // Filter only custom fonts
 * const customFonts = getAvailableFonts().filter(f => f.isCustom)
 * console.log(`${customFonts.length} custom fonts available`)
 * 
 * @example
 * // React component integration
 * function FontSelector({ value, onChange }) {
 *   const fonts = getAvailableFonts()
 *   return (
 *     <Select value={value} onValueChange={onChange}>
 *       <SelectTrigger>
 *         <SelectValue placeholder="Select font" />
 *       </SelectTrigger>
 *       <SelectContent>
 *         {fonts.map(font => (
 *           <SelectItem key={font.value} value={font.value}>
 *             {font.label}
 *           </SelectItem>
 *         ))}
 *       </SelectContent>
 *     </Select>
 *   )
 * }
 * 
 * @public
 */
export function getAvailableFonts(): Array<{ value: string; label: string; isCustom: boolean }> {
  const builtInFonts = [
    { value: "helvetica", label: "Helvetica", isCustom: false },
    { value: "times", label: "Times", isCustom: false },
    { value: "courier", label: "Courier", isCustom: false },
  ]
  
  const customFonts = Array.from(fontRegistry.keys()).map((name) => ({
    value: name,
    label: name.charAt(0).toUpperCase() + name.slice(1),
    isCustom: true,
  }))
  
  return [...builtInFonts, ...customFonts]
}

/**
 * Loads a font from a remote URL and registers it
 * 
 * This function fetches a font file from a URL and registers it for use in the
 * application. The font must already be in jsPDF format (not raw TTF).
 * 
 * **Use Cases:**
 * - Loading fonts from CDN
 * - Loading fonts from API endpoints
 * - Pre-loading common fonts for users
 * - Sharing fonts across team/organization
 * 
 * **Requirements:**
 * - Font must be in jsPDF format (use converter first)
 * - URL must be accessible (no CORS issues)
 * - Font data must be text format
 * 
 * **Error Handling:**
 * - Throws on network failures
 * - Throws on invalid font data
 * - Errors logged to console
 * 
 * @param {string} url - URL to the jsPDF format font file
 * @param {string} fontName - Font family name to register it as
 * @returns {Promise<void>}
 * 
 * @example
 * // Load font from CDN
 * try {
 *   await loadFontFromUrl(
 *     "https://cdn.example.com/fonts/montserrat-jspdf.js",
 *     "Montserrat"
 *   )
 *   console.log("Montserrat font loaded successfully")
 * } catch (error) {
 *   console.error("Failed to load font:", error)
 * }
 * 
 * @example
 * // Load multiple fonts
 * const fontUrls = {
 *   "Montserrat": "https://cdn.example.com/fonts/montserrat.js",
 *   "Roboto": "https://cdn.example.com/fonts/roboto.js"
 * }
 * 
 * for (const [name, url] of Object.entries(fontUrls)) {
 *   await loadFontFromUrl(url, name)
 * }
 * 
 * @throws {Error} If fetch fails or font data is invalid
 * @see {@link registerCustomFont} for manual registration
 * @see {@link loadFontFromJsPDFFile} for file-based loading
 * @public
 */
export async function loadFontFromUrl(url: string, fontName: string): Promise<void> {
  try {
    const response = await fetch(url)
    const fontData = await response.text()
    
    // Parse font data (assuming it's in jsPDF format)
    // This is a simplified version - actual implementation may vary based on font format
    registerCustomFont({
      name: fontName,
      normal: fontData,
    })
  } catch (error) {
    console.error(`Failed to load font from URL ${url}:`, error)
    throw error
  }
}

