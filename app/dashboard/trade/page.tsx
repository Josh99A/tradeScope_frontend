"use client";

import { Maximize2, Minimize2, Search, ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getActiveAssets } from "@/lib/assets";
import { getPrices } from "@/lib/prices";
import { createTradeRequest, getTradeRequests } from "@/lib/trades";
import StatusBadge from "@/components/ui/StatusBadge";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import AssetIcon from "@/components/ui/AssetIcon";

declare global {
  interface Window {
    TradingView: any;
  }
}

type AssetItem = {
  id: number | string;
  name: string;
  symbol: string;
  network: string;
  is_active: boolean;
  icon?: string | null;
  min_deposit: number | string;
  min_withdraw: number | string;
};

type TradeRequestItem = {
  id?: number | string;
  symbol?: string;
  network?: string;
  side?: string;
  status?: string;
  quote_symbol?: string;
  requested_amount_asset?: number | string;
  requested_amount_usd?: number | string;
  conversion_rate_used?: number | string;
  executed_price?: number | string;
  executed_amount_asset?: number | string;
  profit_or_loss_usd?: number | string;
  admin_note?: string;
  rejection_reason?: string;
  created_at?: string;
};

const normalizeSymbol = (value: string, quote: string) => {
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) return "BINANCE:BTCUSDT";
  if (trimmed.includes(":")) return trimmed;
  const base = trimmed.replace(/[^A-Z0-9]/g, "");
  const quoteSuffix = quote.toUpperCase();
  const withQuote = /(USDT|USDC)$/.test(base)
    ? base
    : `${base}${quoteSuffix}`;
  return `BINANCE:${withQuote}`;
};

const parseSearchInput = (
  value: string,
  fallbackQuote: "USDT" | "USDC"
): { symbol: string; quote: "USDT" | "USDC" } | null => {
  const cleaned = value.trim().toUpperCase();
  if (!cleaned) return null;
  const directMatch = cleaned.match(/^([A-Z0-9]+)[\/_-]?([A-Z]{3,4})?$/);
  if (!directMatch) {
    return { symbol: cleaned, quote: fallbackQuote };
  }
  const base = directMatch[1];
  let quoteVal: "USDT" | "USDC" = fallbackQuote;
  if (directMatch[2]) {
    const up = directMatch[2].toUpperCase();
    if (up === "USDT" || up === "USDC") {
      quoteVal = up;
    }
  }
  return { symbol: `${base}${quoteVal}`, quote: quoteVal };
};

const getBaseSymbol = (value: string) => {
  return value
    .replace("BINANCE:", "")
    .replace(/(USDT|USDC)$/i, "")
    .replace(/[^A-Z0-9]/g, "")
    .toUpperCase();
};

const formatTrimmed = (value: number, maxDecimals = 8) => {
  if (!Number.isFinite(value)) return "";
  const fixed = value.toFixed(maxDecimals);
  return fixed.replace(/\.?0+$/, "");
};

const parseAmount = (value: string) => {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDate = (value?: string) => {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

type TradeSide = "buy" | "sell";

export default function TradeChart() {
  const [quote, setQuote] = useState<"USDT" | "USDC">("USDT");
  const [baseSymbol, setBaseSymbol] = useState("BTC");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [assetId, setAssetId] = useState<number | string | null>(null);

  const [side, setSide] = useState<TradeSide>("buy");
  const [amountAsset, setAmountAsset] = useState("");
  const [amountUsd, setAmountUsd] = useState("");
  const [editingField, setEditingField] = useState<"asset" | "usd" | null>(null);
  const [note, setNote] = useState("");
  const [priceMap, setPriceMap] = useState<Record<string, number>>({});
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [tradeNotice, setTradeNotice] = useState<string | null>(null);
  const [tradeSubmitting, setTradeSubmitting] = useState(false);
  const [requests, setRequests] = useState<TradeRequestItem[]>([]);
  const cachedPricesRef = useRef<Record<string, number>>({});
  const cachedPriceMetaRef = useRef<Record<string, number>>({});
  const hasLoadedRequestsRef = useRef(false);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const widgetRef = useRef<any>(null);
  const currentSymbol = normalizeSymbol(baseSymbol, quote);
  const chartKey = `${baseSymbol}-${quote}`;
  const chartContainerId = `tradescope-chart-${chartKey}`;

  const activeAssets = useMemo(
    () => assets.filter((item) => item.is_active),
    [assets]
  );
  const symbols = useMemo(() => {
    const set = new Set(activeAssets.map((item) => item.symbol));
    return Array.from(set);
  }, [activeAssets]);
  const selectedAsset = useMemo(
    () => activeAssets.find((item) => String(item.id) === String(assetId)),
    [activeAssets, assetId]
  );
  const networksForSymbol = useMemo(() => {
    if (!selectedAsset) return [];
    return activeAssets.filter((item) => item.symbol === selectedAsset.symbol);
  }, [activeAssets, selectedAsset]);
  const availableNetworks = useMemo(() => {
    const set = new Set(networksForSymbol.map((item) => item.network));
    return Array.from(set);
  }, [networksForSymbol]);

  useEffect(() => {
    const loadAssets = async () => {
      setAssetsLoading(true);
      setAssetsError(null);
      try {
        const data = await getActiveAssets();
        const list = Array.isArray(data) ? data : data?.items || data?.results || [];
        setAssets(list);
        if (!assetId && list.length > 0) {
          setAssetId(list[0].id);
          setBaseSymbol(list[0].symbol);
        }
      } catch {
        const message = "Unable to load assets.";
        setAssetsError(message);
        toast.error(message);
      } finally {
        setAssetsLoading(false);
      }
    };
    loadAssets();
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("ts_prices_cache");
      const metaRaw = window.localStorage.getItem("ts_prices_cache_meta");
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, number>;
        if (parsed && typeof parsed === "object") {
          cachedPricesRef.current = parsed;
          setPriceMap((prev) => ({ ...parsed, ...prev }));
        }
      }
      if (metaRaw) {
        const parsedMeta = JSON.parse(metaRaw) as Record<string, number>;
        if (parsedMeta && typeof parsedMeta === "object") {
          cachedPriceMetaRef.current = parsedMeta;
        }
      }
    } catch {
      // ignore cache read errors
    }
  }, []);

  useEffect(() => {
    if (selectedAsset) {
      setBaseSymbol(selectedAsset.symbol);
    }
  }, [selectedAsset]);

  useEffect(() => {
    if (!activeAssets.length) return;
    if (selectedAsset && selectedAsset.symbol === baseSymbol) return;
    const match = activeAssets.find((item) => item.symbol === baseSymbol);
    if (match) {
      setAssetId(match.id);
    }
  }, [baseSymbol, activeAssets, selectedAsset]);

  const loadTradeRequests = async () => {
    try {
      const data = await getTradeRequests();
      const list = Array.isArray(data) ? data : data?.items || data?.results || [];
      setRequests(list);
      const cacheKey = "ts_trade_status_cache";
      const buildStatusMap = (items: TradeRequestItem[]) => {
        const map: Record<string, string> = {};
        items.forEach((item) => {
          if (item.id === undefined || item.id === null) return;
          const key = String(item.id);
          const status = String(item.status || "").toUpperCase();
          if (key && status) {
            map[key] = status;
          }
        });
        return map;
      };
      const readCache = () => {
        try {
          const raw = window.localStorage.getItem(cacheKey);
          if (!raw) return {};
          const parsed = JSON.parse(raw) as Record<string, string>;
          return parsed && typeof parsed === "object" ? parsed : {};
        } catch {
          return {};
        }
      };
      const writeCache = (map: Record<string, string>) => {
        try {
          window.localStorage.setItem(cacheKey, JSON.stringify(map));
        } catch {
          // ignore cache write errors
        }
      };

      const prevMap = readCache();
      const nextMap = buildStatusMap(list);

      if (hasLoadedRequestsRef.current) {
        list.forEach((item: { id: null | undefined; status: any; symbol: any; side: any; }) => {
          if (item.id === undefined || item.id === null) return;
          const key = String(item.id);
          const nextStatus = String(item.status || "").toUpperCase();
          const prevStatus = prevMap[key];
          if (!prevStatus || prevStatus === nextStatus) return;
          const symbol = item.symbol ? String(item.symbol).toUpperCase() : "";
          const side = item.side ? String(item.side).toUpperCase() : "TRADE";
          if (nextStatus === "EXECUTED") {
            toast.success(
              `Trade executed: ${side}${symbol ? ` ${symbol}` : ""}.`
            );
          } else if (nextStatus === "REJECTED") {
            toast.error(
              `Trade rejected: ${side}${symbol ? ` ${symbol}` : ""}.`
            );
          } else if (nextStatus === "CANCELLED") {
            toast.error(
              `Trade cancelled: ${side}${symbol ? ` ${symbol}` : ""}.`
            );
          }
        });
      }

      writeCache(nextMap);
      hasLoadedRequestsRef.current = true;
    } catch {
      toast.error("Unable to load trade requests.");
    }
  };

  useEffect(() => {
    loadTradeRequests();
  }, []);

  useEffect(() => {
    const symbolParam = searchParams.get("symbol");
    const quoteParam = searchParams.get("quote");
    if (quoteParam === "USDC" || quoteParam === "USDT") {
      setQuote((prev) => (prev === quoteParam ? prev : quoteParam));
    }
    if (!symbolParam) return;
    setBaseSymbol(getBaseSymbol(symbolParam));
  }, [searchParams]);

  useEffect(() => {
    if (!selectedAsset) return;
    const symbol = selectedAsset.symbol.toUpperCase();
    const cached = cachedPricesRef.current[symbol];
    const cachedAt = cachedPriceMetaRef.current[symbol] || 0;
    const now = Date.now();
    const cacheFresh = cached && now - cachedAt < 5 * 60 * 1000;
    if (cacheFresh) {
      setPriceMap((prev) => ({ ...prev, [symbol]: cached }));
      return;
    }
    const loadPrice = async () => {
      setPriceLoading(true);
      setPriceError(null);
      try {
        const data = await getPrices([symbol]);
        const nextPrices = data?.prices || {};
        setPriceMap((prev) => ({ ...prev, ...nextPrices }));
        if (Object.keys(nextPrices).length > 0) {
          cachedPricesRef.current = {
            ...cachedPricesRef.current,
            ...nextPrices,
          };
          cachedPriceMetaRef.current = {
            ...cachedPriceMetaRef.current,
            [symbol]: Date.now(),
          };
          try {
            window.localStorage.setItem(
              "ts_prices_cache",
              JSON.stringify(cachedPricesRef.current)
            );
            window.localStorage.setItem(
              "ts_prices_cache_meta",
              JSON.stringify(cachedPriceMetaRef.current)
            );
          } catch {
            // ignore cache write errors
          }
        }
      } catch {
        const message = "Unable to load live price.";
        setPriceError(message);
        toast.error(message);
        if (cachedPricesRef.current[symbol]) {
          setPriceMap((prev) => ({
            ...prev,
            [symbol]: cachedPricesRef.current[symbol],
          }));
        }
      } finally {
        setPriceLoading(false);
      }
    };
    loadPrice();
  }, [selectedAsset]);

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

    if (widgetRef.current) {
      try {
        widgetRef.current.remove();
      } catch {
        // ignore
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
    const nextQuote = parsed.quote;
    setQuote(nextQuote);
    applySymbol(parsed.symbol, nextQuote);
    setSearchTerm("");
  };

  const priceUsd = selectedAsset
    ? priceMap[selectedAsset.symbol.toUpperCase()] || 0
    : 0;
  const priceUnavailable = !priceUsd || Number.isNaN(priceUsd);

  useEffect(() => {
    if (editingField === "usd") return;
    if (!amountAsset) {
      setAmountUsd("");
      return;
    }
    const nextAmount = parseAmount(amountAsset);
    if (priceUsd > 0 && Number.isFinite(nextAmount)) {
      setAmountUsd(formatTrimmed(nextAmount * priceUsd, 2));
    }
  }, [amountAsset, priceUsd, editingField]);

  useEffect(() => {
    if (editingField === "asset") return;
    if (!amountUsd) {
      setAmountAsset("");
      return;
    }
    const nextUsd = parseAmount(amountUsd);
    if (priceUsd > 0 && Number.isFinite(nextUsd)) {
      setAmountAsset(formatTrimmed(nextUsd / priceUsd, 8));
    }
  }, [amountUsd, priceUsd, editingField]);

  const minBuy = selectedAsset ? Number(selectedAsset.min_deposit || 0) : 0;
  const minSell = selectedAsset ? Number(selectedAsset.min_withdraw || 0) : 0;
  const numericAsset = parseAmount(amountAsset);
  const canSubmit =
    !!selectedAsset &&
    numericAsset > 0 &&
    !priceUnavailable &&
    (side === "buy" ? numericAsset >= minBuy : numericAsset >= minSell);

  const handleTradeSubmit = async () => {
    if (tradeSubmitting) return;
    if (!selectedAsset) return;
    setTradeNotice(null);
    if (!canSubmit) {
      const message = "Check the trade amount and live price.";
      setTradeNotice(message);
      toast.error(message);
      return;
    }
    setTradeSubmitting(true);
    try {
      await createTradeRequest({
        asset_id: selectedAsset.id,
        side: side.toUpperCase(),
        requested_amount_asset: numericAsset,
        requested_amount_usd: parseAmount(amountUsd),
        conversion_rate_used: Number(priceUsd.toFixed(8)),
        quote_symbol: quote,
        user_note: note,
      });
      setAmountAsset("");
      setAmountUsd("");
      setNote("");
      setEditingField(null);
      setTradeNotice("Trade request submitted for admin review.");
      toast.success("Trade request submitted for admin review.");
      loadTradeRequests();
    } catch (err) {
      const message =
        typeof (err as any)?.message === "string" && (err as any).message.trim().length > 0
          ? (err as any).message
          : "Unable to submit trade request.";
      setTradeNotice(message);
      toast.error(message);
    } finally {
      setTradeSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "rounded-xl border border-ts-border bg-ts-bg-card overflow-hidden",
          isFullscreen && "fixed inset-0 z-50 rounded-none"
        )}
      >
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
              <h2 className="flex items-center font-semibold text-sm">
                <AssetIcon symbol={getBaseSymbol(currentSymbol)} size={18} />
                <span className="sr-only">
                  {currentSymbol.replace("BINANCE:", "")}
                </span>
              </h2>
            </div>
            <p className="text-xs text-ts-text-muted">Crypto Market</p>
          </div>

          <div className="flex w-full flex-wrap gap-2 items-center sm:w-auto sm:flex-nowrap">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-ts-text-muted">
                Quote currency
              </p>
              <div className="mt-1 grid w-full grid-cols-3 items-center gap-1 rounded-md border border-ts-border bg-ts-bg-main p-1 sm:flex sm:w-auto">
              {(["USDT", "USDC"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => applySymbol(baseSymbol, item)}
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
              <p className="mt-1 text-[11px] text-ts-text-muted">
                Tap to change the quote price used for orders.
              </p>
            </div>
            <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[160px] sm:flex-none">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-ts-text-muted" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search asset"
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

        <div className="px-4 py-3 flex gap-2 flex-wrap border-b border-ts-border">
          {symbols.slice(0, 6).map((symbol) => (
            <button
              key={symbol}
              onClick={() => applySymbol(symbol, quote)}
              className={cn(
                "px-3 py-1 rounded-full text-xs transition",
                getBaseSymbol(currentSymbol) === getBaseSymbol(symbol)
                  ? "bg-ts-primary text-white"
                  : "bg-ts-hover text-ts-text-main hover:bg-ts-active"
              )}
            >
              <AssetIcon symbol={symbol} size={16} />
              <span className="sr-only">
                {normalizeSymbol(symbol, quote).replace("BINANCE:", "")}
              </span>
            </button>
          ))}
        </div>

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
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-ts-text-main">Request a trade</h2>
          <span className="text-xs text-ts-text-muted">
            {assetsLoading ? "Loading assets..." : `${symbols.length} assets`}
          </span>
        </div>

        {assetsError && (
          <p className="mt-2 text-sm text-ts-danger">{assetsError}</p>
        )}
        

        <div className="mt-4 space-y-4">
          <section>
            <p className="text-xs uppercase tracking-wide text-ts-text-muted">
              Select asset
            </p>
            {selectedAsset ? (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <button
                  key={selectedAsset.symbol}
                  type="button"
                  onClick={() => setAssetId(selectedAsset.id)}
                  className="flex min-w-0 items-center gap-2 rounded-lg border border-ts-primary bg-ts-primary/10 px-3 py-2 text-xs text-ts-text-main transition sm:text-sm"
                >
                  <AssetIcon symbol={selectedAsset.symbol} size={28} />
                  <span className="sr-only">
                    {selectedAsset.name} ({selectedAsset.symbol})
                  </span>
                </button>
              </div>
            ) : (
              <p className="mt-2 text-sm text-ts-text-muted">
                No active asset selected.
              </p>
            )}
          </section>

          {selectedAsset && (
            <section>
              <label className="text-xs uppercase tracking-wide text-ts-text-muted">
                Network <span className="text-ts-danger">*</span>
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {networksForSymbol.map((item) => {
                  const isActive = String(item.id) === String(assetId);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAssetId(item.id)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                        isActive
                          ? "border-ts-primary bg-ts-primary text-white"
                          : "border-ts-border bg-ts-bg-main text-ts-text-muted hover:text-ts-text-main"
                      }`}
                    >
                      {item.network}
                    </button>
                  );
                })}
              </div>
              {availableNetworks.length > 0 && (
                <p className="mt-2 text-xs text-ts-text-muted">
                  Supported networks: {availableNetworks.join(", ")}
                </p>
              )}
            </section>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSide("buy")}
                className={cn(
                  "py-2 rounded-md text-sm font-medium transition",
                  side === "buy" ? "bg-ts-success text-white" : "bg-ts-hover"
                )}
              >
                Buy
              </button>
              <button
                onClick={() => setSide("sell")}
                className={cn(
                  "py-2 rounded-md text-sm font-medium transition",
                  side === "sell" ? "bg-ts-danger text-white" : "bg-ts-hover"
                )}
              >
                Sell
              </button>
            </div>

            <div>
              <label className="text-xs text-ts-text-muted">Amount (Asset) <span className="text-ts-danger">*</span></label>
              <input
                type="number"
                value={amountAsset}
                required
                onChange={(e) => {
                  setEditingField("asset");
                  setAmountAsset(e.target.value);
                }}
                className="mt-1 w-full px-3 py-2 rounded-md bg-ts-input-bg border border-ts-input-border focus:outline-none"
                placeholder="Enter amount"
              />
              {selectedAsset && (
                <p className="mt-2 text-xs text-ts-text-muted">
                  Minimum {side === "buy" ? "buy" : "sell"}:{" "}
                  <span className="text-ts-text-main">
                    {side === "buy" ? minBuy : minSell}
                  </span>
                  <span className="ml-2 inline-flex items-center">
                    <AssetIcon symbol={selectedAsset.symbol} size={16} />
                    <span className="sr-only">{selectedAsset.symbol}</span>
                  </span>
                  {priceUsd ? (
                    <span className="text-ts-text-muted">
                      {" "}
                      (~$
                      {formatTrimmed(
                        (side === "buy" ? minBuy : minSell) * priceUsd,
                        2
                      )}
                      )
                    </span>
                  ) : null}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs text-ts-text-muted">Amount (USD) <span className="text-ts-danger">*</span></label>
              <input
                type="number"
                value={amountUsd}
                required
                onChange={(e) => {
                  setEditingField("usd");
                  setAmountUsd(e.target.value);
                }}
                className="mt-1 w-full px-3 py-2 rounded-md bg-ts-input-bg border border-ts-input-border focus:outline-none"
                placeholder={priceUnavailable ? "Price unavailable" : "Enter USD amount"}
              />
              <p className="mt-2 text-xs text-ts-text-muted">
                {priceLoading
                  ? "Loading price..."
                  : priceError
                  ? priceError
                  : priceUsd ? (
                      <span className="inline-flex items-center gap-1">
                        1
                        <AssetIcon symbol={selectedAsset?.symbol} size={14} />
                        <span className="sr-only">{selectedAsset?.symbol}</span>
                        = ${priceUsd.toFixed(2)}
                      </span>
                    )
                  : "Live price unavailable."}
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-ts-text-muted">Notes (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm"
                placeholder="Instructions for admin (optional)"
              />
            </div>
          </div>

          {tradeNotice && (
            <p className="text-sm text-ts-text-muted">{tradeNotice}</p>
          )}

          <Button
            type="button"
            onClick={handleTradeSubmit}
            disabled={!canSubmit || tradeSubmitting}
            className={cn(
              "w-full py-3 rounded-lg text-white font-medium transition",
              side === "buy"
                ? "bg-ts-success hover:opacity-90"
                : "bg-ts-danger hover:opacity-90",
              (!canSubmit || tradeSubmitting) && "opacity-60 cursor-not-allowed"
            )}
          >
            {tradeSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>Submit {side.toUpperCase()} request</>
            )}
          </Button>
        </div>
      </Card>

      <Card id="my-requests" className="scroll-mt-20">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-ts-text-main">My trade requests</h2>
          <span className="text-xs text-ts-text-muted">
            {requests.length} requests
          </span>
        </div>

        {requests.length === 0 ? (
          <p className="mt-4 text-sm text-ts-text-muted">
            No trade requests yet.
          </p>
        ) : (
          <>
            <div className="mt-4 hidden md:block overflow-x-auto">
              <table className="w-full min-w-[960px] text-sm">
                <thead className="text-xs uppercase text-ts-text-muted border-b border-ts-border">
                  <tr>
                    <th className="py-2 text-left font-medium">Date</th>
                    <th className="py-2 text-left font-medium">Side</th>
                    <th className="py-2 text-left font-medium">Asset</th>
                    <th className="py-2 text-left font-medium">Amount</th>
                    <th className="py-2 text-left font-medium">USD</th>
                    <th className="py-2 text-left font-medium">Status</th>
                    <th className="py-2 text-left font-medium">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ts-border">
                  {requests.map((item, index) => (
                    <tr key={item.id ?? index}>
                      <td className="py-3 pr-4">{formatDate(item.created_at)}</td>
                    <td className="py-3 pr-4">{item.side}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <AssetIcon symbol={item.symbol} size={18} />
                        <span className="sr-only">
                          {item.symbol} {item.network ? `(${item.network})` : ""}
                        </span>
                      </div>
                    </td>
                      <td className="py-3 pr-4">{item.requested_amount_asset}</td>
                      <td className="py-3 pr-4">{item.requested_amount_usd}</td>
                      <td className="py-3 pr-4">
                        <StatusBadge value={item.status} />
                      </td>
                      <td className="py-3 pr-4 text-xs text-ts-text-muted">
                        {item.status === "EXECUTED" && (
                          <>
                            <p>Executed: {item.executed_amount_asset}</p>
                            <p>Price: {item.executed_price}</p>
                            <p>P/L: {item.profit_or_loss_usd}</p>
                            {item.admin_note && <p>Note: {item.admin_note}</p>}
                          </>
                        )}
                        {item.status === "REJECTED" && item.rejection_reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 grid gap-3 md:hidden">
              {requests.map((item, index) => (
                <div
                  key={item.id ?? index}
                  className="rounded-lg border border-ts-border bg-ts-bg-main p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-ts-text-muted">
                        {formatDate(item.created_at)}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-ts-text-main">
                        {item.side}
                        <span className="ml-2 inline-flex items-center gap-2">
                          <AssetIcon symbol={item.symbol} size={18} />
                          <span className="sr-only">{item.symbol}</span>
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-ts-text-muted">
                        {item.requested_amount_asset} ({item.requested_amount_usd} USD)
                      </p>
                    </div>
                    <StatusBadge value={item.status} />
                  </div>
                  {item.status === "EXECUTED" && (
                    <div className="mt-2 text-xs text-ts-text-muted">
                      <p>Executed: {item.executed_amount_asset}</p>
                      <p>Price: {item.executed_price}</p>
                      <p>P/L: {item.profit_or_loss_usd}</p>
                      {item.admin_note && <p>Note: {item.admin_note}</p>}
                    </div>
                  )}
                  {item.status === "REJECTED" && item.rejection_reason && (
                    <p className="mt-2 text-xs text-ts-danger">
                      {item.rejection_reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
