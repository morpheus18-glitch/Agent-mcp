"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, X, User, Settings, LogOut } from "lucide-react"

// Mock session for development
const mockSession = {
  user: {
    name: "Demo User",
    email: "user@example.com",
    image: null,
  },
}

export function Navbar() {
  // Use mock session instead of real session to avoid auth errors
  const session = mockSession
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const handleSignOut = async () => {
    // Mock sign out
    console.log("Signed out")
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">LLM Sandbox</span>
          </Link>
          <nav className="hidden md:flex gap-6 ml-6">
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/conversations"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/conversations") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Conversations
            </Link>
            <Link
              href="/agents"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/agents") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Agents
            </Link>
            <Link
              href="/templates"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/templates") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Templates
            </Link>
            <Link
              href="/analytics"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/analytics") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Analytics
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt={session.user?.name || "User"} />
                      <AvatarFallback>
                        {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="default" size="sm" asChild className="hidden md:flex">
                <Link href="/sandbox">New Conversation</Link>
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}
          <Button variant="ghost" size="icon" aria-label="Toggle Menu" className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="container py-4 space-y-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={closeMenu}
              >
                Dashboard
              </Link>
              <Link
                href="/conversations"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/conversations") ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={closeMenu}
              >
                Conversations
              </Link>
              <Link
                href="/agents"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/agents") ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={closeMenu}
              >
                Agents
              </Link>
              <Link
                href="/templates"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/templates") ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={closeMenu}
              >
                Templates
              </Link>
              <Link
                href="/analytics"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/analytics") ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={closeMenu}
              >
                Analytics
              </Link>
            </nav>
            {!session && (
              <div className="flex flex-col space-y-2">
                <Button variant="outline" asChild onClick={closeMenu}>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild onClick={closeMenu}>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
            {session && (
              <Button variant="default" asChild onClick={closeMenu}>
                <Link href="/sandbox">New Conversation</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
