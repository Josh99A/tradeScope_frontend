"use client";

import { X } from "lucide-react";
import Link from "next/link";
import NavItem from "../navigation/NavItem";
import { NAV_ITEMS } from "../navigation/nav.config";
import ThemeToggle from "../ui/ThemeToggle";
import { Button } from "../ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";

const links = [
  "Dashboard",
  "Trade",
  "Wallet",
  "Orders",
  "Account",
];

const MobileDrawer = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const { user } = useAuth();
  const isAdmin = !!(user?.is_staff || user?.is_superuser);
  if (!open) return null;
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
      />

      {/* Drawer */}
      <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-ts-bg-card border-r border-ts-border md:hidden flex flex-col animate-slide-in pb-16">
        
        {/* Header / Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ts-border">
            <Link href="/" className="text-lg font-bold text-ts-text-main hover:opacity-80 transition">
            Trade<span className="text-ts-primary">Scope</span>
            </Link>

          <Button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-ts-hover transition"
            aria-label="Close menu"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {NAV_ITEMS.map((group) => {
            const items = group.items.filter((item) => {
              if (item.href.startsWith("/admin")) {
                return isAdmin;
              }
              return true;
            });
            if (items.length === 0) return null;
            return (
            <div key={group.section}>
              <p className="px-3 mb-2 text-xs uppercase text-ts-text-muted">
                {group.section}
              </p>

              <div className="space-y-1">
                {items.map((item) => (
                  <NavItem
                    key={item.href}
                    {...item}
                    onClick={onClose} // auto close on navigation
                  />
                ))}
              </div>
            </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-ts-border">
          <div className="flex items-center justify-between rounded-lg border border-ts-border bg-ts-bg-main px-3 py-2">
            <span className="text-xs uppercase text-ts-text-muted">Theme</span>
            <ThemeToggle size="sm" />
          </div>
        </div>
      </aside>
    </>
  );
}

export default MobileDrawer;
