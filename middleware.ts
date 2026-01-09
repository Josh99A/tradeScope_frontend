import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hasToken = request.cookies.has("access_token");
  const path = request.nextUrl.pathname;

  const protectedRoutes = [
    "/dashboard",
    "/wallet",
    "/trade",
    "/positions",
    "/settings",
  ];

  const isProtected = protectedRoutes.some(route =>
    path.startsWith(route)
  );

  if (isProtected && !hasToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/wallet/:path*",
    "/trade/:path*",
    "/positions/:path*",
    "/settings/:path*",
  ],
};
