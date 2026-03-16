import React from "react";
import { formatINR } from "../utils";

function Card({ label, value, sub, colorClass, icon }) {
  return (
    <div className={`bg-white rounded-xl border shadow-sm p-5 ${colorClass}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}

export default function SummaryCards({ data }) {
  const { totalPortfolioValue, totalToBuy, totalToSell, netCashNeeded } = data;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        label="Portfolio Value"
        value={formatINR(totalPortfolioValue)}
        icon="💼"
        colorClass="border-slate-200"
      />
      <Card
        label="Total to Buy"
        value={formatINR(totalToBuy)}
        sub="Funds to purchase"
        icon="📈"
        colorClass="border-emerald-100"
      />
      <Card
        label="Total to Sell"
        value={formatINR(totalToSell)}
        sub="Funds to redeem"
        icon="📉"
        colorClass="border-red-100"
      />
      <Card
        label="Fresh Money Needed"
        value={formatINR(netCashNeeded)}
        sub={netCashNeeded > 0 ? "Additional investment required" : "Rebalance within existing corpus"}
        icon="💰"
        colorClass={netCashNeeded > 0 ? "border-amber-100" : "border-emerald-100"}
      />
    </div>
  );
}
