"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getDeposits, getHoldings, getWithdrawals } from "@/lib/wallet";
import { getPrices } from "@/lib/prices";

type ActivityItem = {
  id?: number | string;
  amount?: number | string;
  status?: string;
};

type HoldingItem = {
  asset?: string;
  available?: number | string;
  locked?: number | string;
  usd_rate?: number | string | null;
  usd_value?: number | string | null;
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
  const maybe = data as { holdings?: HoldingItem[] };
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

export default function WalletCards() {
  const router = useRouter();
  const [holdings, setHoldings] = useState<HoldingItem[]>([]);
  const [deposits, setDeposits] = useState<ActivityItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("ts_prices_cache");
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, number>;
        if (parsed && typeof parsed === "object") {
          setPrices(parsed);
        }
      }
    } catch {
      // ignore cache read errors
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [depositsData, withdrawalsData, holdingsData] = await Promise.all([
          getDeposits(),
          getWithdrawals(),
          getHoldings(),
        ]);
        const normalizedDeposits = normalizeActivity(depositsData);
        const normalizedWithdrawals = normalizeActivity(withdrawalsData);
        const normalizedHoldings = normalizeHoldings(holdingsData);
        setDeposits(normalizedDeposits);
        setWithdrawals(normalizedWithdrawals);
        setHoldings(normalizedHoldings);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const symbols = holdings
      .map((holding) => String(holding.asset || "").toUpperCase())
      .filter(Boolean);
    const missing = symbols.filter((symbol) => !prices[symbol]);
    if (missing.length === 0) return;
    const load = async () => {
      try {
        const data = await getPrices(missing);
        const nextPrices = data?.prices || {};
        if (Object.keys(nextPrices).length > 0) {
          setPrices((prev) => ({ ...nextPrices, ...prev }));
          try {
            window.localStorage.setItem(
              "ts_prices_cache",
              JSON.stringify({ ...nextPrices, ...prices })
            );
          } catch {
            // ignore cache write errors
          }
        }
      } catch {
        // ignore price fetch errors
      }
    };
    load();
  }, [holdings, prices]);

  const totalPortfolioUsd = useMemo(() => {
    const total = holdings.reduce((sum, holding) => {
      const asset = String(holding.asset || "").toUpperCase();
      const fallbackRate = prices[asset] || getHoldingRate(holding);
      const value = getHoldingValue(holding, fallbackRate);
      return sum + value;
    }, 0);
    return total;
  }, [holdings, prices]);

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card>
        <p className="text-xs uppercase tracking-wide text-ts-text-muted">
          Total available (USD estimate)
        </p>
        <div className="mt-2 text-2xl font-semibold text-ts-text-main">
          {!loading && totalPortfolioUsd
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
          {!loading && holdings.length ? holdings.length.toLocaleString() : "--"}
        </div>
        <p className="mt-4 text-xs text-ts-text-muted">
          Active crypto assets with balances.
        </p>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-ts-text-main">Withdrawals</h2>
        <p className="text-xs text-ts-text-muted">
          Submit a withdrawal request for review.
        </p>
        {pendingDeposit && (
          <div className="mt-3 rounded-lg border border-ts-warning/40 bg-ts-warning/10 px-3 py-2 text-xs text-ts-text-main">
            You have a pending deposit request. Withdrawals are processed within 24
            hours. Do not submit multiple requests.
          </div>
        )}
        {pendingWithdrawal && (
          <div className="mt-3 rounded-lg border border-ts-warning/40 bg-ts-warning/10 px-3 py-2 text-xs text-ts-text-main">
            Your withdrawal request is pending and will be processed within 24
            hours.
          </div>
        )}
        <div className="mt-4">
          <Button
            type="button"
            onClick={() => router.push("/wallet")}
            disabled={loading || pendingWithdrawal}
            className="w-full bg-ts-danger text-white hover:opacity-90"
          >
            Request withdrawal
          </Button>
        </div>
      </Card>
    </div>
  );
}
