// components/navigation/nav.config.ts
import {
  LayoutDashboard,
  CandlestickChart,
  LineChart,
  History,
  Wallet,
  Settings,
  ShieldCheck,
} from "lucide-react";

export const NAV_ITEMS = [
  {
    section: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Markets", href: "/markets", icon: LineChart },
      { label: "Trade", href: "/dashboard/trade", icon: CandlestickChart },
      { label: "History", href: "/history", icon: History },
    ],
  },
  {
    section: "Account",
    items: [
      { label: "Wallet", href: "/wallet", icon: Wallet },
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Admin", href: "/admin", icon: ShieldCheck },
      { label: "Admin Assets", href: "/admin/assets", icon: ShieldCheck },
      { label: "Admin Trades", href: "/admin/trades", icon: ShieldCheck },
    ],
  },
];
