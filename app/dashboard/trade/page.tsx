"use client";

import { Maximize2, Minimize2, Search, ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

declare global {
  interface Window {
    TradingView: any;
  }
}

const POPULAR_CRYPTOS = [
  { symbol: "BTCUSDT", name: "Bitcoin" },
  { symbol: "ETHUSDT", name: "Ethereum" },
  { symbol: "BNBUSDT", name: "BNB" },
  { symbol: "SOLUSDT", name: "Solana" },
  { symbol: "ADAUSDT", name: "Cardano" },
];

const normalizeSymbol = (value: string, quote: string) => {
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) return "BINANCE:BTCUSDT";
  if (trimmed.includes(":")) return trimmed;
  const base = trimmed.replace(/[^A-Z0-9]/g, "");
  const quoteSuffix = quote.toUpperCase();
  const withQuote = /(USDT|USDC|USD)$/.test(base)
    ? base
    : `${base}${quoteSuffix}`;
  return `BINANCE:${withQuote}`;
};

const parseSearchInput = (
  value: string,
  fallbackQuote: "USDT" | "USDC" | "USD"
): { symbol: string; quote: "USDT" | "USDC" | "USD" } | null => {
  const cleaned = value.trim().toUpperCase();
  if (!cleaned) return null;
  const directMatch = cleaned.match(/^([A-Z0-9]+)[\/_-]?([A-Z]{3,4})?$/);
  if (!directMatch) {
    return { symbol: cleaned, quote: fallbackQuote };
  }
  const base = directMatch[1];
  let quoteVal: "USDT" | "USDC" | "USD" = fallbackQuote;
  if (directMatch[2]) {
    const up = directMatch[2].toUpperCase();
    if (up === "USDT" || up === "USDC" || up === "USD") {
      quoteVal = up;
    }
  }
  return { symbol: `${base}${quoteVal}`, quote: quoteVal };
};

const getBaseSymbol = (value: string) => {
  return value
    .replace("BINANCE:", "")
    .replace(/(USDT|USDC|USD)$/i, "")
    .replace(/[^A-Z0-9]/g, "")
    .toUpperCase();
};

type TradeSide = "buy" | "sell";

export default function TradeChart() {
  const [quote, setQuote] = useState<"USDT" | "USDC" | "USD">("USDT");
  const [baseSymbol, setBaseSymbol] = useState("BTC");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Trade state
  const [side, setSide] = useState<TradeSide>("buy");
  const [amount, setAmount] = useState("");

  const chartContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const widgetRef = useRef<any>(null);
  const currentSymbol = normalizeSymbol(baseSymbol, quote);
  const chartKey = `${baseSymbol}-${quote}`;
  const chartContainerId = `tradescope-chart-${chartKey}`;

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
    const symbolParam = searchParams.get("symbol");
    const quoteParam = searchParams.get("quote");
    if (quoteParam === "USDC" || quoteParam === "USD" || quoteParam === "USDT") {
      setQuote(quoteParam);
    }
    if (!symbolParam) return;
    setBaseSymbol(getBaseSymbol(symbolParam));
  }, [searchParams, quote]);

  useEffect(() => {
    if (!isScriptLoaded || !chartContainerRef.current) return;

    // Destroy previous widget safely
    if (widgetRef.current) {
      try {
        widgetRef.current.remove();
      } catch {
        // TradingView sometimes throws internally, ignore safely
      }
      widgetRef.current = null;
    }

    chartContainerRef.current.innerHTML = "";

    widgetRef.current = new window.TradingView.widget({
      autosize: true,
      symbol: currentSymbol,
      container_id: chartContainerId,
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
  }, [isScriptLoaded, currentSymbol, theme, chartContainerId]);

  /* ================= HANDLERS ================= */

  const applySymbol = (symbol: string, nextQuote = quote) => {
    const base = getBaseSymbol(symbol);
    setBaseSymbol(base);
    const normalized = normalizeSymbol(base, nextQuote);
    const nextUrl = `/dashboard/trade?symbol=${normalized.replace("BINANCE:", "")}&quote=${nextQuote}`;
    router.replace(nextUrl);
    window.location.assign(nextUrl);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    const parsed = parseSearchInput(searchTerm, quote);
    if (!parsed) return;
    if (parsed.quote === "USDT" || parsed.quote === "USDC" || parsed.quote === "USD") {
      setQuote(parsed.quote as "USDT" | "USDC" | "USD");
    }
    applySymbol(parsed.symbol, parsed.quote);
    setSearchTerm("");
  };

  const handleTradeSubmit = () => {
    if (!amount) return;

    const payload = {
      symbol: currentSymbol,
      side,
      amount: Number(amount),
    };

    // Will be sent to Django later
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
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-xs text-ts-text-muted hover:text-ts-text-main"
            >
              <ArrowLeft size={14} />
              Dashboard
            </Link>
            <h2 className="font-semibold text-sm">
              {currentSymbol.replace("BINANCE:", "")}
            </h2>
          </div>
          <p className="text-xs text-ts-text-muted">
            Crypto Market
          </p>
        </div>

        <div className="flex w-full flex-wrap gap-2 items-center sm:w-auto sm:flex-nowrap">
          <div className="grid w-full grid-cols-3 items-center gap-1 rounded-md border border-ts-border bg-ts-bg-main p-1 sm:flex sm:w-auto">
            {(["USDT", "USDC", "USD"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setQuote(item)}
                className={cn(
                  "px-2 py-1 text-xs rounded-md transition",
                  quote === item
                    ? "bg-ts-primary text-white"
                    : "text-ts-text-muted hover:text-ts-text-main"
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[160px] sm:flex-none">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-ts-text-muted" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="BTC, ETH..."
              className="w-full pl-8 pr-3 py-2 text-sm rounded-md bg-ts-input-bg border border-ts-input-border focus:outline-none"
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
            onClick={() => applySymbol(getBaseSymbol(c.symbol), quote)}
            className={cn(
              "px-3 py-1 rounded-full text-xs transition",
              getBaseSymbol(currentSymbol) === getBaseSymbol(c.symbol)
                ? "bg-ts-primary text-white"
                : "bg-ts-hover text-ts-text-main hover:bg-ts-active"
            )}
          >
            {normalizeSymbol(getBaseSymbol(c.symbol), quote).replace(
              "BINANCE:",
              ""
            )}
          </button>
        ))}
      </div>

      {/* CHART */}
      <div
        className={cn(
          isFullscreen ? "h-[70vh] sm:h-[75vh]" : "h-[320px] sm:h-[420px]"
        )}
      >
        <div
          key={chartKey}
          ref={chartContainerRef}
          id={chartContainerId}
          className="w-full h-full"
        />
      </div>

      {/* TRADE PANEL */}
      <div className="border-t border-ts-border px-4 py-4">
        <div className="grid gap-4 sm:grid-cols-2">
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
            "w-full py-3 rounded-lg text-white font-medium transition sm:col-span-2",
            side === "buy"
              ? "bg-ts-success hover:opacity-90"
              : "bg-ts-danger hover:opacity-90"
          )}
        >
          Place {side.toUpperCase()} Order
        </button>
        </div>
      </div>
    </div>
  );
}
