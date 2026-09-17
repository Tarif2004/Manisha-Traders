const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const InventoryTransaction = require("../models/InventoryTransaction");


// ========================================
// GENERATE ORDER NUMBER
// ========================================

const generateOrderNumber = () => {
  const timestamp = Date.now();

  const randomNumber = Math.floor(
    1000 + Math.random() * 9000
  );

  return `MT-${timestamp}-${randomNumber}`;
};


// ========================================
// CREATE ORDER
// ========================================

const createOrder = async (req, res) => {
  try {

    const {
      items,
      customerNote,
    } = req.body;


    // ========================================
    // CHECK CUSTOMER
    // ========================================

    const customer = await User.findById(
      req.user._id
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }


    // ========================================
    // CHECK ITEMS
    // ========================================

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message:
          "Order must contain at least one product",
      });
    }


    // ========================================
    // CHECK SHOP INFORMATION
    // ========================================

    if (
      !customer.shop ||
      !customer.shop.shopName ||
      !customer.shop.shopAddress
    ) {
      return res.status(400).json({
        message:
          "Please complete your shop information before placing an order",
      });
    }


    // ========================================
    // PREPARE ORDER ITEMS
    // ========================================

    const orderItems = [];

    let subtotal = 0;


    // ========================================
    // PROCESS EACH PRODUCT
    // ========================================

    for (const item of items) {

      const {
        product: productId,
        quantity,
      } = item;


      // ----------------------------------------
      // VALIDATE QUANTITY
      // ----------------------------------------

      if (
        !quantity ||
        quantity <= 0 ||
        !Number.isInteger(quantity)
      ) {
        return res.status(400).json({
          message:
            "Product quantity must be a positive whole number",
        });
      }


      // ----------------------------------------
      // FIND PRODUCT
      // ----------------------------------------

      const product =
        await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          message:
            `Product not found: ${productId}`,
        });
      }


      // ----------------------------------------
      // CHECK PRODUCT STATUS
      // ----------------------------------------

      if (product.status !== "active") {
        return res.status(400).json({
          message:
            `${product.name} is currently unavailable`,
        });
      }


      // ----------------------------------------
      // CHECK MINIMUM ORDER QUANTITY
      // ----------------------------------------

      if (
        quantity <
        product.minimumOrderQuantity
      ) {
        return res.status(400).json({
          message:
            `${product.name} requires a minimum order quantity of ${product.minimumOrderQuantity}`,
        });
      }


      // ----------------------------------------
      // CHECK STOCK
      // ----------------------------------------

      if (product.stock < quantity) {
        return res.status(400).json({
          message:
            `Insufficient stock for ${product.name}`,

          availableStock:
            product.stock,

          requestedQuantity:
            quantity,
        });
      }


      // ----------------------------------------
      // CALCULATE ITEM SUBTOTAL
      // ----------------------------------------

      const price =
        product.wholesalePrice;

      const itemSubtotal =
        price * quantity;


      // ----------------------------------------
      // ADD TO ORDER
      // ----------------------------------------

      orderItems.push({
        product: product._id,

        name: product.name,

        sku: product.sku,

        quantity,

        price,

        subtotal: itemSubtotal,
      });


      // ----------------------------------------
      // ADD TO TOTAL
      // ----------------------------------------

      subtotal += itemSubtotal;
    }


    // ========================================
    // DISCOUNT
    // ========================================

    let discount = 0;


    // Example:
    // 5% discount if order >= ₹10,000

    if (subtotal >= 10000) {
      discount =
        subtotal * 0.05;
    }


    // ========================================
    // FINAL TOTAL
    // ========================================

    const totalAmount =
      subtotal - discount;


    // ========================================
    // SHOP DETAILS SNAPSHOT
    // ========================================

    const shopDetails = {
      shopName:
        customer.shop.shopName,

      shopPhone:
        customer.shop.shopPhone,

      shopAddress:
        customer.shop.shopAddress,

      city:
        customer.shop.city,

      state:
        customer.shop.state,

      pincode:
        customer.shop.pincode,

      gstNumber:
        customer.shop.gstNumber,
    };


    // ========================================
    // GENERATE ORDER NUMBER
    // ========================================

    const orderNumber =
      generateOrderNumber();


    // ========================================
    // CREATE ORDER
    // ========================================

    const order = await Order.create({
      customer:
        customer._id,

      orderNumber,

      items:
        orderItems,

      shopDetails,

      subtotal,

      discount,

      totalAmount,

      status: "pending",

      paymentStatus: "pending",

      customerNote:
        customerNote || "",
    });


    // ========================================
    // REDUCE INVENTORY
    // ========================================

    for (const item of orderItems) {

      const product =
        await Product.findById(
          item.product
        );

      const stockBefore =
        product.stock;

      product.stock =
        product.stock -
        item.quantity;

      await product.save();


      // ========================================
      // CREATE INVENTORY TRANSACTION
      // ========================================

      await InventoryTransaction.create({
        product:
          product._id,

        type: "sale",

        quantity:
          item.quantity,

        stockBefore,

        stockAfter:
          product.stock,

        reason:
          `Customer order ${order.orderNumber}`,

        performedBy:
          customer._id,
      });
    }


    // ========================================
    // RESPONSE
    // ========================================

    const populatedOrder =
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


    res.status(201).json({
      message:
        "Order created successfully",

      order:
        populatedOrder,
    });

  } catch (error) {

    console.error(
      "CREATE ORDER ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to create order",

      error:
        error.message,
    });
  }
};


// ========================================
// GET CUSTOMER ORDERS
// ========================================

const getCustomerOrders = async (
  req,
  res
) => {
  try {

    const orders =
      await Order.find({
        customer:
          req.user._id,
      })
        .populate(
          "items.product",
          "name sku category"
        )
        .sort({
          createdAt: -1,
        });


    res.status(200).json({
      count:
        orders.length,

      orders,
    });

  } catch (error) {

    console.error(
      "GET CUSTOMER ORDERS ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch customer orders",

      error:
        error.message,
    });
  }
};


// ========================================
// GET SINGLE CUSTOMER ORDER
// ========================================

const getCustomerOrderById = async (
  req,
  res
) => {
  try {

    const order =
      await Order.findOne({
        _id:
          req.params.id,

        customer:
          req.user._id,
      })
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
      "GET CUSTOMER ORDER ERROR:",
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


module.exports = {
  createOrder,
  getCustomerOrders,
  getCustomerOrderById,
};