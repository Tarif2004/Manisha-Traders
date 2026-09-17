import { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  ArrowUpDown,
  Edit2,
  Trash2,
  History,
  X,
  CheckCircle,
  RefreshCw,
  Boxes,
  TrendingDown,
  Eye,
  Power,
  Image as ImageIcon,
  IndianRupee,
  Tag,
} from "lucide-react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getInventoryHistory,
} from "../services/productService";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Selected product
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Inventory history state
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Form states
  const initialFormState = {
    name: "",
    sku: "",
    category: "Kurtis",
    brand: "Manisha Traders",
    color: "",
    sizes: ["M", "L", "XL"],
    purchasePrice: "",
    wholesalePrice: "",
    discount: 0,
    stock: 50,
    minimumOrderQuantity: 5,
    lowStockThreshold: 10,
    description: "",
    image: "",
    status: "active",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Stock update form state
  const [stockForm, setStockForm] = useState({
    type: "purchase",
    quantity: 10,
    reason: "Wholesale restock",
  });

  const categories = [
    "Kurtis",
    "Sarees",
    "Salwar Suits",
    "Shirts",
    "T-Shirts",
    "Jeans",
    "Lehengas",
    "Gowns",
    "Ethnic Wear",
    "Western Wear",
  ];

  const standardSizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Free Size"];

  // ========================================
  // LOAD PRODUCTS
  // ========================================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getProducts();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Fetch products error:", err);
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const showNotification = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  // ========================================
  // TOGGLE ACTIVE / INACTIVE STATUS
  // ========================================
  const handleToggleProductStatus = async (prod) => {
    const nextStatus = prod.status === "active" ? "inactive" : "active";
    try {
      setActionLoading(true);
      const res = await updateProduct(prod._id, { status: nextStatus });
      showNotification(
        `Product marked as ${nextStatus === "active" ? "Active" : "Inactive"}`
      );
      setProducts((prev) =>
        prev.map((p) => (p._id === prod._id ? res.product : p))
      );
      if (selectedProduct && selectedProduct._id === prod._id) {
        setSelectedProduct(res.product);
      }
    } catch (err) {
      console.error("Toggle status error:", err);
      alert(err.response?.data?.message || "Failed to change product status");
    } finally {
      setActionLoading(false);
    }
  };

  // ========================================
  // ADD PRODUCT
  // ========================================
  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setFormError("");
    setIsAddModalOpen(true);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setFormError("");
    setActionLoading(true);

    try {
      const payload = {
        ...formData,
        purchasePrice: Number(formData.purchasePrice),
        wholesalePrice: Number(formData.wholesalePrice),
        discount: Number(formData.discount || 0),
        stock: Number(formData.stock || 0),
        minimumOrderQuantity: Number(formData.minimumOrderQuantity || 1),
        lowStockThreshold: Number(formData.lowStockThreshold || 10),
      };

      await createProduct(payload);
      setIsAddModalOpen(false);
      showNotification("Product added successfully!");
      fetchProducts();
    } catch (err) {
      console.error("Create product error:", err);
      setFormError(err.response?.data?.message || "Failed to create product");
    } finally {
      setActionLoading(false);
    }
  };

  // ========================================
  // EDIT PRODUCT
  // ========================================
  const handleOpenEdit = (prod) => {
    setSelectedProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      category: prod.category,
      brand: prod.brand || "Manisha Traders",
      color: prod.color,
      sizes: prod.sizes || [],
      purchasePrice: prod.purchasePrice,
      wholesalePrice: prod.wholesalePrice,
      discount: prod.discount || 0,
      minimumOrderQuantity: prod.minimumOrderQuantity || 5,
      lowStockThreshold: prod.lowStockThreshold || 10,
      description: prod.description || "",
      image: prod.image || "",
      status: prod.status || "active",
    });
    setFormError("");
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setFormError("");
    setActionLoading(true);

    try {
      const payload = {
        ...formData,
        purchasePrice: Number(formData.purchasePrice),
        wholesalePrice: Number(formData.wholesalePrice),
        discount: Number(formData.discount || 0),
        minimumOrderQuantity: Number(formData.minimumOrderQuantity || 1),
        lowStockThreshold: Number(formData.lowStockThreshold || 10),
      };

      await updateProduct(selectedProduct._id, payload);
      setIsEditModalOpen(false);
      showNotification("Product updated successfully!");
      fetchProducts();
    } catch (err) {
      console.error("Update product error:", err);
      setFormError(err.response?.data?.message || "Failed to update product");
    } finally {
      setActionLoading(false);
    }
  };

  // ========================================
  // DELETE PRODUCT
  // ========================================
  const handleDeleteProduct = async (prod) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${prod.name}" (${prod.sku})? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteProduct(prod._id);
      showNotification("Product deleted successfully!");
      fetchProducts();
    } catch (err) {
      console.error("Delete product error:", err);
      alert(err.response?.data?.message || "Failed to delete product");
    }
  };

  // ========================================
  // STOCK ADJUSTMENT
  // ========================================
  const handleOpenStockModal = (prod) => {
    setSelectedProduct(prod);
    setStockForm({
      type: "purchase",
      quantity: 10,
      reason: "Wholesale restock",
    });
    setFormError("");
    setIsStockModalOpen(true);
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    setFormError("");
    setActionLoading(true);

    try {
      await updateStock(selectedProduct._id, {
        type: stockForm.type,
        quantity: Number(stockForm.quantity),
        reason: stockForm.reason,
      });

      setIsStockModalOpen(false);
      showNotification("Stock adjusted successfully!");
      fetchProducts();
    } catch (err) {
      console.error("Stock update error:", err);
      setFormError(err.response?.data?.message || "Failed to update stock");
    } finally {
      setActionLoading(false);
    }
  };

  // ========================================
  // INVENTORY HISTORY
  // ========================================
  const handleOpenHistory = async () => {
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const data = await getInventoryHistory();
      setHistoryList(data.transactions || []);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Toggle size selection in form
  const toggleSize = (size) => {
    setFormData((prev) => {
      const exists = prev.sizes.includes(size);
      return {
        ...prev,
        sizes: exists
          ? prev.sizes.filter((s) => s !== size)
          : [...prev.sizes, size],
      };
    });
  };

  // ========================================
  // FILTERING & STATS
  // ========================================
  const totalProducts = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const lowStockCount = products.filter(
    (p) => (p.stock || 0) <= (p.lowStockThreshold || 10) && (p.stock || 0) > 0
  ).length;
  const outOfStockCount = products.filter((p) => (p.stock || 0) === 0).length;

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || p.category === categoryFilter;

    let matchesStock = true;
    if (stockFilter === "low") {
      matchesStock =
        (p.stock || 0) <= (p.lowStockThreshold || 10) && (p.stock || 0) > 0;
    } else if (stockFilter === "out") {
      matchesStock = (p.stock || 0) === 0;
    } else if (stockFilter === "in") {
      matchesStock = (p.stock || 0) > (p.lowStockThreshold || 10);
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Product & Inventory Management
          </h1>
          <p className="text-slate-500 mt-1">
            Manage wholesale dress catalog, inventory quantities, and wholesale pricing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenHistory}
            className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition"
          >
            <History size={17} />
            Inventory Logs
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition"
          >
            <Plus size={18} />
            Add New Dress
          </button>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3">
          <CheckCircle size={18} className="text-emerald-600" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* ================= STATS CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Products
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {totalProducts}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package size={22} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Stock In Hand
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {totalStockUnits.toLocaleString("en-IN")} Units
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Boxes size={22} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Low Stock Alert
            </p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">
              {lowStockCount}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Out of Stock
            </p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">
              {outOfStockCount}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown size={22} />
          </div>
        </div>
      </div>

      {/* ================= SEARCH & FILTERS ================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by name, SKU, color..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:border-blue-500"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>

          <button
            onClick={fetchProducts}
            title="Refresh"
            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600"
          >
            <RefreshCw size={17} />
          </button>
        </div>
      </div>

      {/* ================= PRODUCTS TABLE (PHASE 2) ================= */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 mt-4 text-sm">Loading product catalog...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <AlertTriangle className="mx-auto mb-2" size={32} />
            <p className="font-semibold">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-3 text-sm text-blue-600 underline"
            >
              Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Package className="mx-auto mb-3 text-slate-400" size={40} />
            <p className="text-base font-medium text-slate-700">No products found</p>
            <p className="text-sm text-slate-400 mt-1">
              Try adjusting your search filters or click "Add New Dress" to create one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">SKU / Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Color & Sizes</th>
                  <th className="py-3.5 px-4 text-right">Purchase Price</th>
                  <th className="py-3.5 px-4 text-right">Wholesale Price</th>
                  <th className="py-3.5 px-4 text-center">Stock</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProducts.map((p) => {
                  const isLow =
                    (p.stock || 0) <= (p.lowStockThreshold || 10) &&
                    (p.stock || 0) > 0;
                  const isOut = (p.stock || 0) === 0;

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/75 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {p.name}
                        </div>
                        <div className="text-xs font-mono text-slate-500 mt-0.5">
                          {p.sku} • {p.brand}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs text-slate-700 font-medium">
                          {p.color}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.sizes?.map((sz) => (
                            <span
                              key={sz}
                              className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded"
                            >
                              {sz}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-600">
                        ₹{(p.purchasePrice || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="font-semibold text-slate-900">
                          ₹{(p.wholesalePrice || 0).toLocaleString("en-IN")}
                        </span>
                        {p.discount > 0 && (
                          <span className="block text-[11px] text-emerald-600">
                            {p.discount}% bulk off
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isOut
                              ? "bg-rose-100 text-rose-700"
                              : isLow
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {p.stock} units
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          MOQ: {p.minimumOrderQuantity || 1}
                        </div>
                      </td>

                      {/* ACTIVATE / DEACTIVATE STATUS TOGGLE (PHASE 2) */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleProductStatus(p)}
                          title={`Click to mark as ${
                            p.status === "active" ? "Inactive" : "Active"
                          }`}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition border ${
                            p.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                          }`}
                        >
                          <Power size={11} />
                          <span className="capitalize">{p.status || "active"}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedProduct(p);
                              setIsDetailsModalOpen(true);
                            }}
                            title="View Product Details"
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            onClick={() => handleOpenStockModal(p)}
                            title="Adjust Stock"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <ArrowUpDown size={16} />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(p)}
                            title="Edit Product"
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(p)}
                            title="Delete Product"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==========================================================
          PRODUCT DETAILS MODAL (PHASE 2)
      ========================================================== */}
      {isDetailsModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsDetailsModalOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <div className="flex items-start gap-4">
              {selectedProduct.image ? (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-20 h-24 object-cover rounded-xl border border-slate-200 shadow-xs"
                />
              ) : (
                <div className="w-20 h-24 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon size={28} />
                  <span className="text-[10px] mt-1">No Image</span>
                </div>
              )}

              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                  {selectedProduct.category}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  {selectedProduct.name}
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  SKU: {selectedProduct.sku} • Brand: {selectedProduct.brand}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-xs divide-y divide-slate-100">
              <div className="pt-2 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block font-medium">Color:</span>
                  <span className="text-slate-800 font-semibold text-sm">
                    {selectedProduct.color}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Status:</span>
                  <span className="capitalize font-semibold text-slate-800">
                    {selectedProduct.status || "active"}
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <span className="text-slate-400 block font-medium mb-1">
                  Available Sizes:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProduct.sizes?.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-medium text-[11px]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <div>
                  <span className="text-slate-500 block text-[11px]">Purchase Price</span>
                  <span className="font-bold text-slate-800 text-sm">
                    ₹{selectedProduct.purchasePrice}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Wholesale Rate</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    ₹{selectedProduct.wholesalePrice}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Gross Margin</span>
                  <span className="font-bold text-blue-600 text-sm">
                    {selectedProduct.wholesalePrice > 0
                      ? Math.round(
                          ((selectedProduct.wholesalePrice -
                            selectedProduct.purchasePrice) /
                            selectedProduct.wholesalePrice) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>

              <div className="pt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-slate-400 block">Stock In Hand</span>
                  <span className="font-bold text-slate-900 text-base">
                    {selectedProduct.stock} Units
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Min Order Qty</span>
                  <span className="font-bold text-slate-700 text-base">
                    {selectedProduct.minimumOrderQuantity || 1}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Low Stock Level</span>
                  <span className="font-bold text-amber-600 text-base">
                    {selectedProduct.lowStockThreshold || 10}
                  </span>
                </div>
              </div>

              {selectedProduct.description && (
                <div className="pt-3">
                  <span className="text-slate-400 block font-medium">Description:</span>
                  <p className="text-slate-700 mt-1 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleOpenStockModal(selectedProduct);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
              >
                Adjust Stock
              </button>

              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          ADD PRODUCT MODAL (WITH IMAGE SUPPORT - PHASE 2)
      ========================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-slate-900">
              Add New Wholesale Dress
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Add product specifications, pricing, and initial stock units.
            </p>

            {formError && (
              <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dress Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Designer Anarkali Kurti"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MT-KURTI-101"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sku: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Color *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maroon, Royal Blue"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="active">Active (Available for Orders)</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* SIZES */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Available Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {standardSizes.map((sz) => {
                    const selected = formData.sizes.includes(sz);
                    return (
                      <button
                        type="button"
                        key={sz}
                        onClick={() => toggleSize(sz)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition border ${
                          selected
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PRICING & INVENTORY */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Purchase Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="450"
                    value={formData.purchasePrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purchasePrice: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Wholesale Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="650"
                    value={formData.wholesalePrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        wholesalePrice: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Stock (Units) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Min Order Qty (MOQ)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minimumOrderQuantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minimumOrderQuantity: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.lowStockThreshold}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lowStockThreshold: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* IMAGE URL & DESCRIPTION (PHASE 2) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/dress.jpg"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fabric & Design Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pure Georgette fabric with intricate Chikankari embroidery..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition"
                >
                  {actionLoading ? "Adding Dress..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================
          EDIT PRODUCT MODAL (PHASE 2)
      ========================================================== */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-slate-900">
              Edit Product: {selectedProduct.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              SKU: {selectedProduct.sku}
            </p>

            {formError && (
              <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleUpdateProduct} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dress Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Color *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* SIZES */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Available Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {standardSizes.map((sz) => {
                    const selected = formData.sizes.includes(sz);
                    return (
                      <button
                        type="button"
                        key={sz}
                        onClick={() => toggleSize(sz)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition border ${
                          selected
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PRICING */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-100 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Purchase Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.purchasePrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purchasePrice: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Wholesale Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.wholesalePrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        wholesalePrice: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Min Order Qty (MOQ)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minimumOrderQuantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minimumOrderQuantity: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.lowStockThreshold}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lowStockThreshold: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition"
                >
                  {actionLoading ? "Updating..." : "Update Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================
          STOCK ADJUSTMENT MODAL
      ========================================================== */}
      {isStockModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsStockModalOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-slate-900">
              Adjust Inventory Stock
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {selectedProduct.name} ({selectedProduct.sku})
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Current In Stock:
              </span>
              <span className="text-lg font-bold text-slate-900">
                {selectedProduct.stock} Units
              </span>
            </div>

            {formError && (
              <div className="mt-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleStockUpdate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adjustment Type *
                </label>
                <select
                  value={stockForm.type}
                  onChange={(e) =>
                    setStockForm({ ...stockForm, type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="purchase">Purchase / Restock (+) </option>
                  <option value="sale">Manual Sale (-) </option>
                  <option value="return">Customer Return (+)</option>
                  <option value="damage">Damaged / Defect (-) </option>
                  <option value="adjustment">Direct Count Reset (=)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={stockForm.quantity}
                  onChange={(e) =>
                    setStockForm({ ...stockForm, quantity: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Surat batch receipt #1290"
                  value={stockForm.reason}
                  onChange={(e) =>
                    setStockForm({ ...stockForm, reason: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* ESTIMATED NEW STOCK PREVIEW */}
              <div className="text-xs text-slate-600 bg-blue-50 p-2.5 rounded-lg border border-blue-100 flex items-center justify-between">
                <span>Projected New Stock:</span>
                <span className="font-bold text-blue-800">
                  {stockForm.type === "purchase" || stockForm.type === "return"
                    ? (selectedProduct.stock || 0) + Number(stockForm.quantity || 0)
                    : stockForm.type === "sale" || stockForm.type === "damage"
                    ? Math.max(
                        0,
                        (selectedProduct.stock || 0) -
                          Number(stockForm.quantity || 0)
                      )
                    : Number(stockForm.quantity || 0)}{" "}
                  Units
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition"
                >
                  {actionLoading ? "Updating Stock..." : "Confirm Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================
          INVENTORY LOGS MODAL
      ========================================================== */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Stock Audit Trail & Logs
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete history of inventory additions, sales, and corrections.
                </p>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-4">
              {historyLoading ? (
                <div className="py-12 text-center text-slate-500">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                  Loading inventory transactions...
                </div>
              ) : historyList.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  No stock transactions recorded yet.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                      <th className="py-2.5 px-3 text-right">Stock Level</th>
                      <th className="py-2.5 px-3">Reason / By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {historyList.map((tx) => {
                      const isAddition =
                        tx.type === "purchase" || tx.type === "return";
                      return (
                        <tr key={tx._id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-slate-500">
                            {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            {tx.product?.name || "Product"}
                            <span className="block text-[10px] text-slate-400 font-mono">
                              {tx.product?.sku}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                isAddition
                                  ? "bg-emerald-100 text-emerald-700"
                                  : tx.type === "sale"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right font-bold ${
                              isAddition ? "text-emerald-600" : "text-slate-800"
                            }`}
                          >
                            {isAddition ? `+${tx.quantity}` : `-${tx.quantity}`}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-600 font-mono">
                            {tx.stockBefore} → {tx.stockAfter}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            <div>{tx.reason || "—"}</div>
                            <span className="text-[10px] text-slate-400">
                              By: {tx.performedBy?.name || "System"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;