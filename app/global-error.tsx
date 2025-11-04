"use client"

import ServerErrorPage from "@/components/error-pages/ServerErrorPage"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <ServerErrorPage />
      </body>
    </html>
  )
}

