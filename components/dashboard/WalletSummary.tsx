"use client";

import React, { useEffect, useState } from "react";
import { getHoldings } from "@/lib/wallet";
import { useAuth } from "@/components/auth/AuthProvider";

const parseNumber = (value: number | string | undefined) => {
  if (value === undefined || value === null) return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseUsdValue = (value: number | string | null | undefined) => {
  if (value === undefined || value === null) return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const calculateHoldingsTotal = (holdings: any[]) => {
  return holdings.reduce((sum: number, holding: any) => {
    const usdValue = parseUsdValue(holding?.usd_value);
    if (usdValue > 0) return sum + usdValue;
    const available = parseNumber(holding?.available);
    const locked = parseNumber(holding?.locked);
    const rate = parseUsdValue(holding?.usd_rate) || 0;
    return sum + (available + locked) * rate;
  }, 0);
};

const WalletSummary = () => {
  const [holdingsTotalUsd, setHoldingsTotalUsd] = useState<number>(0);
  const [loaded, setLoaded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const response = await getHoldings();
        const holdings = Array.isArray(response?.holdings)
          ? response.holdings
          : [];
        setHoldingsTotalUsd(calculateHoldingsTotal(holdings));
      } catch {
        setHoldingsTotalUsd(0);
      } finally {
        setLoaded(true);
      }
    };

    loadWallet();
  }, []);

  const photoUrl = user?.photo_url || "/Images/avatar-placeholder.jpg";
  const totalUsd = holdingsTotalUsd;
  const formatUsd = (value: number) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    } catch {
      return `$${value.toLocaleString()}`;
    }
  };

  return (
    <div className="bg-gradient-to-br from-ts-primary/20 to-ts-bg-card rounded-2xl p-5 border border-ts-border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ts-text-muted">Total available (USD estimate)</p>
          <h2 className="text-2xl font-semibold">
            {loaded ? formatUsd(totalUsd) : "--"}
          </h2>
          <div className="mt-2 space-y-1 text-xs text-ts-text-muted">
            <p>
              Estimated holdings value: {loaded ? formatUsd(totalUsd) : "--"}
            </p>
            <p>
              Based on cached crypto prices.
            </p>
          </div>
        </div>
        <img
          src={photoUrl}
          alt={user?.username || "User"}
          className="w-10 h-10 rounded-full object-cover"
        />
      </div>
    </div>
  );
};

export default WalletSummary
