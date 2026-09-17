const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const User = require("../models/User");

dotenv.config();

const createOwner = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const existingOwner = await User.findOne({ role: "owner" });

    if (existingOwner) {
      console.log("Owner account already exists.");
      console.log("Email:", existingOwner.email);
      process.exit();
    }

    // Read credentials from .env — fallback to defaults if not set
    const ownerName     = process.env.OWNER_NAME     || "Sudipto Das";
    const ownerEmail    = process.env.OWNER_EMAIL    || "owner@manishatraders.com";
    const ownerPhone    = process.env.OWNER_PHONE    || "9876543210";
    const ownerPassword = process.env.OWNER_PASSWORD || "Sudipto@123";

    const hashedPassword = await bcrypt.hash(ownerPassword, 10);

    const owner = await User.create({
      name:     ownerName,
      email:    ownerEmail,
      phone:    ownerPhone,
      address:  "Kolkata, West Bengal",
      password: hashedPassword,
      role:     "owner",
      status:   "approved",
      permissions: {
        manageProducts:  true,
        manageOrders:    true,
        manageCustomers: true,
        manageAdmins:    true,
        viewAnalytics:   true,
        manageWebsite:   true,
      },
    });

    console.log("✅ Owner account created successfully!");
    console.log("──────────────────────────────");
    console.log("  Name    :", owner.name);
    console.log("  Email   :", owner.email);
    console.log("  Password:", ownerPassword);
    console.log("──────────────────────────────");
    console.log("You can now log in at http://localhost:5173/login");

    process.exit();
  } catch (error) {
    console.error("Error creating owner:", error);
    process.exit(1);
  }
};

createOwner();