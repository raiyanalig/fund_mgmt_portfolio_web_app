import React, { useEffect, useState } from "react";
import { getModel, updateModel } from "../services/api";

export default function ModelPage() {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    getModel()
      .then((d) => setFunds(d.funds.map((f) => ({ ...f }))))
      .finally(() => setLoading(false));
  }, []);

  const total = funds.reduce((sum, f) => sum + Number(f.allocation_pct || 0), 0);
  const totalRounded = Math.round(total * 100) / 100;
  const isValid = totalRounded === 100;

  function handleChange(idx, value) {
    setFunds((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], allocation_pct: value };
      return updated;
    });
    setMessage(null);
  }

  async function handleSave() {
    if (!isValid) {
      setMessage({ type: "error", text: `Allocations sum to ${totalRounded}%. Must equal exactly 100%.` });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const payload = funds.map((f) => ({
        fund_id: f.fund_id,
        allocation_pct: Number(f.allocation_pct),
      }));
      await updateModel(payload);
      setMessage({ type: "success", text: "✅ Model portfolio updated. Dashboard will reflect new targets." });
    } catch (e) {
      setMessage({ type: "error", text: `❌ ${e.message}` });
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-24">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Model Portfolio</h1>
        <p className="text-slate-500 text-sm mt-1">
          Adjust target allocation percentages. They must sum to exactly 100%.
        </p>
      </div>

      {message && (
        <div
          className={`px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-3 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <span className="col-span-1">Fund Name</span>
          <span>Asset Class</span>
          <span className="text-right">Target %</span>
        </div>

        {/* Fund rows */}
        <div className="divide-y divide-slate-100">
          {funds.map((fund, idx) => (
            <div
              key={fund.fund_id}
              className="grid grid-cols-3 gap-4 items-center px-5 py-4"
            >
              <div className="col-span-1">
                <p className="text-sm font-medium text-slate-800">{fund.fund_name}</p>
              </div>
              <div>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                  {fund.asset_class}
                </span>
              </div>
              <div className="flex justify-end">
                <div className="relative w-28">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={fund.allocation_pct}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-right pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                    %
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer: sum indicator */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-t-2 ${
            isValid
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <span className={`text-sm font-semibold ${isValid ? "text-emerald-700" : "text-red-700"}`}>
            {isValid ? "✅ Total allocation is valid" : `⚠️ Total must be 100% — currently ${totalRounded}%`}
          </span>
          <span
            className={`text-xl font-bold font-mono ${
              isValid ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {totalRounded.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !isValid}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
        <button
          onClick={() => {
            getModel().then((d) => {
              setFunds(d.funds.map((f) => ({ ...f })));
              setMessage(null);
            });
          }}
          className="px-6 py-2.5 border border-slate-200 hover:border-slate-300 text-slate-600 text-sm font-medium rounded-lg transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
