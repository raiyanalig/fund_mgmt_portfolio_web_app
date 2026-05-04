const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/portfolioController");


router.get("/rebalance", ctrl.getRebalanceRecommendation);

router.post("/rebalance/save", ctrl.saveRebalanceSession);


router.get("/holdings", ctrl.getHoldings);

router.get("/model", ctrl.getModelFunds);
router.put("/model", ctrl.updateModelFunds);

router.get("/history", ctrl.getRebalanceHistory);
router.get("/history/:sessionId", ctrl.getSessionItems);
router.patch("/history/:sessionId/status", ctrl.updateSessionStatus);

module.exports = router;
