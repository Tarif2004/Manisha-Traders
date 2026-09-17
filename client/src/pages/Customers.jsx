import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Building,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  AlertCircle,
  X,
  RefreshCw,
  ShoppingBag,
  IndianRupee,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Clock,
} from "lucide-react";
import {
  getAllCustomers,
  updateCustomerStatus,
} from "../services/customerService";
import { getAllOrders } from "../services/adminOrderService";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [customersRes, ordersRes] = await Promise.all([
        getAllCustomers(),
        getAllOrders().catch(() => ({ orders: [] })),
      ]);

      setCustomers(customersRes.customers || []);
      setAllOrders(ordersRes.orders || []);
    } catch (err) {
      console.error("Fetch customers error:", err);
      setError(err.response?.data?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleToggleStatus = async (customer) => {
    const isCurrentlyActive = customer.status === "approved";
    const nextStatus = isCurrentlyActive ? "suspended" : "approved";
    const confirmMsg = isCurrentlyActive
      ? `Are you sure you want to DEACTIVATE retailer "${customer.shop?.shopName || customer.name}"? They will not be able to log in or place wholesale orders.`
      : `ACTIVATE and enable retailer "${customer.shop?.shopName || customer.name}" to place wholesale orders?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoading(true);
      const res = await updateCustomerStatus(customer._id, nextStatus);
      showNotification(
        isCurrentlyActive
          ? "Retailer account deactivated successfully."
          : "Retailer account activated successfully."
      );

      setCustomers((prev) =>
        prev.map((c) =>
          c._id === customer._id ? { ...c, status: nextStatus } : c
        )
      );

      if (selectedCustomer && selectedCustomer._id === customer._id) {
        setSelectedCustomer((prev) => ({ ...prev, status: nextStatus }));
      }
    } catch (err) {
      console.error("Update customer status error:", err);
      alert(err.response?.data?.message || "Failed to update account status");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCustomers = customers.map((c) => {
    const totalOrders = c.totalOrders || 0;
    const totalSpent = c.totalSpent || 0;
    const avgOrderValue =
      totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;
    return {
      ...c,
      avgOrderValue,
    };
  }).filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.name?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.phone?.includes(term) ||
      c.shop?.shopName?.toLowerCase().includes(term) ||
      c.shop?.city?.toLowerCase().includes(term) ||
      c.shop?.gstNumber?.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === "all" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalRetailers = customers.length;
  const approvedCount = customers.filter((c) => c.status === "approved").length;
  const suspendedCount = customers.filter(
    (c) => c.status === "suspended"
  ).length;
  const totalVolume = customers.reduce(
    (sum, c) => sum + (c.totalSpent || 0),
    0
  );

  // Filter orders for the selected customer in modal
  const customerOrders = selectedCustomer
    ? allOrders.filter(
        (o) =>
          (o.customer?._id || o.customer) === selectedCustomer._id ||
          o.customer?.email === selectedCustomer.email
      )
    : [];

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Retail Customers & Retailers
          </h1>
          <p className="text-slate-500 mt-1">
            Registered clothing boutiques, retailers, and wholesale shop buyers.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="self-start md:self-auto flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition"
        >
          <RefreshCw size={16} />
          Refresh Directory
        </button>
      </div>

      {/* NOTIFICATION */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3">
          <CheckCircle size={18} className="text-emerald-600" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Retailers
          </p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {totalRetailers}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Verified wholesale buyers</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Accounts
          </p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">
            {approvedCount}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Can place bulk orders</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Suspended
          </p>
          <h3 className="text-2xl font-bold text-rose-600 mt-1">
            {suspendedCount}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Order access restricted</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Purchase Volume
          </p>
          <h3 className="text-2xl font-bold text-blue-600 mt-1">
            ₹{totalVolume.toLocaleString("en-IN")}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Cumulative wholesale sales</p>
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
            placeholder="Search shop, owner, phone, GST..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved / Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* ================= CUSTOMERS TABLE ================= */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 mt-4 text-sm">Loading customer directory...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <AlertCircle className="mx-auto mb-2" size={32} />
            <p className="font-semibold">{error}</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Users className="mx-auto mb-3 text-slate-400" size={40} />
            <p className="text-base font-medium text-slate-700">No retailers found</p>
            <p className="text-sm text-slate-400 mt-1">
              New customer retailers registering via the portal will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Retail Shop & Owner</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Location & GSTIN</th>
                  <th className="py-3.5 px-4 text-center">Orders</th>
                  <th className="py-3.5 px-4 text-right">Avg Order (AOV)</th>
                  <th className="py-3.5 px-4 text-right">Total Business</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredCustomers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/75 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {c.shop?.shopName || "Retail Shop"}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="text-slate-700 font-medium">{c.name}</span>
                        {c.shop?.shopType && (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-600">
                            {c.shop.shopType}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <Phone size={12} className="text-slate-400" />
                        {c.shop?.shopPhone || c.phone}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                        <Mail size={12} className="text-slate-400" />
                        {c.email}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <div className="text-slate-800 font-medium">
                        {c.shop?.city || "Kolkata"}, {c.shop?.state || "West Bengal"}
                      </div>
                      <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                        {c.shop?.gstNumber ? `GST: ${c.shop.gstNumber}` : "No GST registered"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md font-bold text-xs">
                        {c.totalOrders || 0}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-700 font-medium text-xs">
                      ₹{(c.avgOrderValue || 0).toLocaleString("en-IN")}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      ₹{(c.totalSpent || 0).toLocaleString("en-IN")}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          c.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : c.status === "suspended"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {c.status === "approved"
                          ? "Active"
                          : c.status === "suspended"
                          ? "Deactivated"
                          : "Pending"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedCustomer(c);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
                        >
                          Details & History
                        </button>

                        <button
                          onClick={() => handleToggleStatus(c)}
                          disabled={actionLoading}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                            c.status === "approved"
                              ? "border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-100"
                              : "border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {c.status === "approved" ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==========================================================
          CUSTOMER DETAILS & ORDER HISTORY MODAL (PHASE 4)
      ========================================================== */}
      {isModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                <Building size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedCustomer.shop?.shopName || "Retail Shop"}
                </h2>
                <p className="text-xs text-slate-500">
                  Proprietor: {selectedCustomer.name}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-xs divide-y divide-slate-100">
              <div className="pt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block font-medium">Phone:</span>
                  <span className="text-slate-800 font-semibold text-sm">
                    {selectedCustomer.shop?.shopPhone || selectedCustomer.phone}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Email:</span>
                  <span className="text-slate-800 font-semibold text-sm">
                    {selectedCustomer.email}
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <span className="text-slate-400 block font-medium">
                  Shop Delivery Address:
                </span>
                <span className="text-slate-800 font-medium text-sm">
                  {selectedCustomer.shop?.shopAddress || "No address provided"}
                </span>
                <span className="text-slate-600 block mt-0.5">
                  {selectedCustomer.shop?.city},{" "}
                  {selectedCustomer.shop?.state} -{" "}
                  {selectedCustomer.shop?.pincode}
                </span>
              </div>

              <div className="pt-3 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block font-medium">
                    GSTIN / Tax ID:
                  </span>
                  <span className="font-mono text-slate-900 font-bold">
                    {selectedCustomer.shop?.gstNumber || "Not Provided"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">
                    Shop Format:
                  </span>
                  <span className="text-slate-800 font-medium capitalize">
                    {selectedCustomer.shop?.shopType || "Retail Store"}
                  </span>
                </div>
              </div>

              {/* THREE KEY METRICS (PHASE 4) */}
              <div className="pt-3 grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <div>
                  <span className="text-slate-500 font-medium block text-[11px]">
                    Total Orders
                  </span>
                  <span className="text-xl font-bold text-blue-600 mt-0.5 block">
                    {selectedCustomer.totalOrders || 0}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block text-[11px]">
                    Total Purchases
                  </span>
                  <span className="text-xl font-bold text-emerald-600 mt-0.5 block">
                    ₹{(selectedCustomer.totalSpent || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block text-[11px]">
                    Average Order Value
                  </span>
                  <span className="text-xl font-bold text-purple-600 mt-0.5 block">
                    ₹{selectedCustomer.totalOrders > 0
                      ? Math.round(
                          (selectedCustomer.totalSpent || 0) /
                            selectedCustomer.totalOrders
                        ).toLocaleString("en-IN")
                      : 0}
                  </span>
                </div>
              </div>
            </div>

            {/* CUSTOMER ORDER HISTORY TABLE (PHASE 4) */}
            <div className="mt-5">
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <ShoppingBag size={15} className="text-blue-600" />
                Customer Order History
              </h3>

              {customerOrders.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
                  No orders found for this customer retailer.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Order #</th>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customerOrders.map((ord) => (
                        <tr key={ord._id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-semibold text-slate-800">
                            {ord.orderNumber}
                          </td>
                          <td className="py-2 px-3 text-slate-500">
                            {new Date(ord.createdAt).toLocaleDateString("en-IN")}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">
                            ₹{(ord.totalAmount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                                ord.status === "delivered"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : ord.status === "cancelled"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                onClick={() => handleToggleStatus(selectedCustomer)}
                disabled={actionLoading}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                  selectedCustomer.status === "approved"
                    ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                }`}
              >
                {selectedCustomer.status === "approved" ? (
                  <>
                    <ShieldAlert size={14} /> Deactivate Retailer Account
                  </>
                ) : (
                  <>
                    <ShieldCheck size={14} /> Activate Retailer Account
                  </>
                )}
              </button>

              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;