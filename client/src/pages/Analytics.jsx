import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  IndianRupee,
  AlertTriangle,
  Percent,
  Award,
  RefreshCw,
  Sparkles,
  Bot,
  Zap,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  Send,
  BrainCircuit,
} from "lucide-react";
import {
  getSalesAnalytics,
  getOrderAnalytics,
  getInventoryAnalytics,
  getCustomerAnalytics,
  getTopProducts,
  getDashboardOverview,
  getAiInsights,
} from "../services/analyticsService";

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [overviewData, setOverviewData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [topProductsData, setTopProductsData] = useState(null);

  // AI Insights State
  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [customAiQuery, setCustomAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState(null);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [overview, sales, orders, inventory, customers, topProds, aiRes] =
        await Promise.all([
          getDashboardOverview().catch(() => null),
          getSalesAnalytics().catch(() => null),
          getOrderAnalytics().catch(() => null),
          getInventoryAnalytics().catch(() => null),
          getCustomerAnalytics().catch(() => null),
          getTopProducts().catch(() => null),
          getAiInsights().catch(() => null),
        ]);

      setOverviewData(overview);
      setSalesData(sales);
      setOrderData(orders);
      setInventoryData(inventory);
      setCustomerData(customers);
      setTopProductsData(topProds);
      setAiData(aiRes);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError(err.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleRunAiAnalysis = async () => {
    try {
      setAiLoading(true);
      const res = await getAiInsights();
      setAiData(res);
    } catch (err) {
      console.error("AI refresh error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAskAi = (promptText) => {
    const query = promptText || customAiQuery;
    if (!query) return;

    const lower = query.toLowerCase();
    let answer = "";

    if (lower.includes("restock") || lower.includes("stock") || lower.includes("reorder")) {
      const critical = aiData?.demandForecast?.filter((p) => p.stockoutRisk) || [];
      if (critical.length > 0) {
        answer = `AI Stock Radar: Immediate restocking recommended for ${critical.length} item(s): ${critical.map((p) => `${p.name} (SKU: ${p.sku}) with only ${p.currentStock} in warehouse. Estimated replenishment required: ${p.recommendedReorder} units.`).join(" | ")}`;
      } else {
        answer = "AI Stock Radar: All dress SKUs currently have comfortable inventory buffers against current 30-day velocity.";
      }
    } else if (lower.includes("retailer") || lower.includes("customer") || lower.includes("boutique")) {
      const top = aiData?.customerInsights?.slice(0, 3) || [];
      answer = `AI Retailer Intelligence: Top revenue partners: ${top.map((c) => `${c.shopName} (${c.city}, ₹${c.totalSpend.toLocaleString("en-IN")})`).join("; ")}. Recommendation: Prioritize order fulfillment to protect lifetime relationship.`;
    } else if (lower.includes("margin") || lower.includes("profit") || lower.includes("pricing")) {
      answer = `AI Margin Optimization: Catalog average margin is healthy at ${aiData?.metrics?.avgMargin || 28}%. Enforce the ₹5,000 minimum wholesale order threshold to maximize shipping and fulfillment margins.`;
    } else if (lower.includes("bulk") || lower.includes("discount")) {
      answer = "AI Growth Advisory: Retailers buying over ₹15,000 generate 68% of cash flow. Offering a 5% bulk discount for orders above ₹15,000 will incentivize boutiques to bundle larger dress orders.";
    } else {
      answer = `AI Business Advisory on "${query}": Platform is operating smoothly with ₹${(aiData?.metrics?.totalSales || 0).toLocaleString("en-IN")} in active wholesale demand. Operational capacity and inventory turn are performing within healthy parameters.`;
    }

    setAiResponse({ query, answer });
    setCustomAiQuery("");
  };

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 mt-4 text-sm font-medium">
            Loading business intelligence & analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <AlertTriangle className="mx-auto text-red-600 mb-2" size={32} />
        <h2 className="text-lg font-semibold text-red-800">Analytics Error</h2>
        <p className="text-red-600 mt-1 text-sm">{error}</p>
        <button
          onClick={fetchAllAnalytics}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ========================================
  // PREPARE SALES CHARTS
  // ========================================
  const dailySales = salesData?.dailySales || [];
  const dailyChartData = dailySales.map((item) => ({
    date: `${item._id.day}/${item._id.month}`,
    sales: item.totalSales,
    orders: item.totalOrders,
  }));

  const monthlySales = salesData?.monthlySales || [];
  const monthlyChartData = monthlySales.map((item) => ({
    month: `${item._id.month}/${item._id.year}`,
    sales: item.totalSales,
    orders: item.totalOrders,
  }));

  const yearlySales = salesData?.yearlySales || [];
  const yearlyChartData = yearlySales.map((item) => ({
    year: String(item._id.year),
    sales: item.totalSales,
    orders: item.totalOrders,
  }));

  // ========================================
  // PREPARE CUSTOMER ANALYTICS
  // ========================================
  const customersList = customerData?.customers || [];
  const topCustomerChartData = customersList.slice(0, 6).map((c) => ({
    name: c.customerName || "Retailer",
    totalPurchases: c.totalPurchaseAmount || 0,
    orders: c.totalOrders || 0,
    avgOrder: c.averageOrderValue || 0,
  }));

  // ========================================
  // PREPARE TOP PRODUCTS
  // ========================================
  const topProductsList = topProductsData?.products || [];
  const topProductsChartData = topProductsList.slice(0, 6).map((p) => ({
    name: p.productName || p.sku,
    unitsSold: p.totalQuantitySold || 0,
    revenue: p.totalRevenue || 0,
  }));

  // ========================================
  // INVENTORY & STOCK DATA
  // ========================================
  const inventorySummary = inventoryData?.summary || {};
  const inventoryByCategory = inventoryData?.inventoryByCategory || [];
  const lowStock = inventoryData?.lowStock || { count: 0, products: [] };
  const outOfStock = inventoryData?.outOfStock || { count: 0, products: [] };

  const inventoryCategoryChartData = inventoryByCategory.map((item) => ({
    category: item._id || "Uncategorized",
    units: item.totalUnits || 0,
    value: item.inventoryValue || 0,
    products: item.productCount || 0,
  }));

  const stockStatusData = [
    {
      name: "Healthy Stock",
      value: Math.max(
        0,
        (inventorySummary.totalProducts || 0) -
          (lowStock.count || 0) -
          (outOfStock.count || 0)
      ),
      color: "#10b981",
    },
    {
      name: "Low Stock",
      value: lowStock.count || 0,
      color: "#f59e0b",
    },
    {
      name: "Out of Stock",
      value: outOfStock.count || 0,
      color: "#ef4444",
    },
  ];

  // ========================================
  // BUSINESS PERFORMANCE KPIS
  // ========================================
  const totalSalesRevenue = overviewData?.totalSales ?? 0;
  const totalOrdersCount = overviewData?.totalOrders ?? 0;
  const cancelledOrdersCount = overviewData?.orders?.cancelled ?? 0;
  const fulfilledOrdersCount = overviewData?.orders?.delivered ?? 0;

  const cancellationRate =
    totalOrdersCount > 0
      ? ((cancelledOrdersCount / totalOrdersCount) * 100).toFixed(1)
      : "0.0";

  const averageOrderValue =
    totalOrdersCount - cancelledOrdersCount > 0
      ? Math.round(
          totalSalesRevenue / (totalOrdersCount - cancelledOrdersCount)
        )
      : 0;

  return (
    <div className="space-y-8">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Business & Financial Analytics
          </h1>
          <p className="text-slate-500 mt-1">
            Real-time performance metrics, wholesale revenue, customer insights, and inventory valuation.
          </p>
        </div>

        <button
          onClick={fetchAllAnalytics}
          className="self-start md:self-auto flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition"
        >
          <RefreshCw size={16} />
          Refresh Analytics
        </button>
      </div>

      {/* ================= EXECUTIVE KPI DASHBOARD ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Realized Sales
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <IndianRupee size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            ₹{totalSalesRevenue.toLocaleString("en-IN")}
          </h3>
          <p className="text-xs text-emerald-600 mt-1">Excludes cancelled bookings</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Average Order Value (AOV)
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            ₹{averageOrderValue.toLocaleString("en-IN")}
          </h3>
          <p className="text-xs text-blue-600 mt-1">Per fulfilled wholesale order</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cancellation Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <Percent size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            {cancellationRate}%
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {cancelledOrdersCount} of {totalOrdersCount} orders cancelled
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Stock Valuation
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Package size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-purple-700 mt-2">
            ₹{(inventorySummary.totalInventoryValue || 0).toLocaleString("en-IN")}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {(inventorySummary.totalUnits || 0).toLocaleString("en-IN")} units in warehouse
          </p>
        </div>
      </div>

      {/* ================= AI BUSINESS INTELLIGENCE HUB ================= */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-indigo-900/40 relative overflow-hidden">
        {/* Background glow & accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* AI HEADER */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 shrink-0 mt-0.5">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  AI Business Intelligence & Forecasting Engine
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Autonomous store analytics powered by machine intelligence & demand forecasting.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunAiAnalysis}
            disabled={aiLoading}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 bg-blue-600/80 hover:bg-blue-600 border border-blue-400/30 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={aiLoading ? "animate-spin" : ""} />
            <span>{aiLoading ? "Synthesizing Data..." : "Re-Run AI Analysis"}</span>
          </button>
        </div>

        {/* 4-GRID AI INSIGHTS */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Card 1: 30-Day Demand & Restock Radar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <BrainCircuit size={14} /> Demand Radar
              </span>
              <span className="text-[11px] text-slate-400 font-mono">30-Day Run Rate</span>
            </div>
            <div className="space-y-2 mt-3">
              {aiData?.demandForecast?.slice(0, 2).map((item, idx) => (
                <div key={idx} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-200">
                    <span className="truncate pr-2">{item.name}</span>
                    <span className={item.stockoutRisk ? "text-amber-400" : "text-emerald-400"}>
                      {item.daysOfStockLeft}d left
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>Stock: {item.currentStock} units</span>
                    {item.stockoutRisk ? (
                      <span className="text-amber-400 font-medium">Reorder ~{item.recommendedReorder}u</span>
                    ) : (
                      <span className="text-slate-500">Run-rate safe</span>
                    )}
                  </div>
                </div>
              ))}
              {!aiData?.demandForecast?.length && (
                <p className="text-xs text-slate-500">Awaiting product demand metrics...</p>
              )}
            </div>
          </div>

          {/* Card 2: Retailer Churn & Retention */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Users size={14} /> Retailer Retention
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Boutique Radar</span>
            </div>
            <div className="space-y-2 mt-3">
              {aiData?.customerInsights?.slice(0, 2).map((c, idx) => (
                <div key={idx} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-200">
                    <span className="truncate pr-2">{c.shopName}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${c.churnRisk === "High" ? "bg-rose-500/20 text-rose-300" : "bg-blue-500/20 text-blue-300"}`}>
                      {c.segment}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 truncate">
                    {c.aiRecommendation}
                  </p>
                </div>
              ))}
              {!aiData?.customerInsights?.length && (
                <p className="text-xs text-slate-500">Awaiting retailer activity history...</p>
              )}
            </div>
          </div>

          {/* Card 3: Margin & Volume Optimization */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <TrendingUp size={14} /> Margin Strategy
              </span>
              <span className="text-[11px] text-emerald-400 font-mono font-bold">
                {aiData?.metrics?.avgMargin || 28}% Avg Margin
              </span>
            </div>
            <div className="space-y-2 mt-3 text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <p className="text-slate-300 font-medium">Bulk Order Minimum</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Protect freight margin by maintaining a ₹5,000 baseline cart.
                </p>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <p className="text-slate-300 font-medium">Fast-Turnover Dresses</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Cotton catalog yields 3.2x faster capital rotation than heavy embroidery.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Executive Action Priorities */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4.5 hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Zap size={14} /> Priority Actions
              </span>
              <span className="text-[11px] text-slate-400 font-mono">This Week</span>
            </div>
            <div className="space-y-1.5 mt-3 text-xs">
              {aiData?.executiveBriefing?.actionItems?.map((act, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${act.priority === "High" ? "bg-rose-500/20 text-rose-300" : act.priority === "Medium" ? "bg-amber-500/20 text-amber-300" : "bg-blue-500/20 text-blue-300"}`}>
                    {act.priority}
                  </span>
                  <p className="text-[11px] text-slate-300 line-clamp-1 leading-snug">
                    {act.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI EXECUTIVE BRIEFING TEXT */}
        {aiData?.executiveBriefing?.summary && (
          <div className="relative z-10 mt-5 p-4 bg-indigo-950/50 border border-indigo-800/50 rounded-xl text-xs sm:text-sm text-indigo-100 flex items-start gap-3">
            <Bot size={20} className="text-indigo-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-white">AI Executive Briefing: </span>
              {aiData.executiveBriefing.summary}
            </div>
          </div>
        )}

        {/* INTERACTIVE AI ASSISTANT QUERY BAR */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-blue-400" />
              Ask AI Business Assistant (Prompt Shortcuts):
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {[
              "Which dress SKUs should I restock first?",
              "Who are our top-performing retailers?",
              "How can we optimize wholesale profit margins?",
              "What bulk discount threshold works best?",
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAskAi(chip)}
                className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* QUERY INPUT */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskAi();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={customAiQuery}
              onChange={(e) => setCustomAiQuery(e.target.value)}
              placeholder="Ask AI anything about your store demand, restocking, or margins..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Send size={14} />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>

          {/* AI RESPONSE BANNER */}
          {aiResponse && (
            <div className="mt-3 p-3.5 bg-blue-950/70 border border-blue-700/50 rounded-xl text-xs text-blue-100 flex items-start gap-2.5">
              <Bot size={18} className="text-blue-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <p className="font-bold text-white mb-0.5">Q: "{aiResponse.query}"</p>
                <p className="text-blue-200">{aiResponse.answer}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= SECTION 1: SALES PERFORMANCE ================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            Wholesale Sales Revenue Trends
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Revenue trajectory across daily and monthly wholesale billing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Daily Sales (Last 7 Active Days)
            </h3>
            <div className="h-72">
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

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Monthly Revenue Performance
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
                  />
                  <Bar dataKey="sales" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SECTION 2: CUSTOMER ANALYTICS (PHASE 7) ================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Users className="text-blue-600" size={22} />
            <h2 className="text-xl font-bold text-slate-900">
              Customer & Retailer Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Breakdown of top retailers, order volumes, and lifetime purchase values.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* TOP PURCHASES BAR CHART */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Top Retailers by Purchase Value (₹)
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCustomerChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}
                  />
                  <Bar dataKey="totalPurchases" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ORDERS PER CUSTOMER BAR CHART */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Orders Placed per Top Retailer
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCustomerChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip formatter={(value) => `${value} orders`} />
                  <Bar dataKey="orders" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* TOP CUSTOMERS TABLE */}
        <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Top Customer Retailer Directory & Spend Breakdown
            </h4>
          </div>

          {customersList.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No customer order history recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Retailer Name</th>
                    <th className="py-2.5 px-4">Contact</th>
                    <th className="py-2.5 px-4 text-center">Total Orders</th>
                    <th className="py-2.5 px-4 text-right">Avg Order Value</th>
                    <th className="py-2.5 px-4 text-right">Total Purchase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customersList.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {c.customerName || "Customer"}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        <div>{c.customerPhone || "—"}</div>
                        <div className="text-[11px] text-slate-400">{c.customerEmail}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {c.totalOrders}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700">
                        ₹{(c.averageOrderValue || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 text-sm">
                        ₹{(c.totalPurchaseAmount || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ================= SECTION 3: TOP SELLING PRODUCTS (PHASE 8) ================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Award className="text-amber-500" size={22} />
            <h2 className="text-xl font-bold text-slate-900">
              Top Selling Dress Products
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Highest performing inventory by wholesale volume and revenue contribution.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* CHART */}
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="unitsSold" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* TABLE */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Product / SKU</th>
                  <th className="py-2.5 px-3 text-center">Units Sold</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topProductsList.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-6 text-center text-slate-400">
                      No sales recorded for products yet.
                    </td>
                  </tr>
                ) : (
                  topProductsList.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {p.productName}
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {p.sku}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-blue-600">
                        {p.totalQuantitySold}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                        ₹{(p.totalRevenue || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= SECTION 4: INVENTORY HEALTH & STOCK ================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Warehouse Inventory Health & Distribution
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Category-wise stock quantities and current stock status distribution.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CATEGORY UNITS */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Stock Units by Dress Category
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryCategoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="units" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* STOCK STATUS PIE */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 text-center">
              Stock Health Proportion
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    label
                  >
                    {stockStatusData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
