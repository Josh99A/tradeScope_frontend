"use client";

import React, { useEffect, useState } from "react";
import { getWallet } from "@/lib/wallet";
import { useAuth } from "@/components/auth/AuthProvider";

type WalletData = {
  available_balance?: number | string;
  locked_balance?: number | string;
};

const parseNumber = (value: number | string | undefined) => {
  if (value === undefined || value === null) return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const WalletSummary = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const data = await getWallet();
        setWallet(data);
      } catch {
        setWallet(null);
      }
    };

    loadWallet();
  }, []);

  const availableBalance = parseNumber(wallet?.available_balance);
  const lockedBalance = parseNumber(wallet?.locked_balance);
  const totalBalance = availableBalance + lockedBalance;
  const photoUrl = user?.photo_url || "/Images/avatar-placeholder.jpg";

  return (
    <div className="bg-gradient-to-br from-ts-primary/20 to-ts-bg-card rounded-2xl p-5 border border-ts-border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ts-text-muted">Available Balance</p>
          <h2 className="text-2xl font-semibold">
            ${availableBalance.toLocaleString()}
          </h2>
          <p className="mt-1 text-xs text-ts-text-muted">
            Total: ${totalBalance.toLocaleString()}
          </p>
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
