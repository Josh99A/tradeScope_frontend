import React from 'react'
import AppShell from '@/components/layout/AppShell'
import WalletSummary from '@/components/dashboard/WalletSummary'
import MarketTable from '@/components/dashboard/MarketTable'
import ChartPreview from '@/components/dashboard/ChartPreview'
import QuickTradePanel from '@/components/dashboard/QuickTradePanel'
import OpenPositions from '@/components/dashboard/OpenPositions'
import MarketSnapshot from '@/components/dashboard/MarketSnapshot'
import WelcomePanel from '@/components/dashboard/WelcomePanel'

const Dashboard = () => {
  return (
    <AppShell>
      <div className="space-y-4">
        <WelcomePanel />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <ChartPreview />
            <OpenPositions />
            <MarketSnapshot />
          </div>

          <div className="space-y-4">
            <QuickTradePanel />
            <WalletSummary />
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default Dashboard
