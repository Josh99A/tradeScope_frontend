// components/navigation/SideNav.tsx
"use client";

import NavItem from "./NavItem";
import { NAV_ITEMS } from "./nav.config";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

export default function SideNav() {
  const { user } = useAuth();
  const isAdmin = !!(user?.is_staff || user?.is_superuser);

  const navItems = NAV_ITEMS.map((group) => {
    const items = group.items.filter((item) => {
      if (item.href.startsWith("/admin")) {
        return isAdmin;
      }
      return true;
    });
    return { ...group, items };
  }).filter((group) => group.items.length > 0);

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-ts-border bg-ts-bg-card">
      
      {/* Logo */}
      <Link href="/dashboard" className="px-6 py-5 text-lg font-bold text-ts-text-main hover:opacity-80 transition-opacity">
          Trade<span className="text-ts-primary">Scope</span>
        </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-6">
        {navItems.map((group) => (
          <div key={group.section}>
            <p className="px-3 mb-2 text-xs uppercase text-ts-text-muted">
              {group.section}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-ts-border">
        <ThemeToggle />
      </div>
    </aside>
  );
}
