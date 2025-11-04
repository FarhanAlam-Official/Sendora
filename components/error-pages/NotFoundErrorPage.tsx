/**
 * @fileoverview 404 Not Found Page Component - Interactive Astronaut Error Page
 * @module components/error-pages/NotFoundErrorPage
 * @description
 * This component displays a creative and interactive 404 error page featuring
 * a floating astronaut illustration with physics-based animations.
 * 
 * Features:
 * - Large "404" display with gradient text
 * - Floating astronaut image with multiple interactions
 * - Mouse-tracking parallax effect
 * - Draggable astronaut with constraints
 * - Continuous floating animation (7s loop)
 * - Three action buttons: Go Home, Go Back, Learn More
 * - Floating orbs background animation
 * - Gradient grid pattern
 * - Bottom glow effect
 * - Framer Motion animations
 * - Dark mode support
 * 
 * Interactions:
 * - Mouse Move: Parallax effect (astronaut follows cursor)
 * - Hover: Slight scale up (1.06x)
 * - Tap: Slight scale down (0.98x)
 * - Drag: Freely draggable within constraints (24px)
 * - Continuous: Rotating and floating animation
 * 
 * Actions:
 * - Go Home: Navigate to / (homepage)
 * - Go Back: Browser back navigation
 * - Learn More: Navigate to /about page
 * 
 * @requires react
 * @requires next/link
 * @requires next/image
 * @requires framer-motion
 * @requires @/components/ui/button
 * @requires lucide-react
 */

"use client"

import Link from "next/link"
import Image from "next/image"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Home, Undo2, Compass } from "lucide-react"

/**
 * 404 Not Found Page Component - Interactive error page with floating astronaut.
 * 
 * This component creates an engaging and playful 404 error experience with
 * advanced Framer Motion animations and interactive elements.
 * 
 * Layout Structure:
 * - Left side: Text content (404, title, description, buttons)
 * - Right side: Interactive floating astronaut image
 * - Background: Gradient grid + floating orbs + bottom glow
 * 
 * Text Content:
 * - Main heading: "Lost in cyberspace"
 * - 404: Large gradient text (7xl on mobile, 9xl on desktop)
 * - Description: "The page you are looking for doesn't exist..."
 * - Staggered fade-in animations (0.1s, 0.15s, 0.2s, 0.25s delays)
 * 
 * Astronaut Interactions:
 * 1. Mouse Parallax: Follows mouse with smooth spring physics
 *    - Range: ±18px in both directions
 *    - Spring: stiffness=120, damping=14, mass=0.6
 * 2. Continuous Animation: 7s loop
 *    - Rotation: -6° to -12° and back
 *    - Y position: 10px to -10px and back
 *    - Scale: 0.98 to 1.04 and back
 * 3. Hover: Scale up to 1.06x
 * 4. Tap: Scale down to 0.98x
 * 5. Drag: Free drag with 24px constraints in all directions
 *    - Elastic: 0.12 (gentle bounce back)
 * 
 * Button Actions:
 * - Go Home: Navigate to / (primary button)
 * - Go Back: window.history.back() (outline button)
 * - Learn More: Navigate to /about (ghost button, full-width)
 * 
 * Background Elements:
 * - GradientGrid: Radial + linear grid patterns
 * - FloatingOrbs: 3 animated blur orbs (220px, 140px, 90px)
 * - Glow: Bottom primary color glow
 * 
 * Responsive Design:
 * - Mobile: Stacked layout, smaller astronaut
 * - md: Side-by-side layout, larger astronaut
 * - All text and spacing scale appropriately
 * 
 * @component
 * @returns {JSX.Element} Interactive 404 page with astronaut
 * 
 * @example
 * ```tsx
 * // In app/not-found.tsx
 * export default function NotFound() {
 *   return <NotFoundErrorPage />
 * }
 * ```
 */
export default function NotFound() {
  return (
    <div className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-background px-6 py-16">
      <GradientGrid />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col-reverse items-center gap-12 md:flex-row"
      >
        <div className="text-center md:text-left">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-3xl font-bold tracking-tight text-foreground md:text-4xl"
          >
            Lost in cyberspace
          </motion.h2>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-7xl font-black tracking-tight text-transparent sm:text-8xl md:text-9xl"
          >
            404
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 max-w-xl text-balance text-muted-foreground"
          >
            The page you are looking for doesn’t exist or has been relocated. Let’s
            get you back to a familiar orbit.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-8 grid grid-cols-2 items-center justify-center gap-3 md:justify-start"
          >
            <Button asChild size="lg" className="group">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go home
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.history.back()}
              className="group"
            >
              <Undo2 className="mr-2 h-4 w-4" />
              Go back
            </Button>
            <Button asChild variant="ghost" size="lg" className="group col-span-2">
              <Link href="/about">
                <Compass className="mr-2 h-4 w-4" />
                Learn more
              </Link>
            </Button>
          </motion.div>
        </div>

        <div className="relative -mt-20 ml-14 h-[26rem] w-[26rem] sm:-mt-24 sm:ml-20 sm:h-[30rem] sm:w-[30rem] md:-mt-28 md:ml-28 md:h-[34rem] md:w-[34rem]">
          <FloatingAstronautImage />
        </div>
      </motion.div>
      <FloatingOrbs />
      <Glow />
    </div>
  )
}

/**
 * Gradient Grid Background Component.
 * Creates decorative background with radial gradient and grid pattern.
 * 
 * @component
 * @returns {JSX.Element} Background gradient and grid
 */
function GradientGrid() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute inset-0 bg-[radial-gradient(60rem_30rem_at_50%_110%,hsl(var(--primary)/0.15),transparent),linear-gradient(to_bottom,transparent,hsl(var(--foreground)/0.03))]" />
      <div className="absolute inset-0 [background:linear-gradient(to_right,hsl(var(--foreground)/0.04)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.04)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
    </div>
  )
}

/**
 * Bottom Glow Effect Component.
 * Creates ambient glow effect at bottom of page.
 * 
 * @component
 * @returns {JSX.Element} Glow effect element
 */
function Glow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-0 flex justify-center">
      <div className="h-56 w-[40rem] rounded-full bg-primary/20 blur-3xl dark:bg-primary/25" />
    </div>
  )
}

/**
 * Floating Astronaut Image Component with Interactive Animations.
 * 
 * Features:
 * - Mouse parallax tracking with spring physics
 * - Continuous floating animation (rotate, y-position, scale)
 * - Hover scale effect
 * - Draggable with constraints
 * - Uses Next.js Image component
 * 
 * Mouse Parallax:
 * - Calculates relative mouse position (0 to 1)
 * - Converts to ±18px range
 * - Smooth spring animation (stiffness: 120, damping: 14)
 * 
 * Continuous Animation:
 * - 7s duration with infinite repeat
 * - Rotation: -6° to -12° (tilt effect)
 * - Y: 10px to -10px (floating up/down)
 * - Scale: 0.98 to 1.04 (breathing effect)
 * 
 * Drag Behavior:
 * - Constrained to 24px in all directions
 * - Elastic bounce back (0.12 elasticity)
 * - Respects all other animations
 * 
 * @component
 * @returns {JSX.Element} Interactive astronaut image
 */
function FloatingAstronautImage() {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 120, damping: 14, mass: 0.6 })
  const y = useSpring(my, { stiffness: 120, damping: 14, mass: 0.6 })

  /**
   * Handles mouse move for parallax effect.
   * Calculates relative position and sets motion values.
   */
  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width
    const relY = (e.clientY - rect.top) / rect.height
    const range = 18
    mx.set((relX - 0.5) * range)
    my.set((relY - 0.5) * range)
  }

  /**
   * Resets parallax position when mouse leaves.
   */
  function handleLeave() {
    mx.set(0)
    my.set(0)
  }

  return (
    <motion.div
      className="absolute inset-0 translate-x-4 sm:translate-x-6 md:translate-x-8"
      style={{ x, y }}
      initial={{ rotate: -6, y: 8, scale: 0.98 }}
      animate={{ rotate: [ -6, -12, -6 ], y: [10, -10, 10], scale: [0.98, 1.04, 0.98] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.98 }}
      drag
      dragConstraints={{ left: -24, right: 24, top: -24, bottom: 24 }}
      dragElastic={0.12}
    >
      <Image
        src="/astronaut.png"
        alt="Floating astronaut"
        fill
        className="pointer-events-none select-none object-contain drop-shadow-[0_14px_50px_rgba(0,0,0,0.3)]"
        priority
      />
    </motion.div>
  )
}

/**
 * Floating Orbs Background Component.
 * Creates 3 animated blur orbs for depth and atmosphere.
 * 
 * Orbs Configuration:
 * - Orb 1: 220px, left-top, primary color
 * - Orb 2: 140px, right-middle, foreground color
 * - Orb 3: 90px, left-bottom, muted-foreground color
 * 
 * Animation:
 * - Each orb floats up and down (±8px)
 * - Different durations (6s, 8s, 10s) for variation
 * - Infinite loop with easeInOut
 * 
 * @component
 * @returns {JSX.Element} Animated background orbs
 */
function FloatingOrbs() {
  const orbs = [
    { size: 220, x: -280, y: -80, c: "var(--primary)" },
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