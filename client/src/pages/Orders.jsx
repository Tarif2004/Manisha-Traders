import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  X,
  FileText,
  Printer,
  RefreshCw,
  Building,
  User,
  Phone,
  MapPin,
} from "lucide-react";
import {
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} from "../services/adminOrderService";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Status update / cancel loading
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const showNotification = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  // Status transition handler
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setActionLoading(true);
      setActionError("");
      const res = await updateOrderStatus(orderId, newStatus);
      showNotification(`Order status updated to ${newStatus}!`);

      // Update in local state
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? res.order : o))
      );

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(res.order);
      }
    } catch (err) {
      console.error("Update status error:", err);
      setActionError(
        err.response?.data?.message || "Failed to update order status"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel order handler (restores stock)
  const handleCancelOrder = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this order? This will automatically return all reserved dress quantities back into the inventory stock."
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");
      const res = await cancelOrder(orderId);
      showNotification("Order cancelled and inventory restored successfully!");

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? res.order : o))
      );

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(res.order);
      }
    } catch (err) {
      console.error("Cancel order error:", err);
      setActionError(
        err.response?.data?.message || "Failed to cancel order"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shopDetails?.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shopDetails?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shopDetails?.shopPhone?.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate order stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const inProgressOrders = orders.filter((o) =>
    ["confirmed", "processing", "shipped"].includes(o.status)
  ).length;
  const completedOrders = orders.filter((o) => o.status === "delivered").length;
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            <Clock size={12} /> Pending
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            <CheckCircle size={12} /> Confirmed
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
            <RefreshCw size={12} /> Processing
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
            <Truck size={12} /> Shipped
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
            <CheckCircle size={12} /> Delivered
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
            <XCircle size={12} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Wholesale Orders
          </h1>
          <p className="text-slate-500 mt-1">
            Review retailer purchase requests, track dispatches, and manage fulfillment.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="self-start md:self-auto flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition"
        >
          <RefreshCw size={16} />
          Refresh Orders
        </button>
      </div>

      {/* SUCCESS BANNER */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3">
          <CheckCircle size={18} className="text-emerald-600" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* ================= STATS SUMMARY ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Orders
          </p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {totalOrders}
          </h3>
          <p className="text-xs text-slate-400 mt-1">All time bookings</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pending Orders
          </p>
          <h3 className="text-2xl font-bold text-amber-600 mt-1">
            {pendingOrders}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Awaiting confirmation</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            In Fulfillment
          </p>
          <h3 className="text-2xl font-bold text-blue-600 mt-1">
            {inProgressOrders}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Confirmed / Shipped</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Order Value
          </p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Excludes cancelled</p>
        </div>
      </div>

      {/* ================= SEARCH & STATUS TABS ================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search order #, shop, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* STATUS FILTER PILLS */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: "all", label: "All" },
            { id: "pending", label: "Pending" },
            { id: "confirmed", label: "Confirmed" },
            { id: "processing", label: "Processing" },
            { id: "shipped", label: "Shipped" },
            { id: "delivered", label: "Delivered" },
            { id: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                statusFilter === tab.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= ORDERS TABLE ================= */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 mt-4 text-sm">Loading wholesale orders...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <AlertCircle className="mx-auto mb-2" size={32} />
            <p className="font-semibold">{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <ShoppingCart className="mx-auto mb-3 text-slate-400" size={40} />
            <p className="text-base font-medium text-slate-700">No orders found</p>
            <p className="text-sm text-slate-400 mt-1">
              There are no orders matching your current filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order Details</th>
                  <th className="py-3.5 px-4">Retailer / Shop</th>
                  <th className="py-3.5 px-4">Items / Dresses</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredOrders.map((ord) => {
                  const itemsCount = ord.items?.reduce(
                    (sum, itm) => sum + (itm.quantity || 0),
                    0
                  );

                  return (
                    <tr key={ord._id} className="hover:bg-slate-50/75 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 font-mono">
                          {ord.orderNumber}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">
                          {ord.shopDetails?.shopName || ord.customer?.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {ord.shopDetails?.city || "Kolkata"},{" "}
                          {ord.shopDetails?.state || "WB"} •{" "}
                          {ord.shopDetails?.shopPhone || ord.customer?.phone}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block font-semibold text-slate-800">
                          {itemsCount} units
                        </span>
                        <div className="text-xs text-slate-500 truncate max-w-xs">
                          {ord.items?.map((it) => it.name).join(", ")}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-slate-900">
                          ₹{(ord.totalAmount || 0).toLocaleString("en-IN")}
                        </div>
                        {ord.discount > 0 && (
                          <div className="text-[11px] text-emerald-600">
                            -₹{ord.discount} disc.
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(ord.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(ord);
                              setActionError("");
                              setIsDetailModalOpen(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
                          >
                            <Eye size={14} /> View Details
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
          ORDER DETAILS & MANAGEMENT MODAL
      ========================================================== */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            {/* MODAL HEADER */}
            <div className="flex items-start justify-between pr-8 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900 font-mono">
                    {selectedOrder.orderNumber}
                  </h2>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Placed on{" "}
                  {new Date(selectedOrder.createdAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Printer size={14} /> Print Invoice
              </button>
            </div>

            {actionError && (
              <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{actionError}</span>
              </div>
            )}

            {/* RETAILER & DISPATCH SNAPSHOT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1.5">
                  <Building size={14} className="text-blue-600" />
                  <span>Retail Shop & Destination</span>
                </div>
                <p className="font-semibold text-slate-800 text-sm">
                  {selectedOrder.shopDetails?.shopName || "Retail Partner"}
                </p>
                <p className="text-slate-600 mt-0.5">
                  {selectedOrder.shopDetails?.shopAddress}
                </p>
                <p className="text-slate-600">
                  {selectedOrder.shopDetails?.city},{" "}
                  {selectedOrder.shopDetails?.state} -{" "}
                  {selectedOrder.shopDetails?.pincode}
                </p>
                {selectedOrder.shopDetails?.gstNumber && (
                  <p className="text-slate-700 mt-1 font-mono">
                    GSTIN: {selectedOrder.shopDetails.gstNumber}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1.5">
                  <User size={14} className="text-blue-600" />
                  <span>Customer Contact</span>
                </div>
                <p className="text-slate-800 font-medium">
                  {selectedOrder.customer?.name || "Customer"}
                </p>
                <p className="text-slate-600 flex items-center gap-1 mt-0.5">
                  <Phone size={12} />
                  {selectedOrder.shopDetails?.shopPhone ||
                    selectedOrder.customer?.phone}
                </p>
                <p className="text-slate-600">
                  {selectedOrder.customer?.email}
                </p>

                {selectedOrder.customerNote && (
                  <div className="mt-2 bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded-lg">
                    <span className="font-bold">Customer Note:</span>{" "}
                    {selectedOrder.customerNote}
                  </div>
                )}
              </div>
            </div>

            {/* ITEMS TABLE */}
            <div className="mt-5">
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                Order Items (Dress Specifications)
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Item / SKU</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Wholesale Rate</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {item.name}
                          <span className="block text-[10px] text-slate-400 font-mono">
                            SKU: {item.sku}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">
                          ₹{(item.price || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                          ₹{(item.subtotal || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* INVOICE BILLING SUMMARY */}
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-end gap-1 text-xs">
              <div className="flex justify-between w-64 text-slate-600">
                <span>Gross Subtotal:</span>
                <span>
                  ₹{(selectedOrder.subtotal || 0).toLocaleString("en-IN")}
                </span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between w-64 text-emerald-600">
                  <span>Bulk Discount:</span>
                  <span>
                    -₹{(selectedOrder.discount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              <div className="flex justify-between w-64 text-sm font-bold text-slate-900 pt-2 border-t border-slate-200 mt-1">
                <span>Net Total Amount:</span>
                <span>
                  ₹{(selectedOrder.totalAmount || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* CANCELLATION INFO IF CANCELLED */}
            {selectedOrder.status === "cancelled" && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
                <span className="font-bold">Order Cancelled:</span> Reserved
                quantities have been restored back to warehouse stock.
              </div>
            )}

            {/* ORDER LIFECYCLE ACTION WORKFLOW */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Current stage:{" "}
                <span className="font-bold uppercase text-slate-800">
                  {selectedOrder.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* STATUS PROGRESSION BUTTONS */}
                {selectedOrder.status === "pending" && (
                  <>
                    <button
                      disabled={actionLoading}
                      onClick={() =>
                        handleUpdateStatus(selectedOrder._id, "confirmed")
                      }
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-xs font-semibold transition shadow-xs"
                    >
                      Confirm Order
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleCancelOrder(selectedOrder._id)}
                      className="px-4 py-2 border border-rose-300 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition"
                    >
                      Cancel Order
                    </button>
                  </>
                )}

                {selectedOrder.status === "confirmed" && (
                  <>
                    <button
                      disabled={actionLoading}
                      onClick={() =>
                        handleUpdateStatus(selectedOrder._id, "processing")
                      }
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg text-xs font-semibold transition shadow-xs"
                    >
                      Mark As Processing (Packing)
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleCancelOrder(selectedOrder._id)}
                      className="px-4 py-2 border border-rose-300 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition"
                    >
                      Cancel Order
                    </button>
                  </>
                )}

                {selectedOrder.status === "processing" && (
                  <>
                    <button
                      disabled={actionLoading}
                      onClick={() =>
                        handleUpdateStatus(selectedOrder._id, "shipped")
                      }
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-xs font-semibold transition shadow-xs"
                    >
                      Mark As Shipped (Dispatched)
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleCancelOrder(selectedOrder._id)}
                      className="px-4 py-2 border border-rose-300 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition"
                    >
                      Cancel Order
                    </button>
                  </>
                )}

                {selectedOrder.status === "shipped" && (
                  <button
                    disabled={actionLoading}
                    onClick={() =>
                      handleUpdateStatus(selectedOrder._id, "delivered")
                    }
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-lg text-xs font-semibold transition shadow-xs"
                  >
                    Mark As Delivered
                  </button>
                )}

                {selectedOrder.status === "delivered" && (
                  <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-semibold">
                    <CheckCircle size={14} /> Order Fulfilled Successfully
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;