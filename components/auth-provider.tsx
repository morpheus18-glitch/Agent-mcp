"use client"

import type React from "react"
import { SessionProvider } from "next-auth/react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Simple error boundary to prevent auth errors from breaking the app
  try {
    return <SessionProvider>{children}</SessionProvider>
  } catch (error) {
    console.error("Auth provider error:", error)
    return <>{children}</>
  }
}
