import { NextResponse } from "next/server"

// Helper function to check if a string is a valid URL
function isValidUrl(string: string) {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

export async function GET() {
  // Only allow this in development mode or for authenticated admin users in production
  if (process.env.NODE_ENV === "production") {
    // In production, we'd check for admin authentication here
    // For now, we'll just return limited information
    return NextResponse.json({
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      DATABASE_URL: !!process.env.DATABASE_URL,
      GROQ_API_KEY: !!process.env.GROQ_API_KEY,
    })
  }

  // Check environment variables
  const nextAuthUrl = process.env.NEXTAUTH_URL
  const nextAuthSecret = process.env.NEXTAUTH_SECRET
  const databaseUrl = process.env.DATABASE_URL
  const groqApiKey = process.env.GROQ_API_KEY

  return NextResponse.json({
    NEXTAUTH_URL: nextAuthUrl ? isValidUrl(nextAuthUrl) : false,
    NEXTAUTH_SECRET: !!nextAuthSecret && nextAuthSecret.length >= 32,
    DATABASE_URL: !!databaseUrl && databaseUrl.startsWith("postgres://"),
    GROQ_API_KEY: !!groqApiKey,
  })
}
