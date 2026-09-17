const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");
const InventoryTransaction = require("../models/InventoryTransaction");


// ========================================
// CHECK ORDER MANAGEMENT PERMISSION
// ========================================

const checkOrderPermission = (user) => {

  // Owner has complete access
  if (user.role === "owner") {
    return true;
  }

  // Admin needs manageOrders permission
  if (
    user.role === "admin" &&
    user.permissions &&
    user.permissions.manageOrders === true
  ) {
    return true;
  }

  return false;
};


// ========================================
// GET ALL ORDERS
// ========================================

const getAllOrders = async (req, res) => {
  try {

    // Permission check
    if (!checkOrderPermission(req.user)) {
      return res.status(403).json({
        message:
          "You do not have permission to manage orders",
      });
    }


    // Get all orders
    const orders = await Order.find()
      .populate(
        "customer",
        "name email phone address shop"
      )
      .populate(
        "items.product",
        "name sku category"
      )
      .sort({
        createdAt: -1,
      });


    res.status(200).json({
      count: orders.length,
      orders,
    });

  } catch (error) {

    console.error(
      "GET ALL ORDERS ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch orders",

      error:
        error.message,
    });
  }
};


// ========================================
// GET SINGLE ORDER
// ========================================

const getOrderById = async (req, res) => {
  try {

    // Permission check
    if (!checkOrderPermission(req.user)) {
      return res.status(403).json({
        message:
          "You do not have permission to view orders",
      });
    }


    // Find order
    const order = await Order.findById(
      req.params.id
    )
      .populate(
        "customer",
        "name email phone address shop"
      )
      .populate(
        "items.product",
        "name sku category"
      );


    if (!order) {
      return res.status(404).json({
        message:
          "Order not found",
      });
    }


    res.status(200).json({
      order,
    });

  } catch (error) {

    console.error(
      "GET ORDER ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch order",

      error:
        error.message,
    });
  }
};


// ========================================
// UPDATE ORDER STATUS
// ========================================

const updateOrderStatus = async (
  req,
  res
) => {
  try {

    // Permission check
    if (!checkOrderPermission(req.user)) {
      return res.status(403).json({
        message:
          "You do not have permission to manage orders",
      });
    }


    const {
      status,
    } = req.body;


    // Valid statuses
    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];


    if (
      !validStatuses.includes(status)
    ) {
      return res.status(400).json({
        message:
          "Invalid order status",
      });
    }


    // Find order
    const order = await Order.findById(
      req.params.id
    );


    if (!order) {
      return res.status(404).json({
        message:
          "Order not found",
      });
    }


    // Delivered orders cannot change
    if (
      order.status === "delivered"
    ) {
      return res.status(400).json({
        message:
          "Delivered order cannot be changed",
      });
    }


    // Cancelled orders cannot change
    if (
      order.status === "cancelled"
    ) {
      return res.status(400).json({
        message:
          "Cancelled order cannot be changed",
      });
    }


    // Allowed status transitions
    const allowedTransitions = {

      pending: [
        "confirmed",
        "cancelled",
      ],

      confirmed: [
        "processing",
        "cancelled",
      ],

      processing: [
        "shipped",
        "cancelled",
      ],

      shipped: [
        "delivered",
      ],

      delivered: [],

      cancelled: [],
    };


    const allowedNextStatuses =
      allowedTransitions[
        order.status
      ];


    if (
      !allowedNextStatuses.includes(
        status
      )
    ) {
      return res.status(400).json({
        message:
          `Cannot change order from ${order.status} to ${status}`,
      });
    }


    // Update status
    order.status = status;

    await order.save();


    // Get updated order
    const updatedOrder =
      await Order.findById(
        order._id
      )
        .populate(
          "customer",
          "name email phone"
        )
        .populate(
          "items.product",
          "name sku category"
        );


    res.status(200).json({
      message:
        `Order status changed to ${status}`,

      order:
        updatedOrder,
    });

  } catch (error) {

    console.error(
      "UPDATE ORDER STATUS ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update order status",

      error:
        error.message,
    });
  }
};


// ========================================
// CANCEL ORDER
// + RESTORE INVENTORY
// + MONGODB TRANSACTION
// ========================================

const cancelOrder = async (
  req,
  res
) => {

  // Start MongoDB session
  const session =
    await mongoose.startSession();

  try {

    // ========================================
    // PERMISSION CHECK
    // ========================================

    if (!checkOrderPermission(req.user)) {
      return res.status(403).json({
        message:
          "You do not have permission to manage orders",
      });
    }


    // ========================================
    // START TRANSACTION
    // ========================================

    session.startTransaction();


    // ========================================
    // FIND ORDER
    // ========================================

    const order =
      await Order.findById(
        req.params.id
      ).session(session);


    if (!order) {

      await session.abortTransaction();

      return res.status(404).json({
        message:
          "Order not found",
      });
    }


    // ========================================
    // CHECK ORDER STATUS
    // ========================================

    if (
      order.status === "cancelled"
    ) {

      await session.abortTransaction();

      return res.status(400).json({
        message:
          "Order is already cancelled",
      });
    }


    if (
      order.status === "delivered"
    ) {

      await session.abortTransaction();

      return res.status(400).json({
        message:
          "Delivered order cannot be cancelled",
      });
    }


    // ========================================
    // RESTORE INVENTORY
    // ========================================

    for (
      const item of order.items
    ) {

      // Find product inside transaction
      const product =
        await Product.findById(
          item.product
        ).session(session);


      if (!product) {

        throw new Error(
          `Product not found: ${item.product}`
        );
      }


      // Stock before restoration
      const stockBefore =
        product.stock;


      // Restore stock
      product.stock =
        product.stock +
        item.quantity;


      await product.save({
        session,
      });


      // ========================================
      // CREATE INVENTORY TRANSACTION
      // ========================================

      await InventoryTransaction.create(
        [
          {
            product:
              product._id,

            type:
              "return",

            quantity:
              item.quantity,

            stockBefore:
              stockBefore,

            stockAfter:
              product.stock,

            reason:
              `Order ${order.orderNumber} cancelled - inventory restored`,

            performedBy:
              req.user._id,
          },
        ],
        {
          session,
        }
      );
    }


    // ========================================
    // UPDATE ORDER
    // ========================================

    order.status =
      "cancelled";

    order.cancelledAt =
      new Date();

    order.cancelledBy =
      req.user._id;


    await order.save({
      session,
    });


    // ========================================
    // COMMIT TRANSACTION
    // ========================================

    await session.commitTransaction();


    // ========================================
    // GET UPDATED ORDER
    // ========================================

    const updatedOrder =
      await Order.findById(
        order._id
      )
        .populate(
          "customer",
          "name email phone"
        )
        .populate(
          "items.product",
          "name sku category"
        );


    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      message:
        "Order cancelled and inventory restored successfully",

      order:
        updatedOrder,
    });

  } catch (error) {

    // ========================================
    // ROLLBACK
    // ========================================

    await session.abortTransaction();


    console.error(
      "CANCEL ORDER ERROR:",
      error
    );


    return res.status(500).json({
      message:
        "Failed to cancel order. No changes were made.",

      error:
        error.message,
    });

  } finally {

    // End session
    session.endSession();
  }
};


// ========================================
// EXPORT
// ========================================

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};