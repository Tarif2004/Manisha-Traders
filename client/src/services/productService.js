import API from "./api";

export const getProducts = async () => {
  const response = await API.get("/products");
  return response.data;
};

export const getProductById = async (id) => {
  const response = await API.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await API.post("/products", productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await API.patch(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await API.delete(`/products/${id}`);
  return response.data;
};

export const updateStock = async (id, stockData) => {
  const response = await API.patch(`/products/${id}/stock`, stockData);
  return response.data;
};

export const getInventoryHistory = async () => {
  const response = await API.get("/products/inventory/history");
  return response.data;
};
