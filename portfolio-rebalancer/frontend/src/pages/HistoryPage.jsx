import React, { useEffect, useState } from "react";
import { getHistory, getSessionItems, updateSessionStatus } from "../services/api";
import { formatINR, formatDate, statusStyle } from "../utils";

export default function HistoryPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [sessionItems, setSessionItems] = useState({});
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    try {
      const result = await getHistory();
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleExpand(sessionId) {
    if (expandedId === sessionId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(sessionId);
    if (!sessionItems[sessionId]) {
      const result = await getSessionItems(sessionId);
      setSessionItems((prev) => ({ ...prev, [sessionId]: result.items }));
    }
  }

  async function changeStatus(sessionId, status) {
    setUpdating(sessionId);
    try {
      await updateSessionStatus(sessionId, status);
      await fetchHistory();
    } finally {
      setUpdating(null);
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-24">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );

  if (error)
    return <div className="text-center py-24 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Rebalance History</h1>
        <p className="text-slate-500 text-sm mt-1">
          All past rebalancing recommendations for{" "}
          <strong>{data.client.client_name}</strong>
        </p>
      </div>

      {data.sessions.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-4xl mb-3">📭</div>
          <p>No rebalancing sessions saved yet.</p>
          <p className="text-sm mt-1">
            Go to the Dashboard and click "Save Recommendation".
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.sessions.map((session) => (
            <div
              key={session.session_id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Session row */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Date</p>
                    <p className="text-sm font-medium text-slate-700">
                      {formatDate(session.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Portfolio Value</p>
                    <p className="text-sm font-semibold font-mono text-slate-700">
                      {formatINR(session.portfolio_value)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Total Buy</p>
                    <p className="text-sm font-semibold font-mono text-emerald-600">
                      {formatINR(session.total_to_buy)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Total Sell</p>
                    <p className="text-sm font-semibold font-mono text-red-600">
                      {formatINR(session.total_to_sell)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Status</p>
                    <span className={`inline-block mt-1 text-xs font-bold px-2.5 py-1 rounded-full ${statusStyle(session.status)}`}>
                      {session.status}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {session.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => changeStatus(session.session_id, "APPLIED")}
                        disabled={updating === session.session_id}
                        className="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        ✓ Apply
                      </button>
                      <button
                        onClick={() => changeStatus(session.session_id, "DISMISSED")}
                        disabled={updating === session.session_id}
                        className="text-xs px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        ✕ Dismiss
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => toggleExpand(session.session_id)}
                    className="text-xs px-3 py-1.5 border border-slate-200 hover:border-slate-300 text-slate-600 rounded-lg font-medium transition-colors"
                  >
                    {expandedId === session.session_id ? "▲ Hide" : "▼ Details"}
                  </button>
                </div>
              </div>

              {/* Expanded items */}
              {expandedId === session.session_id && sessionItems[session.session_id] && (
                <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-400 uppercase tracking-wide">
                        <th className="text-left pb-2">Fund</th>
                        <th className="text-right pb-2">Action</th>
                        <th className="text-right pb-2">Amount</th>
                        <th className="text-right pb-2">Current %</th>
                        <th className="text-right pb-2">Target %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {sessionItems[session.session_id].map((item) => (
                        <tr key={item.item_id}>
                          <td className="py-2 font-medium text-slate-700">{item.fund_name}</td>
                          <td className="py-2 text-right">
                            <span className={`font-bold ${
                              item.action === "BUY" ? "text-emerald-600" :
                              item.action === "SELL" ? "text-red-600" :
                              item.action === "REVIEW" ? "text-amber-600" :
                              "text-slate-400"
                            }`}>{item.action}</span>
                          </td>
                          <td className="py-2 text-right font-mono">{formatINR(item.amount)}</td>
                          <td className="py-2 text-right font-mono">{item.current_pct.toFixed(2)}%</td>
                          <td className="py-2 text-right font-mono">
                            {item.target_pct > 0 ? `${item.target_pct.toFixed(2)}%` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
