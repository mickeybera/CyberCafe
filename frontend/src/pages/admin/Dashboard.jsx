import { useEffect, useState } from "react";
import api from "../../services/api";

import {
  FaUserGraduate,
  FaBook,
  FaMoneyBillWave,
  FaCertificate,
  FaBullhorn,
  FaArrowRight,
  FaPlus,
  FaUserPlus,
  FaCreditCard,
  FaEye,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaChartLine,
} from "react-icons/fa";

import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH DASHBOARD
  // ==========================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const response = await api.get("/dashboard");

      setDashboard(response.data.dashboard);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // SAFETY
  // ==========================================

  if (!dashboard) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-700">
            Unable to load dashboard
          </p>

          <button
            onClick={fetchDashboard}
            className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // API DATA
  // ==========================================

  const statsData = dashboard.stats || {};
  const students = dashboard.students || {};
  const fees = dashboard.fees || {};
  const notices = dashboard.notices || {};
  const certificates = dashboard.certificates || {};

  // ==========================================
  // FEE CALCULATION
  // ==========================================

  const totalFees = Number(
    fees.totalFee ?? 0
  );

  // Use actual Payment collection
  const totalCollected = Number(
    fees.totalCollectedFromPayments ?? 0
  );

  const totalRemaining = Math.max(
    totalFees - totalCollected,
    0
  );

  const collectionPercentage =
    totalFees > 0
      ? Math.min(
          Math.round(
            (totalCollected / totalFees) * 100
          ),
          100
        )
      : 0;

  // ==========================================
  // STAT CARDS
  // ==========================================

  const statCards = [
    {
      title: "Total Students",
      value: statsData.totalStudents ?? 0,
      icon: FaUserGraduate,
      color: "blue",
      link: "/admin/students",
      description: "Registered students",
    },

    {
      title: "Total Courses",
      value: statsData.totalCourses ?? 0,
      icon: FaBook,
      color: "violet",
      link: "/admin/courses",
      description: "Available courses",
    },

    {
      title: "Total Payments",
      value: fees.totalPaymentRecords ?? 0,
      icon: FaMoneyBillWave,
      color: "emerald",
      link: "/admin/payments",
      description: "Payment records",
    },

    {
      title: "Certificates",
      value: certificates.total ?? 0,
      icon: FaCertificate,
      color: "amber",
      link: "/admin/certificates",
      description: "Certificates issued",
    },
  ];

  // ==========================================
  // COLORS
  // ==========================================

  const colorClasses = {
    blue: {
      icon: "bg-blue-50 text-blue-600",
      hover: "group-hover:border-blue-200",
    },

    violet: {
      icon: "bg-violet-50 text-violet-600",
      hover: "group-hover:border-violet-200",
    },

    emerald: {
      icon: "bg-emerald-50 text-emerald-600",
      hover: "group-hover:border-emerald-200",
    },

    amber: {
      icon: "bg-amber-50 text-amber-600",
      hover: "group-hover:border-amber-200",
    },
  };

  return (
    <div className="space-y-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

        <div>

          <div className="flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
              Overview
            </p>

          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-800">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your training center from one place.
          </p>

        </div>

        {/* QUICK ACTION */}

        <Link
          to="/admin/students/add"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          <FaPlus size={13} />

          Add Student
        </Link>

      </div>


      {/* ==================================================
          STAT CARDS
      ================================================== */}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        {statCards.map((stat) => {

          const Icon = stat.icon;
          const colors = colorClasses[stat.color];

          return (
            <Link
              key={stat.title}
              to={stat.link}
              className={`
                group relative overflow-hidden
                rounded-2xl border border-slate-200
                bg-white p-5
                shadow-sm
                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-xl
                ${colors.hover}
              `}
            >

              {/* Decorative circle */}

              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-50 transition group-hover:scale-125" />

              <div className="relative">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>

                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-800">
                      {stat.value}
                    </h2>

                  </div>

                  <div
                    className={`
                      flex h-12 w-12
                      items-center justify-center
                      rounded-xl
                      ${colors.icon}
                    `}
                  >
                    <Icon size={19} />
                  </div>

                </div>

                <div className="mt-5 flex items-center justify-between">

                  <span className="text-xs text-slate-400">
                    {stat.description}
                  </span>

                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition group-hover:bg-blue-50 group-hover:text-blue-600">

                    <FaArrowRight size={10} />

                  </span>

                </div>

              </div>

            </Link>
          );
        })}

      </div>


      {/* ==================================================
          FEE OVERVIEW + STUDENT STATUS
      ================================================== */}

      <div className="grid gap-6 xl:grid-cols-3">

        {/* ==================================================
            FEE OVERVIEW
        ================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">

          <div className="flex items-start justify-between">

            <div>

              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <FaChartLine size={15} />
                </div>

                <div>

                  <h2 className="font-bold text-slate-800">
                    Fee Overview
                  </h2>

                  <p className="text-xs text-slate-400">
                    Overall fee collection
                  </p>

                </div>

              </div>

            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
              {collectionPercentage}% Collected
            </span>

          </div>


          {/* MAIN AMOUNT */}

          <div className="mt-7">

            <p className="text-sm text-slate-500">
              Total collected
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-800">
              ₹{totalCollected.toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              out of ₹{totalFees.toLocaleString("en-IN")}
            </p>

          </div>


          {/* PROGRESS */}

          <div className="mt-6">

            <div className="mb-2 flex justify-between text-xs font-semibold">

              <span className="text-slate-500">
                Collection progress
              </span>

              <span className="text-blue-600">
                {collectionPercentage}%
              </span>

            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700"
                style={{
                  width: `${collectionPercentage}%`,
                }}
              />

            </div>

          </div>


          {/* AMOUNTS */}

          <div className="mt-6 grid grid-cols-2 gap-4">

            <div className="rounded-xl bg-emerald-50 p-4">

              <div className="flex items-center gap-2">

                <FaCheckCircle className="text-emerald-500" />

                <p className="text-xs font-medium text-slate-500">
                  Collected
                </p>

              </div>

              <p className="mt-2 text-lg font-bold text-emerald-600">
                ₹{totalCollected.toLocaleString("en-IN")}
              </p>

            </div>


            <div className="rounded-xl bg-red-50 p-4">

              <div className="flex items-center gap-2">

                <FaClock className="text-red-500" />

                <p className="text-xs font-medium text-slate-500">
                  Remaining
                </p>

              </div>

              <p className="mt-2 text-lg font-bold text-red-600">
                ₹{totalRemaining.toLocaleString("en-IN")}
              </p>

            </div>

          </div>

        </div>


        {/* ==================================================
            STUDENT STATUS
        ================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="font-bold text-slate-800">
                Student Status
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Current student overview
              </p>

            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FaUserGraduate size={16} />
            </div>

          </div>


          <div className="mt-6 space-y-3">

            {/* ACTIVE */}

            <div className="flex items-center justify-between rounded-xl bg-blue-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <FaClock size={14} />
                </div>

                <div>

                  <p className="text-sm font-semibold text-slate-700">
                    Active
                  </p>

                  <p className="text-xs text-slate-400">
                    Currently studying
                  </p>

                </div>

              </div>

              <p className="text-xl font-bold text-blue-600">
                {students.active ?? 0}
              </p>

            </div>


            {/* COMPLETED */}

            <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <FaCheckCircle size={14} />
                </div>

                <div>

                  <p className="text-sm font-semibold text-slate-700">
                    Completed
                  </p>

                  <p className="text-xs text-slate-400">
                    Course completed
                  </p>

                </div>

              </div>

              <p className="text-xl font-bold text-emerald-600">
                {students.completed ?? 0}
              </p>

            </div>


            {/* DROPPED */}

            <div className="flex items-center justify-between rounded-xl bg-red-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <FaTimesCircle size={14} />
                </div>

                <div>

                  <p className="text-sm font-semibold text-slate-700">
                    Dropped
                  </p>

                  <p className="text-xs text-slate-400">
                    Left the course
                  </p>

                </div>

              </div>

              <p className="text-xl font-bold text-red-600">
                {students.dropped ?? 0}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ==================================================
          QUICK ACTIONS + NOTICES
      ================================================== */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-5">

            <h2 className="font-bold text-slate-800">
              Quick Actions
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Frequently used management tools
            </p>

          </div>


          <div className="grid grid-cols-2 gap-3">

            <Link
              to="/admin/students/add"
              className="group rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                <FaUserPlus />
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-700">
                Add Student
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                Register new student
              </p>

            </Link>


            <Link
              to="/admin/payments"
              className="group rounded-xl border border-slate-200 p-4 transition hover:border-emerald-200 hover:bg-emerald-50"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100">
                <FaCreditCard />
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-700">
                Add Payment
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                Record fee payment
              </p>

            </Link>


            <Link
              to="/admin/certificates"
              className="group rounded-xl border border-slate-200 p-4 transition hover:border-amber-200 hover:bg-amber-50"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100">
                <FaCertificate />
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-700">
                Certificates
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                Manage certificates
              </p>

            </Link>


            <Link
              to="/admin/students"
              className="group rounded-xl border border-slate-200 p-4 transition hover:border-violet-200 hover:bg-violet-50"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600 group-hover:bg-violet-100">
                <FaEye />
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-700">
                View Students
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                Browse student records
              </p>

            </Link>

          </div>

        </div>


        {/* ==================================================
            NOTICE SUMMARY
        ================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-start justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <FaBullhorn />
              </div>

              <div>

                <h2 className="font-bold text-slate-800">
                  Notices
                </h2>

                <p className="text-xs text-slate-400">
                  Important announcements
                </p>

              </div>

            </div>


            <Link
              to="/admin/notices"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View All
            </Link>

          </div>


          <div className="mt-6 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-4xl font-bold text-orange-600">
                  {notices.open ?? 0}
                </p>

                <p className="mt-1 text-sm font-medium text-slate-600">
                  Active Notices
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Government schemes & announcements
                </p>

              </div>


              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl text-orange-500 shadow-sm">
                <FaBullhorn />
              </div>

            </div>


            <Link
              to="/admin/notices"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-600"
            >
              Manage Notices

              <FaArrowRight size={9} />

            </Link>

          </div>

        </div>

      </div>


      {/* ==================================================
          FOOTER
      ================================================== */}

      <div className="flex flex-col justify-between gap-2 rounded-xl border border-slate-200 bg-white px-5 py-4 text-xs text-slate-400 sm:flex-row sm:items-center">

        <p>
          Training Center Management System
        </p>

        <p>
          All systems operational

          <span className="ml-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
        </p>

      </div>

    </div>
  );
};

export default Dashboard;