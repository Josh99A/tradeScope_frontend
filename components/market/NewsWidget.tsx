"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";

export default function NewsWidget({
  className = "",
}: {
  className?: string;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const colorTheme = resolvedTheme === "dark" ? "dark" : "light";
  const config = useMemo(
    () => ({
      displayMode: "regular",
      feedMode: "all_symbols",
      isTransparent: false,
      width: "100%",
      height: 520,
      colorTheme,
      locale: "en",
    }),
    [colorTheme]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify(config);
    containerRef.current.appendChild(script);
  }, [config, mounted]);

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
      <div className="tradingview-widget-container px-2 pb-2">
        <div
          ref={containerRef}
          className="tradingview-widget-container__widget"
        />
        <div className="tradingview-widget-copyright text-[10px] text-ts-text-muted px-2 pb-2">
          <a
            href="https://www.tradingview.com/news/top-providers/tradingview/"
            rel="noopener nofollow"
            target="_blank"
            className="text-ts-primary hover:underline"
          >
            Top stories
          </a>{" "}
          <span className="text-ts-text-muted">by TradingView</span>
        </div>
      </div>
    </section>
  );
}
