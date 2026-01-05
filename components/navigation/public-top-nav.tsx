// components/navigation/public-top-nav.tsx
"use client";

import ThemeToggle from "../ui/ThemeToggle";
import UserMenu from "./user-menu";
import MobileMenu from "./mobile-menu";
import { useAuth } from "@/app/hooks/use-auth";
import Link from "next/link";

export function PublicTopNav() {
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-ts-border bg-ts-bg-card/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between">
          
          {/* Left: Brand */}
          <Link href="/" className="text-lg font-semibold text-ts-text-main">
            TradeScope
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/markets" className="text-ts-text-muted hover:text-ts-text-main">
              Markets
            </Link>
            <Link href="/pricing" className="text-ts-text-muted hover:text-ts-text-main">
              Pricing
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden rounded-md bg-ts-primary px-4 py-2 text-sm font-medium text-white md:block"
                >
                  Dashboard
                </Link>
                <UserMenu user={user} />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-ts-text-muted hover:text-ts-text-main"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-ts-primary px-4 py-2 text-sm font-medium text-white"
                >
                  Get Started
                </Link>
              </>
            )}

            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
