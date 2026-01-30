"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "../ui/ThemeToggle";
import { Button } from "../ui/Button";
import LogoutButton from "../ui/LogoutButton";


type TopNavProps = {
  isAuthenticated: boolean;
  user?: {
    username: string;
    photo_url?: string;
  };
};

export default function TopNav({ isAuthenticated, user }: TopNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-ts-bg-main border-b border-ts-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="text-lg font-bold tracking-tight text-ts-text-main"
        >
          Trade<span className="text-ts-primary">Scope</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLinks isAuthenticated={isAuthenticated} user={user} />
        </nav>

        {/* Mobile Menu Button */}
        <Button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 rounded-md hover:bg-ts-hover active:bg-ts-active transition"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </Button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-200",
          open ? "max-h-[500px] border-t border-ts-border" : "max-h-0"
        )}
      >
        <nav className="px-4 py-4 space-y-4 bg-ts-bg-main">
          <NavLinks
            isAuthenticated={isAuthenticated}
            user={user}
            mobile
            onNavigate={() => setOpen(false)}
          />
        </nav>
      </div>
    </header>
  );
}

/* ================= NAV LINKS ================= */

function NavLinks({
  isAuthenticated,
  user,
  mobile = false,
  onNavigate,
}: {
  isAuthenticated: boolean;
  user?: {
    username: string;
    photo_url?: string;
  };
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const linkClass = cn(
    "text-sm font-medium transition",
    mobile
      ? "px-3 py-2 rounded-md hover:bg-ts-hover active:bg-ts-active"
      : "text-ts-text-muted hover:text-ts-text-main"
  );

  return (
    <>
      {/* Primary Links */}
      <div className={cn("flex gap-4", mobile && "flex-col")}>
        <Link href="/markets" onClick={onNavigate} className={linkClass}>
          Markets
        </Link>
      </div>

      {/* Auth Section */}
      {!isAuthenticated ? (
        <Link
          href="/login"
          onClick={onNavigate}
          className={cn(
            "font-medium transition",
            mobile
              ? "w-full text-center bg-ts-primary text-white py-2 rounded-md block"
              : "bg-ts-primary text-white px-4 py-2 rounded-md hover:opacity-90"
          )}
        >
          Sign In
        </Link>
      ) : (
        <div
          className={cn(
            "flex items-center gap-4",
            mobile && "flex-col border-t border-ts-border pt-4"
          )}
        >
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className={linkClass}
          >
            Dashboard
          </Link>

          <LogoutButton mobile={mobile} />

          <Link
            href="/settings"
            onClick={onNavigate}
            className="relative h-9 w-9 rounded-full overflow-hidden border border-ts-border hover:ring-2 hover:ring-ts-primary transition"
          >
            <img
              src={user?.photo_url || "/Images/avatar-placeholder.jpg"}
              alt={user?.username || "Profile"}
              className="h-full w-full object-cover"
            />
          </Link>
        </div>
      )}

      {/* Theme Toggle */}
      <div className={cn(mobile && "pt-2")}>
        <ThemeToggle />
      </div>
    </>
  );
}
