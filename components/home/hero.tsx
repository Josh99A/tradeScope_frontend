import React from 'react'

const HomeHero = () => {
  return (
    <section className="relative overflow-hidden bg-ts-bg-main">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-ts-text-main sm:text-6xl">
            Trade Forex with
            <span className="text-ts-primary"> Precision & Clarity</span>
          </h1>

          <p className="mt-6 text-lg text-ts-text-muted">
            TradeScope is a modern forex trading platform with real-time charts,
            paper trading, and broker integrations — built for serious traders.
          </p>

          <div className="mt-10 flex gap-4">
            <button className="rounded-lg bg-ts-primary px-6 py-3 text-white font-medium">
              Start Paper Trading
            </button>

            <button className="rounded-lg border border-ts-border px-6 py-3 text-ts-text-main">
              View Markets
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HomeHero
