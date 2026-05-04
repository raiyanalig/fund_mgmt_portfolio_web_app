import React from "react";

const TABS = [
  { id: "dashboard", label: "Rebalance Dashboard", icon: "⚖️" },
  { id: "holdings", label: "Current Investments", icon: "📊" },
  { id: "history", label: "History", icon: "🕐" },
  { id: "model", label: "Edit Model Portfolio", icon: "✏️" },
];

export default function Navbar({ active, onChange }) {
  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 gap-2">
          {/* Logo */}
          <div className="flex items-center gap-3 mr-8">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-sm font-bold text-white">
              R
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">
              RebalancePro
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  transition-all duration-150
                  ${
                    active === tab.id
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
