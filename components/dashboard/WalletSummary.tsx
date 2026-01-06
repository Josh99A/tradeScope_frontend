import React from 'react'
import Card from '../ui/Card'

const WalletSummary = () => {
  return (
   <div className="bg-gradient-to-br from-ts-primary/20 to-ts-bg-card rounded-2xl p-5 border border-ts-border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ts-text-muted">Total Balance</p>
          <h2 className="text-2xl font-semibold">$4,601.55</h2>
        </div>
        <img
          src="/avatar.png"
          alt="User"
          className="w-10 h-10 rounded-full"
        />
      </div>
    </div>
  )
}

export default WalletSummary
