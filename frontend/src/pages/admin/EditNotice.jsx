
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaBullhorn,
  FaSave,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

import { toast } from "react-hot-toast";

import api from "../../services/api";

const EditNotice = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "general",
    startDate: "",
    lastDate: "",
    status: "open",
    isPinned: false,
    isPublished: true,
  });

  const [requiredDocuments, setRequiredDocuments] =
    useState([""]);

  // ==========================================
  // FETCH NOTICE
  // ==========================================

  const fetchNotice = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/notices/${id}`
      );

      const notice = response.data.notice;

      if (!notice) {
        toast.error("Notice not found");
        navigate("/admin/notices");
        return;
      }

      setFormData({
        title: notice.title || "",
        description: notice.description || "",
        category: notice.category || "general",
        startDate: notice.startDate
          ? new Date(notice.startDate)
              .toISOString()
              .split("T")[0]
          : "",
        lastDate: notice.lastDate
          ? new Date(notice.lastDate)
              .toISOString()
              .split("T")[0]
          : "",
        status: notice.status || "open",
        isPinned: notice.isPinned ?? false,
        isPublished:
          notice.isPublished ?? true,
      });

      setRequiredDocuments(
        notice.requiredDocuments?.length
          ? notice.requiredDocuments
          : [""]
      );
    } catch (error) {
      console.error(
        "Fetch Notice Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load notice"
      );

      navigate("/admin/notices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchNotice();
    }
  }, [id]);

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ==========================================
  // REQUIRED DOCUMENTS
  // ==========================================

  const handleDocumentChange = (index, value) => {
    setRequiredDocuments((previous) => {
      const updated = [...previous];
      updated[index] = value;
      return updated;
    });
  };

  const addDocument = () => {
    setRequiredDocuments((previous) => [
      ...previous,
      "",
    ]);
  };

  const removeDocument = (index) => {
    setRequiredDocuments((previous) =>
      previous.filter(
        (_, documentIndex) =>
          documentIndex !== index
      )
    );
  };

  // ==========================================
  // UPDATE NOTICE
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter notice title");
      return;
    }

    if (!formData.description.trim()) {
      toast.error(
        "Please enter notice description"
      );
      return;
    }

    if (
      formData.startDate &&
      formData.lastDate &&
      formData.lastDate < formData.startDate
    ) {
      toast.error(
        "Last date cannot be before start date"
      );
      return;
    }

    try {
      setSubmitting(true);

      const documents = requiredDocuments
        .map((document) => document.trim())
        .filter(Boolean);

      const response = await api.put(
        `/notices/${id}`,
        {
          title: formData.title.trim(),
          description:
            formData.description.trim(),
          category: formData.category,
          startDate:
            formData.startDate || undefined,
          lastDate:
            formData.lastDate || undefined,
          requiredDocuments: documents,
          status: formData.status,
          isPinned: formData.isPinned,
          isPublished: formData.isPublished,
        }
      );

      toast.success(
        response.data.message ||
          "Notice updated successfully"
      );

      navigate("/admin/notices");
    } catch (error) {
      console.error(
        "Update Notice Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update notice"
      );
    } finally {
      setSubmitting(false);
    }
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
    <div className="mx-auto max-w-4xl">

      {/* HEADER */}

      <div className="mb-6">

        <button
          type="button"
          onClick={() =>
            navigate("/admin/notices")
          }
          className="mb-4 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <FaArrowLeft />
          Back to Notices
        </button>

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <FaBullhorn />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Edit Notice
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Update notice information
            </p>
          </div>

        </div>

      </div>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-white p-6 shadow-sm"
      >

        {/* TITLE */}

        <div className="mb-5">

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Notice Title
            <span className="text-red-500"> *</span>
          </label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter notice title"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

        </div>

        {/* DESCRIPTION */}

        <div className="mb-5">

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Description
            <span className="text-red-500"> *</span>
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter notice description"
            rows={6}
            required
            className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

        </div>

        {/* CATEGORY + STATUS */}

        <div className="mb-5 grid gap-5 md:grid-cols-2">

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Category
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="general">
                General
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
            </select>

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
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

          </div>

        </div>

        {/* DATES */}

        <div className="mb-6 grid gap-5 md:grid-cols-2">

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Start Date
            </label>

            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Last Date
            </label>

            <input
              type="date"
              name="lastDate"
              value={formData.lastDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </div>

        </div>

        {/* REQUIRED DOCUMENTS */}

        <div className="mb-6">

          <div className="mb-3 flex items-center justify-between">

            <label className="block text-sm font-medium text-slate-700">
              Required Documents
            </label>

            <button
              type="button"
              onClick={addDocument}
              className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100"
            >
              <FaPlus />
              Add Document
            </button>

          </div>

          <div className="space-y-3">

            {requiredDocuments.map(
              (document, index) => (
                <div
                  key={index}
                  className="flex gap-2"
                >

                  <input
                    type="text"
                    value={document}
                    onChange={(e) =>
                      handleDocumentChange(
                        index,
                        e.target.value
                      )
                    }
                    placeholder={`Document ${
                      index + 1
                    }`}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  {requiredDocuments.length >
                    1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeDocument(index)
                      }
                      className="rounded-lg bg-red-50 px-4 text-red-600 hover:bg-red-100"
                    >
                      <FaTrash />
                    </button>
                  )}

                </div>
              )
            )}

          </div>

        </div>

        {/* SETTINGS */}

        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-5">

          <h3 className="mb-4 font-semibold text-slate-800">
            Notice Settings
          </h3>

          <div className="space-y-4">

            <label className="flex cursor-pointer items-center gap-3">

              <input
                type="checkbox"
                name="isPinned"
                checked={formData.isPinned}
                onChange={handleChange}
                className="h-4 w-4 accent-blue-600"
              />

              <div>
                <p className="font-medium text-slate-700">
                  Pin this notice
                </p>

                <p className="text-xs text-slate-500">
                  Keep this notice at the top.
                </p>
              </div>

            </label>

            <label className="flex cursor-pointer items-center gap-3">

              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="h-4 w-4 accent-blue-600"
              />

              <div>
                <p className="font-medium text-slate-700">
                  Publish notice
                </p>

                <p className="text-xs text-slate-500">
                  Published notices are visible to
                  users.
                </p>
              </div>

            </label>

          </div>

        </div>

        {/* BUTTONS */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={() =>
              navigate("/admin/notices")
            }
            className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Updating...
              </>
            ) : (
              <>
                <FaSave />
                Update Notice
              </>
            )}
          </button>

        </div>

      </form>
    </div>
  );
};

export default EditNotice;

