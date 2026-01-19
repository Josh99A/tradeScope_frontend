"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

export default function DepositActions({
  onCancel,
  onConfirm,
  canConfirm,
  loading = false,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  canConfirm: boolean;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button
        type="button"
        onClick={onCancel}
        className="bg-ts-hover text-ts-text-main hover:bg-ts-active"
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={onConfirm}
        disabled={!canConfirm || loading}
        className="bg-ts-primary text-white hover:opacity-90"
      >
        {loading ? "Processing..." : "Confirm Deposit"}
      </Button>
    </div>
  );
}
