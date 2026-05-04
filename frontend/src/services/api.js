const BASE = "/api/portfolio";

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "API error");
  return data;
}

// Dashboard
export const getRebalance = () => request(`${BASE}/rebalance`);
export const saveRebalance = () =>
  request(`${BASE}/rebalance/save`, { method: "POST" });

// Holdings
export const getHoldings = () => request(`${BASE}/holdings`);

// Model
export const getModel = () => request(`${BASE}/model`);
export const updateModel = (funds) =>
  request(`${BASE}/model`, {
    method: "PUT",
    body: JSON.stringify({ funds }),
  });

// History
export const getHistory = () => request(`${BASE}/history`);
export const getSessionItems = (id) => request(`${BASE}/history/${id}`);
export const updateSessionStatus = (id, status) =>
  request(`${BASE}/history/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
