import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  UserCog,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  X,
  RefreshCw,
  Sliders,
  Award,
  Lock,
  Unlock,
  UserPlus,
  ExternalLink,
} from "lucide-react";
import {
  getAllAdmins,
  getAdminApplications,
  approveAdmin,
  rejectAdmin,
  updateAdminPermissions,
  suspendAdmin,
} from "../services/adminService";

function Admins() {
  const [admins, setAdmins] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("admins"); // "admins" | "applications"

  // Permissions Modal
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [permissionsForm, setPermissionsForm] = useState({
    manageProducts: false,
    manageOrders: false,
    manageCustomers: false,
    manageAdmins: false,
    viewAnalytics: false,
    manageWebsite: false,
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [adminsRes, appsRes] = await Promise.all([
        getAllAdmins().catch(() => ({ admins: [] })),
        getAdminApplications().catch(() => ({ applications: [] })),
      ]);

      setAdmins(adminsRes.admins || []);
      setApplications(appsRes.applications || []);
    } catch (err) {
      console.error("Fetch admins error:", err);
      setError(err.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  // ========================================
  // APPROVE APPLICATION
  // ========================================
  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      const res = await approveAdmin(id);
      showNotification("Admin application approved successfully!");
      fetchData();
    } catch (err) {
      console.error("Approve admin error:", err);
      alert(err.response?.data?.message || "Failed to approve admin");
    } finally {
      setActionLoading(false);
    }
  };

  // ========================================
  // REJECT APPLICATION
  // ========================================
  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this admin applicant?")) {
      return;
    }

    try {
      setActionLoading(true);
      await rejectAdmin(id);
      showNotification("Admin application rejected.");
      fetchData();
    } catch (err) {
      console.error("Reject admin error:", err);
      alert(err.response?.data?.message || "Failed to reject admin");
    } finally {
      setActionLoading(false);
    }
  };

  // ========================================
  // SUSPEND / ACTIVATE ADMIN
  // ========================================
  const handleSuspend = async (admin) => {
    if (!window.confirm(`Suspend administrative access for ${admin.name}?`)) {
      return;
    }

    try {
      setActionLoading(true);
      await suspendAdmin(admin._id);
      showNotification(`Admin ${admin.name} suspended.`);
      fetchData();
    } catch (err) {
      console.error("Suspend admin error:", err);
      alert(err.response?.data?.message || "Failed to suspend admin");
    } finally {
      setActionLoading(false);
    }
  };

  // ========================================
  // OPEN PERMISSIONS MODAL
  // ========================================
  const handleOpenPermModal = (admin) => {
    setSelectedAdmin(admin);
    setPermissionsForm({
      manageProducts: admin.permissions?.manageProducts || false,
      manageOrders: admin.permissions?.manageOrders || false,
      manageCustomers: admin.permissions?.manageCustomers || false,
      manageAdmins: admin.permissions?.manageAdmins || false,
      viewAnalytics: admin.permissions?.viewAnalytics || false,
      manageWebsite: admin.permissions?.manageWebsite || false,
    });
    setIsPermModalOpen(true);
  };

  // ========================================
  // SAVE PERMISSIONS
  // ========================================
  const handleSavePermissions = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await updateAdminPermissions(selectedAdmin._id, permissionsForm);
      showNotification("Admin permissions updated successfully!");
      setIsPermModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Update permissions error:", err);
      alert(err.response?.data?.message || "Failed to update permissions");
    } finally {
      setActionLoading(false);
    }
  };

  const permissionDefinitions = [
    {
      key: "manageProducts",
      label: "Manage Products & Catalog",
      desc: "Add dresses, update wholesale prices, adjust stock, and review inventory history.",
    },
    {
      key: "manageOrders",
      label: "Manage Wholesale Orders",
      desc: "Confirm orders, mark packed/shipped, cancel orders, and review customer delivery notes.",
    },
    {
      key: "manageCustomers",
      label: "Manage Retail Customers",
      desc: "View shop details, verify GST registrations, and suspend or activate retailer accounts.",
    },
    {
      key: "viewAnalytics",
      label: "View Business Analytics",
      desc: "Access daily/monthly revenue graphs, top-selling dresses, and inventory value summaries.",
    },
    {
      key: "manageAdmins",
      label: "Manage Admin Staff",
      desc: "Approve or reject admin applicants and configure staff roles.",
    },
    {
      key: "manageWebsite",
      label: "Distributor Settings & Policies",
      desc: "Modify minimum wholesale order quantities and bulk discount rules.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Staff & Admin Management
          </h1>
          <p className="text-slate-500 mt-1">
            Authorize team members and configure granular operational permissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <Link
            to="/register?role=admin"
            target="_blank"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-xs transition"
          >
            <UserPlus size={16} />
            <span>Open Admin Sign-Up Form</span>
            <ExternalLink size={13} className="opacity-70" />
          </Link>

          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* NOTIFICATION */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3">
          <CheckCircle size={18} className="text-emerald-600" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* ================= TABS ================= */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("admins")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === "admins"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <UserCog size={17} />
          Active Staff ({admins.length})
        </button>

        <button
          onClick={() => setActiveTab("applications")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition relative ${
            activeTab === "applications"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Clock size={17} />
          Pending Applications
          {applications.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === "applications"
                  ? "bg-white text-blue-600"
                  : "bg-amber-500 text-white"
              }`}
            >
              {applications.length}
            </span>
          )}
        </button>
      </div>

      {/* ================= TAB 1: ACTIVE ADMINS ================= */}
      {activeTab === "admins" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 mt-4 text-sm">Loading staff members...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">{error}</div>
          ) : admins.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <UserCog className="mx-auto mb-3 text-slate-400" size={40} />
              <p className="text-base font-medium text-slate-700">No admin staff found</p>
              <p className="text-sm text-slate-400 mt-1">
                Approved admin applicants will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Admin Name</th>
                    <th className="py-3.5 px-4">Contact & Qualification</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Active Permissions</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-sm">
                  {admins.map((admin) => {
                    const activePermsCount = Object.values(
                      admin.permissions || {}
                    ).filter(Boolean).length;

                    return (
                      <tr key={admin._id} className="hover:bg-slate-50/75 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">
                            {admin.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {admin.email}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          <div className="font-medium text-slate-800">
                            {admin.phone}
                          </div>
                          <div className="text-slate-500">
                            {admin.qualification || "Graduate"} •{" "}
                            {admin.address || "Kolkata"}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                              admin.status === "approved"
                                ? "bg-emerald-100 text-emerald-700"
                                : admin.status === "suspended"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {admin.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {admin.permissions?.manageProducts && (
                              <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                                Products
                              </span>
                            )}
                            {admin.permissions?.manageOrders && (
                              <span className="text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium">
                                Orders
                              </span>
                            )}
                            {admin.permissions?.manageCustomers && (
                              <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">
                                Customers
                              </span>
                            )}
                            {admin.permissions?.viewAnalytics && (
                              <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">
                                Analytics
                              </span>
                            )}
                            {admin.permissions?.manageWebsite && (
                              <span className="text-[11px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-medium">
                                Settings
                              </span>
                            )}
                            {activePermsCount === 0 && (
                              <span className="text-xs text-slate-400 italic">
                                No permissions assigned
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenPermModal(admin)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition"
                            >
                              <Sliders size={13} /> Permissions
                            </button>

                            {admin.status === "approved" ? (
                              <button
                                onClick={() => handleSuspend(admin)}
                                disabled={actionLoading}
                                title="Suspend Access"
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              >
                                <Lock size={15} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleApprove(admin._id)}
                                disabled={actionLoading}
                                title="Reactivate Access"
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                              >
                                <Unlock size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: PENDING APPLICATIONS ================= */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
              <CheckCircle className="mx-auto mb-3 text-emerald-500" size={40} />
              <p className="text-base font-semibold text-slate-800">
                All applications reviewed!
              </p>
              <p className="text-sm text-slate-400 mt-1">
                There are no pending admin requests awaiting owner approval.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {app.name}
                        </h3>
                        <p className="text-xs text-slate-500">{app.email}</p>
                      </div>
                      <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full">
                        Pending
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-700">
                          Phone:
                        </span>{" "}
                        {app.phone}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">
                          Qualification:
                        </span>{" "}
                        {app.qualification || "Not provided"}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">
                          Address:
                        </span>{" "}
                        {app.address || "Not provided"}
                      </div>
                      <div className="text-slate-400 text-[11px] pt-1">
                        Applied: {new Date(app.createdAt).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-5 mt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleApprove(app._id)}
                      disabled={actionLoading}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-2 rounded-lg text-xs transition"
                    >
                      Approve Admin
                    </button>
                    <button
                      onClick={() => handleReject(app._id)}
                      disabled={actionLoading}
                      className="flex-1 border border-rose-300 text-rose-600 hover:bg-rose-50 font-semibold py-2 rounded-lg text-xs transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==========================================================
          PERMISSIONS CONFIGURATION MODAL
      ========================================================== */}
      {isPermModalOpen && selectedAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsPermModalOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Shield size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Configure Permissions
                </h2>
                <p className="text-xs text-slate-500">
                  Staff: {selectedAdmin.name} ({selectedAdmin.email})
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePermissions} className="mt-5 space-y-3">
              {permissionDefinitions.map((perm) => (
                <label
                  key={perm.key}
                  className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={permissionsForm[perm.key]}
                    onChange={(e) =>
                      setPermissionsForm({
                        ...permissionsForm,
                        [perm.key]: e.target.checked,
                      })
                    }
                    className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {perm.label}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {perm.desc}
                    </span>
                  </div>
                </label>
              ))}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-4">
                <button
                  type="button"
                  onClick={() => setIsPermModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-xs font-bold transition shadow-xs"
                >
                  {actionLoading ? "Saving..." : "Save Permissions"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admins;