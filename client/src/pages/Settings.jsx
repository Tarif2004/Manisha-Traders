import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Building,
  Shield,
  Save,
  CheckCircle,
  AlertCircle,
  Percent,
  IndianRupee,
  Lock,
  KeyRound,
  FileBadge,
  Sparkles,
  Database,
} from "lucide-react";
import {
  getSettings,
  updateSettings,
  changePassword,
} from "../services/settingsService";

function Settings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Business settings state
  const [businessSettings, setBusinessSettings] = useState({
    businessName: "Manisha Traders",
    tagline: "Wholesale & Distribution Management",
    ownerName: "Sudipto Das",
    email: "owner@manishatraders.com",
    phone: "9876543210",
    address: "Kolkata, West Bengal",
    gstin: "19ABCDE1234F1Z5",
    minWholesaleOrderAmount: 5000,
    bulkDiscountThreshold: 10000,
    bulkDiscountPercentage: 5,
    announcement:
      "Welcome to Manisha Traders. Specialized in wholesale dress distribution across Eastern India.",
  });

  const [savingSettings, setSavingSettings] = useState(false);

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const fetchSettingsData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getSettings();
      if (res.settings) {
        setBusinessSettings(res.settings);
      }
    } catch (err) {
      console.error("Fetch settings error:", err);
      // Fallback to default
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const showNotification = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  // ========================================
  // SAVE BUSINESS SETTINGS
  // ========================================
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const res = await updateSettings(businessSettings);
      showNotification(res.message || "Settings updated successfully!");
    } catch (err) {
      console.error("Save settings error:", err);
      alert(err.response?.data?.message || "Failed to update settings");
    } finally {
      setSavingSettings(false);
    }
  };

  // ========================================
  // CHANGE PASSWORD
  // ========================================
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirm password do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordSuccess(res.message || "Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setPasswordSuccess(""), 4000);
    } catch (err) {
      console.error("Change password error:", err);
      setPasswordError(
        err.response?.data?.message || "Failed to change password"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Settings & Configuration
        </h1>
        <p className="text-slate-500 mt-1">
          Manage Manisha Traders business identity, wholesale policies, and account credentials.
        </p>
      </div>

      {/* NOTIFICATION */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3">
          <CheckCircle size={18} className="text-emerald-600" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* ================= SECTION 1: BUSINESS PROFILE ================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Building size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Distributor Business Profile
            </h2>
            <p className="text-xs text-slate-500">
              Company information displayed on invoices and wholesale documents.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Business Name
              </label>
              <input
                type="text"
                required
                value={businessSettings.businessName}
                onChange={(e) =>
                  setBusinessSettings({
                    ...businessSettings,
                    businessName: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tagline / Subtitle
              </label>
              <input
                type="text"
                value={businessSettings.tagline}
                onChange={(e) =>
                  setBusinessSettings({
                    ...businessSettings,
                    tagline: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Owner / Proprietor
              </label>
              <input
                type="text"
                value={businessSettings.ownerName}
                onChange={(e) =>
                  setBusinessSettings({
                    ...businessSettings,
                    ownerName: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                GSTIN / Tax ID
              </label>
              <input
                type="text"
                value={businessSettings.gstin}
                onChange={(e) =>
                  setBusinessSettings({
                    ...businessSettings,
                    gstin: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-mono uppercase outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contact Phone
              </label>
              <input
                type="text"
                value={businessSettings.phone}
                onChange={(e) =>
                  setBusinessSettings({
                    ...businessSettings,
                    phone: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Support Email
              </label>
              <input
                type="email"
                value={businessSettings.email}
                onChange={(e) =>
                  setBusinessSettings({
                    ...businessSettings,
                    email: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Warehouse / Distribution Center Address
            </label>
            <textarea
              rows="2"
              value={businessSettings.address}
              onChange={(e) =>
                setBusinessSettings({
                  ...businessSettings,
                  address: e.target.value,
                })
              }
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ================= SECTION 2: WHOLESALE POLICIES ================= */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-blue-600" />
              Wholesale Order Rules & Incentives
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Min Wholesale Order (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={businessSettings.minWholesaleOrderAmount}
                  onChange={(e) =>
                    setBusinessSettings({
                      ...businessSettings,
                      minWholesaleOrderAmount: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bulk Discount Threshold (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={businessSettings.bulkDiscountThreshold}
                  onChange={(e) =>
                    setBusinessSettings({
                      ...businessSettings,
                      bulkDiscountThreshold: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bulk Discount Percent (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={businessSettings.bulkDiscountPercentage}
                  onChange={(e) =>
                    setBusinessSettings({
                      ...businessSettings,
                      bulkDiscountPercentage: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Portal Announcement Banner
              </label>
              <input
                type="text"
                value={businessSettings.announcement}
                onChange={(e) =>
                  setBusinessSettings({
                    ...businessSettings,
                    announcement: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingSettings}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-semibold transition shadow-xs"
            >
              <Save size={16} />
              {savingSettings ? "Saving..." : "Save Business Settings"}
            </button>
          </div>
        </form>
      </div>

      {/* ================= SECTION 3: ACCOUNT CREDENTIALS ================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <KeyRound size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Account Security & Password
            </h2>
            <p className="text-xs text-slate-500">
              Update your account login password.
            </p>
          </div>
        </div>

        {passwordError && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSuccess && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex items-center gap-2">
            <CheckCircle size={15} />
            <span>{passwordSuccess}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
                })
              }
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password (min 6 chars)
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value,
                })
              }
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-lg text-xs font-semibold transition"
          >
            <Lock size={14} />
            {passwordLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* ================= SECTION 4: SYSTEM INFO ================= */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database size={20} className="text-slate-400" />
          <div>
            <p className="text-xs font-bold text-slate-700">
              Manisha Traders System Environment
            </p>
            <p className="text-[11px] text-slate-500">
              MongoDB: Connected • API Endpoint: http://localhost:5000/api
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Operational
        </span>
      </div>
    </div>
  );
}

export default Settings;