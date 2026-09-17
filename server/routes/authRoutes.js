const express = require("express");

const {
  register,
  login,
  registerAdmin,
  registerCustomer,
  changePassword,
  getProfile,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Customer registration
router.post(
  "/customer/register",
  registerCustomer
);

// Login
router.post("/login", login);

// Admin SignUp routes
router.post("/admin/register", registerAdmin);

// Current User Profile
router.get("/profile", protect, getProfile);

// Change Password
router.patch("/change-password", protect, changePassword);

module.exports = router;