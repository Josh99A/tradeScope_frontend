import React from 'react'
import Card from '../ui/Card';

const MarketTable = () => {
    const markets = [
  { pair: "EUR/USD", price: "1.1042", change: "+0.32%" },
  { pair: "GBP/USD", price: "1.2731", change: "-0.12%" },
];

  return (
     <Card>
      <h3 className="mb-2 font-semibold">Markets</h3>
      <table className="w-full text-sm">
        <tbody>
          {markets.map((m) => (
            <tr key={m.pair} className="border-b border-ts-border">
              <td>{m.pair}</td>
              <td>{m.price}</td>
              <td
                className={
                  m.change.startsWith("+")
                    ? "text-ts-success"
                    : "text-ts-danger"
                }
              >
                {m.change}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

export default MarketTable
