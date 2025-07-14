import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Check if this is a public path
  const isPublicPath =
    path === "/" ||
    path === "/login" ||
    path === "/register" ||
    path === "/forgot-password" ||
    path === "/reset-password" ||
    path === "/setup" ||
    path.startsWith("/auth/") ||
    path.startsWith("/api/auth/")

  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Redirect logic
  if (!token && !isPublicPath) {
    // Redirect to login if trying to access a protected route without being logged in
    const url = new URL(`/login`, request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  if (token && (path === "/login" || path === "/register" || path === "/forgot-password" || path === "/reset-password")) {
    // Redirect to dashboard if trying to access login/register while logged in
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (token && path.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Continue with the request
  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/conversations/:path*",
    "/agents/:path*",
    "/templates/:path*",
    "/analytics/:path*",
    "/sandbox/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
}
