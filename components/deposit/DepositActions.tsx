"use client";

import React from "react";
import { Loader2 } from "lucide-react";
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
        className="w-full bg-ts-hover text-ts-text-main hover:bg-ts-active sm:w-auto"
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={onConfirm}
        disabled={!canConfirm || loading}
        className="w-full bg-ts-primary text-white hover:opacity-90 sm:w-auto"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Confirm Deposit"
        )}
      </Button>
    </div>
  );
}
