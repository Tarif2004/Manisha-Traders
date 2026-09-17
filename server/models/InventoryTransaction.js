const mongoose = require("mongoose");

const inventoryTransactionSchema = new mongoose.Schema(
  {
    // ========================================
    // PRODUCT
    // ========================================

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },


    // ========================================
    // TRANSACTION TYPE
    // ========================================

    type: {
      type: String,
      enum: [
        "purchase",
        "sale",
        "return",
        "damage",
        "adjustment",
      ],
      required: true,
    },


    // ========================================
    // QUANTITY
    // ========================================

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },


    // ========================================
    // STOCK BEFORE / AFTER
    // ========================================

    stockBefore: {
      type: Number,
      required: true,
      min: 0,
    },

    stockAfter: {
      type: Number,
      required: true,
      min: 0,
    },


    // ========================================
    // REASON
    // ========================================

    reason: {
      type: String,
      default: "",
      trim: true,
    },


    // ========================================
    // PERFORMED BY
    // ========================================

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "InventoryTransaction",
  inventoryTransactionSchema
);