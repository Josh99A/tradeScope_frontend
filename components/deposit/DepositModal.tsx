"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import DepositMethodSelector, {
  DepositAsset,
} from "@/components/deposit/DepositMethodSelector";
import DepositAddressCard from "@/components/deposit/DepositAddressCard";
import DepositQRCode from "@/components/deposit/DepositQRCode";
import DepositAmountInput from "@/components/deposit/DepositAmountInput";
import DepositActions from "@/components/deposit/DepositActions";

const ASSET_ADDRESSES: Record<DepositAsset, string> = {
  USDC: "0x7a3d...c31f",
  USDT: "0x2b7f...f89c",
  ETH: "0x9c4a...1a07",
  BTC: "bc1q2s...p9x3",
  XRP: "rG7Z...9uT2",
  DOGE: "D9s2...k3Lm",
};

const parseAmount = (value: string) => {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function DepositModal({
  open,
  onOpenChange,
  onConfirm,
  locked = false,
  lockMessage,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: {
    asset: DepositAsset;
    amount: number;
    address: string;
  }) => void;
  locked?: boolean;
  lockMessage?: string;
}) {
  const [asset, setAsset] = useState<DepositAsset>("USDC");
  const [amount, setAmount] = useState("");
  const [touched, setTouched] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const initialFocusRef = useRef<HTMLButtonElement | null>(null);

  const address = useMemo(() => ASSET_ADDRESSES[asset], [asset]);
  const numericAmount = parseAmount(amount);
  const isValid = numericAmount > 0;
  const showError = touched && !isValid;

  useEffect(() => {
    if (open) {
      setTouched(false);
      setAmount("");
      window.setTimeout(() => {
        initialFocusRef.current?.focus();
      }, 0);
    }
  }, [open]);

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
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
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
        className="relative w-full max-w-2xl rounded-t-2xl border border-ts-border bg-ts-bg-card p-5 shadow-xl sm:rounded-2xl sm:p-6"
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
              Select method
            </p>
            <div className="mt-3">
              <DepositMethodSelector
                value={asset}
                onChange={(value) => setAsset(value)}
              />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-[1.3fr_1fr]">
            <DepositAddressCard address={address} />
            <DepositQRCode asset={asset} />
          </section>

          <section>
            <DepositAmountInput
              value={amount}
              onChange={(value) => {
                setTouched(true);
                setAmount(value);
              }}
              error={showError ? "Enter a valid deposit amount." : undefined}
            />
          </section>
        </div>

        <div className="mt-6">
          <DepositActions
            onCancel={() => onOpenChange(false)}
            onConfirm={() => {
              if (!isValid) {
                setTouched(true);
                return;
              }
              if (locked) {
                return;
              }
              onConfirm({
                asset,
                amount: numericAmount,
                address,
              });
            }}
            canConfirm={isValid && !locked}
            loading={false}
          />
        </div>

        <button
          ref={initialFocusRef}
          type="button"
          className="sr-only"
        >
          Focus trap
        </button>
      </div>
    </div>
  );
}
