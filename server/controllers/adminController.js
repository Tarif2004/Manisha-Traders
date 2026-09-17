const User = require("../models/User");
const Order = require("../models/Order");
const Settings = require("../models/Settings");

// ========================================
// GET PENDING ADMIN APPLICATIONS
// ========================================

const getAdminApplications = async (req, res) => {
  try {
    const applications = await User.find({
      role: "admin",
      status: "pending",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: applications.length,
      applications,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch admin applications",
    });
  }
};


// ========================================
// APPROVE ADMIN
// ========================================

const approveAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findOne({
      _id: id,
      role: "admin",
    });

    if (!admin) {
      return res.status(404).json({
        message: "Admin application not found",
      });
    }

    if (admin.status === "approved") {
      return res.status(400).json({
        message: "Admin is already approved",
      });
    }

    admin.status = "approved";

    // Default permissions
    admin.permissions = {
      manageProducts: true,
      manageOrders: true,
      manageCustomers: true,
      manageAdmins: false,
      viewAnalytics: false,
      manageWebsite: false,
    };

    await admin.save();

    res.status(200).json({
      message: "Admin approved successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        status: admin.status,
        permissions: admin.permissions,
      },
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to approve admin",
    });
  }
};


// ========================================
// REJECT ADMIN
// ========================================

const rejectAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findOne({
      _id: id,
      role: "admin",
    });

    if (!admin) {
      return res.status(404).json({
        message: "Admin application not found",
      });
    }

    admin.status = "rejected";

    await admin.save();

    res.status(200).json({
      message: "Admin application rejected",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to reject admin",
    });
  }
};


// ========================================
// GET ALL ADMINS
// ========================================

const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({
      role: "admin",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: admins.length,
      admins,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch admins",
    });
  }
};


// ========================================
// UPDATE ADMIN PERMISSIONS
// ========================================

const updateAdminPermissions = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Admin ID:", id);
    console.log("Request body:", req.body);

    const {
      manageProducts,
      manageOrders,
      manageCustomers,
      manageAdmins,
      viewAnalytics,
      manageWebsite,
    } = req.body;

    const admin = await User.findOne({
      _id: id,
      role: "admin",
    });

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    admin.permissions = {
      manageProducts:
        manageProducts !== undefined
          ? manageProducts
          : admin.permissions.manageProducts,

      manageOrders:
        manageOrders !== undefined
          ? manageOrders
          : admin.permissions.manageOrders,

      manageCustomers:
        manageCustomers !== undefined
          ? manageCustomers
          : admin.permissions.manageCustomers,

      manageAdmins:
        manageAdmins !== undefined
          ? manageAdmins
          : admin.permissions.manageAdmins,

      viewAnalytics:
        viewAnalytics !== undefined
          ? viewAnalytics
          : admin.permissions.viewAnalytics,

      manageWebsite:
        manageWebsite !== undefined
          ? manageWebsite
          : admin.permissions.manageWebsite,
    };

    await admin.save();

    res.status(200).json({
      message: "Admin permissions updated successfully",

      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        status: admin.status,
        permissions: admin.permissions,
      },
    });

  } catch (error) {

    console.error("UPDATE PERMISSION ERROR:");
    console.error(error);

    res.status(500).json({
      message: "Failed to update permissions",
      error: error.message,
    });
  }
};

// ========================================
// SUSPEND ADMIN
// ========================================

const suspendAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findOne({
      _id: id,
      role: "admin",
    });

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    admin.status = "suspended";

    await admin.save();

    res.status(200).json({
      message: "Admin suspended successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to suspend admin",
    });
  }
};


// ========================================
// GET ALL CUSTOMERS
// ========================================

const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({
      role: "customer",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    const customerIds = customers.map((c) => c._id);
    const orderStats = await Order.aggregate([
      { $match: { customer: { $in: customerIds } } },
      {
        $group: {
          _id: "$customer",
          totalOrders: { $sum: 1 },
          totalSpent: {
            $sum: {
              $cond: [{ $ne: ["$status", "cancelled"] }, "$totalAmount", 0],
            },
          },
        },
      },
    ]);

    const statsMap = {};
    orderStats.forEach((stat) => {
      statsMap[stat._id.toString()] = stat;
    });

    const customersWithStats = customers.map((c) => {
      const stats = statsMap[c._id.toString()] || {
        totalOrders: 0,
        totalSpent: 0,
      };
      return {
        ...c.toObject(),
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
      };
    });

    res.status(200).json({
      count: customersWithStats.length,
      customers: customersWithStats,
    });
  } catch (error) {
    console.error("GET CUSTOMERS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE CUSTOMER STATUS
// ========================================

const updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["approved", "suspended", "rejected", "pending"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const customer = await User.findOne({
      _id: id,
      role: "customer",
    }).select("-password");

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    customer.status = status;
    await customer.save();

    res.status(200).json({
      message: `Customer account ${status} successfully`,
      customer,
    });
  } catch (error) {
    console.error("UPDATE CUSTOMER STATUS ERROR:", error);
    res.status(500).json({
      message: "Failed to update customer status",
      error: error.message,
    });
  }
};

// ========================================
// GET DISTRIBUTOR SETTINGS
// ========================================

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    res.status(200).json({
      settings,
    });
  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch settings",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE DISTRIBUTOR SETTINGS
// ========================================

const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    const allowedFields = [
      "businessName",
      "tagline",
      "ownerName",
      "email",
      "phone",
      "address",
      "gstin",
      "minWholesaleOrderAmount",
      "bulkDiscountThreshold",
      "bulkDiscountPercentage",
      "announcement",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    await settings.save();

    res.status(200).json({
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);
    res.status(500).json({
      message: "Failed to update settings",
      error: error.message,
    });
  }
};

module.exports = {
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
};


async function testProductPermission(req, res) {
    res.json({
        message: "You have permission to manage products!",
        user: req.user.name,
        role: req.user.role,
    });
}