import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const hasToken = request.cookies.has("access_token");
  const path = request.nextUrl.pathname;
  const search = request.nextUrl.search || "";

  const protectedRoutes = [
    "/dashboard",
    "/wallet",
    "/trade",
    "/positions",
    "/settings",
    "/admin",
  ];

  const publicRoutes = ["/", "/markets", "/login", "/register", "/privacy", "/terms"];
  if (publicRoutes.includes(path)) {
    return NextResponse.next();
  }

  const isProtected = protectedRoutes.some(route =>
    path.startsWith(route)
  );

  
  if (isProtected && !hasToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${path}${search}`);
    return NextResponse.redirect(loginUrl);
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
