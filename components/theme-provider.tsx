/**
 * @fileoverview Theme Provider Component
 * 
 * This component wraps the application with theme management capabilities using
 * next-themes. It enables dark/light mode switching and provides theme context
 * to all child components.
 * 
 * **Key Features:**
 * - Seamless theme switching (light/dark/system)
 * - Persistent theme preference (localStorage)
 * - System theme detection and synchronization
 * - No flash of unstyled content (FOUC)
 * - SSR-safe theme initialization
 * 
 * **Theme Options:**
 * - Light: Light color scheme
 * - Dark: Dark color scheme
 * - System: Follows OS preference
 * 
 * **Implementation:**
 * Wraps next-themes ThemeProvider for centralized theme management.
 * Should be placed high in the component tree (typically in root layout).
 * 
 * **Configuration:**
 * Theme configuration is passed via props from the root layout, typically:
 * - attribute: "class" or "data-theme"
 * - defaultTheme: "system" | "light" | "dark"
 * - enableSystem: boolean
 * 
 * **Storage:**
 * Theme preference is automatically persisted to localStorage and restored
 * on subsequent visits.
 * 
 * @module components/theme-provider
 * @requires next-themes - Theme management library
 * @requires react - React library
 * 
 * @author Farhan Alam
 * @version 1.0.0
 */

'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

/**
 * Theme Provider Component
 * 
 * Wraps the application with theme context provider from next-themes.
 * Enables theme switching and preference persistence.
 * 
 * **Usage:**
 * Place this component in your root layout to enable theme functionality
 * throughout the application.
 * 
 * **Props:**
 * Accepts all props from next-themes ThemeProviderProps:
 * - attribute: HTML attribute for theme (e.g., "class", "data-theme")
 * - defaultTheme: Default theme to use ("system" | "light" | "dark")
 * - enableSystem: Enable system theme detection
 * - storageKey: localStorage key for theme persistence
 * - themes: Array of available theme names
 * - forcedTheme: Force a specific theme (overrides user preference)
 * - ...and more
 * 
 * @component
 * @param {ThemeProviderProps} props - Theme provider configuration
 * @param {React.ReactNode} props.children - Child components to wrap
 * @returns {JSX.Element} Theme provider wrapper
 * 
 * @example
 * // Usage in root layout
 * export default function RootLayout({ children }) {
 *   return (
 *     <html suppressHydrationWarning>
 *       <body>
 *         <ThemeProvider
 *           attribute="class"
 *           defaultTheme="system"
 *           enableSystem
 *           disableTransitionOnChange
 *         >
 *           {children}
 *         </ThemeProvider>
 *       </body>
 *     </html>
 *   )
 * }
 * 
 * @example
 * // Access theme in components
 * import { useTheme } from 'next-themes'
 * 
 * function ThemeSwitcher() {
 *   const { theme, setTheme } = useTheme()
 *   
 *   return (
 *     <select value={theme} onChange={(e) => setTheme(e.target.value)}>
 *       <option value="light">Light</option>
 *       <option value="dark">Dark</option>
 *       <option value="system">System</option>
 *     </select>
 *   )
 * }
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
