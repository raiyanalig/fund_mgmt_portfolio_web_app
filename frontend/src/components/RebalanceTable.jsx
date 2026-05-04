import React from "react";
import { formatINR, formatPct, actionStyle } from "../utils";

function DriftBar({ drift }) {
  const clamped = Math.max(-15, Math.min(15, drift));
  const pct = Math.abs(clamped / 15) * 50;
  const isPositive = drift >= 0;

  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-2 bg-slate-100 rounded-full relative overflow-hidden">
        {/* Center line */}
        <div className="absolute top-0 left-1/2 w-px h-full bg-slate-300" />
        {/* Fill */}
        <div
          className={`absolute top-0 h-full rounded-full ${
            isPositive ? "bg-emerald-400 left-1/2" : "bg-red-400 right-1/2"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`text-xs font-mono w-14 text-right ${
          drift > 0
            ? "text-emerald-600"
            : drift < 0
            ? "text-red-600"
            : "text-slate-400"
        }`}
      >
        {formatPct(drift)}
      </span>
    </div>
  );
}

export default function RebalanceTable({ items }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                Fund Name
              </th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                Target %
              </th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                Current %
              </th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                Drift
              </th>
              <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                Action
              </th>
              <th className="text-right px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, idx) => {
              const style = actionStyle(item.action);
              return (
                <tr
                  key={idx}
                  className={`transition-colors ${style.row}`}
                >
                  {/* Fund Name */}
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-slate-800">{item.fund_name}</p>
                      {item.asset_class && item.asset_class !== "N/A" && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {item.asset_class}
                        </p>
                      )}
                      {!item.is_model_fund && (
                        <span className="inline-block mt-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                          Not in model
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Target % */}
                  <td className="px-4 py-4 text-right font-mono text-slate-600">
                    {item.target_pct > 0 ? `${item.target_pct.toFixed(2)}%` : "—"}
                  </td>

                  {/* Current % */}
                  <td className="px-4 py-4 text-right font-mono text-slate-700 font-medium">
                    {item.current_pct.toFixed(2)}%
                  </td>

                  {/* Drift bar */}
                  <td className="px-4 py-4">
                    {item.is_model_fund ? (
                      <DriftBar drift={item.drift} />
                    ) : (
                      <span className="text-xs text-slate-400">N/A</span>
                    )}
                  </td>

                  {/* Action badge */}
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${style.badge}`}
                    >
                      {item.action}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="px-5 py-4 text-right">
                    {item.action === "REVIEW" || item.action === "HOLD" ? (
                      <span className="text-slate-400 font-mono text-xs">—</span>
                    ) : (
                      <span className={`font-mono font-semibold ${style.text}`}>
                        {formatINR(item.amount)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
