import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./app/lib/auth"

// Define protected routes that require authentication
const protectedRoutes = [
  "/",
  "/explore",
  "/notifications",
  "/messages",
  "/saved",
  "/profile",
  "/posts",
  "/clubs",
]

// Define auth routes that should redirect if user is already logged in
const authRoutes = ["/login", "/register"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("auth-token")?.value

  // Skip middleware for API routes and static files
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // If no token, allow access to login/register
  if (!token) {
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      return NextResponse.next()
    }
    // Redirect to login for protected routes
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verify token (signature/expiry only)
  let payload = null
  try {
    payload = await verifyToken(token)
  } catch {
    // Invalid token, clear cookie and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth-token')
    return response
  }

  // If authenticated and trying to access login/register, redirect to home
  if ((pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Allow access to all other routes
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
} 