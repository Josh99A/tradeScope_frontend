"use client";

import { Home, BarChart2, Wallet, List, User } from "lucide-react";
import { Button } from "../ui/Button";

const navItems = [
  { label: "Home", icon: Home },
  { label: "Trade", icon: BarChart2 },
  { label: "Wallet", icon: Wallet },
  { label: "Orders", icon: List },
  { label: "Account", icon: User },
];
const MobileBottomNav = () => {
  return (
    <nav className="fixed bottom-0 inset-x-0 h-16 bg-ts-bg-card border-t border-ts-border md:hidden z-50">
      <div className="h-full flex justify-around items-center">
        {navItems.map(({ label, icon: Icon }) => (
          <Button
            key={label}
            className="flex flex-col items-center text-xs text-ts-text-muted hover:text-ts-primary transition"
          >
            <Icon size={18} />
            {label}
          </Button>
        ))}
      </div>
    </nav>
  );
}
export default MobileBottomNav;