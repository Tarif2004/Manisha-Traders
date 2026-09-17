const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      default: "Manisha Traders",
      trim: true,
    },
    tagline: {
      type: String,
      default: "Wholesale & Distribution Management",
      trim: true,
    },
    ownerName: {
      type: String,
      default: "Sudipto Das",
      trim: true,
    },
    email: {
      type: String,
      default: "owner@manishatraders.com",
      trim: true,
    },
    phone: {
      type: String,
      default: "9876543210",
      trim: true,
    },
    address: {
      type: String,
      default: "Kolkata, West Bengal",
      trim: true,
    },
    gstin: {
      type: String,
      default: "19ABCDE1234F1Z5",
      trim: true,
    },
    minWholesaleOrderAmount: {
      type: Number,
      default: 5000,
      min: 0,
    },
    bulkDiscountThreshold: {
      type: Number,
      default: 10000,
      min: 0,
    },
    bulkDiscountPercentage: {
      type: Number,
      default: 5,
      min: 0,
      max: 100,
    },
    announcement: {
      type: String,
      default: "Welcome to Manisha Traders. Specialized in wholesale dress distribution across Eastern India.",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", settingsSchema);
