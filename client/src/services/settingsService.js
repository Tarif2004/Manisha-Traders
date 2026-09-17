import API from "./api";

export const getSettings = async () => {
  const response = await API.get("/admin/settings");
  return response.data;
};

export const updateSettings = async (data) => {
  const response = await API.patch("/admin/settings", data);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await API.patch("/auth/change-password", data);
  return response.data;
};

export const getProfile = async () => {
  const response = await API.get("/auth/profile");
  return response.data;
};
