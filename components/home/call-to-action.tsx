import React from 'react'
import { Button } from '../ui/Button'

const CallToAction = () => {
  return (
    <section className="bg-ts-primary">
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h2 className="text-3xl font-semibold text-white">
          Start trading smarter today
        </h2>
        <p className="mt-4 text-white/80">
          No credit card required. Practice with paper trading.
        </p>

        <Button className="mt-8 rounded-lg bg-white px-8 py-3 font-medium text-ts-primary">
          Get Started
        </Button>
      </div>
    </section>
  )
}

export default CallToAction
