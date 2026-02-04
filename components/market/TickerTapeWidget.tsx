"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [mounted, setMounted] = useState(false);
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

  const symbolsAttr = useMemo(
    () => symbols.map((item) => item.proName).join(","),
    [symbols]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    if (
      typeof document !== "undefined" &&
      !document.querySelector('script[data-tradingview-ticker-tape="true"]')
    ) {
      const script = document.createElement("script");
      script.src = "https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js";
      script.type = "module";
      script.async = true;
      script.setAttribute("data-tradingview-ticker-tape", "true");
      document.head.appendChild(script);
    }

    const widget = document.createElement("tv-ticker-tape");
    widget.setAttribute("symbols", symbolsAttr);
    widget.setAttribute("color-theme", resolvedTheme);
    widget.setAttribute("display-mode", "adaptive");
    widget.setAttribute("show-symbol-logo", "true");
    widget.setAttribute("locale", "en");
    if (config.isTransparent) {
      widget.setAttribute("is-transparent", "true");
    }
    containerRef.current.appendChild(widget);
  }, [config, mounted, resolvedTheme, symbolsAttr]);

  return (
    <div
      className={`rounded-xl border border-ts-border bg-ts-bg-card/60 ${className}`}
    >
      <div className="tradingview-widget-container">
        <div
          ref={containerRef}
          className="tradingview-widget-container__widget"
        />
      </div>
    </div>
  );
}
