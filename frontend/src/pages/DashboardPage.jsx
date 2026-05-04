import React, { useEffect, useState } from "react";
import { getRebalance, saveRebalance } from "../services/api";
import SummaryCards from "../components/SummaryCards";
import RebalanceTable from "../components/RebalanceTable";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const result = await getRebalance();
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveMsg(null);
    try {
      const result = await saveRebalance();
      setSaveMsg({
        type: "success",
        text: `✅ Saved as session #${result.sessionId}. Check History tab.`,
      });
    } catch (e) {
      setSaveMsg({ type: "error", text: `❌ ${e.message}` });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Portfolio Rebalance Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Client: <strong>{data.client.client_name}</strong> · Recommendations
            based on current model portfolio
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            {saving ? "Saving…" : "💾 Save Recommendation"}
          </button>
        </div>
      </div>

      {/* Save feedback */}
      {saveMsg && (
        <div
          className={`px-4 py-3 rounded-lg text-sm font-medium ${
            saveMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {saveMsg.text}
        </div>
      )}

      {/* Summary Cards */}
      <SummaryCards data={data} />

      {/* Legend */}
      <div className="flex items-center gap-5 text-xs text-slate-500">
        <span className="font-semibold text-slate-600">Legend:</span>
        {[
          { label: "BUY — Underweight", color: "bg-emerald-400" },
          { label: "SELL — Overweight", color: "bg-red-400" },
          { label: "REVIEW — Not in model", color: "bg-amber-400" },
          { label: "HOLD — Perfectly allocated", color: "bg-slate-300" },
        ].map((l) => (
          <span key={l.label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
            {l.label}
          </span>
        ))}
      </div>

      {/* Main table */}
      <RebalanceTable items={data.items} />

      {/* Footer note */}
      <p className="text-xs text-slate-400 text-right">
        ⚠️ Calculations are based on current portfolio value of{" "}
        <strong>
          ₹{data.totalPortfolioValue.toLocaleString("en-IN")}
        </strong>
        . Post-rebalance drift may vary with market movement.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
      <p className="text-sm">Calculating recommendations…</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="text-5xl">⚠️</div>
      <p className="text-red-600 font-medium">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg"
      >
        Retry
      </button>
    </div>
  );
}
