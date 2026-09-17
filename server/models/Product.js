const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // ========================================
    // BASIC PRODUCT INFORMATION
    // ========================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },


    // ========================================
    // DRESS INFORMATION
    // ========================================

    brand: {
      type: String,
      default: "Manisha Traders",
    },

    color: {
      type: String,
      required: true,
      trim: true,
    },

    sizes: {
      type: [String],
      default: [],
    },


    // ========================================
    // PRICING
    // ========================================

    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    wholesalePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },


    // ========================================
    // INVENTORY
    // ========================================

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    minimumOrderQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },


    // ========================================
    // PRODUCT STATUS
    // ========================================

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },


    // ========================================
    // PRODUCT IMAGE
    // ========================================

    image: {
      type: String,
      default: "",
    },


    // ========================================
    // CREATED BY
    // ========================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },

  {
    timestamps: true,
  }
);


// ========================================
// LOW STOCK VIRTUAL
// ========================================

productSchema.virtual("isLowStock").get(function () {
  return this.stock <= this.lowStockThreshold;
});


// Allow virtual fields in JSON
productSchema.set("toJSON", {
  virtuals: true,
});


module.exports = mongoose.model("Product", productSchema);