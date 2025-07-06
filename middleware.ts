import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./app/lib/auth"

// Define protected routes that require authentication
const protectedRoutes = [
  "/explore",
  "/notifications",
  "/messages",
  "/saved",
  "/users",
  "/posts",
  "/clubs",
]

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

  // Allow unauthenticated users to access only the root route
  if (!token) {
    if (pathname === "/") {
      return NextResponse.next()
    }
    // Redirect to root for all other routes
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Verify token (signature/expiry only)
  let payload = null
  try {
    payload = await verifyToken(token)
  } catch {
    // Invalid token, clear cookie and redirect to root
    const response = NextResponse.redirect(new URL('/', request.url))
    response.cookies.delete('auth-token')
    return response
  }

  // Authenticated users can access any route
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