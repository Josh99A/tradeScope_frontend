"use client";

import { X } from "lucide-react";
import Link from "next/link";

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
  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        open ? "visible" : "invisible"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`absolute left-0 top-0 h-full w-64 bg-ts-bg-card border-r border-ts-border transform transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex justify-between items-center">
            <Link href="/" className="font-semibold">TradeScope</Link>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="px-3 space-y-1">
        {links.map((link) => (
            <a
            key={link}
            href="#"
            className="
                block px-3 py-2 text-sm rounded-md
                hover:bg-ts-hover
                active:bg-ts-active
                transition
            "
            >
            {link}
            </a>
        ))}
        </nav>

      </aside>
    </div>
  );
}

export default MobileDrawer;