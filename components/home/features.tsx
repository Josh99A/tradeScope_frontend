import React from 'react'

const HomeFeatures = () => {

const FEATURES = [
  {
    title: "Advanced Charts",
    description: "Interactive candlestick charts powered by TradingView Lightweight Charts."
  },
  {
    title: "Paper & Real Trading",
    description: "Practice risk-free or connect to real brokers when ready."
  },
  {
    title: "Live Positions",
    description: "Track open positions, PnL, and exposure in real time."
  },
];

  return (
        <section className="bg-ts-bg-main py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-3xl font-semibold text-ts-text-main">
          Everything you need to trade confidently
        </h2>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-ts-border bg-ts-bg-card p-6"
            >
              <h3 className="text-lg font-medium text-ts-text-main">
                {f.title}
              </h3>
              <p className="mt-2 text-ts-text-muted">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HomeFeatures
