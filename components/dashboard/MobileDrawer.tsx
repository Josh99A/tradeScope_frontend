"use client";

import { X } from "lucide-react";
import Link from "next/link";
import NavItem from "../navigation/NavItem";
import { NAV_ITEMS } from "../navigation/nav.config";
import ThemeToggle from "../ui/ThemeToggle";

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
  if (!open) return null;
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
      />

      {/* Drawer */}
      <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-ts-bg-card border-r border-ts-border md:hidden flex flex-col animate-slide-in">
        
        {/* Header / Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ts-border">
          <div className="text-lg font-bold text-ts-text-main">
            Trade<span className="text-ts-primary">Scope</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-ts-hover transition"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {NAV_ITEMS.map((group) => (
            <div key={group.section}>
              <p className="px-3 mb-2 text-xs uppercase text-ts-text-muted">
                {group.section}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavItem
                    key={item.href}
                    {...item}
                    onClick={onClose} // auto close on navigation
                  />
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
    </>
  );
}

export default MobileDrawer;