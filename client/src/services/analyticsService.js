import API from "./api";

// ========================================
// DASHBOARD OVERVIEW
// ========================================

export const getDashboardOverview = async () => {
  const response = await API.get(
    "/analytics/dashboard"
  );

  return response.data;
};


// ========================================
// SALES ANALYTICS
// ========================================

export const getSalesAnalytics = async () => {
  const response = await API.get(
    "/analytics/sales"
  );

  return response.data;
};


// ========================================
// ORDER ANALYTICS
// ========================================

export const getOrderAnalytics = async () => {
  const response = await API.get(
    "/analytics/orders"
  );

  return response.data;
};


// ========================================
// INVENTORY ANALYTICS
// ========================================

export const getInventoryAnalytics = async () => {
  const response = await API.get(
    "/analytics/inventory"
  );

  return response.data;
};


// ========================================
// TOP SELLING PRODUCTS ANALYTICS
// ========================================

export const getTopProducts = async () => {
  const response = await API.get(
    "/analytics/top-products"
  );

  return response.data;
};


// ========================================
// CUSTOMER ANALYTICS
// ========================================

export const getCustomerAnalytics = async () => {
  const response = await API.get(
    "/analytics/customers"
  );

  return response.data;
};

// ========================================
// AI BUSINESS INTELLIGENCE
// ========================================

export const getAiInsights = async () => {
  const response = await API.get(
    "/analytics/ai-insights"
  );

  return response.data;
};