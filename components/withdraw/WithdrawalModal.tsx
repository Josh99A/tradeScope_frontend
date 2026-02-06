"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";
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

export type WithdrawalPayload = {
  assetId: number | string;
  amount: number;
  fee: number;
  address: string;
  network: string;
  usdAmount?: number;
  proof?: File | null;
};

export default function WithdrawalModal({
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
  onConfirm: (payload: WithdrawalPayload) => void;
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
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [usdAmount, setUsdAmount] = useState("");
  const [editingField, setEditingField] = useState<"asset" | "usd" | null>(
    null
  );
  const triedRef = useRef<string | null>(null);
  const lastPriceWarnRef = useRef<string | null>(null);
  const [proof, setProof] = useState<File | null>(null);
  const [touched, setTouched] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const initialFocusRef = useRef<HTMLButtonElement | null>(null);
  const isBusy = loading;

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
  const minWithdraw = parseAmount(String(selectedAsset?.min_withdraw || "0"));
  const fee = parseAmount(String(selectedAsset?.withdraw_fee || "0"));
  const assetDecimals =
    symbol === "USDT" || symbol === "USDC"
      ? 2
      : symbol === "XRP" || symbol === "DOGE"
      ? 4
      : 8;
  const totalDebit = numericAmount + fee;
  const isValid =
    numericAmount > 0 &&
    numericAmount >= minWithdraw &&
    address.trim().length > 0 &&
    !!selectedAsset &&
    !!selectedAsset.network;
  const showError = touched && !isValid;
  const priceUnavailable = !priceUsd || Number.isNaN(priceUsd);

  useEffect(() => {
    if (!open || !selectedAsset || !priceUnavailable) return;
    const symbolValue = selectedAsset.symbol?.toUpperCase?.() || "";
    if (!symbolValue || lastPriceWarnRef.current === symbolValue) return;
    lastPriceWarnRef.current = symbolValue;
    console.warn("[Withdraw] Live price unavailable", {
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
      setAddress("");
      setAmount("");
      setUsdAmount("");
      setEditingField(null);
      triedRef.current = null;
      setProof(null);
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
      aria-labelledby="withdraw-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close withdrawal modal"
        onClick={() => {
          if (isBusy) return;
          onOpenChange(false);
        }}
      />
      <div
        ref={containerRef}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl border border-ts-border bg-ts-bg-card p-5 shadow-xl sm:max-h-[85vh] sm:rounded-2xl sm:p-6"
      >
        <div className="flex items-center justify-between">
          <h2 id="withdraw-title" className="text-lg font-semibold">
            Withdraw
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md border border-ts-border bg-ts-bg-main px-3 py-1 text-xs text-ts-text-muted hover:text-ts-text-main"
            disabled={isBusy}
          >
            Close
          </button>
        </div>

        <div className="mt-5 space-y-5">
          <div className="rounded-lg border border-ts-warning/40 bg-ts-warning/10 px-3 py-2 text-sm text-ts-text-main">
            Withdrawals are processed within 24 hours.
          </div>
          <div className="rounded-lg border border-ts-warning/40 bg-ts-warning/10 px-3 py-2 text-sm text-ts-text-main">
            Only provide a designated address of your selected asset/coin. Using the
            wrong network could mean losing your funds. When in doubt, make a small
            withdrawal amount first to confirm or contact our customer support for
            assistance.
          </div>
          {locked && (
            <div className="rounded-lg border border-ts-warning/40 bg-ts-warning/10 px-3 py-2 text-sm text-ts-text-main">
              {lockMessage ||
                "You already have a pending withdrawal request. Please wait for admin processing."}
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
                      disabled={isBusy}
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
                      disabled={isBusy}
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
            <div className="rounded-lg border border-ts-border bg-ts-bg-main p-3 text-xs text-ts-text-muted">
              <p>
                Network: <span className="text-ts-text-main">{selectedAsset.network}</span>
              </p>
              <p>
                Minimum withdraw:{" "}
                <span className="text-ts-text-main">
                  {minWithdraw}
                  <span className="ml-2 inline-flex items-center">
                    <AssetIcon symbol={symbol} size={14} />
                    <span className="sr-only">{symbol}</span>
                  </span>
                </span>
                {priceUsd ? (
                  <span className="text-ts-text-muted">
                    {" "}
                    (~${formatTrimmed(minWithdraw * priceUsd, 2)})
                  </span>
                ) : null}
              </p>
              <p>
                Withdrawal fee:{" "}
                <span className="text-ts-text-main">
                  {fee}
                  <span className="ml-2 inline-flex items-center">
                    <AssetIcon symbol={symbol} size={14} />
                    <span className="sr-only">{symbol}</span>
                  </span>
                </span>
                {priceUsd ? (
                  <span className="text-ts-text-muted">
                    {" "}
                    (~${formatTrimmed(fee * priceUsd, 2)})
                  </span>
                ) : null}
              </p>
            </div>
          )}

          <section className="space-y-3">
            <div>
              <label className="text-xs uppercase tracking-wide text-ts-text-muted">
                Destination address <span className="text-ts-danger">*</span>
              </label>
              <input
                type="text"
                value={address}
                required
                onChange={(event) => setAddress(event.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="Paste wallet address"
                className="mt-2 w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm text-ts-text-main focus:outline-none"
                disabled={isBusy}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-wide text-ts-text-muted">
                  Amount (Asset) <span className="text-ts-danger">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.00000001"
                  value={amount}
                  required
                  onChange={(event) => {
                    setTouched(true);
                    setEditingField("asset");
                    setAmount(event.target.value);
                  }}
                  onBlur={() => setTouched(true)}
                  placeholder="Enter amount"
                  className="mt-2 w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm text-ts-text-main focus:outline-none"
                  disabled={isBusy}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-ts-text-muted">
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
                    priceUnavailable
                      ? "USD price unavailable"
                      : "Enter USD amount"
                  }
                  className="mt-2 w-full rounded-md border border-ts-input-border bg-ts-input-bg px-3 py-2 text-sm text-ts-text-main focus:outline-none"
                  disabled={isBusy}
                />
              </div>
            </div>
            <div className="rounded-lg border border-ts-border bg-ts-bg-main px-3 py-2 text-xs text-ts-text-muted">
              <p>
                Fee:{" "}
                <span className="text-ts-text-main">
                  {fee}
                  <span className="ml-2 inline-flex items-center">
                    <AssetIcon symbol={symbol} size={14} />
                    <span className="sr-only">{symbol}</span>
                  </span>
                </span>
              </p>
              <p>
                Total debit:{" "}
                <span className="text-ts-text-main">
                  {totalDebit}
                  <span className="ml-2 inline-flex items-center">
                    <AssetIcon symbol={symbol} size={14} />
                    <span className="sr-only">{symbol}</span>
                  </span>
                </span>
              </p>
            </div>
            <p className="text-xs text-ts-text-muted">
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
                className="text-xs text-ts-primary hover:underline"
                disabled={isBusy}
              >
                Retry CoinCap price
              </button>
            )}
            {showError && (
              <p className="text-xs text-ts-danger">
                Amount must be at least the minimum withdrawal.
              </p>
            )}
          </section>

          <section>
            <label className="text-xs uppercase tracking-wide text-ts-text-muted">
              QR code (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setProof(file);
              }}
              className="mt-2 block w-full text-xs text-ts-text-muted file:mr-3 file:rounded-md file:border file:border-ts-border file:bg-ts-bg-main file:px-3 file:py-1 file:text-xs file:text-ts-text-main hover:file:border-ts-primary/40"
              disabled={isBusy}
            />
            {proof && (
              <p className="mt-2 text-xs text-ts-text-muted">
                Selected: {proof.name}
              </p>
            )}
          </section>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-ts-bg-main text-ts-text-main border border-ts-border hover:border-ts-primary/40"
            disabled={isBusy}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (loading) return;
              if (!isValid || locked || priceUnavailable || !selectedAsset) {
                setTouched(true);
                return;
              }
              if (!selectedAsset.network) {
                setTouched(true);
                return;
              }
              const numericUsd = parseAmount(usdAmount);
              onConfirm({
                assetId: selectedAsset.id,
                amount: numericAmount,
                fee,
                address: address.trim(),
                network: selectedAsset.network,
                usdAmount: numericUsd > 0 ? numericUsd : undefined,
                proof,
              });
            }}
            disabled={!isValid || locked || priceUnavailable || !selectedAsset || loading}
            className="bg-ts-danger text-white hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm withdrawal"
            )}
          </Button>
        </div>

        <button ref={initialFocusRef} type="button" className="sr-only">
          Focus trap
        </button>
      </div>
    </div>
  );
}
