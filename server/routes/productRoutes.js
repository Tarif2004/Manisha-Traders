const express = require("express");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
  getInventoryHistory,
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");

const {
  requirePermission,
} = require("../middleware/roleMiddleware");

const router = express.Router();


// ========================================
// GET ALL PRODUCTS
// ========================================

router.get(
  "/",
  getProducts
);


// ========================================
// INVENTORY HISTORY (MUST BE BEFORE /:id)
// ========================================

router.get(
  "/inventory/history",
  protect,
  requirePermission("manageProducts"),
  getInventoryHistory
);


// ========================================
// GET SINGLE PRODUCT
// ========================================

router.get(
  "/:id",
  getProductById
);


// ========================================
// CREATE PRODUCT
// ========================================

router.post(
  "/",
  protect,
  requirePermission("manageProducts"),
  createProduct
);


// ========================================
// UPDATE PRODUCT
// ========================================

router.patch(
  "/:id",
  protect,
  requirePermission("manageProducts"),
  updateProduct
);


// ========================================
// DELETE PRODUCT
// ========================================

router.delete(
  "/:id",
  protect,
  requirePermission("manageProducts"),
  deleteProduct
);


// ========================================
// UPDATE STOCK
// ========================================

router.patch(
  "/:id/stock",
  protect,
  requirePermission("manageProducts"),
  updateStock
);

module.exports = router;