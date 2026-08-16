import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaBell,
  FaCalendarAlt,
  FaThumbtack,
  FaArrowRight,
  FaLaptop,
  FaGraduationCap,
  FaFileAlt,
  FaGlobe,
  FaCheckCircle,
  FaShieldAlt,
  FaClock,
  FaUsers,
} from "react-icons/fa";

import { toast } from "react-hot-toast";

import api from "../../services/api";

const Home = () => {
  const navigate = useNavigate();

  const [notices, setNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(true);

  // ==========================================
  // FETCH PUBLIC NOTICES
  // ==========================================

  const fetchNotices = async () => {
    try {
      setLoadingNotices(true);

      const response = await api.get("/notices");

      setNotices(response.data.notices || []);
    } catch (error) {
      console.error("Fetch Notices Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load notices"
      );
    } finally {
      setLoadingNotices(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // ==========================================
  // FORMAT CATEGORY
  // ==========================================

  const formatCategory = (category) => {
    if (!category) return "General";

    return category
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // STATUS
  // ==========================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-700";

      case "closing_soon":
        return "bg-orange-100 text-orange-700";

      case "closed":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "open":
        return "Open";

      case "closing_soon":
        return "Closing Soon";

      case "closed":
        return "Closed";

      default:
        return "General";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">

        {/* Decorative circles */}

        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />

        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-indigo-400/20" />

        <div className="absolute right-1/4 top-1/3 h-32 w-32 rounded-full bg-blue-400/10 blur-2xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">

          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <div>

              {/* TRUST BADGE */}

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">

                <span className="h-2 w-2 rounded-full bg-green-400" />

                Your Trusted Digital Service Center

              </div>

              {/* TITLE */}

              <h1 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">

                Learn. Grow.

                <span className="block text-blue-200">
                  Build Your Future.
                </span>

              </h1>

              {/* DESCRIPTION */}

              <p className="mt-6 max-w-xl text-base leading-7 text-blue-100 sm:text-lg">

                Professional computer training, digital
                services, government applications and
                online assistance — all under one roof.

              </p>

              {/* =================================================
                  BUTTONS
              ================================================= */}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">

                {/* VIEW NOTICES */}

                <button
                  type="button"
                  onClick={() =>
                    navigate("/notices")
                  }
                  className="hover:cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
                >
                  View Latest Notices

                  <FaArrowRight />
                </button>

                {/* EXPLORE COURSES */}

                <button
                  type="button"
                  onClick={() =>
                    navigate("/courses")
                  }
                  className="hover:cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
                >
                  Explore Courses

                  <FaGraduationCap />
                </button>

                {/* ADMIN LOGIN */}

                <button
                  type="button"
                  onClick={() =>
                    navigate("/admin/login")
                  }
                  className="hover:cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
                >
                  Admin Login

                  <FaShieldAlt />
                </button>

              </div>

              {/* TRUST FEATURES */}

              <div className="mt-10 flex flex-wrap gap-6 text-sm text-blue-100">

                <div className="flex items-center gap-2">

                  <FaCheckCircle className="text-green-300" />

                  Professional Training

                </div>

                <div className="flex items-center gap-2">

                  <FaCheckCircle className="text-green-300" />

                  Digital Services

                </div>

                <div className="flex items-center gap-2">

                  <FaCheckCircle className="text-green-300" />

                  Trusted Support

                </div>

              </div>

            </div>

            {/* =================================================
                RIGHT VISUAL
            ================================================= */}

            <div className="relative hidden lg:block">

              <div className="relative mx-auto max-w-md">

                {/* MAIN CARD */}

                <div className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">

                  <div className="mb-6 flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl text-blue-600">

                        <FaLaptop />

                      </div>

                      <div>

                        <p className="font-bold">
                          Training Center
                        </p>

                        <p className="text-xs text-blue-200">
                          Learn • Practice • Succeed
                        </p>

                      </div>

                    </div>

                    <span className="h-3 w-3 rounded-full bg-green-400 shadow-lg shadow-green-400/50" />

                  </div>

                  {/* SERVICE GRID */}

                  <div className="grid grid-cols-2 gap-4">

                    {/* COURSES */}

                    <div className="rounded-2xl bg-white/10 p-5">

                      <FaGraduationCap className="mb-4 text-2xl text-blue-200" />

                      <p className="text-2xl font-bold">
                        Courses
                      </p>

                      <p className="mt-1 text-xs text-blue-200">
                        Skill development
                      </p>

                    </div>

                    {/* ONLINE */}

                    <div className="rounded-2xl bg-white/10 p-5">

                      <FaGlobe className="mb-4 text-2xl text-blue-200" />

                      <p className="text-2xl font-bold">
                        Online
                      </p>

                      <p className="mt-1 text-xs text-blue-200">
                        Digital services
                      </p>

                    </div>

                    {/* FORMS */}

                    <div className="rounded-2xl bg-white/10 p-5">

                      <FaFileAlt className="mb-4 text-2xl text-blue-200" />

                      <p className="text-2xl font-bold">
                        Forms
                      </p>

                      <p className="mt-1 text-xs text-blue-200">
                        Application support
                      </p>

                    </div>

                    {/* SECURE */}

                    <div className="rounded-2xl bg-white/10 p-5">

                      <FaShieldAlt className="mb-4 text-2xl text-blue-200" />

                      <p className="text-2xl font-bold">
                        Secure
                      </p>

                      <p className="mt-1 text-xs text-blue-200">
                        Reliable assistance
                      </p>

                    </div>

                  </div>

                </div>

                {/* FLOATING CARD */}

                <div className="absolute -bottom-6 -left-8 flex items-center gap-3 rounded-2xl bg-white p-4 text-slate-800 shadow-xl">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-600">

                    <FaCheckCircle />

                  </div>

                  <div>

                    <p className="text-sm font-bold">
                      Quality Service
                    </p>

                    <p className="text-xs text-slate-500">
                      Professional & reliable
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          QUICK SERVICES
      ===================================================== */}

      <section className="relative -mt-8 px-4">

        <div className="mx-auto max-w-6xl">

          <div className="grid overflow-hidden rounded-2xl bg-white shadow-xl sm:grid-cols-2 lg:grid-cols-4">

            {/* COMPUTER TRAINING */}

            <div className="border-b border-slate-100 p-6 sm:border-r lg:border-b-0">

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                <FaGraduationCap />

              </div>

              <h3 className="font-bold text-slate-800">
                Computer Training
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Build practical digital and computer skills.
              </p>

            </div>

            {/* ONLINE SERVICES */}

            <div className="border-b border-slate-100 p-6 lg:border-r lg:border-b-0">

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">

                <FaGlobe />

              </div>

              <h3 className="font-bold text-slate-800">
                Online Services
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Get help with online applications and services.
              </p>

            </div>

            {/* APPLICATION SUPPORT */}

            <div className="border-b border-slate-100 p-6 sm:border-r sm:border-b-0">

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">

                <FaFileAlt />

              </div>

              <h3 className="font-bold text-slate-800">
                Application Support
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Assistance with forms and documentation.
              </p>

            </div>

            {/* QUICK ASSISTANCE */}

            <div className="p-6">

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">

                <FaClock />

              </div>

              <h3 className="font-bold text-slate-800">
                Quick Assistance
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Friendly support for your digital needs.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          NOTICES
      ===================================================== */}

      <section className="px-4 py-20">

        <div className="mx-auto max-w-6xl">

          {/* HEADER */}

          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-600">

                <FaBell />

                Latest Updates

              </div>

              <h2 className="text-3xl font-extrabold text-slate-800 sm:text-4xl">
                Latest Notices
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">

                Stay informed about government schemes,
                jobs, scholarships, examinations and important
                announcements.

              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/notices")
              }
              className="hover:cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              View All Notices

              <FaArrowRight />

            </button>

          </div>

          {/* LOADING */}

          {loadingNotices ? (

            <div className="flex min-h-[220px] items-center justify-center rounded-2xl bg-white shadow-sm">

              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            </div>

          ) : notices.length === 0 ? (

            /* EMPTY */

            <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">

                <FaBell />

              </div>

              <h3 className="text-lg font-bold text-slate-800">
                No notices available
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                There are no published notices at the moment.
              </p>

            </div>

          ) : (

            /* NOTICE LIST */

            <div className="grid gap-6 md:grid-cols-2">

              {notices.slice(0, 4).map(
                (notice) => (

                  <article
                    key={notice._id}
                    className={`group overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                      notice.isPinned
                        ? "border-2 border-blue-200"
                        : "border border-slate-100"
                    }`}
                  >

                    <div className="p-6">

                      {/* TOP */}

                      <div className="mb-4 flex items-start justify-between gap-3">

                        <div className="flex flex-wrap items-center gap-2">

                          {notice.isPinned && (

                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">

                              <FaThumbtack />

                              Pinned

                            </span>

                          )}

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">

                            {formatCategory(
                              notice.category
                            )}

                          </span>

                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                            notice.status
                          )}`}
                        >

                          {getStatusText(
                            notice.status
                          )}

                        </span>

                      </div>

                      {/* TITLE */}

                      <h3 className="text-xl font-bold leading-7 text-slate-800 transition group-hover:text-blue-600">

                        {notice.title}

                      </h3>

                      {/* DESCRIPTION */}

                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">

                        {notice.description}

                      </p>

                      {/* DATE */}

                      {notice.lastDate && (

                        <div className="mt-5 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-sm">

                          <FaCalendarAlt className="text-blue-500" />

                          <span className="text-slate-500">
                            Last Date
                          </span>

                          <span className="font-bold text-slate-700">

                            {formatDate(
                              notice.lastDate
                            )}

                          </span>

                        </div>

                      )}

                      {/* BUTTON */}

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/notices/${notice._id}`
                          )
                        }
                        className="hover:cursor-pointer mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition group-hover:gap-3 hover:text-blue-700"
                      >

                        View Full Notice

                        <FaArrowRight />

                      </button>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </div>

      </section>

      {/* =====================================================
          WHY CHOOSE US
      ===================================================== */}

      <section className="bg-white px-4 py-20">

        <div className="mx-auto max-w-6xl">

          <div className="mx-auto mb-12 max-w-2xl text-center">

            <span className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Why Choose Us
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-800 sm:text-4xl">

              Everything You Need, In One Place

            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">

              We combine professional training with
              convenient digital services to make your
              everyday tasks easier.

            </p>

          </div>

          <div className="grid gap-6 md:grid-cols-3">

            {/* SKILL DEVELOPMENT */}

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-7 transition hover:-translate-y-1 hover:shadow-lg">

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-xl text-blue-600">

                <FaGraduationCap />

              </div>

              <h3 className="text-xl font-bold text-slate-800">
                Skill Development
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-500">

                Learn useful computer and digital skills
                through practical training designed for
                real-world use.

              </p>

            </div>

            {/* RELIABLE SERVICE */}

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-7 transition hover:-translate-y-1 hover:shadow-lg">

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-xl text-green-600">

                <FaShieldAlt />

              </div>

              <h3 className="text-xl font-bold text-slate-800">
                Reliable Service
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-500">

                Get dependable assistance for digital
                applications, documents and online services.

              </p>

            </div>

            {/* STUDENT FRIENDLY */}

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-7 transition hover:-translate-y-1 hover:shadow-lg">

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-xl text-orange-600">

                <FaUsers />

              </div>

              <h3 className="text-xl font-bold text-slate-800">
                Student Friendly
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-500">

                A comfortable and supportive environment
                for students, learners and local customers.

              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="px-4 py-20">

        <div className="mx-auto max-w-6xl">

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-12 text-center text-white shadow-xl sm:px-12">

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />

            <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-white/10" />

            <div className="relative">

              <h2 className="text-3xl font-extrabold sm:text-4xl">

                Ready to Learn Something New?

              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">

                Explore our courses, stay updated with
                important notices and get the digital
                assistance you need.

              </p>

              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={() =>
                    navigate("/notices")
                  }
                  className="hover:cursor-pointer line-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-blue-700 transition hover:bg-blue-50"
                >

                  Check Notices

                  <FaBell />

                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/courses")
                  }
                  className="hover:cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 font-bold text-white transition hover:bg-white/20"
                >

                  Browse Courses

                  <FaGraduationCap />

                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/admin/login")
                  }
                  className="hover:cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 font-bold text-white transition hover:bg-white/20"
                >

                  Admin Login

                  <FaShieldAlt />

                </button>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-slate-900 px-4 py-8 text-center">

        <p className="text-sm text-slate-400">

          © {new Date().getFullYear()} Cyber Café &
          Training Center. All rights reserved.

        </p>

      </footer>

    </div>
  );
};

export default Home;