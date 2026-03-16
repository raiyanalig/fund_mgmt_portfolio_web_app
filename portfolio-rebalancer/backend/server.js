const express = require("express");
const cors = require("cors");
const { initDb, seedDb } = require("./db/database");
const portfolioRoutes = require("./routes/portfolio");

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());


app.use("/api/portfolio", portfolioRoutes);


app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});


initDb();
seedDb();

app.listen(PORT, () => {
  console.log(`\n🚀 Portfolio Rebalancer API running on http://localhost:${PORT}`);
  console.log(`   Endpoints: http://localhost:${PORT}/api/portfolio/rebalance\n`);
});
