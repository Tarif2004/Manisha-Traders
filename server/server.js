const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

// ========================================
// MIDDLEWARE
// ========================================

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// ========================================
// ROUTES
// ========================================

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/analytics", analyticsRoutes);

// ========================================
// HOME ROUTE
// ========================================

app.get("/", (req, res) => {
  res.json({
    message: "Manisha Traders API is running",
    environment: process.env.NODE_ENV || "development",
  });
});

// ========================================
// MONGODB + SERVER
// ========================================

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
      console.log(`Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:");
    console.error(error);
  });
