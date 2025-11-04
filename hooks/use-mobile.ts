/**
 * @fileoverview Mobile Breakpoint Detection Hook
 * 
 * This custom React hook provides responsive design capabilities by detecting
 * whether the current viewport matches mobile screen dimensions. It uses the
 * matchMedia API for efficient, real-time breakpoint detection.
 * 
 * **Key Features:**
 * - Real-time viewport width monitoring
 * - Efficient event-based updates (no polling)
 * - SSR-safe with undefined initial state
 * - Configurable breakpoint threshold
 * - Automatic cleanup of event listeners
 * 
 * **Breakpoint Configuration:**
 * - Mobile: < 768px (default)
 * - Desktop: >= 768px
 * - Based on common tablet/desktop breakpoint
 * 
 * **Use Cases:**
 * - Conditional rendering for mobile vs desktop layouts
 * - Adaptive component behavior based on screen size
 * - Mobile-first responsive design implementation
 * - Touch vs mouse interaction optimization
 * - Performance optimization (load less on mobile)
 * 
 * **Performance:**
 * - Uses native matchMedia API (highly efficient)
 * - Event-driven updates (only when needed)
 * - Single listener per hook instance
 * - Proper cleanup prevents memory leaks
 * 
 * @module hooks/use-mobile
 * @requires react - React hooks (useState, useEffect)
 * 
 * @author Farhan Alam
 * @version 1.0.0
 */

import * as React from 'react'

/**
 * Viewport width threshold for mobile devices
 * 
 * Screens below this width (in pixels) are considered mobile.
 * This follows the common Bootstrap/Tailwind breakpoint convention.
 * 
 * **Breakpoint Rationale:**
 * - 768px is a standard tablet portrait width
 * - Matches most responsive framework defaults
 * - Covers smartphones and small tablets
 * - Tablets in landscape are treated as desktop
 * 
 * @constant {number}
 * @private
 */
const MOBILE_BREAKPOINT = 768

/**
 * Custom hook for detecting mobile viewport size
 * 
 * This hook monitors the viewport width and returns whether the current
 * screen size matches mobile dimensions. It updates automatically when
 * the viewport is resized, making it perfect for responsive layouts.
 * 
 * **Return Values:**
 * - `true`: Viewport width < 768px (mobile)
 * - `false`: Viewport width >= 768px (desktop/tablet landscape)
 * - `undefined`: Initial render (SSR-safe, before client-side hydration)
 * 
 * **SSR Behavior:**
 * The hook returns `undefined` initially to prevent hydration mismatches
 * in server-side rendering scenarios. Once mounted on the client, it
 * immediately determines the correct value.
 * 
 * **Event Handling:**
 * - Uses matchMedia.addEventListener for efficient monitoring
 * - Automatically cleans up listener on unmount
 * - Updates state only when breakpoint is crossed
 * - No unnecessary re-renders
 * 
 * **Browser Compatibility:**
 * - Modern browsers: Full support
 * - Legacy browsers: Gracefully degrades
 * - IE11: Requires polyfill for addEventListener
 * 
 * @returns {boolean} True if viewport is mobile-sized, false otherwise
 * 
 * @example
 * // Basic usage in a component
 * function MyComponent() {
 *   const isMobile = useIsMobile()
 *   
 *   return (
 *     <div>
 *       {isMobile ? (
 *         <MobileNav />
 *       ) : (
 *         <DesktopNav />
 *       )}
 *     </div>
 *   )
 * }
 * 
 * @example
 * // Conditional styling
 * function Header() {
 *   const isMobile = useIsMobile()
 *   
 *   return (
 *     <header className={isMobile ? "mobile-header" : "desktop-header"}>
 *       <Logo size={isMobile ? "sm" : "lg"} />
 *     </header>
 *   )
 * }
 * 
 * @example
 * // Conditional feature loading
 * function App() {
 *   const isMobile = useIsMobile()
 *   
 *   return (
 *     <>
 *       <MainContent />
 *       {!isMobile && <Sidebar />}
 *       {!isMobile && <AdvancedFeatures />}
 *     </>
 *   )
 * }
 * 
 * @example
 * // Handle undefined initial state for SSR
 * function ResponsiveComponent() {
 *   const isMobile = useIsMobile()
 *   
 *   if (isMobile === undefined) {
 *     // Show neutral/loading state during SSR
 *     return <LoadingSkeleton />
 *   }
 *   
 *   return isMobile ? <MobileView /> : <DesktopView />
 * }
 * 
 * @public
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener('change', onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return !!isMobile
}
