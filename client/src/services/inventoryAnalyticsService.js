import api from "./api";

// ========================================
// GET INVENTORY ANALYTICS
// ========================================

export const getInventoryAnalytics = async () => {
  const response = await api.get("/analytics/inventory");

  return response.data;
};