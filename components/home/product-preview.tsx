import React from 'react'

const ProductPreview = () => {
  return (
    <section className="bg-ts-bg-card py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="rounded-2xl border border-ts-border bg-ts-bg-main p-10">
          <p className="text-ts-text-muted">
            Dashboard preview
          </p>
          <div className="mt-6 h-64 rounded-lg border border-ts-border bg-ts-bg-card flex items-center justify-center text-ts-text-muted">
            Chart & Trading UI Preview
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductPreview
