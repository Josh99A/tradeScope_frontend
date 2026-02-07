"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import AppShell from "@/components/layout/AppShell";
import DepositModal from "@/components/deposit/DepositModal";
import MobileDashboardHome from "@/components/dashboard/MobileDashboardHome";
import MiniChartsRow from "@/components/market/MiniChartsRow";
import NewsWidget from "@/components/market/NewsWidget";
import RecentActivity from "@/components/dashboard/RecentActivity";
import SymbolInfoCarousel from "@/components/market/SymbolInfoCarousel";
import TickerTapeWidget from "@/components/market/TickerTapeWidget";
import WalletCards from "@/components/dashboard/WalletCards";
import WelcomePanel from "@/components/dashboard/WelcomePanel";
import WithdrawalModal, {
  WithdrawalPayload as BaseWithdrawalPayload,
} from "@/components/withdraw/WithdrawalModal";
import LiveMarketGrid from "@/components/market/LiveMarketGrid";
import LiveMarketList from "@/components/market/LiveMarketList";
import LiveTickerTable from "@/components/market/LiveTickerTable";
import MarketTable from "@/components/dashboard/MarketTable";
import { HoldingItem } from "@/components/wallet/HoldingsRow";
import { getActiveAssets } from "@/lib/assets";
import { getPrices } from "@/lib/prices";
import {
  depositFunds,
  getDeposits,
  getHoldings,
  getWithdrawals,
  withdrawFunds,
} from "@/lib/wallet";

type WithdrawalPayload = BaseWithdrawalPayload & {
  network?: string;
};

type ActivityItem = {
  id?: number | string;
  amount?: number | string;
  status?: string;
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

const getResponseRecordId = (payload: unknown): string | null => {
  if (!payload || typeof payload !== "object") return null;
  const recordId = (payload as { record_id?: unknown }).record_id;
  if (typeof recordId === "string" && recordId.trim()) return recordId.trim();
  const fallbackId = (payload as { id?: unknown }).id;
  if (
    typeof fallbackId === "string" ||
    typeof fallbackId === "number"
  ) {
    return String(fallbackId);
  }
  return null;
};

const Dashboard = () => {
  const [holdings, setHoldings] = useState<HoldingItem[]>([]);
  const [deposits, setDeposits] = useState<ActivityItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<ActivityItem[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [pricesLoading, setPricesLoading] = useState(false);
  const [pricesError, setPricesError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<"deposit" | "withdraw" | null>(
    null
  );
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAssetId, setDepositAssetId] = useState<
    number | string | null
  >(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAssetId, setWithdrawAssetId] = useState<
    number | string | null
  >(null);
  const cachedPricesRef = useRef<Record<string, number>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("ts_prices_cache");
      const metaRaw = window.localStorage.getItem("ts_prices_cache_meta");
      const meta = metaRaw ? (JSON.parse(metaRaw) as { ts?: number }) : null;
      const now = Date.now();
      if (!meta?.ts || now - meta.ts > 5_000) {
        window.localStorage.removeItem("ts_prices_cache");
        window.localStorage.removeItem("ts_prices_cache_meta");
        return;
      }
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, number>;
        if (parsed && typeof parsed === "object") {
          cachedPricesRef.current = parsed;
          setPrices((prev) => ({ ...parsed, ...prev }));
        }
      }
    } catch {
      // ignore cache read errors
    }
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const assetsPromise = getActiveAssets();
    try {
      const [depositsData, withdrawalsData, holdingsData] = await Promise.all([
        getDeposits(),
        getWithdrawals(),
        getHoldings(),
      ]);
      setDeposits(normalizeActivity(depositsData));
      setWithdrawals(normalizeActivity(withdrawalsData));
      const normalizedHoldings = normalizeHoldings(holdingsData);
      setHoldings(normalizedHoldings);

      const symbols = normalizedHoldings
        .map((holding) => String(holding.asset || "").toUpperCase())
        .filter(Boolean);
      if (symbols.length > 0) {
        const priceData = await getPrices(symbols, { forceRefresh: true });
        const nextPrices = priceData?.prices || {};
        if (Object.keys(nextPrices).length > 0) {
          setPrices((prev) => ({ ...nextPrices, ...prev }));
          try {
            window.localStorage.removeItem("ts_prices_cache");
            window.localStorage.removeItem("ts_prices_cache_meta");
            window.localStorage.setItem(
              "ts_prices_cache",
              JSON.stringify(nextPrices)
            );
            window.localStorage.setItem(
              "ts_prices_cache_meta",
              JSON.stringify({ ts: Date.now() })
            );
          } catch {
            // ignore cache write errors
          }
        }
      }
    } finally {
      setLoading(false);
    }
    try {
      const assetData = await assetsPromise;
      setAssets(normalizeActivity(assetData));
    } catch {
      // ignore asset load errors
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const symbols = holdings
      .map((holding) => String(holding.asset || "").toUpperCase())
      .filter(Boolean);
    const missing = symbols.filter((symbol) => !prices[symbol]);
    if (missing.length === 0) return;
    const load = async () => {
      try {
        const data = await getPrices(missing, { forceRefresh: true });
        const nextPrices = data?.prices || {};
        setPrices((prev) => ({ ...nextPrices, ...prev }));
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
        setRateLimited(false);
      }
    };
    load();
  }, [holdings, prices]);

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

  const totalPortfolioUsd = useMemo(() => {
    const total = holdings.reduce((sum, holding) => {
      const asset = String(holding.asset || "").toUpperCase();
      const fallbackRate = prices[asset] || getHoldingRate(holding);
      return sum + getHoldingValue(holding, fallbackRate);
    }, 0);
    return total;
  }, [holdings, prices]);

  const formattedBalance = !loading
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(totalPortfolioUsd)
    : "--";

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

  const handleDepositAction = () => {
    setDepositAssetId(null);
    setDepositOpen(true);
  };

  const handleWithdrawAction = () => {
    setWithdrawAssetId(null);
    setWithdrawOpen(true);
  };

  const handlePriceRetry = async (asset: string) => {
    if (!asset) return;
    await fetchPricesForSymbols([asset]);
  };

  const handleWithdraw = async (payload: WithdrawalPayload) => {
    if (submitting) return;
    const amount = parseNumber(payload.amount);
    if (!payload.network) {
      toast.error("Select a network for this withdrawal.");
      return;
    }
    if (amount <= 0) {
      toast.error("Enter a valid withdrawal amount.");
      return;
    }
    setSubmitting("withdraw");
    try {
      const response = await withdrawFunds({
        ...payload,
        asset_id: payload.assetId,
        usd_amount: payload.usdAmount,
        proof: payload.proof || "",
      });
      const recordId = getResponseRecordId(response);
      toast.success(
        recordId
          ? `Withdrawal request submitted (${recordId}).`
          : "Withdrawal request submitted."
      );
      setWithdrawOpen(false);
      await fetchDashboardData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Withdrawal request failed.";
      toast.error(message);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 w-full overflow-x-hidden">
        <div className="space-y-4 md:hidden pb-16">
          <MobileDashboardHome
            totalBalance={formattedBalance}
            loadingBalance={loading}
            onDeposit={handleDepositAction}
            onWithdraw={handleWithdrawAction}
          />
          <MiniChartsRow />
          <SymbolInfoCarousel className="max-w-[560px] mx-auto" />
          
          <div className="overflow-x-auto">
            <MarketTable />
          </div>
          <NewsWidget />
        </div>

        <div className="hidden md:block space-y-6">
          <TickerTapeWidget />
          <MiniChartsRow />
          <SymbolInfoCarousel className="max-w-[720px] mx-auto" />
          <WelcomePanel />
          <WalletCards
            totalUsd={totalPortfolioUsd}
            holdingsCount={holdings.length}
            loading={loading}
            pendingDeposit={pendingDeposit}
            pendingWithdrawal={pendingWithdrawal}
            onWithdraw={handleWithdrawAction}
            withdrawDisabled={submitting !== null}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <LiveTickerTable limit={8} />
              <LiveMarketGrid limit={6} />
              <MarketTable />
            </div>

            <div className="space-y-4">
              <LiveMarketList limit={5} />
              <RecentActivity />
            </div>
          </div>

          <NewsWidget />
        </div>
      </div>

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
          try {
            const response = await depositFunds({
              amount,
              asset_id: assetId,
              usd_amount: usdAmount,
            });
            setDepositOpen(false);
            const recordId = getResponseRecordId(response);
            toast.success(
              recordId
                ? `Deposit request submitted (${recordId}).`
                : "Deposit request submitted."
            );
            await fetchDashboardData();
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Deposit request failed.";
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
    </AppShell>
  );
}

export default Dashboard
