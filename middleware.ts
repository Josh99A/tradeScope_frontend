import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/markets",
  "/login",
  "/register",
  "/privacy",
  "/terms",
];

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/wallet",
  "/trade",
  "/positions",
  "/settings",
  "/admin",
];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname === path)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (!isProtected) {
    return NextResponse.next();
  }

  const hasToken = request.cookies.has("access_token");
  if (hasToken) {
    return NextResponse.next();
  }

  const nextUrl = `${pathname}${search}`;
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", nextUrl);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
