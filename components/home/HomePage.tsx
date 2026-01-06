"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const HomePage = () => {
  return (
    <main className="bg-ts-bg-main text-ts-text-main">
      {/* ================= HERO ================= */}
      <section className="max-w-7xl mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
            Trade Crypto with
            <span className="text-ts-primary"> Confidence</span>
          </h1>

          <p className="mt-4 text-ts-text-muted max-w-xl">
            TradeScope is a modern crypto trading platform offering real-time
            markets, paper trading, and seamless crypto payments.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              href="/register"
              className={cn(
                "px-6 py-3 rounded-lg font-medium text-white transition",
                "bg-ts-primary hover:opacity-90"
              )}
            >
              Get Started
            </Link>

            <Link
              href="/markets"
              className={cn(
                "px-6 py-3 rounded-lg font-medium transition",
                "border border-ts-border text-ts-text-main hover:bg-ts-bg-card"
              )}
            >
              View Markets
            </Link>
          </div>
        </div>

        <div className="relative h-72 lg:h-96 rounded-xl bg-ts-bg-card border border-ts-border flex items-center justify-center">
          <span className="text-ts-text-muted text-sm">
            📈 Live Crypto Charts Preview
          </span>
        </div>
      </section>

      {/* ================= MARKET HIGHLIGHTS ================= */}
      <section className="border-t border-ts-border">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-semibold mb-8">Market Highlights</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MarketCard pair="BTC / USDT" price="$42,180" change="+2.4%" />
            <MarketCard pair="ETH / USDT" price="$2,320" change="-1.1%" />
            <MarketCard pair="SOL / USDT" price="$98.40" change="+4.7%" />
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="border-t border-ts-border">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-semibold mb-10">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              step="01"
              title="Create an Account"
              description="Sign up and secure your account in minutes."
            />
            <StepCard
              step="02"
              title="Practice or Go Live"
              description="Use paper trading or connect to a real broker."
            />
            <StepCard
              step="03"
              title="Trade & Track"
              description="Analyze charts and manage positions in real time."
            />
          </div>
        </div>
      </section>

      {/* ================= WHY TRADESCOPE ================= */}
      <section className="border-t border-ts-border">
        <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="Paper Trading"
            description="Practice crypto trading with virtual funds."
          />
          <FeatureCard
            title="Real-Time Charts"
            description="TradingView-powered lightweight charts."
          />
          <FeatureCard
            title="Crypto Payments"
            description="Secure deposits via Cryptopus."
          />
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="border-t border-ts-border">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Start Trading Smarter Today
          </h2>
          <p className="text-ts-text-muted mb-8 max-w-2xl mx-auto">
            Whether you're learning or trading live, TradeScope gives you the
            tools you need to succeed in crypto markets.
          </p>

          <Link
            href="/register"
            className={cn(
              "inline-flex px-8 py-4 rounded-lg font-medium text-white transition",
              "bg-ts-primary hover:opacity-90"
            )}
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </main>
  );
}

/* ================= SUB COMPONENTS ================= */

function MarketCard({
  pair,
  price,
  change,
}: {
  pair: string;
  price: string;
  change: string;
}) {
  const isPositive = change.startsWith("+");

  return (
    <div className="bg-ts-bg-card border border-ts-border rounded-xl p-6 hover:border-ts-primary transition">
      <p className="text-sm text-ts-text-muted">{pair}</p>
      <p className="text-xl font-semibold mt-2">{price}</p>
      <p
        className={cn(
          "text-sm mt-1",
          isPositive ? "text-ts-success" : "text-ts-danger"
        )}
      >
        {change}
      </p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-ts-bg-card border border-ts-border rounded-xl p-6">
      <span className="text-ts-primary font-semibold">{step}</span>
      <h3 className="mt-2 font-semibold">{title}</h3>
      <p className="text-sm text-ts-text-muted mt-1">{description}</p>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-ts-bg-card border border-ts-border rounded-xl p-6 hover:border-ts-primary transition">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-ts-text-muted">{description}</p>
    </div>
  );
}
export default HomePage;