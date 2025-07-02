import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// --- Configuration: Define your protected and public routes ---
const protectedRoutes = ['/dashboard', '/documents', '/analytics', '/chat'];
const publicRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  // 1. Get the authentication token cookie from the request.
  const token = request.cookies.get('access_token')?.value;

  // 2. Get the path the user is trying to access.
  const { pathname } = request.nextUrl;

  // --- Logic for redirecting authenticated users ---
  // If the user is authenticated (has a token) but tries to access a public
  // route like /login, redirect them to the dashboard.
  if (token && publicRoutes.includes(pathname)) {
    // Construct the absolute URL for the dashboard.
    const absoluteURL = new URL('/dashboard', request.nextUrl.origin);
    return NextResponse.redirect(absoluteURL.toString());
  }

  // --- Logic for protecting routes ---
  // If the user is not authenticated (no token) and is trying to access
  // a protected route, redirect them to the login page.
  if (!token && protectedRoutes.some(path => pathname.startsWith(path))) {
    // Construct the absolute URL for the login page.
    const absoluteURL = new URL('/login', request.nextUrl.origin);
    return NextResponse.redirect(absoluteURL.toString());
  }

  // 5. If none of the above conditions are met, let the request proceed.
  return NextResponse.next();
}

// --- The Matcher: Performance Optimization ---
// This config tells the middleware on which paths it should run.
// This is more efficient than running it on EVERY single request (like for images or CSS files).
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};