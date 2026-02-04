"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";

const DEFAULT_SYMBOLS = [
  { label: "BTC", symbol: "BINANCE:BTCUSDT" },
  { label: "ETH", symbol: "BINANCE:ETHUSDT" },
  { label: "SOL", symbol: "BINANCE:SOLUSDT" },
  { label: "XRP", symbol: "BINANCE:XRPUSDT" },
];

export default function MiniChartsRow({
  symbols = DEFAULT_SYMBOLS,
  className = "",
}: {
  symbols?: { label: string; symbol: string }[];
  className?: string;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const colorTheme = resolvedTheme === "dark" ? "dark" : "light";
  const items = useMemo(() => symbols.filter((item) => item.symbol), [symbols]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    if (
      typeof document !== "undefined" &&
      !document.querySelector('script[data-tradingview-mini-chart="true"]')
    ) {
      const script = document.createElement("script");
      script.src = "https://widgets.tradingview-widget.com/w/en/tv-mini-chart.js";
      script.type = "module";
      script.async = true;
      script.setAttribute("data-tradingview-mini-chart", "true");
      document.head.appendChild(script);
    }

    items.forEach((item) => {
      const wrapper = document.createElement("div");
      wrapper.className =
        "rounded-xl border border-ts-border bg-ts-bg-card/60 p-2 h-[240px] sm:h-[200px] overflow-hidden";
      const label = document.createElement("div");
      label.className = "px-1 pb-1 text-[11px] text-ts-text-muted";
      label.textContent = item.label;
      const widget = document.createElement("tv-mini-chart");
      widget.setAttribute("symbol", item.symbol);
      widget.setAttribute("color-theme", colorTheme);
      widget.setAttribute("is-transparent", "true");
      widget.setAttribute("width", "100%");
      widget.setAttribute("height", "175");
      wrapper.appendChild(label);
      wrapper.appendChild(widget);
      containerRef.current?.appendChild(wrapper);
    });
  }, [items, mounted, colorTheme]);

  if (!items.length) return null;

  return (
    <div
      className={`grid grid-cols-2 gap-3 sm:grid-cols-4 items-stretch ${className}`}
      ref={containerRef}
    />
  );
}
