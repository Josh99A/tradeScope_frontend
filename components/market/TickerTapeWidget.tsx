"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTheme } from "next-themes";

const DEFAULT_SYMBOLS = [
  { proName: "BINANCE:BTCUSDT", title: "Bitcoin" },
  { proName: "BINANCE:ETHUSDT", title: "Ethereum" },
  { proName: "BINANCE:SOLUSDT", title: "Solana" },
  { proName: "BINANCE:XRPUSDT", title: "XRP" },
  { proName: "BINANCE:ADAUSDT", title: "Cardano" },
  { proName: "BINANCE:AVAXUSDT", title: "Avalanche" },
  { proName: "BINANCE:DOTUSDT", title: "Polkadot" },
  { proName: "BINANCE:LINKUSDT", title: "Chainlink" },
];

export default function TickerTapeWidget({
  symbols = DEFAULT_SYMBOLS,
  className = "",
}: {
  symbols?: { proName: string; title?: string }[];
  className?: string;
}) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resolvedTheme = theme === "dark" ? "dark" : "light";
  const config = useMemo(
    () => ({
      symbols,
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: resolvedTheme,
      locale: "en",
    }),
    [symbols, resolvedTheme]
  );

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.type = "text/javascript";
    script.text = JSON.stringify(config);
    containerRef.current.appendChild(script);
  }, [config]);

  return (
    <div
      className={`rounded-xl border border-ts-border bg-ts-bg-card/60 ${className}`}
    >
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
