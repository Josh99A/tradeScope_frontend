import React from 'react'

const TrustBar = () => {
  return (
    <section className="border-y border-ts-border bg-ts-bg-card">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-6 text-sm text-ts-text-muted">
          <span>🔒 Secure by design</span>
          <span>📊 Real-time market data</span>
          <span>🧪 Paper trading supported</span>
          <span>⚡ Built for speed</span>
        </div>
      </div>
    </section>
  )
}

export default TrustBar
