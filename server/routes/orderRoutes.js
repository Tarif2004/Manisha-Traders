const express = require("express");

const {
  createOrder,
  getCustomerOrders,
  getCustomerOrderById,
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// ========================================
// CREATE ORDER
// ========================================

router.post(
  "/",
  protect,
  createOrder
);


// ========================================
// GET CUSTOMER ORDERS
// ========================================

router.get(
  "/my-orders",
  protect,
  getCustomerOrders
);


// ========================================
// GET SINGLE CUSTOMER ORDER
// ========================================

router.get(
  "/my-orders/:id",
  protect,
  getCustomerOrderById
);


module.exports = router;