"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTheme } from "next-themes";

export default function SymbolInfoWidget({
  symbol = "BINANCE:BTCUSDT",
  className = "",
}: {
  symbol?: string;
  className?: string;
}) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resolvedTheme = theme === "dark" ? "dark" : "light";
  const config = useMemo(
    () => ({
      symbol,
      width: "100%",
      locale: "en",
      colorTheme: resolvedTheme,
      isTransparent: true,
    }),
    [symbol, resolvedTheme]
  );

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js";
    script.async = true;
    script.type = "text/javascript";
    script.text = JSON.stringify(config);
    containerRef.current.appendChild(script);
  }, [config]);

  return (
    <section
      className={`rounded-xl border border-ts-border bg-ts-bg-card/60 ${className}`}
      aria-label="Symbol info"
    >
      <div ref={containerRef} className="w-full" />
    </section>
  );
}
