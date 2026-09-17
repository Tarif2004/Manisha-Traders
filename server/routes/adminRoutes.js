const express = require("express");

const {
  getAdminApplications,
  approveAdmin,
  rejectAdmin,
  getAllAdmins,
  updateAdminPermissions,
  suspendAdmin,
  testProductPermission,
  getAllCustomers,
  updateCustomerStatus,
  getSettings,
  updateSettings,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");

const {
  ownerOnly,
  requirePermission,
} = require("../middleware/roleMiddleware");

const router = express.Router();

// ========================================
// ADMIN APPLICATION MANAGEMENT
// ========================================

// Get pending admin applications
router.get(
  "/applications",
  protect,
  ownerOnly,
  getAdminApplications
);

// Approve admin
router.patch(
  "/:id/approve",
  protect,
  ownerOnly,
  approveAdmin
);

// Reject admin
router.patch(
  "/:id/reject",
  protect,
  ownerOnly,
  rejectAdmin
);

// Get all admins
router.get(
  "/",
  protect,
  ownerOnly,
  getAllAdmins
);

// Update admin permissions
router.patch(
  "/:id/permissions",
  protect,
  ownerOnly,
  updateAdminPermissions
);

// Suspend admin
router.patch(
  "/:id/suspend",
  protect,
  ownerOnly,
  suspendAdmin
);

// Test product permission
router.get(
  "/test-products-permission",
  protect,
  requirePermission("manageProducts"),
  testProductPermission
);

// ========================================
// CUSTOMER MANAGEMENT
// ========================================

// Get all customers (Owner or Admin with manageCustomers)
router.get(
  "/customers",
  protect,
  requirePermission("manageCustomers"),
  getAllCustomers
);

// Update customer status
router.patch(
  "/customers/:id/status",
  protect,
  requirePermission("manageCustomers"),
  updateCustomerStatus
);

// ========================================
// DISTRIBUTOR SETTINGS
// ========================================

// Get settings
router.get(
  "/settings",
  protect,
  getSettings
);

// Update settings (Owner or Admin with manageWebsite)
router.patch(
  "/settings",
  protect,
  requirePermission("manageWebsite"),
  updateSettings
);

module.exports = router;