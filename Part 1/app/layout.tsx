import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { ThemeProvider } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LLM Sandbox",
  description: "A sandbox for experimenting with LLMs",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen flex-col">
            <header className="border-b">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-6">
                  <Link href="/" className="flex items-center space-x-2">
                    <span className="font-bold text-xl">LLM Sandbox</span>
                  </Link>
                  <nav className="flex items-center space-x-4 lg:space-x-6">
                    <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                      Home
                    </Link>
                    <Link href="/sandbox" className="text-sm font-medium transition-colors hover:text-primary">
                      Sandbox
                    </Link>
                  </nav>
                </div>
                <div className="flex items-center gap-4">
                  <Button asChild>
                    <Link href="/sandbox">Launch Sandbox</Link>
                  </Button>
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'