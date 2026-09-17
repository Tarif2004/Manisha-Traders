import API from "./api";

export const getAllOrders = async () => {
  const response = await API.get("/admin/orders");
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await API.get(`/admin/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await API.patch(`/admin/orders/${id}/status`, { status });
  return response.data;
};

export const cancelOrder = async (id) => {
  const response = await API.patch(`/admin/orders/${id}/cancel`);
  return response.data;
};
