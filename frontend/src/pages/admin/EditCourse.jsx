
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaBook,
  FaSave,
} from "react-icons/fa";

import { toast } from "react-hot-toast";

import api from "../../services/api";

const EditCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    duration: "",
    fee: "",
    description: "",
    isActive: true,
  });

  // ==========================================
  // FETCH COURSE
  // ==========================================

  const fetchCourse = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/courses/${id}`
      );

      const course = response.data.course;

      if (!course) {
        toast.error("Course not found");
        navigate("/admin/courses");
        return;
      }

      setFormData({
        name: course.name || "",
        category: course.category || "",
        duration: course.duration || "",
        fee:
          course.fee !== undefined
            ? String(course.fee)
            : "",
        description: course.description || "",
        isActive: course.isActive !== false,
      });
    } catch (error) {
      console.error(
        "Fetch Course Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load course"
      );

      navigate("/admin/courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id]);

  // ==========================================
  // HANDLE CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value, type, checked } =
      e.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
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
      toast.error(
        "Please select course category"
      );
      return;
    }

    if (!formData.duration.trim()) {
      toast.error(
        "Please enter course duration"
      );
      return;
    }

    if (formData.fee === "") {
      toast.error("Please enter course fee");
      return;
    }

    const fee = Number(formData.fee);

    if (Number.isNaN(fee) || fee < 0) {
      toast.error(
        "Please enter a valid course fee"
      );
      return;
    }

    try {
      setSubmitting(true);

      const data = {
        name: formData.name.trim(),
        category: formData.category,
        duration: formData.duration.trim(),
        fee,
        description:
          formData.description.trim() ||
          undefined,
        isActive: formData.isActive,
      };

      const response = await api.put(
        `/courses/${id}`,
        data
      );

      toast.success(
        response.data.message ||
          "Course updated successfully"
      );

      navigate("/admin/courses");
    } catch (error) {
      console.error(
        "Update Course Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update course"
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
              Edit Course
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Update course information
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

            </div>

            {/* ACTIVE STATUS */}

            <div className="md:col-span-2">

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

                <label className="flex cursor-pointer items-center justify-between gap-4">

                  <div>

                    <p className="font-semibold text-slate-800">
                      Course Status
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Inactive courses will not appear
                      as available courses when adding
                      new students.
                    </p>

                  </div>

                  <div className="flex items-center gap-3">

                    <span
                      className={`text-sm font-semibold ${
                        formData.isActive
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formData.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>

                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="h-5 w-5 cursor-pointer accent-blue-600"
                    />

                  </div>

                </label>

              </div>

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
                Updating...
              </>
            ) : (
              <>
                <FaSave />
                Update Course
              </>
            )}

          </button>

        </div>

      </form>

    </div>
  );
};

export default EditCourse;

