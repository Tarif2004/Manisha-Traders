const express = require("express");

const {
  getDashboardOverview,
  getSalesAnalytics,
  getOrderAnalytics,
  getTopProducts,
  getCustomerAnalytics,
  getInventoryAnalytics,
  getAiInsights,
} = require("../controllers/analyticsController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ========================================
// DASHBOARD OVERVIEW
// ========================================

router.get(
  "/dashboard",
  authMiddleware,
  getDashboardOverview
);

// ========================================
// SALES ANALYTICS
// ========================================

router.get(
  "/sales",
  authMiddleware,
  getSalesAnalytics
);  

// ========================================
// ORDER ANALYTICS
// ========================================

router.get(
  "/orders",
  authMiddleware,
  getOrderAnalytics
);

// ========================================
// TOP SELLING PRODUCTS ANALYTICS
// ========================================

router.get(
  "/top-products",
  authMiddleware,
  getTopProducts
);

// ========================================
// CUSTOMER ANALYTICS
// ========================================

router.get(
  "/customers",
  authMiddleware,
  getCustomerAnalytics
);
 
// ========================================
// INVENTORY ANALYTICS
// ========================================

router.get(
  "/inventory",
  authMiddleware,
  getInventoryAnalytics
);

// ========================================
// AI BUSINESS INTELLIGENCE & FORECASTING
// ========================================

router.get(
  "/ai-insights",
  authMiddleware,
  getAiInsights
);

module.exports = router;