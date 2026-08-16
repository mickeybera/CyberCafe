import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  FaTachometerAlt,
  FaUserGraduate,
  FaBook,
  FaMoneyBillWave,
  FaBullhorn,
  FaCertificate,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaBell,
  FaChevronRight,
  FaGraduationCap,
} from "react-icons/fa";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const { user, logout } = useAuth();

  const navigate = useNavigate();

  // ==========================================
  // MENU ITEMS
  // ==========================================

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: FaTachometerAlt,
    },
    {
      name: "Students",
      path: "/admin/students",
      icon: FaUserGraduate,
    },
    {
      name: "Courses",
      path: "/admin/courses",
      icon: FaBook,
    },
    {
      name: "Payments",
      path: "/admin/payments",
      icon: FaMoneyBillWave,
    },
    {
      name: "Notices",
      path: "/admin/notices",
      icon: FaBullhorn,
    },
    {
      name: "Certificates",
      path: "/admin/certificates",
      icon: FaCertificate,
    },
  ];

  // ==========================================
  // USER INITIAL
  // ==========================================

  const getInitial = () => {
    if (!user?.name) {
      return "A";
    }

    return user.name
      .charAt(0)
      .toUpperCase();
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    logout();

    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">

      {/* ==================================================
          MOBILE TOP BAR
      ================================================== */}

      <header className="fixed left-0 right-0 top-0 z-40 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur md:hidden">

        {/* MENU */}

        <button
          onClick={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
        >
          {sidebarOpen ? (
            <FaTimes size={20} />
          ) : (
            <FaBars size={20} />
          )}
        </button>


        {/* BRAND */}

        <div className="flex items-center gap-2">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">

            <FaGraduationCap />

          </div>

          <div className="text-left">

            <p className="text-sm font-bold leading-none text-slate-800">
              Cyber Café
            </p>

            <p className="mt-1 text-[10px] font-medium text-slate-400">
              MANAGEMENT
            </p>

          </div>

        </div>


        {/* USER */}

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
          {getInitial()}
        </div>

      </header>


      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-[270px] flex-col
          border-r border-slate-800
          bg-[#111827] text-white
          shadow-2xl
          transition-transform duration-300

          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          md:translate-x-0
        `}
      >

        {/* ==================================================
            BRAND
        ================================================== */}

        <div className="flex h-[82px] items-center border-b border-white/10 px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-lg shadow-blue-600/20">

              <FaGraduationCap />

            </div>


            <div>

              <h1 className="text-[17px] font-bold tracking-tight">
                Cyber Café
              </h1>

              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Management System
              </p>

            </div>

          </div>

        </div>


        {/* ==================================================
            NAVIGATION
        ================================================== */}

        <div className="flex-1 overflow-y-auto px-4 py-6">

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Main Menu
          </p>


          <nav className="space-y-1.5">

            {menuItems.map(
              (item) => {

                const Icon =
                  item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() =>
                      setSidebarOpen(false)
                    }
                    className={({
                      isActive,
                    }) =>
                      `
                      group relative flex items-center gap-3
                      rounded-xl px-3.5 py-3
                      text-sm font-medium
                      transition-all duration-200

                      ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }
                      `
                    }
                  >

                    {({
                      isActive,
                    }) => (
                      <>
                        {/* ACTIVE INDICATOR */}

                        {isActive && (
                          <span className="absolute -left-4 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-blue-400" />
                        )}


                        {/* ICON */}

                        <span
                          className={`
                            flex h-9 w-9 items-center justify-center rounded-lg
                            transition
                            ${
                              isActive
                                ? "bg-white/15 text-white"
                                : "bg-white/5 text-slate-400 group-hover:text-white"
                            }
                          `}
                        >

                          <Icon size={16} />

                        </span>


                        {/* NAME */}

                        <span className="flex-1">
                          {item.name}
                        </span>


                        {/* ARROW */}

                        <FaChevronRight
                          size={10}
                          className={`
                            transition
                            ${
                              isActive
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-50"
                            }
                          `}
                        />

                      </>
                    )}

                  </NavLink>
                );
              }
            )}

          </nav>


          {/* ==================================================
              QUICK INFO
          ================================================== */}

          <div className="mt-8">

            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              System
            </p>


            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">

              <div className="mb-3 flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/40" />

                <span className="text-xs font-medium text-slate-300">
                  System Online
                </span>

              </div>

              <p className="text-[11px] leading-relaxed text-slate-500">
                Your management system is running normally.
              </p>

            </div>

          </div>

        </div>


        {/* ==================================================
            USER / LOGOUT
        ================================================== */}

        <div className="border-t border-white/10 p-4">

          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/[0.04] p-3">

            {/* AVATAR */}

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20">

              {getInitial()}

            </div>


            {/* USER INFO */}

            <div className="min-w-0 flex-1">

              <p className="truncate text-sm font-semibold text-white">
                {user?.name || "Administrator"}
              </p>

              <p className="truncate text-[11px] text-slate-500">
                {user?.email ||
                  "Administrator"}
              </p>

            </div>

          </div>


          {/* LOGOUT */}

          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >

            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 transition group-hover:bg-red-500/10">

              <FaSignOutAlt size={15} />

            </span>

            Logout

          </button>

        </div>

      </aside>


      {/* ==================================================
          MOBILE OVERLAY
      ================================================== */}

      {sidebarOpen && (
        <div
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
        />
      )}


      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main className="min-h-screen md:ml-[270px]">

        {/* ==================================================
            DESKTOP TOP BAR
        ================================================== */}

        <header className="sticky top-0 z-30 hidden h-[82px] items-center justify-between border-b border-slate-200 bg-white/90 px-8 backdrop-blur-xl md:flex">

          {/* LEFT */}

          <div>

            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Administration
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-800">
              Welcome back,{" "}
              {user?.name ||
                "Administrator"}
            </h2>

          </div>


          {/* RIGHT */}

          <div className="flex items-center gap-5">

            {/* NOTIFICATION */}

            <button className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600">

              <FaBell size={16} />

              <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />

            </button>


            {/* DIVIDER */}

            <div className="h-9 w-px bg-slate-200" />


            {/* PROFILE */}

            <div className="flex items-center gap-3">

              <div className="text-right">

                <p className="text-sm font-semibold text-slate-700">
                  {user?.name ||
                    "Administrator"}
                </p>

                <p className="text-xs text-slate-400">
                  Administrator
                </p>

              </div>


              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-bold text-white shadow-md shadow-blue-500/20">

                {getInitial()}

              </div>

            </div>

          </div>

        </header>


        {/* ==================================================
            PAGE CONTENT
        ================================================== */}

        <div className="px-4 pb-8 pt-[88px] md:px-8 md:pb-10 md:pt-8 lg:px-10">

          <Outlet />

        </div>

      </main>

    </div>
  );
};

export default AdminLayout;