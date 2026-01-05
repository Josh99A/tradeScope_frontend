// components/navigation/nav.config.ts
import {
  LayoutDashboard,
  CandlestickChart,
  LineChart,
  Briefcase,
  History,
  Wallet,
  Settings,
} from "lucide-react";

export const NAV_ITEMS = [
  {
    section: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Markets", href: "/markets", icon: LineChart },
      { label: "Trade", href: "/trade", icon: CandlestickChart },
      { label: "Positions", href: "/positions", icon: Briefcase },
      { label: "History", href: "/history", icon: History },
    ],
  },
  {
    section: "Account",
    items: [
      { label: "Wallet", href: "/wallet", icon: Wallet },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];
