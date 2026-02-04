"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTheme } from "next-themes";

export default function NewsWidget({
  className = "",
}: {
  className?: string;
}) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resolvedTheme = theme === "dark" ? "dark" : "light";
  const config = useMemo(
    () => ({
      feedMode: "market",
      market: "crypto",
      isTransparent: true,
      displayMode: "regular",
      width: "100%",
      height: 520,
      colorTheme: resolvedTheme,
      locale: "en",
    }),
    [resolvedTheme]
  );

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
    script.async = true;
    script.type = "text/javascript";
    script.text = JSON.stringify(config);
    containerRef.current.appendChild(script);
  }, [config]);

  return (
    <section
      className={`rounded-xl border border-ts-border bg-ts-bg-card/60 ${className}`}
      aria-label="News and top stories"
    >
      <div className="border-b border-ts-border px-4 py-3">
        <h2 className="text-sm font-semibold text-ts-text-main">
          News / Top Stories
        </h2>
        <p className="text-xs text-ts-text-muted">
          Latest crypto headlines and market updates.
        </p>
      </div>
      <div ref={containerRef} className="w-full" />
    </section>
  );
}
