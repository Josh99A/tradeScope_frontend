"use client";

import { useEffect, useRef, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import ActivityTable from "@/components/wallet/ActivityTable";
import StatusTable from "@/components/wallet/StatusTable";
import HoldingsList from "@/components/wallet/HoldingsList";
import DepositModal from "@/components/deposit/DepositModal";
import WithdrawalModal, {
  WithdrawalPayload as BaseWithdrawalPayload,
} from "@/components/withdraw/WithdrawalModal";

type WithdrawalPayload = BaseWithdrawalPayload & {
  network?: string;
};
import { HoldingItem } from "@/components/wallet/HoldingsRow";
import {
  depositFunds,
  withdrawFunds,
  getWalletActivity,
  getDeposits,
  getWithdrawals,
  getHoldings,
} from "@/lib/wallet";
import { getPrices } from "@/lib/prices";
import { getActiveAssets } from "@/lib/assets";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type ActivityItem = {
  id?: number | string;
  type?: string;
  amount?: number | string;
  status?: string;
  created_at?: string;
  description?: string;
  reference?: string;
  archived?: boolean;
  deleted?: boolean;
};

type HoldingsResponse = {
  holdings?: HoldingItem[];
};

const parseNumber = (value: number | string | undefined) => {
  if (value === undefined || value === null) return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeActivity = (data: unknown): ActivityItem[] => {
  if (Array.isArray(data)) return data as ActivityItem[];
  if (data && typeof data === "object") {
    const maybe = data as { results?: ActivityItem[]; items?: ActivityItem[] };
    return maybe.results || maybe.items || [];
  }
  return [];
};

const normalizeHoldings = (data: unknown): HoldingItem[] => {
  if (!data || typeof data !== "object") return [];
  const maybe = data as HoldingsResponse;
  if (!Array.isArray(maybe.holdings)) return [];
  return maybe.holdings;
};

const getHoldingRate = (holding: HoldingItem) => {
  if (holding.usd_rate !== null && holding.usd_rate !== undefined) {
    const parsed = Number(holding.usd_rate);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }
  return 0;
};

const getHoldingValue = (holding: HoldingItem, fallbackRate: number) => {
  if (holding.usd_value !== null && holding.usd_value !== undefined) {
    const parsed = Number(holding.usd_value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  const available = parseNumber(holding.available);
  const locked = parseNumber(holding.locked);
  return (available + locked) * fallbackRate;
};

const PRICE_CACHE_TTL_MS = 30_000;


export default function WalletPage() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [deposits, setDeposits] = useState<ActivityItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<ActivityItem[]>([]);
  const [holdings, setHoldings] = useState<HoldingItem[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [holdingsLoading, setHoldingsLoading] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [holdingsError, setHoldingsError] = useState<string | null>(null);
  const [pricesError, setPricesError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<
    "deposit" | "withdraw" | null
  >(null);
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAssetId, setDepositAssetId] = useState<
    number | string | null
  >(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAssetId, setWithdrawAssetId] = useState<
    number | string | null
  >(null);
  const router = useRouter();
  const cachedPricesRef = useRef<Record<string, number>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("ts_prices_cache");
      const metaRaw = window.localStorage.getItem("ts_prices_cache_meta");
      const meta = metaRaw ? (JSON.parse(metaRaw) as { ts?: number }) : null;
      const cacheFresh = meta?.ts && Date.now() - meta.ts < PRICE_CACHE_TTL_MS;
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, number>;
        if (cacheFresh && parsed && typeof parsed === "object") {
          cachedPricesRef.current = parsed;
          setPrices((prev) => ({ ...parsed, ...prev }));
        }
      }
    } catch {
      // ignore cache read errors
    }
  }, []);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === "object" && error && "response" in error) {
      const data = (error as { response?: { data?: unknown } }).response?.data;
      console.error("[Withdrawal] API error", data);
      if (data && typeof data === "object") {
        if ((data as Record<string, unknown>).network) {
          return "Select a network for this withdrawal.";
        }
        const detail = (data as { detail?: string }).detail;
        if (detail) return detail;
        const firstKey = Object.keys(data as Record<string, unknown>)[0];
        if (firstKey) {
          const value = (data as Record<string, unknown>)[firstKey];
          if (Array.isArray(value)) return String(value[0]);
          if (typeof value === "string") return value;
        }
      }
    }
    return fallback;
  };

  const fetchWalletData = async () => {
    setLoading(true);
    setHoldingsLoading(true);
    setNotice(null);
    setHoldingsError(null);
    setAssetsError(null);
    const assetsPromise = getActiveAssets();
    try {
      const [activityData, depositsData, withdrawalsData, holdingsData] =
        await Promise.all([
          getWalletActivity({ includeArchived: true }),
          getDeposits(),
          getWithdrawals(),
          getHoldings(),
        ]);
      setActivity(normalizeActivity(activityData));
      setDeposits(normalizeActivity(depositsData));
      setWithdrawals(normalizeActivity(withdrawalsData));

      const normalizedHoldings = normalizeHoldings(holdingsData);
      setHoldings(normalizedHoldings);
      const derivedRates = normalizedHoldings.reduce<Record<string, number>>(
        (acc, holding) => {
          const rate = getHoldingRate(holding);
          if (rate > 0) {
            acc[String(holding.asset || "").toUpperCase()] = rate;
          }
          return acc;
        },
        {}
      );
      if (Object.keys(derivedRates).length > 0) {
        setPrices((prev) => ({ ...derivedRates, ...prev }));
      }
    } catch {
      setNotice("Unable to load wallet data.");
      setHoldingsError("Unable to load holdings.");
    } finally {
      setLoading(false);
      setHoldingsLoading(false);
    }

    try {
      const assetData = await assetsPromise;
      setAssets(normalizeActivity(assetData));
    } catch {
      setAssetsError("Unable to load assets.");
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchPricesForSymbols = async (symbols: string[]) => {
    const uniqueSymbols = Array.from(
      new Set(symbols.map((symbol) => symbol.toUpperCase()).filter(Boolean))
    );
    const missing = uniqueSymbols.filter((symbol) => !prices[symbol]);
    if (missing.length === 0) return;
    setPricesLoading(true);
    setPricesError(null);
    try {
      const data = await getPrices(missing);
      const nextPrices = data?.prices || {};
      setPrices((prev) => ({ ...prev, ...nextPrices }));
      setRateLimited(Boolean(data?.rate_limited));
      if (Object.keys(nextPrices).length > 0) {
        cachedPricesRef.current = {
          ...cachedPricesRef.current,
          ...nextPrices,
        };
        try {
          window.localStorage.setItem(
            "ts_prices_cache",
            JSON.stringify(cachedPricesRef.current)
          );
          window.localStorage.setItem(
            "ts_prices_cache_meta",
            JSON.stringify({ ts: Date.now() })
          );
        } catch {
          // ignore cache write errors
        }
      }
    } catch {
      setPricesError("Unable to load live prices.");
      setRateLimited(false);
      if (Object.keys(cachedPricesRef.current).length > 0) {
        setPrices((prev) => ({ ...cachedPricesRef.current, ...prev }));
      }
    } finally {
      setPricesLoading(false);
    }
  };

  const totalPortfolioUsd = holdings.reduce((sum, holding) => {
    const asset = String(holding.asset || "").toUpperCase();
    const fallbackRate = prices[asset] || getHoldingRate(holding);
    return sum + getHoldingValue(holding, fallbackRate);
  }, 0);

  const handleWithdraw = async (payload: WithdrawalPayload) => {
    if (submitting) return;
    const amount = parseNumber(payload.amount);
    console.log("[Withdraw] Payload", payload);
    if (!payload.network) {
      const message = "Select a network for this withdrawal.";
      setNotice(message);
      toast.error(message);
      return;
    }
    if (amount <= 0) {
      const message = "Enter a valid withdrawal amount.";
      setNotice(message);
      toast.error(message);
      return;
    }
    setSubmitting("withdraw");
    setNotice(null);
    try {
      await withdrawFunds({ ...payload, asset_id: payload.assetId, usd_amount: payload.usdAmount, proof: payload.proof || "" });
      setNotice("Withdrawal request submitted.");
      toast.success("Withdrawal request submitted.");
      setWithdrawOpen(false);
      await fetchWalletData();
    } catch (error) {
      const message = getErrorMessage(error, "Withdrawal request failed.");
      setNotice(message);
      toast.error(message);
    } finally {
      setSubmitting(null);
    }
  };

  const pendingDeposit = deposits.some(
    (deposit) => String(deposit.status).toUpperCase() === "PENDING_REVIEW"
  );
  const pendingWithdrawal = withdrawals.some((withdrawal) => {
    const status = String(withdrawal.status).toUpperCase();
    return (
      status === "PENDING" ||
      status === "PENDING_REVIEW" ||
      status === "PROCESSING"
    );
  });

  const handleDepositAction = (asset?: string) => {
    if (asset) {
      const match = assets.find(
        (item) =>
          String(item?.symbol || "").toUpperCase() === asset.toUpperCase()
      );
      setDepositAssetId(match?.id ?? null);
    } else {
      setDepositAssetId(null);
    }
    setDepositOpen(true);
  };

  const handleWithdrawAction = (asset?: string) => {
    if (asset) {
      const match = assets.find(
        (item) =>
          String(item?.symbol || "").toUpperCase() === asset.toUpperCase()
      );
      setWithdrawAssetId(match?.id ?? null);
    } else {
      setWithdrawAssetId(null);
    }
    setWithdrawOpen(true);
  };

  const handleTradeAction = (asset: string) => {
    if (!asset) return;
    router.push(`/dashboard/trade?symbol=${asset}USDT&quote=USDT`);
  };

  const handlePriceRetry = async (asset: string) => {
    if (!asset) return;
    await fetchPricesForSymbols([asset]);
  };

  return (
    <DashboardShell>
      <AppShell>
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold text-ts-text-main">Wallet</h1>
            <p className="text-sm text-ts-text-muted">
              Manage your balance, deposits, and withdrawals.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => handleDepositAction()}
              className="bg-ts-primary text-white hover:opacity-90"
              disabled={submitting !== null}
            >
              Deposit
            </Button>
          </div>

          {notice && (
            <div className="text-sm text-ts-text-muted">{notice}</div>
          )}
          {assetsError && (
            <div className="text-sm text-ts-text-muted">{assetsError}</div>
          )}
          {pendingDeposit && (
            <div className="rounded-lg border border-ts-warning/40 bg-ts-warning/10 px-3 py-2 text-sm text-ts-text-main">
              You already have a pending deposit request. Please wait for admin confirmation.
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <p className="text-xs uppercase tracking-wide text-ts-text-muted">
                Total available (USD estimate)
              </p>
              <div className="mt-2 text-2xl font-semibold text-ts-text-main">
                {totalPortfolioUsd
                  ? new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(totalPortfolioUsd)
                  : "--"}
              </div>
              <p className="mt-4 text-xs text-ts-text-muted">
                Based on cached crypto price estimates.
              </p>
            </Card>

            <Card>
              <p className="text-xs uppercase tracking-wide text-ts-text-muted">
                Holdings count
              </p>
              <div className="mt-2 text-2xl font-semibold text-ts-text-main">
                {holdings.length ? holdings.length.toLocaleString() : "--"}
              </div>
              <p className="mt-4 text-xs text-ts-text-muted">
                Active crypto assets with balances.
              </p>
            </Card>

            <Card>
              <h2 className="text-sm font-semibold text-ts-text-main">
                Withdrawals
              </h2>
              <p className="text-xs text-ts-text-muted">
                Submit a withdrawal request for review.
              </p>
              {pendingDeposit && (
                <div className="mt-3 rounded-lg border border-ts-warning/40 bg-ts-warning/10 px-3 py-2 text-xs text-ts-text-main">
                  You have a pending deposit request. Withdrawals are processed within 24 hours. Do not submit multiple requests.
                </div>
              )}
              {pendingWithdrawal && (
                <div className="mt-3 rounded-lg border border-ts-warning/40 bg-ts-warning/10 px-3 py-2 text-xs text-ts-text-main">
                  Your withdrawal request is pending and will be processed within 24 hours.
                </div>
              )}
              <div className="mt-4">
                <Button
                  type="button"
                  onClick={() => handleWithdrawAction()}
                  disabled={submitting !== null || loading || pendingWithdrawal}
                  className="w-full bg-ts-danger text-white hover:opacity-90"
                >
                  Request withdrawal
                </Button>
              </div>
            </Card>
          </div>

          <HoldingsList
            holdings={holdings}
            prices={prices}
            loading={holdingsLoading}
            error={holdingsError}
            onDeposit={handleDepositAction}
            onWithdraw={handleWithdrawAction}
            onTrade={handleTradeAction}
          />

          <ActivityTable
            items={activity}
            title="Wallet activity"
            onRefresh={fetchWalletData}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <StatusTable
              title="Deposits"
              items={deposits}
              emptyLabel="No deposits yet."
              prices={prices}
            />
            <StatusTable
              title="Withdrawals"
              items={withdrawals}
              emptyLabel="No withdrawals yet."
              prices={prices}
            />
          </div>
        </div>
      </AppShell>

      <DepositModal
        open={depositOpen}
        onOpenChange={setDepositOpen}
        initialAssetId={depositAssetId}
        assets={assets}
        prices={prices}
        pricesLoading={pricesLoading}
        pricesError={pricesError}
        rateLimited={rateLimited}
        onRetryPrice={handlePriceRetry}
        locked={pendingDeposit}
        lockMessage="You already have a pending deposit request. Please wait for admin confirmation."
        loading={submitting === "deposit"}
        onConfirm={async ({ assetId, amount, usdAmount }) => {
          if (submitting) return;
          setSubmitting("deposit");
          setNotice(null);
          try {
            await depositFunds({ amount, asset_id: assetId, usd_amount: usdAmount });
            setDepositOpen(false);
            setNotice("Deposit request submitted.");
            toast.success("Deposit request submitted.");
            await fetchWalletData();
          } catch (error) {
            const message = getErrorMessage(error, "Deposit request failed.");
            setNotice(message);
            toast.error(message);
          } finally {
            setSubmitting(null);
          }
        }}
      />
      <WithdrawalModal
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        onConfirm={handleWithdraw}
        initialAssetId={withdrawAssetId}
        assets={assets}
        prices={prices}
        pricesLoading={pricesLoading}
        pricesError={pricesError}
        rateLimited={rateLimited}
        onRetryPrice={handlePriceRetry}
        locked={pendingWithdrawal}
        lockMessage="You already have a pending withdrawal request. Please wait for admin processing."
        loading={submitting === "withdraw"}
      />
    </DashboardShell>
  );
}
