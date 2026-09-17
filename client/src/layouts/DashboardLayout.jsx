import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  UserCog,
  Settings,
  LogOut,
  Store,
} from "lucide-react";

function DashboardLayout() {
  const userStr = localStorage.getItem("user");
  let currentUser = { name: "Sudipto Das", role: "owner", permissions: {} };
  if (userStr) {
    try {
      currentUser = JSON.parse(userStr);
    } catch {}
  }

  const isOwner = currentUser.role === "owner";
  const basePath = isOwner ? "/owner" : "/admin";

  // Build menu dynamically based on role & permissions
  const allMenuItems = [
    {
      name: "Dashboard",
      path: `${basePath}/dashboard`,
      icon: LayoutDashboard,
      visible: true,
    },
    {
      name: "Products",
      path: `${basePath}/products`,
      icon: Package,
      visible: isOwner || !!currentUser.permissions?.manageProducts,
    },
    {
      name: "Orders",
      path: `${basePath}/orders`,
      icon: ShoppingCart,
      visible: isOwner || !!currentUser.permissions?.manageOrders,
    },
    {
      name: "Customers",
      path: `${basePath}/customers`,
      icon: Users,
      visible: isOwner || !!currentUser.permissions?.manageCustomers,
    },
    {
      name: "Analytics",
      path: `${basePath}/analytics`,
      icon: BarChart3,
      visible: isOwner || !!currentUser.permissions?.viewAnalytics,
    },
    {
      name: "Admins",
      path: "/owner/admins",
      icon: UserCog,
      visible: isOwner, // Strictly Owner Only
    },
    {
      name: "Settings",
      path: `${basePath}/settings`,
      icon: Settings,
      visible: isOwner || !!currentUser.permissions?.manageWebsite,
    },
  ];

  const menuItems = allMenuItems.filter((item) => item.visible);

  const initials = currentUser.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "MT";

  const roleLabel = isOwner
    ? "Distributor / Owner"
    : currentUser.role === "admin"
    ? "Staff / Admin"
    : "User";

  const portalSubtitle = isOwner
    ? "Executive Owner Portal"
    : "Staff Operations Portal";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-slate-950 text-white fixed left-0 top-0 bottom-0 flex flex-col overflow-y-auto shadow-2xl">

        {/* LOGO / BRAND */}
        <div className="px-6 py-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${
              isOwner
                ? "bg-gradient-to-br from-amber-400 to-orange-500"
                : "bg-gradient-to-br from-blue-500 to-indigo-600"
            }`}>
              <Store size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-wide text-white leading-tight">
                MANISHA TRADERS
              </h1>
              <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
                {portalSubtitle}
              </p>
            </div>
          </div>

          {/* Role badge */}
          <div className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
            isOwner
              ? "bg-amber-500/15 text-amber-300 border border-amber-500/25"
              : "bg-blue-500/15 text-blue-300 border border-blue-500/25"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOwner ? "bg-amber-400" : "bg-blue-400"}`} />
            {roleLabel}
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 ${
                    isActive
                      ? isOwner
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                        : "bg-blue-600/30 text-blue-200 border border-blue-500/30 shadow-sm"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 border border-transparent"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      className={`flex-shrink-0 transition-transform duration-150 ${
                        isActive ? "scale-110" : "group-hover:scale-105"
                      }`}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                    {isActive && (
                      <span className={`ml-auto w-1.5 h-1.5 rounded-full ${
                        isOwner ? "bg-amber-400" : "bg-blue-400"
                      }`} />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* USER PROFILE + LOGOUT */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          {/* User info mini card */}
          <div className="flex items-center gap-3 px-2">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold flex-shrink-0 ${
              isOwner
                ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
            }`}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100 truncate leading-tight">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{currentUser.email || "admin@manishatraders.com"}</p>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-red-600/20 hover:text-red-300 hover:border-red-500/30 border border-transparent transition-all duration-150 text-sm font-medium"
          >
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* ================= MAIN AREA ================= */}
      <main className="ml-64 flex-1 min-h-screen">

        {/* TOP HEADER */}
        <header className="h-16 bg-white/90 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {isOwner ? "Executive Owner Portal" : "Staff Admin Portal"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isOwner
                ? "Full distribution, wholesale management & administrative authority"
                : "Operational management & order processing"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight">
                {currentUser.name}
              </p>
              <span
                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isOwner
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-blue-100 text-blue-800 border border-blue-200"
                }`}
              >
                {roleLabel}
              </span>
            </div>

            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm shadow-sm ${
              isOwner
                ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
            }`}>
              {initials}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <section className="p-8">
          <Outlet />
        </section>

      </main>

    </div>
  );
}

export default DashboardLayout;