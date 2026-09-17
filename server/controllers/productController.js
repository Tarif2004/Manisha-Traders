const Product = require("../models/Product");
const InventoryTransaction = require(
  "../models/InventoryTransaction"
);

// ========================================
// ADD PRODUCT
// ========================================

async function createProduct(req, res) {
    try {
        const {
            name, sku, category, description, brand, color, sizes, purchasePrice, wholesalePrice, discount, stock, minimumOrderQuantity, lowStockThreshold, image,
        } = req.body;

        // Required fields
        if (!name ||
            !sku ||
            !category ||
            !color ||
            purchasePrice === undefined ||
            wholesalePrice === undefined) {
            return res.status(400).json({
                message: "Please provide all required product details",
            });
        }

        // Check duplicate SKU
        const existingProduct = await Product.findOne({
            sku: sku.toUpperCase(),
        });

        if (existingProduct) {
            return res.status(400).json({
                message: "Product with this SKU already exists",
            });
        }

        const product = await Product.create({
            name,
            sku: sku.toUpperCase(),
            category,
            description,
            brand,
            color,
            sizes,
            purchasePrice,
            wholesalePrice,
            discount,
            stock,
            minimumOrderQuantity,
            lowStockThreshold,
            image,
            createdBy: req.user._id,
        });

        res.status(201).json({
            message: "Product created successfully",
            product,
        });

    } catch (error) {
        console.error("CREATE PRODUCT ERROR:", error);

        res.status(500).json({
            message: "Failed to create product",
            error: error.message,
        });
    }
}


// ========================================
// GET ALL PRODUCTS
// ========================================

const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: products.length,
      products,
    });

  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};


// ========================================
// GET SINGLE PRODUCT
// ========================================

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("createdBy", "name email role");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      product,
    });

  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};


// ========================================
// UPDATE PRODUCT
// ========================================

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const allowedFields = [
      "name",
      "category",
      "description",
      "brand",
      "color",
      "sizes",
      "purchasePrice",
      "wholesalePrice",
      "discount",
      "minimumOrderQuantity",
      "lowStockThreshold",
      "status",
      "image",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });

  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};


// ========================================
// DELETE PRODUCT
// ========================================

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      message: "Product deleted successfully",
    });

  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};


// ========================================
// UPDATE STOCK
// ========================================

const updateStock = async (req, res) => {
  try {
    const {
      quantity,
      type,
      reason,
    } = req.body;

    // ========================================
    // VALIDATION
    // ========================================

    const allowedTypes = [
      "purchase",
      "sale",
      "return",
      "damage",
      "adjustment",
    ];

    if (
      quantity === undefined ||
      !allowedTypes.includes(type)
    ) {
      return res.status(400).json({
        message:
          "Please provide quantity and valid transaction type",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than zero",
      });
    }


    // ========================================
    // FIND PRODUCT
    // ========================================

    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }


    // ========================================
    // CALCULATE STOCK
    // ========================================

    const stockBefore = product.stock;

    let stockAfter = stockBefore;


    // Stock coming IN
    if (
      type === "purchase" ||
      type === "return"
    ) {
      stockAfter =
        stockBefore + quantity;
    }


    // Stock going OUT
    if (
      type === "sale" ||
      type === "damage"
    ) {
      if (stockBefore < quantity) {
        return res.status(400).json({
          message: "Insufficient stock",
          currentStock: stockBefore,
        });
      }

      stockAfter =
        stockBefore - quantity;
    }


    // Adjustment
    if (type === "adjustment") {
      stockAfter = quantity;
    }


    // ========================================
    // UPDATE PRODUCT
    // ========================================

    product.stock = stockAfter;

    await product.save();


    // ========================================
    // CREATE TRANSACTION
    // ========================================

    const transaction =
      await InventoryTransaction.create({
        product: product._id,

        type,

        quantity,

        stockBefore,

        stockAfter,

        reason,

        performedBy: req.user._id,
      });


    // ========================================
    // RESPONSE
    // ========================================

    res.status(200).json({
      message: "Stock updated successfully",

      product: {
        id: product._id,
        name: product.name,
        sku: product.sku,
        stock: product.stock,
        isLowStock:
          product.stock <=
          product.lowStockThreshold,
      },

      transaction,
    });

  } catch (error) {

    console.error(
      "UPDATE STOCK ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to update stock",
      error: error.message,
    });
  }
};

// ========================================
// GET INVENTORY HISTORY
// ========================================

const getInventoryHistory = async (
  req,
  res
) => {
  try {
    const transactions =
      await InventoryTransaction.find()
        .populate(
          "product",
          "name sku category"
        )
        .populate(
          "performedBy",
          "name email role"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      count: transactions.length,
      transactions,
    });

  } catch (error) {

    console.error(
      "GET INVENTORY HISTORY ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch inventory history",

      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
  getInventoryHistory,
};