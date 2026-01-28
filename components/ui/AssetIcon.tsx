"use client";

import * as tokenIcons from "@web3icons/react";
import { cn } from "@/lib/utils";

type AssetIconProps = {
  symbol?: string | null;
  size?: number;
  className?: string;
};

const getTokenComponent = (symbol?: string | null) => {
  if (!symbol) return null;
  const key = `Token${String(symbol).toUpperCase()}`;
  return (
    (tokenIcons as unknown as Record<string, React.ComponentType<any>>)[key] ||
    null
  );
};

export default function AssetIcon({
  symbol,
  size = 24,
  className,
}: AssetIconProps) {
  const Icon = getTokenComponent(symbol);
  if (Icon) {
    return (
      <Icon
        style={{ width: size, height: size }}
        className={cn("inline-block", className)}
        aria-label={symbol || "asset"}
        role="img"
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-ts-border bg-ts-bg-main",
        className
      )}
      style={{ width: size, height: size }}
      aria-label={symbol || "asset"}
      role="img"
    />
  );
}
