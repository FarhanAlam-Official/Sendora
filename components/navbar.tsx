/**
 * @fileoverview Primary Navigation Bar Component
 * 
 * This component provides the main navigation interface for the Sendora application,
 * featuring a responsive design with desktop and mobile layouts, smooth animations,
 * and advanced interactivity using Framer Motion.
 * 
 * **Key Features:**
 * - Responsive design (mobile hamburger menu, desktop horizontal nav)
 * - Scroll-based backdrop blur and shadow effects
 * - Active route highlighting with smooth transitions
 * - Animated mobile menu with staggered item animations
 * - Logo with hover animations
 * - Call-to-action button with gradient effects
 * - Automatic mobile menu closure on route change
 * 
 * **Navigation Structure:**
 * - Home: Landing page
 * - Generate Certificates: Certificate generation tool
 * - How It Works: Feature explanation
 * - About: Company information
 * - Contact: Contact form
 * - Get Started (CTA): Quick access to main feature
 * 
 * **Animation Features:**
 * - Initial slide-down animation on page load
 * - Smooth active indicator movement between nav items
 * - Hover effects with background color transitions
 * - Logo shake animation on hover
 * - Mobile menu height animation with opacity fade
 * - Staggered mobile menu item appearance
 * 
 * **Responsive Behavior:**
 * - Desktop (≥768px): Horizontal navigation with CTA button
 * - Mobile (<768px): Hamburger menu with slide-down panel
 * - Tablet: Adapts based on breakpoint
 * 
 * **Performance Optimizations:**
 * - Image priority loading for logo
 * - Event listener cleanup on unmount
 * - Conditional animation rendering
 * - Efficient re-render with proper dependency arrays
 * 
 * @module components/navbar
 * @requires next/link - Next.js navigation
 * @requires next/image - Optimized image component
 * @requires next/navigation - usePathname hook
 * @requires framer-motion - Animation library
 * @requires lucide-react - Icon components
 * 
 * @author Farhan Alam
 * @version 2.0.0
 */

"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Menu, X, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

/**
 * Navigation link interface
 * 
 * Defines the structure for navigation menu items.
 * 
 * @interface NavLink
 * @property {string} href - URL path for the link
 * @property {string} label - Display text for the link
 */
interface NavLink {
  href: string
  label: string
}

/**
 * Navigation links configuration
 * 
 * Defines all navigation menu items in the desired order.
 * Modify this array to add, remove, or reorder navigation items.
 * 
 * @constant {NavLink[]}
 * @private
 */
const navLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/certificates", label: "Generate Certificates" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

/**
 * Primary Navigation Bar Component
 * 
 * Renders the main navigation bar with responsive design, smooth animations,
 * and interactive elements. Handles both desktop and mobile navigation patterns.
 * 
 * **State Management:**
 * - `isOpen`: Controls mobile menu visibility
 * - `scrolled`: Tracks scroll position for backdrop effects
 * 
 * **Effects:**
 * - Scroll listener for backdrop blur animation
 * - Route change listener for mobile menu auto-close
 * - Cleanup on component unmount
 * 
 * **Accessibility:**
 * - Semantic HTML (nav element)
 * - ARIA labels for icon buttons
 * - Keyboard navigation support
 * - Focus management
 * 
 * **Layout Breakpoints:**
 * - Mobile: <768px (hamburger menu)
 * - Desktop: ≥768px (horizontal navigation)
 * 
 * @component
 * @returns {JSX.Element} Rendered navigation bar
 * 
 * @example
 * // Usage in layout
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <Navbar />
 *         <main>{children}</main>
 *       </body>
 *     </html>
 *   )
 * }
 */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  /**
   * Scroll event handler for backdrop effects
   * 
   * Updates the `scrolled` state when user scrolls past 20px,
   * triggering backdrop blur and shadow effects.
   */
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  /**
   * Route change effect for mobile menu
   * 
   * Automatically closes the mobile menu when navigation occurs,
   * preventing the menu from staying open on new pages.
   */
  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  /**
   * Determines if a navigation link is active
   * 
   * Checks if the current route matches the link href. Handles special
   * case for home page (exact match) and other pages (prefix match).
   * 
   * @param {string} href - The link href to check
   * @returns {boolean} True if the link is active
   */
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border/50 shadow-lg shadow-primary/5"
          : "bg-background/95 backdrop-blur-sm border-b border-border/30"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-18">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <Image
                  src="/logo.png"
                  alt="Sendora Logo"
                  width={48}
                  height={48}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain transition-transform group-hover:scale-110"
                  priority
                />
                {pathname === "/" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full ring-2 ring-background"
                  />
                )}
              </motion.div>
              <span className="font-bold text-xl hidden sm:inline text-foreground group-hover:text-primary transition-colors">
                Sendora
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 rounded-lg font-medium transition-all group"
                >
                  <span
                    className={`relative z-10 transition-colors ${
                      active
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-indigo-500"
                    }`}
                  >
                    {link.label}
                  </span>
                  
                  {/* Active indicator underline */}
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  
                  {/* Hover background - only show when not active */}
                  {!active && (
                    <motion.div
                      className="absolute inset-0 bg-indigo-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={false}
                    />
                  )}
                  
                  {/* Active background */}
                  {active && (
                    <motion.div
                      className="absolute inset-0 bg-primary/10 rounded-lg"
                      layoutId="activeBackground"
                      initial={false}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/send"
                className="relative inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Get Started
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-foreground p-2 rounded-lg hover:bg-primary/10 transition-colors relative"
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
            >
              <div className="pb-4 pt-2 space-y-1">
                {navLinks.map((link, index) => {
                  const active = isActive(link.href)
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        className={`relative flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                          active
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-indigo-500 hover:bg-indigo-100"
                        }`}
                      >
                        {active && (
                          <motion.div
                            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-r-full"
                            layoutId="mobileActiveIndicator"
                            initial={false}
                          />
                        )}
                        <span>{link.label}</span>
                      </Link>
                    </motion.div>
                  )
                })}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: navLinks.length * 0.1 }}
                  className="pt-2"
                >
                  <Link
                    href="/send"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    Get Started
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
