import API from "./api";

export const getAllCustomers = async () => {
  const response = await API.get("/admin/customers");
  return response.data;
};

export const updateCustomerStatus = async (id, status) => {
  const response = await API.patch(`/admin/customers/${id}/status`, { status });
  return response.data;
};
