"use client";

import { Home, BarChart2, Wallet, List, User } from "lucide-react";
import Link from "next/link";

const navItems = [
  { label: "Home", icon: Home, path: "/dashboard" },
  { label: "Trade", icon: BarChart2, path: "/dashboard/trade" },
  { label: "Wallet", icon: Wallet, path: "/wallet" },
  { label: "Markets", icon: List, path: "/markets" },
  { label: "Account", icon: User, path: "/settings" },
];
const MobileBottomNav = () => {
  return (
    <nav className="fixed bottom-0 inset-x-0 h-16 bg-ts-bg-card border-t border-ts-border md:hidden z-30">
      <div className="h-full flex justify-around items-center">
        {navItems.map(({ label, icon: Icon, path }) => (
          <Link key={label} href={path} className="flex flex-col items-center text-xs text-ts-text-muted hover:text-ts-primary transition">
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
export default MobileBottomNav;
