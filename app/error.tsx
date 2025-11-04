"use client"

import { useEffect } from "react"
import GenericErrorPage from "@/components/error-pages/GenericErrorPage"
import NetworkErrorPage from "@/components/error-pages/NetworkErrorPage"
import ServerErrorPage from "@/components/error-pages/ServerErrorPage"

function isNetworkError(error: Error): boolean {
  // Check for common network error patterns
  if (error.message.includes("fetch") || error.message.includes("network") || error.message.includes("Network")) {
    return true
  }
  if (error.name === "NetworkError" || error.name === "TypeError") {
    return true
  }
  return false
}

function isServerError(error: Error): boolean {
  // Check for server error patterns
  if (error.message.includes("500") || error.message.includes("Internal Server Error")) {
    return true
  }
  if (error.digest?.startsWith("500")) {
    return true
  }
  return false
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error("Error caught by error boundary:", error)
  }, [error])

  // Route to appropriate error page based on error type
  if (isNetworkError(error)) {
    return <NetworkErrorPage />
  }

  if (isServerError(error)) {
    return <ServerErrorPage />
  }

  // Default to generic error page
  return <GenericErrorPage error={error} reset={reset} />
}
