const mongoose = require("mongoose");


// ========================================
// ORDER ITEM SCHEMA
// ========================================

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    sku: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);


// ========================================
// ORDER SCHEMA
// ========================================

const orderSchema = new mongoose.Schema(
  {
    // ========================================
    // CUSTOMER
    // ========================================

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },


    // ========================================
    // ORDER NUMBER
    // ========================================

    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },


    // ========================================
    // PRODUCTS
    // ========================================

    items: {
      type: [orderItemSchema],

      required: true,

      validate: {
        validator: function (items) {
          return items.length > 0;
        },

        message:
          "Order must contain at least one product",
      },
    },


    // ========================================
    // SHOP SNAPSHOT
    // ========================================

    shopDetails: {
      shopName: {
        type: String,
      },

      shopPhone: {
        type: String,
      },

      shopAddress: {
        type: String,
      },

      city: {
        type: String,
      },

      state: {
        type: String,
      },

      pincode: {
        type: String,
      },

      gstNumber: {
        type: String,
      },
    },


    // ========================================
    // BILLING
    // ========================================

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },


    // ========================================
    // ORDER STATUS
    // ========================================

    status: {
      type: String,

      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],

      default: "pending",
    },


    // ========================================
    // PAYMENT STATUS
    // ========================================

    paymentStatus: {
      type: String,

      enum: [
        "pending",
        "partial",
        "paid",
      ],

      default: "pending",
    },


    // ========================================
    // CUSTOMER NOTE
    // ========================================

    customerNote: {
      type: String,
      default: "",
    },


    // ========================================
    // CANCELLATION INFORMATION
    // ========================================

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },

  // ========================================
  // SCHEMA OPTIONS
  // ========================================

  {
    timestamps: true,
  }
);


// ========================================
// EXPORT ORDER MODEL
// ========================================

module.exports = mongoose.model(
  "Order",
  orderSchema
);