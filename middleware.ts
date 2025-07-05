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

  // Skip middleware for API routes and static files
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  try {
    // Check if user is authenticated by looking for auth token cookie
    const authToken = request.cookies.get("auth-token")
    
    console.log('Middleware - Pathname:', pathname, 'Auth token exists:', !!authToken)
    
    // Only redirect to /login if not already on an auth route
    if (
      !authToken &&
      protectedRoutes.some(route => pathname.startsWith(route)) &&
      !authRoutes.some(route => pathname.startsWith(route))
    ) {
      console.log('Middleware - Redirecting to login (no token)')
      const loginUrl = new URL("/login", request.url)
      // Only set redirect if not already on /login or /register
      if (!authRoutes.some(route => pathname.startsWith(route))) {
        loginUrl.searchParams.set("redirect", pathname)
      }
      return NextResponse.redirect(loginUrl)
    }

    // Auth token exists, verify it
    if (authToken) {
      try {
        const payload = await verifyToken(authToken.value)
        console.log('Middleware - Token verification result:', payload ? 'Valid' : 'Invalid')
        
        if (!payload) {
          // Invalid token, clear cookie and redirect to login
          console.log('Middleware - Invalid token, clearing cookie')
          const response = NextResponse.redirect(new URL("/login", request.url))
          response.cookies.delete("auth-token")
          return response
        }

        // Valid token
        if (authRoutes.some(route => pathname.startsWith(route))) {
          // User is logged in but trying to access auth pages, redirect to home
          console.log('Middleware - Authenticated user accessing auth page, redirecting to home')
          return NextResponse.redirect(new URL("/", request.url))
        }

        // Add user info to headers for use in components
        const response = NextResponse.next()
        response.headers.set("x-user-id", payload.userId)
        response.headers.set("x-user-email", payload.email)
        
        console.log('Middleware - Allowing access to protected route')
        return response
      } catch (error) {
        // Token verification failed, clear cookie and redirect to login
        console.error("Token verification failed:", error)
        const response = NextResponse.redirect(new URL("/login", request.url))
        response.cookies.delete("auth-token")
        return response
      }
    }

    // Allow access to public routes
    console.log('Middleware - Allowing access to public route')
    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    // On error, allow the request to continue (fail open)
    return NextResponse.next()
  }
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