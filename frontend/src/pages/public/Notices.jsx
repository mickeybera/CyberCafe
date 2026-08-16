
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaSearch,
  FaBell,
  FaThumbtack,
  FaCalendarAlt,
  FaFileAlt,
  FaArrowRight,
  FaFilter,
} from "react-icons/fa";

import { toast } from "react-hot-toast";

import api from "../../services/api";

const Notices = () => {
  const navigate = useNavigate();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  // ==========================================
  // FETCH PUBLIC NOTICES
  // ==========================================

  const fetchNotices = async () => {
    try {
      setLoading(true);

      const response = await api.get("/notices");

      setNotices(response.data.notices || []);
    } catch (error) {
      console.error("Fetch Notices Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load notices"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // ==========================================
  // FORMAT CATEGORY
  // ==========================================

  const formatCategory = (value) => {
    if (!value) return "General";

    return value
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
  // FILTER NOTICES
  // ==========================================

  const filteredNotices = useMemo(() => {
    const searchText = search
      .trim()
      .toLowerCase();

    return notices.filter((notice) => {
      const matchesSearch =
        !searchText ||
        notice.title
          ?.toLowerCase()
          .includes(searchText) ||
        notice.description
          ?.toLowerCase()
          .includes(searchText);

      const matchesCategory =
        category === "all" ||
        notice.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [notices, search, category]);

  // ==========================================
  // STATUS STYLE
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

  // ==========================================
  // STATUS TEXT
  // ==========================================

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

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ========================================
          HEADER
      ======================================== */}

      <section className="bg-blue-600 px-4 py-14 text-white">

        <div className="mx-auto max-w-6xl">

          <div className="flex items-center gap-3">

            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 text-2xl">
              <FaBell />
            </div>

            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">
                Notices
              </h1>

              <p className="mt-2 text-sm text-blue-100 sm:text-base">
                Stay updated with the latest announcements,
                schemes, jobs, scholarships and exams.
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* ========================================
          CONTENT
      ======================================== */}

      <main className="mx-auto max-w-6xl px-4 py-8">

        {/* FILTERS */}

        <div className="mb-8 rounded-xl bg-white p-5 shadow-sm">

          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <FaFilter />
            Find a Notice
          </div>

          <div className="grid gap-4 md:grid-cols-2">

            {/* SEARCH */}

            <div className="relative">

              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search notices..."
                className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* CATEGORY */}

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">
                All Categories
              </option>

              <option value="government_scheme">
                Government Scheme
              </option>

              <option value="job">
                Job
              </option>

              <option value="scholarship">
                Scholarship
              </option>

              <option value="exam">
                Exam
              </option>

              <option value="general">
                General
              </option>
            </select>

          </div>

        </div>

        {/* NOTICE COUNT */}

        <div className="mb-5 flex items-center justify-between">

          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredNotices.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {notices.length}
            </span>{" "}
            notices
          </p>

        </div>

        {/* ========================================
            EMPTY STATE
        ======================================== */}

        {filteredNotices.length === 0 ? (

          <div className="rounded-xl bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
              <FaBell />
            </div>

            <h2 className="text-lg font-bold text-slate-800">
              No notices found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {notices.length === 0
                ? "There are no published notices at the moment."
                : "Try changing your search or category filter."}
            </p>

          </div>

        ) : (

          /* ======================================
             NOTICE GRID
          ====================================== */

          <div className="grid gap-5 md:grid-cols-2">

            {filteredNotices.map((notice) => (

              <article
                key={notice._id}
                className={`overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md ${
                  notice.isPinned
                    ? "border-2 border-blue-200"
                    : "border border-slate-100"
                }`}
              >

                {/* CARD HEADER */}

                <div className="border-b border-slate-100 p-5">

                  <div className="mb-3 flex items-start justify-between gap-3">

                    <div className="flex flex-wrap items-center gap-2">

                      {notice.isPinned && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          <FaThumbtack />
                          Pinned
                        </span>
                      )}

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">
                        {formatCategory(
                          notice.category
                        )}
                      </span>

                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                        notice.status
                      )}`}
                    >
                      {getStatusText(
                        notice.status
                      )}
                    </span>

                  </div>

                  <h2 className="text-xl font-bold leading-7 text-slate-800">
                    {notice.title}
                  </h2>

                </div>

                {/* CARD BODY */}

                <div className="p-5">

                  <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                    {notice.description}
                  </p>

                  {/* DATES */}

                  {(notice.startDate ||
                    notice.lastDate) && (

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">

                      {notice.startDate && (
                        <div className="rounded-lg bg-slate-50 p-3">

                          <div className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-500">
                            <FaCalendarAlt />
                            Start Date
                          </div>

                          <p className="text-sm font-semibold text-slate-700">
                            {formatDate(
                              notice.startDate
                            )}
                          </p>

                        </div>
                      )}

                      {notice.lastDate && (
                        <div className="rounded-lg bg-slate-50 p-3">

                          <div className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-500">
                            <FaCalendarAlt />
                            Last Date
                          </div>

                          <p className="text-sm font-semibold text-slate-700">
                            {formatDate(
                              notice.lastDate
                            )}
                          </p>

                        </div>
                      )}

                    </div>
                  )}

                  {/* DOCUMENTS */}

                  {notice.requiredDocuments?.length >
                    0 && (

                    <div className="mt-5">

                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <FaFileAlt />
                        Required Documents
                      </div>

                      <div className="flex flex-wrap gap-2">

                        {notice.requiredDocuments
                          .slice(0, 3)
                          .map(
                            (
                              document,
                              index
                            ) => (
                              <span
                                key={index}
                                className="rounded-md bg-blue-50 px-2.5 py-1 text-xs text-blue-700"
                              >
                                {document}
                              </span>
                            )
                          )}

                        {notice.requiredDocuments
                          .length > 3 && (
                          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                            +
                            {notice
                              .requiredDocuments
                              .length -
                              3}{" "}
                            more
                          </span>
                        )}

                      </div>

                    </div>
                  )}

                </div>

                {/* CARD FOOTER */}

                <div className="border-t border-slate-100 bg-slate-50 p-4">

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/notices/${notice._id}`
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    View Full Notice
                    <FaArrowRight />
                  </button>

                </div>

              </article>

            ))}

          </div>

        )}

      </main>

    </div>
  );
};

export default Notices;

