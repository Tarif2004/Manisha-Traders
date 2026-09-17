const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");


// ========================================
// GENERATE JWT
// ========================================

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};


// ========================================
// CUSTOMER / GENERAL REGISTER
// ========================================

const register = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      password,
    } = req.body;

    if (
      !name ||
      !phone ||
      !email ||
      !address ||
      !password
    ) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name,
      phone,
      email: email.toLowerCase(),
      address,
      password: hashedPassword,

      role: "customer",
      status: "approved",
    });

    res.status(201).json({
      message: "User registered successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};


// ========================================
// LOGIN
// ========================================

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }


    // ========================================
    // CHECK PASSWORD
    // ========================================

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }


    // ========================================
    // CHECK ACCOUNT STATUS
    // ========================================

    if (
      user.role === "admin" &&
      user.status !== "approved"
    ) {
      return res.status(403).json({
        message:
          "Admin account is not approved by owner",
      });
    }

    if (
      user.status === "rejected"
    ) {
      return res.status(403).json({
        message: "Your account has been rejected",
      });
    }

    if (
      user.status === "suspended"
    ) {
      return res.status(403).json({
        message: "Your account has been suspended",
      });
    }


    // ========================================
    // GENERATE TOKEN
    // ========================================

    const token = generateToken(user);


    // ========================================
    // RESPONSE
    // ========================================

    res.status(200).json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        permissions: user.permissions,
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};


// ========================================
// ADMIN REGISTRATION
// ========================================

const registerAdmin = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      qualification,
      password,
    } = req.body;

    if (
      !name ||
      !phone ||
      !email ||
      !address ||
      !qualification ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Please provide all required admin details",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          "User with this email already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      phone,
      email: email.toLowerCase(),
      address,
      qualification,
      password: hashedPassword,

      role: "admin",

      status: "pending",

      permissions: {
        manageProducts: false,
        manageOrders: false,
        manageCustomers: false,
        manageAdmins: false,
        viewAnalytics: false,
        manageWebsite: false,
      },
    });

    res.status(201).json({
      message:
        "Admin registration successful. Waiting for owner approval.",

      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
        permissions: admin.permissions,
      },
    });

  } catch (error) {
    console.error(
      "ADMIN REGISTRATION ERROR:",
      error
    );

    res.status(500).json({
      message: "Admin registration failed",
      error: error.message,
    });
  }
};


// ========================================
// CUSTOMER REGISTRATION WITH SHOP DETAILS
// ========================================

const registerCustomer = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      password,

      shopName,
      shopType,
      gstNumber,
      shopPhone,
      shopAddress,
      city,
      state,
      pincode,
    } = req.body;


    // ========================================
    // VALIDATION
    // ========================================

    if (
      !name ||
      !phone ||
      !email ||
      !address ||
      !password ||
      !shopName ||
      !shopAddress ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        message:
          "Please provide all required customer and shop details",
      });
    }


    // ========================================
    // CHECK EXISTING USER
    // ========================================

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          "User with this email already exists",
      });
    }


    // ========================================
    // HASH PASSWORD
    // ========================================

    const hashedPassword =
      await bcrypt.hash(password, 10);


    // ========================================
    // CREATE CUSTOMER
    // ========================================

    const customer = await User.create({
      name,
      phone,
      email: email.toLowerCase(),
      address,
      password: hashedPassword,

      role: "customer",

      status: "approved",

      shop: {
        shopName,
        shopType,
        gstNumber,
        shopPhone,
        shopAddress,
        city,
        state,
        pincode,
      },
    });


    // ========================================
    // RESPONSE
    // ========================================

    res.status(201).json({
      message:
        "Customer registered successfully",

      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        role: customer.role,
        status: customer.status,
        shop: customer.shop,
      },
    });

  } catch (error) {
    console.error(
      "CUSTOMER REGISTRATION ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Customer registration failed",

      error: error.message,
    });
  }
};


// ========================================
// CHANGE PASSWORD
// ========================================

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    res.status(500).json({
      message: "Failed to change password",
      error: error.message,
    });
  }
};

// ========================================
// GET CURRENT PROFILE
// ========================================

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  register,
  login,
  registerAdmin,
  registerCustomer,
  changePassword,
  getProfile,
};