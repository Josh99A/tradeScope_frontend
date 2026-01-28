"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import DepositAddressCard from "@/components/deposit/DepositAddressCard";
import DepositQRCode from "@/components/deposit/DepositQRCode";
import DepositAmountInput from "@/components/deposit/DepositAmountInput";
import DepositActions from "@/components/deposit/DepositActions";
import AssetIcon from "@/components/ui/AssetIcon";

type AssetItem = {
  id: number | string;
  name: string;
  symbol: string;
  network: string;
  is_active: boolean;
  icon?: string | null;
  deposit_address: string;
  deposit_qr_code: string;
  min_deposit: number | string;
  min_withdraw: number | string;
  withdraw_fee: number | string;
};

const parseAmount = (value: string) => {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatTrimmed = (value: number, maxDecimals = 8) => {
  if (!Number.isFinite(value)) return "";
  const fixed = value.toFixed(maxDecimals);
  return fixed.replace(/\.?0+$/, "");
};

const networkOrder = [
  "TRC20",
  "ERC20",
  "BEP20",
  "SOLANA",
  "BTC",
  "ETH",
  "XRP",
  "ADA",
  "DOGE",
];

const getPreferredAssetForSymbol = (assets: AssetItem[], symbol: string) => {
  const candidates = assets.filter((item) => item.symbol === symbol);
  if (candidates.length === 0) return null;
  const ranked = [...candidates].sort((a, b) => {
    const aIndex = networkOrder.indexOf(a.network);
    const bIndex = networkOrder.indexOf(b.network);
    const aRank = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
    const bRank = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
    if (aRank !== bRank) return aRank - bRank;
    return a.network.localeCompare(b.network);
  });
  return ranked[0];
};

export default function DepositModal({
  open,
  onOpenChange,
  onConfirm,
  initialAssetId,
  assets,
  prices,
  pricesLoading,
  pricesError,
  rateLimited,
  onRetryPrice,
  locked = false,
  lockMessage,
  loading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: {
    assetId: number | string;
    amount: number;
    usdAmount?: number;
  }) => void;
  initialAssetId?: number | string | null;
  assets?: AssetItem[];
  prices?: Record<string, number>;
  pricesLoading?: boolean;
  pricesError?: string | null;
  rateLimited?: boolean;
  onRetryPrice?: (symbol: string) => void;
  locked?: boolean;
  lockMessage?: string;
  loading?: boolean;
}) {
  const [assetId, setAssetId] = useState<number | string | null>(null);
  const [amount, setAmount] = useState("");
  const [usdAmount, setUsdAmount] = useState("");
  const [editingField, setEditingField] = useState<"asset" | "usd" | null>(
    null
  );
  const triedRef = useRef<string | null>(null);
  const lastPriceWarnRef = useRef<string | null>(null);
  const [touched, setTouched] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const initialFocusRef = useRef<HTMLButtonElement | null>(null);

  const activeAssets = (assets || []).filter((item) => item.is_active);
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
    if (!assetId && activeAssets.length > 0) {
      const preferred = getPreferredAssetForSymbol(activeAssets, activeAssets[0].symbol);
      setAssetId(preferred?.id ?? activeAssets[0].id);
    }
  }, [assetId, activeAssets]);

  const symbol = selectedAsset?.symbol || "";
  const numericAmount = parseAmount(amount);
  const priceUsd = symbol ? prices?.[symbol.toUpperCase()] || 0 : 0;
  const minDeposit = parseAmount(String(selectedAsset?.min_deposit || "0"));
  const assetDecimals =
    symbol === "USDT" || symbol === "USDC"
      ? 2
      : symbol === "XRP" || symbol === "DOGE"
      ? 4
      : 8;
  const isValid =
    numericAmount > 0 && numericAmount >= minDeposit && !!selectedAsset;
  const showError = touched && !isValid;
  const priceUnavailable = !priceUsd || Number.isNaN(priceUsd);

  useEffect(() => {
    if (!open || !selectedAsset || !priceUnavailable) return;
    const symbolValue = selectedAsset.symbol?.toUpperCase?.() || "";
    if (!symbolValue || lastPriceWarnRef.current === symbolValue) return;
    lastPriceWarnRef.current = symbolValue;
    console.warn("[Deposit] Live price unavailable", {
      symbol: symbolValue,
      priceUsd,
    });
  }, [open, selectedAsset, priceUnavailable, priceUsd]);

  useEffect(() => {
    if (open) {
      if (initialAssetId) {
        setAssetId(initialAssetId);
      }
      setTouched(false);
      setAmount("");
      setUsdAmount("");
      setEditingField(null);
      triedRef.current = null;
      window.setTimeout(() => {
        initialFocusRef.current?.focus();
      }, 0);
    }
  }, [open, initialAssetId]);

  useEffect(() => {
    if (!open || !priceUnavailable || !onRetryPrice || !symbol) return;
    if (triedRef.current === symbol) return;
    triedRef.current = symbol;
    onRetryPrice(symbol);
  }, [open, symbol, priceUnavailable, onRetryPrice]);

  useEffect(() => {
    if (editingField === "usd") return;
    if (!amount) {
      setUsdAmount("");
      return;
    }
    const nextAmount = parseAmount(amount);
    if (priceUsd > 0 && Number.isFinite(nextAmount)) {
      setUsdAmount(formatTrimmed(nextAmount * priceUsd, 2));
    } else {
      setUsdAmount("");
    }
  }, [symbol, priceUsd, amount, editingField]);

  useEffect(() => {
    if (editingField === "asset") return;
    if (!usdAmount) {
      setAmount("");
      return;
    }
    const nextUsd = parseAmount(usdAmount);
    if (priceUsd > 0 && Number.isFinite(nextUsd)) {
      setAmount(formatTrimmed(nextUsd / priceUsd, assetDecimals));
    }
  }, [symbol, priceUsd, usdAmount, editingField, assetDecimals]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (!open) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
      }
      if (event.key === "Tab") {
        const focusable = containerRef.current?.querySelectorAll<HTMLElement>(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-16 pb-24 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deposit-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close deposit modal"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={containerRef}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl border border-ts-border bg-ts-bg-card p-5 shadow-xl sm:max-h-[85vh] sm:rounded-2xl sm:p-6"
      >
        <div className="flex items-center justify-between">
          <h2 id="deposit-title" className="text-lg font-semibold">
            Deposit
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md border border-ts-border bg-ts-bg-main px-3 py-1 text-xs text-ts-text-muted hover:text-ts-text-main"
          >
            Close
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {locked && (
            <div className="rounded-lg border border-ts-warning/40 bg-ts-warning/10 px-3 py-2 text-sm text-ts-text-main">
              {lockMessage ||
                "You already have a pending deposit request. Please wait for admin confirmation."}
            </div>
          )}
          <section>
            <p className="text-xs uppercase tracking-wide text-ts-text-muted">
              Select asset <span className="text-ts-danger">*</span>
            </p>
            {activeAssets.length === 0 ? (
              <p className="mt-2 text-sm text-ts-text-muted">
                No active assets available.
              </p>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {symbols.map((symbol) => {
                  const asset = activeAssets.find(
                    (item) => item.symbol === symbol
                  );
                  if (!asset) return null;
                  const isActive = selectedAsset?.symbol === symbol;
                  return (
                    <button
                      key={symbol}
                      type="button"
                      onClick={() => {
                        const preferred = getPreferredAssetForSymbol(activeAssets, symbol);
                        setAssetId(preferred?.id ?? asset.id);
                      }}
                      className={`flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs transition sm:text-sm ${
                        isActive
                          ? "border-ts-primary bg-ts-primary/10 text-ts-text-main"
                          : "border-ts-border bg-ts-bg-main text-ts-text-muted hover:border-ts-primary/50"
                      }`}
                      aria-pressed={isActive}
                    >
                      <AssetIcon symbol={asset.symbol} size={28} />
                      <span className="text-xs font-semibold text-ts-text-main">
                        {asset.symbol}
                      </span>
                      <span className="sr-only">{asset.name}</span>
                    </button>
                  );
                })}
              </div>
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

          {selectedAsset && (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-[1.3fr_1fr]">
              <DepositAddressCard
                address={selectedAsset.deposit_address}
                network={selectedAsset.network}
              />
              <DepositQRCode
                asset={`${selectedAsset.symbol} (${selectedAsset.network})`}
                imageUrl={selectedAsset.deposit_qr_code}
              />
            </section>
          )}
          {selectedAsset && (
            <div className="rounded-lg border border-ts-border bg-ts-bg-main px-3 py-2 text-xs text-ts-text-muted">
              Minimum deposit:{" "}
              <span className="text-ts-text-main">
                {minDeposit}
                <span className="ml-2 inline-flex items-center">
                  <AssetIcon symbol={symbol} size={14} />
                  <span className="sr-only">{symbol}</span>
                </span>
              </span>
              {priceUsd ? (
                <span className="text-ts-text-muted">
                  {" "}
                  (~${formatTrimmed(minDeposit * priceUsd, 2)})
                </span>
              ) : null}
            </div>
          )}

          <section className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
              <DepositAmountInput
                value={amount}
                onChange={(value) => {
                  setTouched(true);
                  setEditingField("asset");
                  setAmount(value);
                }}
                error={
                  showError
                  ? `Minimum deposit is ${minDeposit}.`
                  : priceUnavailable
                  ? "Live price unavailable."
                  : undefined
                }
              />
            <div>
              <label className="text-xs text-ts-text-muted">
                Amount (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={usdAmount}
                onChange={(event) => {
                  setTouched(true);
                  setEditingField("usd");
                  setUsdAmount(event.target.value);
                }}
                placeholder={
                  priceUnavailable ? "USD price unavailable" : "Enter USD amount"
                }
                className="mt-2 w-full rounded-md bg-ts-input-bg border border-ts-input-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ts-primary"
              />
              <p className="mt-2 text-xs text-ts-text-muted">
                {pricesLoading
                  ? "Loading price..."
                  : pricesError
                  ? pricesError
                  : rateLimited
                  ? "Rate limited. Using cached price if available."
                  : priceUsd ? (
                      <span className="inline-flex items-center gap-1">
                        1
                        <AssetIcon symbol={symbol} size={14} />
                        <span className="sr-only">{symbol}</span>
                        = ${priceUsd.toFixed(2)}
                      </span>
                    )
                  : "Live price unavailable for this asset."}
              </p>
              {!pricesLoading && priceUnavailable && onRetryPrice && symbol && (
                <button
                  type="button"
                  onClick={() => onRetryPrice(symbol)}
                  className="mt-2 text-xs text-ts-primary hover:underline"
                >
                  Retry CoinCap price
                </button>
              )}
            </div>
          </section>
        </div>

        <div className="mt-6">
          <DepositActions
            onCancel={() => onOpenChange(false)}
            onConfirm={() => {
              if (loading) return;
              if (!isValid || !selectedAsset) {
                setTouched(true);
                return;
              }
              if (locked || priceUnavailable) {
                return;
              }
              const numericUsd = parseAmount(usdAmount);
              onConfirm({
                assetId: selectedAsset.id,
                amount: numericAmount,
                usdAmount: numericUsd > 0 ? numericUsd : undefined,
              });
            }}
            canConfirm={isValid && !locked && !priceUnavailable}
            loading={loading}
          />
        </div>

        <button ref={initialFocusRef} type="button" className="sr-only">
          Focus trap
        </button>
      </div>
    </div>
  );
}
