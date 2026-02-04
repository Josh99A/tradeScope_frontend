"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";

export default function SymbolInfoWidget({
  symbol = "BINANCE:BTCUSDT",
  className = "",
}: {
  symbol?: string;
  className?: string;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const colorTheme = resolvedTheme === "dark" ? "dark" : "light";
  const config = useMemo(
    () => ({
      symbol,
      width: "100%",
      locale: "en",
      colorTheme,
      isTransparent: false,
    }),
    [symbol, colorTheme]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js";
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify(config);
    containerRef.current.appendChild(script);
  }, [config, mounted]);

  return (
    <section
      className={`rounded-xl border border-ts-border bg-ts-bg-card/60 ${className}`}
      aria-label="Symbol info"
    >
      <div className="tradingview-widget-container">
        <div
          ref={containerRef}
          className="tradingview-widget-container__widget"
        />
        <div className="tradingview-widget-copyright text-[10px] text-ts-text-muted px-2 pb-2">
          <a
            href={`https://www.tradingview.com/symbols/${symbol.replace(":", "-")}/`}
            rel="noopener nofollow"
            target="_blank"
            className="text-ts-primary hover:underline"
          >
            {symbol} performance
          </a>{" "}
          <span className="text-ts-text-muted">by TradingView</span>
        </div>
      </div>
    </section>
  );
}
