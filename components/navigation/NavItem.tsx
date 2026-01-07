// components/navigation/NavItem.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function NavItem({
  label,
  href,
  icon: Icon,
  onClick,
}: {
  label: string;
  href: string;
  icon: any;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition",
        isActive
          ? "bg-ts-primary/10 text-ts-primary"
          : "text-ts-text-muted hover:bg-ts-hover hover:text-ts-text-main"
      )}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
}
