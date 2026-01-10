import { Button } from "../ui/Button";
const MarketSnapshot = () => {
  return (
    <div className="bg-ts-bg-card border border-ts-border rounded-xl p-5">
      <h3 className="text-sm mb-3">Top Markets</h3>

      <div className="space-y-3">
        {["BTC/USDT", "ETH/USDT", "SOL/USDT"].map((pair) => (
          <div key={pair} className="flex justify-between items-center">
            <span>{pair}</span>
            <Button className="text-ts-primary text-xs">Trade</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MarketSnapshot;