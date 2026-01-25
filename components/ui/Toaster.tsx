"use client";

import { Toaster } from "react-hot-toast";

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#111827",
          color: "#F9FAFB",
          border: "1px solid #1F2937",
        },
        success: {
          style: {
            background: "#064E3B",
            color: "#ECFDF5",
            border: "1px solid #10B981",
          },
          iconTheme: {
            primary: "#10B981",
            secondary: "#ECFDF5",
          },
        },
        error: {
          style: {
            background: "#7F1D1D",
            color: "#FEF2F2",
            border: "1px solid #EF4444",
          },
          iconTheme: {
            primary: "#EF4444",
            secondary: "#FEF2F2",
          },
        },
      }}
    />
  );
}
