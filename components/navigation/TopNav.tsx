"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
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
  const [open, setOpen] = useState(false);

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

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLinks isAuthenticated={isAuthenticated} user={user} />
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-md hover:bg-ts-bg-card transition"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-ts-border bg-ts-bg-main">
          <nav className="px-4 py-4 flex flex-col gap-3">
            <NavLinks
              isAuthenticated={isAuthenticated}
              user={user}
              mobile
              onNavigate={() => setOpen(false)}
            />
          </nav>
        </div>
      )}
    </header>
  );
}

/* ================= SHARED NAV LINKS ================= */

function NavLinks({
  isAuthenticated,
  user,
  mobile = false,
  onNavigate,
}: {
  isAuthenticated: boolean;
  user?: {
    name: string;
    avatarUrl?: string;
  };
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const linkClass = cn(
    "text-sm transition",
    mobile
      ? "py-2 px-2 rounded-md hover:bg-ts-bg-card"
      : "text-ts-text-muted hover:text-ts-text-main"
  );

  return (
    <>
      <Link href="/markets" onClick={onNavigate} className={linkClass}>
        Markets
      </Link>

      <Link href="/pricing" onClick={onNavigate} className={linkClass}>
        Pricing
      </Link>

      {!isAuthenticated ? (
        <Link
          href="/login"
          onClick={onNavigate}
          className={cn(
            mobile
              ? "mt-2 bg-ts-primary text-white text-center py-2 rounded-md"
              : "bg-ts-primary text-white px-4 py-2 rounded-md hover:opacity-90"
          )}
        >
          Sign In
        </Link>
      ) : (
        <div
          className={cn(
            "flex items-center gap-3",
            mobile && "mt-3 border-t border-ts-border pt-3"
          )}
        >
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="text-sm font-medium hover:text-ts-primary transition"
          >
            Dashboard
          </Link>

          <Link
            href="/profile"
            onClick={onNavigate}
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
    </>
  );
}
export default TopNav;