import React, { useEffect, useState } from "react";
import { getHoldings } from "../services/api";
import { formatINR } from "../utils";

export default function HoldingsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getHoldings()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-24">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="text-center py-24 text-red-500">{error}</div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Current Investments
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Client: <strong>{data.client.client_name}</strong>
        </p>
      </div>

      {/* Total card */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl p-6 text-white">
        <p className="text-indigo-200 text-sm font-medium uppercase tracking-wide">
          Total Portfolio Value
        </p>
        <p className="text-4xl font-bold mt-1">
          {formatINR(data.totalPortfolioValue)}
        </p>
        <p className="text-indigo-200 text-sm mt-2">
          {data.holdings.length} fund{data.holdings.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Holdings table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Fund Name
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Current Value
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                % of Portfolio
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.holdings.map((h) => (
              <tr key={h.holding_id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-800">{h.fund_name}</p>
                </td>
                <td className="px-5 py-4 text-right font-mono font-semibold text-slate-700">
                  {formatINR(h.current_value)}
                </td>
                <td className="px-5 py-4 text-right font-mono text-slate-600">
                  {h.percentage.toFixed(2)}%
                </td>
                <td className="px-5 py-4">
                  {/* Mini bar */}
                  <div className="w-24 bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{ width: `${Math.min(h.percentage, 100)}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 border-t-2 border-slate-200">
              <td className="px-5 py-3 font-bold text-slate-700">Total</td>
              <td className="px-5 py-3 text-right font-bold font-mono text-slate-900">
                {formatINR(data.totalPortfolioValue)}
              </td>
              <td className="px-5 py-3 text-right font-mono font-bold text-slate-700">
                100.00%
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
