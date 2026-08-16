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
  // CATEGORY LABEL
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
  // STATUS STYLE
  // ==========================================

  const getStatusStyle = (statusValue) => {
    if (statusValue === "open") {
      return "bg-green-100 text-green-700";
    }

    if (statusValue === "closing_soon") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-red-100 text-red-700";
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="mx-auto max-w-7xl">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <FaBullhorn />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Notices
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage announcements and important notices
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/notices/add")
          }
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <FaPlus />
          Add Notice
        </button>

      </div>

      {/* ========================================
          FILTERS
      ======================================== */}

      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">

        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <FaFilter />
          Filters
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          {/* SEARCH */}

          <div className="relative">

            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search notice..."
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

          {/* STATUS */}

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

      {/* ========================================
          COUNT
      ======================================== */}

      <div className="mb-4">

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
            <FaBullhorn />
          </div>

          <h2 className="text-lg font-bold text-slate-800">
            No notices found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {notices.length === 0
              ? "You haven't created any notices yet."
              : "Try changing your search or filters."}
          </p>

          {notices.length === 0 && (
            <button
              type="button"
              onClick={() =>
                navigate("/admin/notices/add")
              }
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              <FaPlus />
              Add Your First Notice
            </button>
          )}

        </div>

      ) : (

        /* ======================================
           NOTICE GRID
        ====================================== */

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {filteredNotices.map((notice) => (

            <div
              key={notice._id}
              className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
            >

              {/* CARD HEADER */}

              <div className="border-b border-slate-100 p-5">

                <div className="mb-3 flex items-start justify-between gap-3">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <FaBullhorn />
                    </div>

                    <div className="min-w-0">

                      <h2 className="text-lg font-bold text-slate-800">
                        {notice.title}
                      </h2>

                      <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                        {getCategoryLabel(
                          notice.category
                        )}
                      </span>

                    </div>

                  </div>

                  {notice.isPinned && (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700">
                      <FaThumbtack />
                      Pinned
                    </span>
                  )}

                </div>

                {/* STATUS + PUBLISHED */}

                <div className="flex flex-wrap gap-2">

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                      notice.status
                    )}`}
                  >
                    {notice.status ===
                    "closing_soon"
                      ? "Closing Soon"
                      : notice.status
                          ?.charAt(0)
                          .toUpperCase() +
                        notice.status?.slice(1)}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      notice.isPublished
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {notice.isPublished
                      ? "Published"
                      : "Unpublished"}
                  </span>

                </div>

              </div>

              {/* CARD BODY */}

              <div className="space-y-4 p-5">

                <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                  {notice.description}
                </p>

                {/* DATES */}

                <div className="space-y-2 text-sm">

                  {notice.startDate && (
                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-2 text-slate-500">
                        <FaCalendarAlt className="text-blue-500" />
                        Start Date
                      </div>

                      <span className="font-medium text-slate-700">
                        {formatDate(
                          notice.startDate
                        )}
                      </span>

                    </div>
                  )}

                  {notice.lastDate && (
                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-2 text-slate-500">
                        <FaCalendarAlt className="text-red-500" />
                        Last Date
                      </div>

                      <span className="font-medium text-slate-700">
                        {formatDate(
                          notice.lastDate
                        )}
                      </span>

                    </div>
                  )}

                </div>

                {/* REQUIRED DOCUMENTS */}

                {notice.requiredDocuments?.length >
                  0 && (
                  <div>

                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <FaFileAlt className="text-blue-500" />
                      Required Documents
                    </div>

                    <div className="flex flex-wrap gap-2">

                      {notice.requiredDocuments
                        .slice(0, 4)
                        .map(
                          (
                            document,
                            index
                          ) => (
                            <span
                              key={`${document}-${index}`}
                              className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                            >
                              {document}
                            </span>
                          )
                        )}

                      {notice.requiredDocuments
                        .length > 4 && (
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                          +
                          {notice
                            .requiredDocuments
                            .length - 4}{" "}
                          more
                        </span>
                      )}

                    </div>

                  </div>
                )}

              </div>

              {/* CARD FOOTER */}

              <div className="flex gap-3 border-t border-slate-100 bg-slate-50 p-4">

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/admin/notices/${notice._id}`
                    )
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
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
                    deletingId === notice._id
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingId === notice._id ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                  ) : (
                    <FaTrash />
                  )}

                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
};

export default Notice;