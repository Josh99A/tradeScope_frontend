"use client";

import React from "react";
import { cn } from "@/lib/utils";

const Card = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => {
  return (
    <div
      className={cn("rounded-xl bg-ts-bg-card p-4 border border-ts-border", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
