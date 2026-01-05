import React from 'react'

const Footer = () => {
  return (
    <footer className="border-t border-ts-border bg-ts-bg-main">
      <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-ts-text-muted">
        © {new Date().getFullYear()} TradeScope. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
