
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaBell,
  FaCalendarAlt,
  FaFileAlt,
  FaThumbtack,
} from "react-icons/fa";

import { toast } from "react-hot-toast";

import api from "../../services/api";

const NoticeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH NOTICE
  // ==========================================

  const fetchNotice = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/notices/${id}`
      );

      setNotice(response.data.notice);
    } catch (error) {
      console.error(
        "Fetch Notice Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load notice"
      );

      navigate("/notices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotice();
  }, [id]);

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
        month: "long",
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
  // NOT FOUND
  // ==========================================

  if (!notice) {
    return null;
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <section className="bg-blue-600 px-4 py-10 text-white">

        <div className="mx-auto max-w-4xl">

          <button
            type="button"
            onClick={() =>
              navigate("/notices")
            }
            className="mb-6 flex items-center gap-2 text-sm font-semibold text-blue-100 transition hover:text-white"
          >
            <FaArrowLeft />
            Back to Notices
          </button>

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20 text-2xl">
              <FaBell />
            </div>

            <div>
              <p className="text-sm font-medium text-blue-100">
                Notice Details
              </p>

              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                {notice.title}
              </h1>
            </div>

          </div>

        </div>

      </section>

      {/* CONTENT */}

      <main className="mx-auto max-w-4xl px-4 py-8">

        <article className="overflow-hidden rounded-2xl bg-white shadow-sm">

          {/* NOTICE HEADER */}

          <div className="border-b border-slate-100 p-6 sm:p-8">

            <div className="mb-5 flex flex-wrap items-center gap-3">

              {notice.isPinned && (
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-sm font-semibold text-blue-700">
                  <FaThumbtack />
                  Pinned Notice
                </span>
              )}

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                {formatCategory(
                  notice.category
                )}
              </span>

              <span
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${getStatusStyle(
                  notice.status
                )}`}
              >
                {getStatusText(
                  notice.status
                )}
              </span>

            </div>

            <h2 className="text-2xl font-bold leading-9 text-slate-800 sm:text-3xl">
              {notice.title}
            </h2>

          </div>

          {/* DESCRIPTION */}

          <div className="p-6 sm:p-8">

            <div className="mb-8">

              <h3 className="mb-3 text-lg font-bold text-slate-800">
                Notice Details
              </h3>

              <div className="whitespace-pre-line text-base leading-8 text-slate-600">
                {notice.description}
              </div>

            </div>

            {/* DATES */}

            {(notice.startDate ||
              notice.lastDate) && (

              <div className="mb-8">

                <h3 className="mb-4 text-lg font-bold text-slate-800">
                  Important Dates
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">

                  {notice.startDate && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                        <FaCalendarAlt />
                        Start Date
                      </div>

                      <p className="text-lg font-bold text-slate-800">
                        {formatDate(
                          notice.startDate
                        )}
                      </p>

                    </div>
                  )}

                  {notice.lastDate && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                        <FaCalendarAlt />
                        Last Date
                      </div>

                      <p className="text-lg font-bold text-slate-800">
                        {formatDate(
                          notice.lastDate
                        )}
                      </p>

                    </div>
                  )}

                </div>

              </div>
            )}

            {/* REQUIRED DOCUMENTS */}

            {notice.requiredDocuments?.length >
              0 && (

              <div>

                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
                  <FaFileAlt />
                  Required Documents
                </h3>

                <div className="space-y-3">

                  {notice.requiredDocuments.map(
                    (document, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
                      >

                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                          {index + 1}
                        </span>

                        <span className="text-sm leading-6 text-slate-700">
                          {document}
                        </span>

                      </div>
                    )
                  )}

                </div>

              </div>
            )}

          </div>

          {/* FOOTER */}

          <div className="border-t border-slate-100 bg-slate-50 p-6">

            <button
              type="button"
              onClick={() =>
                navigate("/notices")
              }
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <FaArrowLeft />
              Back to All Notices
            </button>

          </div>

        </article>

      </main>

    </div>
  );
};

export default NoticeDetails;

