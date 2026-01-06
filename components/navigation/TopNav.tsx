"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ThemeToggle from "../ui/ThemeToggle";

type TopNavProps = {
  isAuthenticated: boolean;
  user?: {
    name: string;
    avatarUrl?: string;
  };
};


const TopNav = ({ isAuthenticated, user }: TopNavProps) => {
  return (
    <header className="sticky top-0 z-50 bg-ts-bg-main border-b border-ts-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold text-ts-primary tracking-tight"
        >
          TradeScope
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          <Link
            href="/markets"
            className="text-sm text-ts-text-muted hover:text-ts-text-main transition"
          >
            Markets
          </Link>

          <Link
            href="/pricing"
            className="text-sm text-ts-text-muted hover:text-ts-text-main transition"
          >
            Pricing
          </Link>

          {/* Auth Section */}
          {!isAuthenticated ? (
            <Link
              href="/login"
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition",
                "bg-ts-primary text-white hover:opacity-90"
              )}
            >
              Sign In
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-ts-text-main hover:text-ts-primary transition"
              >
                Dashboard
              </Link>

              <Link
                href="/profile"
                className="relative h-9 w-9 rounded-full overflow-hidden border border-ts-border hover:ring-2 hover:ring-ts-primary transition"
              >
                <Image
                  src={user?.avatarUrl || "/avatar-placeholder.png"}
                  alt={user?.name || "Profile"}
                  fill
                  className="object-cover"
                />
              </Link>
            </div>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
export default TopNav;
