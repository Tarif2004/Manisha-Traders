import api from "./api";

export const getOrderAnalytics = async () => {
  const response = await api.get("/analytics/orders");

  return response.data;
};