import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaBullhorn,
  FaFilter,
  FaThumbtack,
  FaCalendarAlt,
  FaFileAlt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaLayerGroup,
  FaRedo,
} from "react-icons/fa";

import { toast } from "react-hot-toast";

import api from "../../services/api";

const Notice = () => {
  const navigate = useNavigate();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [published, setPublished] = useState("all");

  // ==========================================
  // FETCH NOTICES
  // ==========================================

  const fetchNotices = async () => {
    try {
      setLoading(true);

      const response = await api.get("/notices/admin/all");

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
  // DELETE NOTICE
  // ==========================================

  const handleDelete = async (notice) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${notice.title}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(notice._id);

      await api.delete(`/notices/${notice._id}`);

      setNotices((previous) =>
        previous.filter(
          (item) => item._id !== notice._id
        )
      );

      toast.success("Notice deleted successfully");
    } catch (error) {
      console.error("Delete Notice Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to delete notice"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // FILTER
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

      const matchesStatus =
        status === "all" ||
        notice.status === status;

      const matchesPublished =
        published === "all" ||
        (published === "published" &&
          notice.isPublished === true) ||
        (published === "unpublished" &&
          notice.isPublished === false);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesPublished
      );
    });
  }, [
    notices,
    search,
    category,
    status,
    published,
  ]);

  // ==========================================
  // STATISTICS
  // ==========================================

  const statistics = useMemo(() => {
    return {
      total: notices.length,

      published: notices.filter(
        (notice) => notice.isPublished
      ).length,

      open: notices.filter(
        (notice) => notice.status === "open"
      ).length,

      closed: notices.filter(
        (notice) => notice.status === "closed"
      ).length,
    };
  }, [notices]);

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "—";

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
  // CATEGORY
  // ==========================================

  const getCategoryLabel = (value) => {
    const labels = {
      government_scheme: "Government Scheme",
      job: "Job",
      scholarship: "Scholarship",
      exam: "Exam",
      general: "General",
    };

    return labels[value] || value;
  };

  // ==========================================
  // STATUS
  // ==========================================

  const getStatusInfo = (statusValue) => {
    switch (statusValue) {
      case "open":
        return {
          label: "Open",
          icon: FaCheckCircle,
          className:
            "bg-emerald-50 text-emerald-700 border-emerald-100",
        };

      case "closing_soon":
        return {
          label: "Closing Soon",
          icon: FaClock,
          className:
            "bg-amber-50 text-amber-700 border-amber-100",
        };

      case "closed":
        return {
          label: "Closed",
          icon: FaTimesCircle,
          className:
            "bg-red-50 text-red-700 border-red-100",
        };

      default:
        return {
          label: "Unknown",
          icon: FaClock,
          className:
            "bg-slate-50 text-slate-600 border-slate-200",
        };
    }
  };

  // ==========================================
  // RESET FILTERS
  // ==========================================

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setStatus("all");
    setPublished("all");
  };

  const hasFilters =
    search ||
    category !== "all" ||
    status !== "all" ||
    published !== "all";

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-[500px]">
        <div className="mb-8 h-8 w-52 animate-pulse rounded-lg bg-slate-200" />

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>

        <div className="mb-6 h-36 animate-pulse rounded-2xl bg-slate-200" />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-80 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="mx-auto max-w-7xl pb-10">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-xl text-white shadow-lg shadow-blue-200">
            <FaBullhorn />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
              Notices
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage announcements and important
              notifications
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/notices/add")
          }
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
        >
          <FaPlus />
          Add Notice
        </button>

      </div>

      {/* ======================================
          STATISTICS
      ====================================== */}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* TOTAL */}

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Notices
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-800">
                {statistics.total}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FaLayerGroup />
            </div>

          </div>

        </div>

        {/* PUBLISHED */}

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Published
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-800">
                {statistics.published}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FaCheckCircle />
            </div>

          </div>

        </div>

        {/* OPEN */}

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Active / Open
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-800">
                {statistics.open}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <FaClock />
            </div>

          </div>

        </div>

        {/* CLOSED */}

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Closed
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-800">
                {statistics.closed}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <FaTimesCircle />
            </div>

          </div>

        </div>

      </div>

      {/* ======================================
          FILTERS
      ====================================== */}

      <div className="mb-7 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <FaFilter />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Filter Notices
              </h2>

              <p className="text-xs text-slate-400">
                Search and filter your notices
              </p>
            </div>

          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              <FaRedo />
              Reset Filters
            </button>
          )}

        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          {/* SEARCH */}

          <div className="relative xl:col-span-1">

            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search notices..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />

          </div>

          {/* CATEGORY */}

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
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

          {/* STATUS */}

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
          >
            <option value="all">
              All Status
            </option>

            <option value="open">
              Open
            </option>

            <option value="closing_soon">
              Closing Soon
            </option>

            <option value="closed">
              Closed
            </option>
          </select>

          {/* PUBLISHED */}

          <select
            value={published}
            onChange={(e) =>
              setPublished(e.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
          >
            <option value="all">
              All Notices
            </option>

            <option value="published">
              Published
            </option>

            <option value="unpublished">
              Unpublished
            </option>
          </select>

        </div>

      </div>

      {/* ======================================
          RESULTS HEADER
      ====================================== */}

      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h2 className="text-lg font-bold text-slate-800">
            All Notices
          </h2>

          <p className="mt-1 text-sm text-slate-500">
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

        {hasFilters && (
          <div className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
            Filters active
          </div>
        )}

      </div>

      {/* ======================================
          EMPTY STATE
      ====================================== */}

      {filteredNotices.length === 0 ? (

        <div className="rounded-2xl border border-slate-100 bg-white px-6 py-20 text-center shadow-sm">

          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-3xl text-blue-400">
            <FaBullhorn />
          </div>

          <h2 className="text-xl font-bold text-slate-800">
            No notices found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {notices.length === 0
              ? "You haven't created any notices yet. Create your first notice to keep users informed."
              : "No notices match your current search or filters. Try changing your filters."}
          </p>

          {notices.length === 0 ? (

            <button
              type="button"
              onClick={() =>
                navigate("/admin/notices/add")
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <FaPlus />
              Add Your First Notice
            </button>

          ) : (

            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <FaRedo />
              Clear Filters
            </button>

          )}

        </div>

      ) : (

        /* ======================================
           NOTICE GRID
        ====================================== */

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {filteredNotices.map((notice) => {

            const statusInfo =
              getStatusInfo(notice.status);

            const StatusIcon =
              statusInfo.icon;

            return (

              <article
                key={notice._id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl"
              >

                {/* CARD TOP */}

                <div className="relative border-b border-slate-100 p-5">

                  {notice.isPinned && (
                    <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-600">
                      <FaThumbtack />
                      Pinned
                    </div>
                  )}

                  <div className="mb-4 flex items-start gap-3 pr-16">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                      <FaBullhorn />
                    </div>

                    <div className="min-w-0">

                      <h3 className="line-clamp-2 text-lg font-bold leading-6 text-slate-800">
                        {notice.title}
                      </h3>

                      <span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        {getCategoryLabel(
                          notice.category
                        )}
                      </span>

                    </div>

                  </div>

                  {/* STATUS */}

                  <div className="flex flex-wrap gap-2">

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusInfo.className}`}
                    >
                      <StatusIcon />
                      {statusInfo.label}
                    </span>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                        notice.isPublished
                          ? "border-blue-100 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-slate-50 text-slate-500"
                      }`}
                    >
                      {notice.isPublished
                        ? "Published"
                        : "Unpublished"}
                    </span>

                  </div>

                </div>

                {/* CARD BODY */}

                <div className="flex flex-1 flex-col p-5">

                  <p className="line-clamp-3 min-h-[72px] text-sm leading-6 text-slate-600">
                    {notice.description}
                  </p>

                  {/* DATES */}

                  {(notice.startDate ||
                    notice.lastDate) && (

                    <div className="mt-5 space-y-2">

                      {notice.startDate && (
                        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">

                          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <FaCalendarAlt className="text-blue-500" />
                            Start Date
                          </div>

                          <span className="text-xs font-bold text-slate-700">
                            {formatDate(
                              notice.startDate
                            )}
                          </span>

                        </div>
                      )}

                      {notice.lastDate && (
                        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">

                          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <FaCalendarAlt className="text-red-500" />
                            Last Date
                          </div>

                          <span className="text-xs font-bold text-slate-700">
                            {formatDate(
                              notice.lastDate
                            )}
                          </span>

                        </div>
                      )}

                    </div>
                  )}

                  {/* DOCUMENTS */}

                  {notice.requiredDocuments?.length >
                    0 && (

                    <div className="mt-5">

                      <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-600">
                        <FaFileAlt className="text-blue-500" />
                        Required Documents
                      </div>

                      <div className="flex flex-wrap gap-1.5">

                        {notice.requiredDocuments
                          .slice(0, 3)
                          .map(
                            (
                              document,
                              index
                            ) => (
                              <span
                                key={`${document}-${index}`}
                                className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                              >
                                {document}
                              </span>
                            )
                          )}

                        {notice.requiredDocuments
                          .length > 3 && (
                          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-600">
                            +
                            {notice
                              .requiredDocuments
                              .length - 3}{" "}
                            more
                          </span>
                        )}

                      </div>

                    </div>
                  )}

                </div>

                {/* CARD FOOTER */}

                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50 p-4">

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/admin/notices/${notice._id}`
                      )
                    }
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(notice)
                    }
                    disabled={
                      deletingId ===
                      notice._id
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {deletingId ===
                    notice._id ? (

                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />

                    ) : (

                      <FaTrash />

                    )}

                    {deletingId ===
                    notice._id
                      ? "Deleting..."
                      : "Delete"}

                  </button>

                </div>

              </article>

            );
          })}

        </div>
      )}

    </div>
  );
};

export default Notice;