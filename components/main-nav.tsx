"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Home
      </Link>
      <Link
        href="/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard" || pathname.startsWith("/dashboard/") ? "text-primary" : "text-muted-foreground",
        )}
      >
        Dashboard
      </Link>
      <Link
        href="/templates"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/templates" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Templates
      </Link>
      <Link
        href="/sandbox"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/sandbox" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Sandbox
      </Link>
    </nav>
  )
}
