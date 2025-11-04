/**
 * @fileoverview 500 Server Error Page Component - Interactive Server Error Display
 * @module components/error-pages/ServerErrorPage
 * @description
 * This component displays a visually engaging 500 server error page with
 * interactive animations and clear recovery actions.
 * 
 * Features:
 * - Large "500" display with animated letter spacing
 * - ServerCrash icon with red theme
 * - Mouse parallax effect on error card
 * - Error details card (Internal Server Error)
 * - Three action buttons: Go Back, Go Home, Report Problem
 * - Floating orbs background animation
 * - Gradient grid pattern
 * - Bottom glow effect
 * - Framer Motion animations
 * - Dark mode support
 * 
 * Interactions:
 * - Mouse Move: Parallax effect on error card (±14px)
 * - Letter Spacing: Animated breathing effect on "500"
 * - Staggered Fade-in: All elements animate in sequence
 * - Hover Effects: Shadow lift on buttons
 * 
 * Actions:
 * - Go Back: Browser back navigation
 * - Go Home: Navigate to / (homepage)
 * - Report Problem: Navigate to /contact page
 * 
 * Visual Design:
 * - Red color scheme for error indication
 * - Large error card with border and shadow
 * - Desktop-only error details text
 * - Responsive layout for all screen sizes
 * 
 * @requires react
 * @requires next/link
 * @requires framer-motion
 * @requires @/components/ui/button
 * @requires lucide-react
 */

"use client"

import Link from "next/link"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, Bug, ServerCrash } from "lucide-react"

/**
 * 500 Server Error Page Component - Interactive server error display.
 * 
 * This component creates a professional and engaging server error page with
 * mouse-tracking parallax effects and smooth animations.
 * 
 * Layout Structure:
 * - Center: Large error card with 500 display
 * - Top: ServerCrash icon
 * - Middle: Large "500" text with animated spacing
 * - Right: Error details (desktop only)
 * - Below: Error message and action buttons
 * - Background: Gradient grid + floating orbs + glow
 * 
 * Error Card Features:
 * - 32rem width, rounded corners (3xl)
 * - Red border and background (red-500/20, red-500/5)
 * - Box shadow with red tint
 * - Mouse parallax effect (±14px range)
 * - Contains ServerCrash icon, 500 text, error details
 * 
 * "500" Text Animation:
 * - Letter spacing animation (3s loop)
 * - -0.02em to 0.02em and back
 * - easeInOut transition
 * - Creates breathing/pulsing effect
 * 
 * Mouse Parallax:
 * - Tracks mouse position on error card
 * - Converts to relative position (0 to 1)
 * - Maps to ±14px range
 * - Spring physics (stiffness: 140, damping: 16, mass: 0.7)
 * - Resets to center on mouse leave
 * 
 * Staggered Animations:
 * - Error card: 0s delay, fade + slide up
 * - Heading: 0.15s delay
 * - Description: 0.2s delay
 * - Buttons: 0.25s delay
 * 
 * Action Buttons:
 * - Go Back: window.history.back() (outline)
 * - Go Home: Link to / (primary button)
 * - Report Problem: Link to /contact (ghost, full-width)
 * 
 * Background Elements:
 * - GradientGrid: Red-tinted radial gradient
 * - FloatingOrbs: 3 orbs (red, foreground, muted)
 * - Glow: Bottom primary glow effect
 * 
 * Responsive Design:
 * - Error details: Hidden on mobile, shown on md+
 * - Buttons: 2-column grid, third button spans both
 * - Text and spacing scale appropriately
 * 
 * @component
 * @returns {JSX.Element} Interactive 500 server error page
 * 
 * @example
 * ```tsx
 * // In global-error.tsx or API error handler
 * if (error.status === 500) {
 *   return <ServerErrorPage />
 * }
 * ```
 */
export default function ServerErrorPage() {
  // Motion values for mouse parallax effect
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 140, damping: 16, mass: 0.7 })
  const y = useSpring(my, { stiffness: 140, damping: 16, mass: 0.7 })

  /**
   * Handles mouse move for parallax effect on error card.
   * Calculates relative position and updates motion values.
   */
  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width
    const relY = (e.clientY - rect.top) / rect.height
    const range = 14
    mx.set((relX - 0.5) * range)
    my.set((relY - 0.5) * range)
  }

  /**
   * Resets parallax position when mouse leaves error card.
   */
  function handleLeave() {
    mx.set(0)
    my.set(0)
  }
  
  return (
    <div className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-background px-6 py-16">
      <GradientGrid />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-6 text-center"
      >
        <motion.div className="relative" onMouseMove={handleMove} onMouseLeave={handleLeave}>
          <motion.div
            style={{ x, y }}
            initial={{ scale: 0.95, opacity: 0, y: 6 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative flex h-52 w-[32rem] items-center justify-center gap-6 rounded-3xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-sm shadow-[0_10px_40px_rgba(239,68,68,0.15)]"
          >
            <div className="flex items-center text-red-600 dark:text-red-500">
              <ServerCrash className="h-16 w-16" />
            </div>
            <motion.div
              initial={{ letterSpacing: "-0.02em" }}
              animate={{ letterSpacing: ["-0.02em", "0.02em", "-0.02em"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-7xl font-extrabold tracking-tight text-red-600 dark:text-red-500"
            >
              500
            </motion.div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold text-red-600/80 dark:text-red-400/80">Internal Server Error</div>
              <div className="text-xs text-red-600/60 dark:text-red-400/60">Please try again later</div>
            </div>
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-400 md:text-4xl"
        >
          Sorry , It's not you. It's us.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl text-muted-foreground"
        >
          We're working to fix the issue. You can go back, return home, or report
          the problem.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-4 grid w-full max-w-md grid-cols-2 gap-3"
        >
          <Button onClick={() => window.history.back()} variant="outline" size="lg" className="hover:shadow-lg">
            Go back
          </Button>
          <Button asChild size="lg" className="hover:shadow-lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="col-span-2 hover:shadow-lg">
            <Link href="/contact">
              <Bug className="mr-2 h-4 w-4" />
              Report a problem
            </Link>
          </Button>
        </motion.div>
      </motion.div>
      <FloatingOrbs />
      <Glow />
    </div>
  )
}

/**
 * Gradient Grid Background Component.
 * Creates red-tinted gradient background with grid pattern.
 * 
 * @component
 * @returns {JSX.Element} Red-themed background
 */
function GradientGrid() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute inset-0 bg-[radial-gradient(60rem_30rem_at_50%_110%,hsl(0_85%_60%/0.15),transparent),linear-gradient(to_bottom,transparent,hsl(var(--foreground)/0.05))]" />
      <div className="absolute inset-0 [background:linear-gradient(to_right,hsl(var(--foreground)/0.06)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.06)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
    </div>
  )
}

/**
 * Bottom Glow Effect Component.
 * Creates ambient primary color glow at bottom.
 * 
 * @component
 * @returns {JSX.Element} Glow effect
 */
function Glow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-0 flex justify-center">
      <div className="h-56 w-[40rem] rounded-full bg-primary/20 blur-3xl dark:bg-primary/25" />
    </div>
  )
}

/**
 * Floating Orbs Background Component.
 * Creates 3 animated blur orbs with floating animation.
 * 
 * Orbs Configuration:
 * - Orb 1: 220px, left-top, red color (hsl 0 85% 60%)
 * - Orb 2: 140px, right-middle, foreground color
 * - Orb 3: 90px, left-bottom, muted-foreground color
 * 
 * Animation:
 * - Each orb floats vertically (±8px)
 * - Different durations for natural variation (6s, 8s, 10s)
 * - Infinite loop with easeInOut easing
 * 
 * @component
 * @returns {JSX.Element} Animated floating orbs
 */
function FloatingOrbs() {
  const orbs = [
    { size: 220, x: -280, y: -80, c: "0 85% 60%" },
    { size: 140, x: 280, y: 40, c: "var(--foreground)" },
    { size: 90, x: -40, y: 160, c: "var(--muted-foreground)" },
  ] as const

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-2xl"
          style={{
            width: o.size,
            height: o.size,
            left: `calc(50% + ${o.x}px)`,
            top: `calc(50% + ${o.y}px)`,
            background: `radial-gradient(circle, hsl(${o.c}/0.5), transparent 60%)`,
          }}
          initial={{ y: 0 }}
          animate={{ y: [ -8, 8, -8 ] }}
          transition={{ duration: 6 + i * 2, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  )
}
