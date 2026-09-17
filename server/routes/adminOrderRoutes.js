const express = require("express");

const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/adminOrderController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// ========================================
// GET ALL ORDERS
// ========================================

router.get(
  "/",
  protect,
  getAllOrders
);


// ========================================
// GET SINGLE ORDER
// ========================================

router.get(
  "/:id",
  protect,
  getOrderById
);


// ========================================
// UPDATE ORDER STATUS
// ========================================

router.patch(
  "/:id/status",
  protect,
  updateOrderStatus
);

// ========================================
// CANCEL ORDER
// ========================================

router.patch(
  "/:id/cancel",
  protect,
  cancelOrder
);

module.exports = router;