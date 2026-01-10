import { Button } from "../ui/Button";
const actions = [
  { label: "Trade", icon: "📈" },
  { label: "Deposit", icon: "⬇️" },
  { label: "Withdraw", icon: "⬆️" },
  { label: "Wallet", icon: "👛" },
];

const ActionGrid = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {actions.map((a) => (
        <Button
          key={a.label}
          className="flex flex-col items-center gap-2 bg-ts-bg-card p-4 rounded-xl hover:bg-ts-bg-hover transition"
        >
          <span className="text-xl">{a.icon}</span>
          <span className="text-xs">{a.label}</span>
        </Button>
      ))}
    </div>
  );
}

export default ActionGrid;