// components/navigation/NavItem.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  href: string;
  icon: any;
};

export default function NavItem({ label, href, icon: Icon }: Props) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
        "hover:bg-ts-border",
        isActive
          ? "bg-ts-border text-ts-primary"
          : "text-ts-text-muted"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}
