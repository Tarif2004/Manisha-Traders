import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Users,
  Package,
  IndianRupee,
  AlertTriangle,
  CheckCircle,
  Truck,
  Clock,
  XCircle,
  TrendingUp,
  ArrowRight,
  Boxes,
  RefreshCw,
  Plus,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getDashboardOverview,
  getInventoryAnalytics,
  getSalesAnalytics,
} from "../services/analyticsService";

function OwnerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [sales, setSales] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Detect role for dynamic title
  const userStr = localStorage.getItem("user");
  let currentUserRole = "owner";
  try {
    if (userStr) currentUserRole = JSON.parse(userStr)?.role ?? "owner";
  } catch {}

  const loadAllDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [dashData, invData, salesData] = await Promise.all([
        getDashboardOverview(),
        getInventoryAnalytics().catch(() => null),
        getSalesAnalytics().catch(() => null),
      ]);

      setDashboard(dashData);
      setInventory(invData);
      setSales(salesData);
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError(
        err.response?.data?.message || "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 mt-4 text-sm font-medium">
            Loading owner dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <AlertTriangle className="mx-auto text-red-600 mb-2" size={32} />
        <h2 className="text-lg font-semibold text-red-800">Dashboard Error</h2>
        <p className="text-red-600 mt-1 text-sm">{error}</p>
        <button
          onClick={loadAllDashboardData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  const totalSales = dashboard?.totalSales ?? 0;
  const totalOrders = dashboard?.totalOrders ?? 0;
  const totalCustomers = dashboard?.totalCustomers ?? 0;
  const totalProducts = dashboard?.totalProducts ?? 0;
  const lowStockProducts = dashboard?.lowStockProducts ?? 0;
  const orders = dashboard?.orders || {};
  const totalInventoryValue =
    inventory?.summary?.totalInventoryValue ?? 0;
  const totalUnits = inventory?.summary?.totalUnits ?? 0;

  let userName = "Sudipto Das";
  try {
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u.name) userName = u.name;
    }
  } catch {}

  // Daily chart data for mini sales graph
  const dailyChartData = (sales?.dailySales || []).map((item) => ({
    date: `${item._id.day}/${item._id.month}`,
    sales: item.totalSales,
    orders: item.totalOrders,
  }));

  return (
    <div className="space-y-8">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {currentUserRole === "owner"
              ? "Owner Dashboard Overview"
              : "Admin Operations Dashboard"}
          </h1>
          <p className="text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-slate-800">{userName}</span>.{" "}
            {currentUserRole === "owner"
              ? "Here is your wholesale dress distribution overview."
              : "Manage orders, customers, and operations below."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/owner/products"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition shadow-xs"
          >
            <Plus size={15} /> Add Product
          </Link>
          <button
            onClick={loadAllDashboardData}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition shadow-xs"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* ================= MAIN STAT CARDS (PHASE 9) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* 1. TOTAL SALES */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Business Sales
            </span>
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
              <IndianRupee size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-bold text-slate-900">
              ₹{totalSales.toLocaleString("en-IN")}
            </h2>
            <p className="text-xs text-green-600 font-medium mt-1">
              Active wholesale revenue
            </p>
          </div>
        </div>

        {/* 2. TOTAL ORDERS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShoppingCart size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-bold text-slate-900">
              {totalOrders}
            </h2>
            <Link
              to="/owner/orders"
              className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1 mt-1"
            >
              Manage Orders <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* 3. CUSTOMERS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Registered Retailers
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-bold text-slate-900">
              {totalCustomers}
            </h2>
            <Link
              to="/owner/customers"
              className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1 mt-1"
            >
              View Directory <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* 4. TOTAL PRODUCTS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Dress Products
            </span>
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <Package size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-bold text-slate-900">
              {totalProducts}
            </h2>
            <p className="text-xs text-orange-600 font-medium mt-1">
              Active catalog styles
            </p>
          </div>
        </div>

        {/* 5. INVENTORY VALUE (PHASE 9 REQUIREMENT) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Warehouse Stock Value
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Boxes size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-bold text-purple-700">
              ₹{totalInventoryValue.toLocaleString("en-IN")}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {totalUnits.toLocaleString("en-IN")} units currently in stock
            </p>
          </div>
        </div>

        {/* 6. LOW STOCK PRODUCTS (PHASE 9 REQUIREMENT) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Low Stock Warnings
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-bold text-amber-600">
              {lowStockProducts}
            </h2>
            <Link
              to="/owner/products"
              className="text-xs text-amber-700 font-medium hover:underline flex items-center gap-1 mt-1"
            >
              Reorder stock <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* ================= ORDER STATUS BREAKDOWN ================= */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Wholesale Order Status Pipeline
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* PENDING */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <Clock size={20} className="text-amber-500" />
            <p className="text-xs text-slate-500 mt-3 font-semibold uppercase">
              Pending
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {orders.pending ?? 0}
            </p>
          </div>

          {/* CONFIRMED */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <CheckCircle size={20} className="text-blue-600" />
            <p className="text-xs text-slate-500 mt-3 font-semibold uppercase">
              Confirmed
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {orders.confirmed ?? 0}
            </p>
          </div>

          {/* PROCESSING */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <Package size={20} className="text-purple-600" />
            <p className="text-xs text-slate-500 mt-3 font-semibold uppercase">
              Processing
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {orders.processing ?? 0}
            </p>
          </div>

          {/* SHIPPED */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <Truck size={20} className="text-indigo-600" />
            <p className="text-xs text-slate-500 mt-3 font-semibold uppercase">
              Shipped
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {orders.shipped ?? 0}
            </p>
          </div>

          {/* DELIVERED */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <CheckCircle size={20} className="text-emerald-600" />
            <p className="text-xs text-slate-500 mt-3 font-semibold uppercase">
              Delivered
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {orders.delivered ?? 0}
            </p>
          </div>

          {/* CANCELLED */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <XCircle size={20} className="text-rose-600" />
            <p className="text-xs text-slate-500 mt-3 font-semibold uppercase">
              Cancelled
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {orders.cancelled ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* ================= REVENUE TREND GRAPH (FAST & READABLE) ================= */}
      {dailyChartData.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Daily Sales Trend
              </h2>
              <p className="text-xs text-slate-500">
                Recent wholesale billing volume across recorded business days.
              </p>
            </div>
            <Link
              to="/owner/analytics"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              Full Analytics <ArrowRight size={13} />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ================= ABOUT MANISHA TRADERS ================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          Manisha Traders • Centralized Distribution System
        </h2>
        <p className="text-slate-600 text-sm mt-1 leading-relaxed">
          Wholesale clothing and dress distribution platform supporting B2B boutique orders,
          inventory reservations, transactional order cancellations, and business performance tracking.
        </p>
      </div>
    </div>
  );
}

export default OwnerDashboard;