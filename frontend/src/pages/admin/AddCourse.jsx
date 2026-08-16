
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaBook,
  FaSave,
} from "react-icons/fa";

import { toast } from "react-hot-toast";

import api from "../../services/api";

const AddCourse = () => {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    duration: "",
    fee: "",
    description: "",
  });

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!formData.name.trim()) {
      toast.error("Please enter course name");
      return;
    }

    if (!formData.category) {
      toast.error("Please select course category");
      return;
    }

    if (!formData.duration.trim()) {
      toast.error("Please enter course duration");
      return;
    }

    if (formData.fee === "") {
      toast.error("Please enter course fee");
      return;
    }

    const fee = Number(formData.fee);

    if (Number.isNaN(fee) || fee < 0) {
      toast.error("Please enter a valid course fee");
      return;
    }

    try {
      setSubmitting(true);

      // ==========================================
      // REQUEST DATA
      // ==========================================

      const data = {
        name: formData.name.trim(),
        category: formData.category,
        duration: formData.duration.trim(),
        fee,
        description:
          formData.description.trim() || undefined,
      };

      // ==========================================
      // API
      // ==========================================

      const response = await api.post(
        "/courses",
        data
      );

      toast.success(
        response.data.message ||
          "Course created successfully"
      );

      // ==========================================
      // REDIRECT
      // ==========================================

      navigate("/admin/courses");

    } catch (error) {
      console.error(
        "Create Course Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to create course"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="mx-auto max-w-3xl">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="mb-6">

        <button
          type="button"
          onClick={() =>
            navigate("/admin/courses")
          }
          className="mb-4 flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-700"
        >
          <FaArrowLeft />
          Back to Courses
        </button>

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <FaBook />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Add Course
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create a new training course
            </p>
          </div>

        </div>

      </div>

      {/* ========================================
          FORM
      ======================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* ======================================
            COURSE INFORMATION
        ====================================== */}

        <div className="rounded-xl bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-lg font-bold text-slate-800">
            Course Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">

            {/* COURSE NAME */}

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Course Name
                <span className="text-red-500">
                  {" "}*
                </span>
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Example: Basic Computer Course"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* CATEGORY */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Category
                <span className="text-red-500">
                  {" "}*
                </span>
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >

                <option value="">
                  Select category
                </option>

                <option value="computer">
                  Computer
                </option>

                <option value="tailoring">
                  Tailoring
                </option>

              </select>

            </div>

            {/* DURATION */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Duration
                <span className="text-red-500">
                  {" "}*
                </span>
              </label>

              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="Example: 6 Months"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* FEE */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Course Fee
                <span className="text-red-500">
                  {" "}*
                </span>
              </label>

              <div className="relative">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  ₹
                </span>

                <input
                  type="number"
                  name="fee"
                  value={formData.fee}
                  onChange={handleChange}
                  placeholder="Enter course fee"
                  min="0"
                  required
                  className="w-full rounded-lg border border-slate-300 py-3 pl-9 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>

            {/* DESCRIPTION */}

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter a short description of the course"
                rows="5"
                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-2 text-xs text-slate-400">
                Optional. Describe what students
                will learn in this course.
              </p>

            </div>

          </div>

        </div>

        {/* ========================================
            BUTTONS
        ======================================== */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={() =>
              navigate("/admin/courses")
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
                Creating...
              </>
            ) : (
              <>
                <FaSave />
                Create Course
              </>
            )}

          </button>

        </div>

      </form>

    </div>
  );
};

export default AddCourse;

