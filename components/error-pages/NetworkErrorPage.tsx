/**
 * @fileoverview Network Error Page Component - Connection Error Display
 * @module components/error-pages/NetworkErrorPage
 * @description
 * This component displays a visually appealing error page when network connectivity
 * issues prevent the application from reaching the server.
 * 
 * Features:
 * - Visual illustration showing connection failure (Smartphone -> WifiOff -> Server)
 * - Clean, modern design with gradient background
 * - Three action buttons: Retry, Go Home, Contact Support
 * - Responsive layout for all screen sizes
 * - Dark mode support
 * - Decorative gradient grid and glow effects
 * 
 * Use Cases:
 * - API request timeouts
 * - Failed fetch calls
 * - Network disconnection
 * - Server unreachable
 * - DNS resolution failures
 * 
 * Actions:
 * - Retry: Reloads the page (window.location.reload)
 * - Go Home: Navigate to homepage
 * - Contact Support: Navigate to /contact page
 * 
 * @requires react
 * @requires next/link
 * @requires @/components/ui/button
 * @requires lucide-react
 */

"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WifiOff, Home, RefreshCw, LifeBuoy, Smartphone, Server } from "lucide-react"

/**
 * Network Error Page Component - Displays connection error with visual illustration.
 * 
 * This component provides a user-friendly error page specifically for network-related
 * issues. It features a visual representation of the connection failure and clear
 * actions to resolve the problem.
 * 
 * Visual Design:
 * - Static illustration: Smartphone -> WifiOff Icon -> Server
 * - Red color scheme for error indication
 * - Gradient background grid pattern
 * - Bottom glow effect (primary color)
 * - Responsive sizing (mobile to desktop)
 * - Smooth hover effects on buttons
 * 
 * Layout:
 * - Centered content with max-width
 * - Large visual illustration at top
 * - Error title and description
 * - 2-column action button grid (mobile: stacked)
 * - Full-width contact support button
 * 
 * Action Buttons:
 * 1. Retry: Reloads page, primary button with RefreshCw icon
 * 2. Go Home: Links to /, outline button with Home icon
 * 3. Contact Support: Links to /contact, ghost button with LifeBuoy icon
 * 
 * Decorative Elements:
 * - GradientGrid: Radial gradient + linear grid pattern
 * - Glow: Bottom blur effect for depth
 * 
 * Responsive Breakpoints:
 * - Mobile: Smaller icons, stacked layout
 * - sm: Medium icons, side-by-side buttons
 * - md: Larger icons, optimized spacing
 * 
 * @component
 * @returns {JSX.Element} Network error page with retry and navigation options
 * 
 * @example
 * ```tsx
 * // In API error handler
 * if (error.code === 'NETWORK_ERROR') {
 *   return <NetworkErrorPage />
 * }
 * 
 * // Or wrap fetch calls
 * fetch('/api/data')
 *   .catch(err => {
 *     if (!navigator.onLine) {
 *       render(<NetworkErrorPage />)
 *     }
 *   })
 * ```
 */
export default function NetworkErrorPage() {
  return (
    <div className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-background px-6 py-16">
      <GradientGrid />
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-6 text-center">
        {/* Visual illustration - Smartphone -> WifiOff -> Server */}
        <div className="relative w-full max-w-5xl">
          <div className="mx-auto flex max-w-4xl items-center justify-between text-red-600 dark:text-red-500">
            <div className="flex items-center justify-center">
              <Smartphone className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32" />
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="h-1 w-40 sm:w-56 md:w-64 rounded-full bg-red-500/40" />
              <WifiOff className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10" />
              <div className="h-1 w-40 sm:w-56 md:w-64 rounded-full bg-red-500/40" />
            </div>
            <div className="flex items-center justify-center">
              <Server className="h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36" />
            </div>
          </div>
        </div>

        {/* Error title */}
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Network error
        </h1>

        {/* Error message */}
        <p className="max-w-2xl text-muted-foreground">
          We couldn't reach the server. Please check your internet connection.
        </p>

        {/* Action buttons - Retry, Go Home, Contact Support */}
        <div className="mt-4 grid w-full max-w-md grid-cols-2 gap-3">
          <Button onClick={() => window.location.reload()} size="lg" className="group hover:shadow-lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
          <Button asChild variant="outline" size="lg" className="group hover:shadow-lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="group col-span-2 hover:shadow-lg">
            <Link href="/contact">
              <LifeBuoy className="mr-2 h-4 w-4" />
              Contact support
            </Link>
          </Button>
        </div>
      </div>
      <Glow />
    </div>
  )
}

/**
 * Gradient Grid Background Component.
 * Creates a decorative background with radial gradient and grid pattern.
 * 
 * @component
 * @returns {JSX.Element} Background grid pattern
 */
function GradientGrid() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute inset-0 bg-[radial-gradient(60rem_30rem_at_50%_110%,hsl(var(--primary)/0.12),transparent),linear-gradient(to_bottom,transparent,hsl(var(--foreground)/0.03))]" />
      <div className="absolute inset-0 [background:linear-gradient(to_right,hsl(var(--foreground)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.05)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
    </div>
  )
}

/**
 * Glow Effect Component.
 * Creates a bottom glow effect using blur for visual depth.
 * 
 * @component
 * @returns {JSX.Element} Blur glow effect
 */
function Glow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-0 flex justify-center">
      <div className="h-56 w-[40rem] rounded-full bg-primary/20 blur-3xl dark:bg-primary/25" />
    </div>
  )
}
