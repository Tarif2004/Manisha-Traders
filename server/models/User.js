const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ========================================
    // BASIC USER INFORMATION
    // ========================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    qualification: {
      type: String,
      default: "",
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },


    // ========================================
    // ROLE
    // ========================================

    role: {
      type: String,
      enum: ["owner", "admin", "customer"],
      default: "customer",
    },


    // ========================================
    // ACCOUNT STATUS
    // ========================================

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: function () {
        return this.role === "customer"
          ? "approved"
          : "pending";
      },
    },


    // ========================================
    // ADMIN PERMISSIONS
    // ========================================

    permissions: {
      manageProducts: {
        type: Boolean,
        default: false,
      },

      manageOrders: {
        type: Boolean,
        default: false,
      },

      manageCustomers: {
        type: Boolean,
        default: false,
      },

      manageAdmins: {
        type: Boolean,
        default: false,
      },

      viewAnalytics: {
        type: Boolean,
        default: false,
      },

      manageWebsite: {
        type: Boolean,
        default: false,
      },
    },


    // ========================================
    // SHOP INFORMATION
    // ========================================

    shop: {
      shopName: {
        type: String,
        default: "",
        trim: true,
      },

      shopType: {
        type: String,
        default: "",
        trim: true,
      },

      gstNumber: {
        type: String,
        default: "",
        trim: true,
      },

      shopPhone: {
        type: String,
        default: "",
        trim: true,
      },

      shopAddress: {
        type: String,
        default: "",
        trim: true,
      },

      city: {
        type: String,
        default: "",
        trim: true,
      },

      state: {
        type: String,
        default: "",
        trim: true,
      },

      pincode: {
        type: String,
        default: "",
        trim: true,
      },
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);