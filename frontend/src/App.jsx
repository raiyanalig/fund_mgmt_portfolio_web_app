import React, { useState } from "react";
import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";
import HoldingsPage from "./pages/HoldingsPage";
import HistoryPage from "./pages/HistoryPage";
import ModelPage from "./pages/ModelPage";

const PAGES = {
  dashboard: <DashboardPage />,
  holdings: <HoldingsPage />,
  history: <HistoryPage />,
  model: <ModelPage />,
};

export default function App() {
  const [tab, setTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar active={tab} onChange={setTab} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {PAGES[tab]}
      </main>
    </div>
  );
}
