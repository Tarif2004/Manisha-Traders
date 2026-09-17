import API from "./api";

export const getAllAdmins = async () => {
  const response = await API.get("/admin");
  return response.data;
};

export const getAdminApplications = async () => {
  const response = await API.get("/admin/applications");
  return response.data;
};

export const approveAdmin = async (id) => {
  const response = await API.patch(`/admin/${id}/approve`);
  return response.data;
};

export const rejectAdmin = async (id) => {
  const response = await API.patch(`/admin/${id}/reject`);
  return response.data;
};

export const updateAdminPermissions = async (id, permissions) => {
  const response = await API.patch(`/admin/${id}/permissions`, permissions);
  return response.data;
};

export const suspendAdmin = async (id) => {
  const response = await API.patch(`/admin/${id}/suspend`);
  return response.data;
};
