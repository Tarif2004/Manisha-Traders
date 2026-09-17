import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Store,
  UserCog,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Building,
  Phone,
  Mail,
  Lock,
  MapPin,
  FileBadge,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  // Preselect admin if URL has ?role=admin or matches /admin/register or /register/admin
  const queryRole = new URLSearchParams(location.search).get("role");
  const isDirectAdmin = queryRole === "admin" || location.pathname.includes("admin");

  const [activeTab, setActiveTab] = useState(isDirectAdmin ? "admin" : "customer");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("role") === "admin" || location.pathname.includes("admin")) {
      setActiveTab("admin");
    } else if (params.get("role") === "customer") {
      setActiveTab("customer");
    }
  }, [location]);

  // Customer Form State
  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
    shopName: "",
    shopType: "Retail Boutique",
    gstNumber: "",
    shopPhone: "",
    shopAddress: "",
    city: "",
    state: "West Bengal",
    pincode: "",
  });

  // Admin Form State
  const [adminForm, setAdminForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    qualification: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  // Handle Customer Form Input
  const handleCustomerChange = (e) => {
    setCustomerForm({
      ...customerForm,
      [e.target.name]: e.target.value,
    });
  };

  // Handle Admin Form Input
  const handleAdminChange = (e) => {
    setAdminForm({
      ...adminForm,
      [e.target.name]: e.target.value,
    });
  };

  // Submit Customer Registration
  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessData(null);

    if (customerForm.password !== customerForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (customerForm.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/customer/register", {
        name: customerForm.name,
        phone: customerForm.phone,
        email: customerForm.email,
        address: customerForm.address,
        password: customerForm.password,
        shopName: customerForm.shopName,
        shopType: customerForm.shopType,
        gstNumber: customerForm.gstNumber,
        shopPhone: customerForm.shopPhone || customerForm.phone,
        shopAddress: customerForm.shopAddress || customerForm.address,
        city: customerForm.city,
        state: customerForm.state,
        pincode: customerForm.pincode,
      });

      setSuccessData({
        type: "customer",
        title: "Retailer Account Created Successfully!",
        message:
          "Your business profile has been registered. You can now log in immediately with your email and password to place wholesale orders.",
        email: customerForm.email,
      });
    } catch (err) {
      console.error("Customer register error:", err);
      setError(
        err.response?.data?.message || "Registration failed. Please verify your details."
      );
    } finally {
      setLoading(false);
    }
  };

  // Submit Admin Application
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessData(null);

    if (adminForm.password !== adminForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (adminForm.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/admin/register", {
        name: adminForm.name,
        phone: adminForm.phone,
        email: adminForm.email,
        address: adminForm.address,
        qualification: adminForm.qualification,
        password: adminForm.password,
      });

      setSuccessData({
        type: "admin",
        title: "Staff Application Submitted for Owner Review!",
        message:
          "Your application has been logged under pending status. For security reasons, the business Owner must review your qualifications and grant operational permissions before your account is activated.",
        email: adminForm.email,
      });
    } catch (err) {
      console.error("Admin register error:", err);
      setError(
        err.response?.data?.message || "Admin application submission failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* HEADER */}
        <div className="bg-slate-950 text-white p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Manisha Traders Distribution
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold mt-1">
                Create an Account
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Register as a retail boutique partner or apply for staff management.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
              MT
            </div>
          </div>

          {/* TAB SELECTOR */}
          <div className="grid grid-cols-2 gap-2 mt-6 p-1.5 bg-slate-900 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab("customer");
                setError("");
                setSuccessData(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === "customer"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Store size={16} />
              Retailer / Boutique Sign Up
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("admin");
                setError("");
                setSuccessData(null);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === "admin"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <UserCog size={16} />
              Staff / Admin Application
            </button>
          </div>
        </div>

        {/* CONTENT BODY */}
        <div className="p-6 sm:p-8">
          {/* SUCCESS MODAL / BANNER */}
          {successData ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                {successData.title}
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                {successData.message}
              </p>

              {successData.type === "admin" && (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs text-left max-w-md mx-auto flex items-start gap-2.5">
                  <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Owner Review Required:</strong> The business owner has been notified. Once approved, you can sign in to the Staff Portal using your email: <strong>{successData.email}</strong>.
                  </span>
                </div>
              )}

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
                >
                  <span>Go to Login</span>
                  <ArrowRight size={16} />
                </Link>
                <button
                  type="button"
                  onClick={() => setSuccessData(null)}
                  className="w-full sm:w-auto px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition"
                >
                  Register Another Account
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ERROR NOTICE */}
              {error && (
                <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center gap-3">
                  <AlertCircle size={18} className="shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 1: RETAILER / CUSTOMER REGISTRATION */}
              {/* ======================================================== */}
              {activeTab === "customer" && (
                <form onSubmit={handleCustomerSubmit} className="space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Store size={16} className="text-blue-600" />
                      1. Retailer Store Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Shop / Boutique Name *
                      </label>
                      <input
                        type="text"
                        name="shopName"
                        value={customerForm.shopName}
                        onChange={handleCustomerChange}
                        placeholder="e.g. Mahalakshmi Fashion Boutique"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Business Type
                      </label>
                      <select
                        name="shopType"
                        value={customerForm.shopType}
                        onChange={handleCustomerChange}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Retail Boutique">Retail Boutique</option>
                        <option value="Wholesale Buyer">Wholesale Buyer</option>
                        <option value="Multi-brand Showroom">Multi-brand Showroom</option>
                        <option value="Online Retailer">Online Retailer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        GSTIN / Tax ID (Optional)
                      </label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={customerForm.gstNumber}
                        onChange={handleCustomerChange}
                        placeholder="e.g. 19ABCDE1234F1Z5"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Shop Contact Phone
                      </label>
                      <input
                        type="tel"
                        name="shopPhone"
                        value={customerForm.shopPhone}
                        onChange={handleCustomerChange}
                        placeholder="e.g. 9876543210"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        City / Market *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={customerForm.city}
                        onChange={handleCustomerChange}
                        placeholder="e.g. Kolkata"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={customerForm.state}
                        onChange={handleCustomerChange}
                        placeholder="e.g. West Bengal"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={customerForm.pincode}
                        onChange={handleCustomerChange}
                        placeholder="e.g. 700001"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Store Address / Delivery Location *
                    </label>
                    <textarea
                      rows={2}
                      name="shopAddress"
                      value={customerForm.shopAddress}
                      onChange={handleCustomerChange}
                      placeholder="Street, market name, landmark..."
                      required
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="border-b border-slate-100 pb-3 pt-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Building size={16} className="text-blue-600" />
                      2. Proprietor Login Credentials
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Proprietor Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={customerForm.name}
                        onChange={handleCustomerChange}
                        placeholder="Full Name"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={customerForm.phone}
                        onChange={handleCustomerChange}
                        placeholder="10-digit mobile"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Email Address (Used for Login) *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={customerForm.email}
                        onChange={handleCustomerChange}
                        placeholder="retailer@example.com"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Personal / Residential Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={customerForm.address}
                        onChange={handleCustomerChange}
                        placeholder="City, State"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Create Password *
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={customerForm.password}
                        onChange={handleCustomerChange}
                        placeholder="At least 6 characters"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={customerForm.confirmPassword}
                        onChange={handleCustomerChange}
                        placeholder="Re-enter password"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl transition shadow-md shadow-blue-600/20 text-sm flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      "Registering Retailer Account..."
                    ) : (
                      <>
                        <span>Complete Retailer Registration</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ======================================================== */}
              {/* TAB 2: STAFF / ADMIN APPLICATION */}
              {/* ======================================================== */}
              {activeTab === "admin" && (
                <form onSubmit={handleAdminSubmit} className="space-y-5">
                  <div className="p-4 bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl text-xs leading-relaxed flex items-start gap-3">
                    <ShieldAlert size={20} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Staff / Admin Security Notice</p>
                      <p className="mt-0.5 text-blue-700">
                        Admin accounts possess system access to orders, products, and customer directories. To maintain security, every admin applicant is placed in <strong>pending status</strong> until verified and approved by the Owner.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={adminForm.name}
                        onChange={handleAdminChange}
                        placeholder="e.g. Rahul Sen"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={adminForm.phone}
                        onChange={handleAdminChange}
                        placeholder="10-digit mobile number"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Email Address (Admin Login) *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={adminForm.email}
                        onChange={handleAdminChange}
                        placeholder="staff@manishatraders.com"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Qualification & Background *
                      </label>
                      <input
                        type="text"
                        name="qualification"
                        value={adminForm.qualification}
                        onChange={handleAdminChange}
                        placeholder="e.g. B.Com / 3 Yrs Wholesale Experience"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Address / Location *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={adminForm.address}
                        onChange={handleAdminChange}
                        placeholder="Residential address or locality"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Password *
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={adminForm.password}
                        onChange={handleAdminChange}
                        placeholder="At least 6 characters"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={adminForm.confirmPassword}
                        onChange={handleAdminChange}
                        placeholder="Re-enter password"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-xl transition shadow-md text-sm flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      "Submitting Application..."
                    ) : (
                      <>
                        <span>Submit Staff Application for Review</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}

          {/* FOOTER LINK TO LOGIN */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs sm:text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-blue-600 hover:underline"
              >
                Sign In here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
