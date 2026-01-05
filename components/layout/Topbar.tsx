import React from 'react'
import ThemeToggle from '../ui/ThemeToggle'

const Topbar = () => {
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-ts-border bg-ts-bg-card">
      <span className="font-semibold text-ts-text-main">Dashboard</span>
      <ThemeToggle />
    </header>
  )
}

export default Topbar
