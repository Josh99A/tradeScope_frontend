import React from 'react'

const Card = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
     <div className="rounded-xl bg-ts-bg-card p-4 border border-ts-border">
      {children}
    </div>
  )
}

export default Card
