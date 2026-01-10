"use client";

import { Maximize2, Minimize2, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

declare global {
  interface Window {
    TradingView: any;
  }
}

const POPULAR_CRYPTOS = [
  { symbol: "BTCUSD", name: "Bitcoin" },
  { symbol: "ETHUSD", name: "Ethereum" },
  { symbol: "BNBUSD", name: "BNB" },
  { symbol: "SOLUSD", name: "Solana" },
  { symbol: "ADAUSD", name: "Cardano" },
];

type TradeSide = "buy" | "sell";

export default function TradeChart() {
  const [currentSymbol, setCurrentSymbol] = useState("BTCUSD");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const { theme } = useTheme();

  // Trade state
  const [side, setSide] = useState<TradeSide>("buy");
  const [amount, setAmount] = useState("");

  const chartContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const widgetRef = useRef<any>(null);

  /* ================= LOAD TRADINGVIEW ================= */

  useEffect(() => {
    if (window.TradingView) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!isScriptLoaded || !chartContainerRef.current) return;


  // ✅ Destroy previous widget safely
  if (widgetRef.current) {
    try {
      widgetRef.current.remove();
    } catch {
      // TradingView sometimes throws internally – ignore safely
    }
    widgetRef.current = null;
  }

  widgetRef.current = new window.TradingView.widget({
    autosize: true,
    symbol: currentSymbol,
    container_id: chartContainerRef.current.id,
    interval: "15",
    timezone: "Etc/UTC",
    theme: theme === "dark" ? "dark" : "light",
    style: "1",
    locale: "en",
    enable_publishing: false,
    hide_top_toolbar: false,
    hide_legend: false,
    save_image: false,
  });

  return () => {
    if (widgetRef.current) {
      try {
        widgetRef.current.remove();
      } catch {}
      widgetRef.current = null;
    }
  };
}, [isScriptLoaded, currentSymbol, theme]);

  /* ================= HANDLERS ================= */

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const symbol = searchTerm.toUpperCase().endsWith("USD")
      ? searchTerm.toUpperCase()
      : `${searchTerm.toUpperCase()}USD`;

    setCurrentSymbol(symbol);
    setSearchTerm("");
  };

  const handleTradeSubmit = () => {
    if (!amount) return;

    const payload = {
      symbol: currentSymbol,
      side,
      amount: Number(amount),
    };

    // 🔗 Will be sent to Django later
    console.log("TRADE PAYLOAD:", payload);

    alert(`${side.toUpperCase()} order placed (demo)`);
    setAmount("");
  };

  /* ================= UI ================= */

  return (
    <div
      className={cn(
        "rounded-xl border border-ts-border bg-ts-bg-card overflow-hidden",
        isFullscreen && "fixed inset-0 z-50 rounded-none"
      )}
    >
      {/* HEADER */}
      <div className="px-4 py-3 border-b border-ts-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-sm">{currentSymbol}</h2>
          <p className="text-xs text-ts-text-muted">
            Crypto Market
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-ts-text-muted" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="BTC, ETH..."
              className="pl-8 pr-3 py-2 text-sm rounded-md bg-ts-input-bg border border-ts-input-border focus:outline-none"
            />
          </form>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-md hover:bg-ts-hover"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* QUICK SYMBOLS */}
      <div className="px-4 py-3 flex gap-2 flex-wrap border-b border-ts-border">
        {POPULAR_CRYPTOS.map((c) => (
          <button
            key={c.symbol}
            onClick={() => setCurrentSymbol(c.symbol)}
            className={cn(
              "px-3 py-1 rounded-full text-xs transition",
              currentSymbol === c.symbol
                ? "bg-ts-primary text-white"
                : "bg-ts-hover text-ts-text-main hover:bg-ts-active"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* CHART */}
      <div className={cn(isFullscreen ? "h-[70vh]" : "h-[420px]")}>
        <div
          ref={chartContainerRef}
          id="tradescope-chart"
          className="w-full h-full"
        />
      </div>

      {/* TRADE PANEL */}
      <div className="border-t border-ts-border px-4 py-4 space-y-4">
        {/* Buy / Sell */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSide("buy")}
            className={cn(
              "py-2 rounded-md text-sm font-medium transition",
              side === "buy"
                ? "bg-ts-success text-white"
                : "bg-ts-hover"
            )}
          >
            Buy
          </button>
          <button
            onClick={() => setSide("sell")}
            className={cn(
              "py-2 rounded-md text-sm font-medium transition",
              side === "sell"
                ? "bg-ts-danger text-white"
                : "bg-ts-hover"
            )}
          >
            Sell
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs text-ts-text-muted">
            Amount (USD)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-md bg-ts-input-bg border border-ts-input-border focus:outline-none"
            placeholder="Enter amount"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleTradeSubmit}
          className={cn(
            "w-full py-3 rounded-lg text-white font-medium transition",
            side === "buy"
              ? "bg-ts-success hover:opacity-90"
              : "bg-ts-danger hover:opacity-90"
          )}
        >
          Place {side.toUpperCase()} Order
        </button>
      </div>
    </div>
  );
}
