
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaBook,
  FaClock,
  FaMoneyBillWave,
  FaFilter,
  FaArrowRight,
  FaGraduationCap,
} from "react-icons/fa";

import { toast } from "react-hot-toast";

import api from "../../services/api";

const Course = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  // ==========================================
  // FETCH COURSES
  // ==========================================

  const fetchCourses = async () => {
    try {
      setLoading(true);

      const response = await api.get("/courses");

      setCourses(response.data.courses || []);
    } catch (error) {
      console.error("Fetch Courses Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load courses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // ==========================================
  // DELETE COURSE
  // ==========================================

  const handleDelete = async (course) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${course.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(course._id);

      await api.delete(`/courses/${course._id}`);

      setCourses((previous) =>
        previous.filter(
          (item) => item._id !== course._id
        )
      );

      toast.success("Course deleted successfully");
    } catch (error) {
      console.error("Delete Course Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to delete course"
      );
    } finally {
      setDeletingId(null);
    }
  };

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
  // FILTER COURSES
  // ==========================================

  const filteredCourses = useMemo(() => {
    const searchText = search
      .trim()
      .toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        !searchText ||
        course.name
          ?.toLowerCase()
          .includes(searchText) ||
        course.description
          ?.toLowerCase()
          .includes(searchText);

      const matchesCategory =
        category === "all" ||
        course.category === category;

      const matchesStatus =
        status === "all" ||
        (status === "active" &&
          course.isActive !== false) ||
        (status === "inactive" &&
          course.isActive === false);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    courses,
    search,
    category,
    status,
  ]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading courses...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50/70 px-3 py-5 sm:px-5 lg:px-7">

      <div className="mx-auto max-w-7xl">

        {/* ========================================
            HEADER
        ======================================== */}

        <div className="mb-7 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600 ring-1 ring-blue-100">
                <FaGraduationCap />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                    Courses
                  </h1>

                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
                    {courses.length}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your training programs and course details.
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/courses/add")
              }
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
            >
              <FaPlus className="text-xs" />
              Add New Course

              <FaArrowRight className="text-xs transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>

          </div>

        </div>

        {/* ========================================
            FILTER PANEL
        ======================================== */}

        <div className="mb-7 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-600">
                <FaFilter />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Find Courses
                </h2>

                <p className="text-xs text-slate-400">
                  Search and filter your courses
                </p>
              </div>

            </div>

            {(search ||
              category !== "all" ||
              status !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                  setStatus("all");
                }}
                className="text-left text-xs font-semibold text-blue-600 hover:text-blue-700 sm:text-right"
              >
                Clear filters
              </button>
            )}

          </div>

          <div className="grid gap-4 md:grid-cols-3">

            {/* SEARCH */}

            <div className="relative md:col-span-1">

              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search course name..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />

            </div>

            {/* CATEGORY */}

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            >
              <option value="all">
                All Categories
              </option>

              <option value="computer">
                Computer
              </option>

              <option value="tailoring">
                Tailoring
              </option>
            </select>

            {/* STATUS */}

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            >
              <option value="all">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

          </div>

        </div>

        {/* ========================================
            RESULT INFORMATION
        ======================================== */}

        <div className="mb-5 flex items-center justify-between px-1">

          <div>
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-800">
                {filteredCourses.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {courses.length}
              </span>{" "}
              courses
            </p>
          </div>

        </div>

        {/* ========================================
            EMPTY STATE
        ======================================== */}

        {filteredCourses.length === 0 ? (

          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">

            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-3xl text-slate-400">
              <FaBook />
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              No courses found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {courses.length === 0
                ? "You haven't added any courses yet. Create your first course to get started."
                : "No courses match your current search or filters. Try adjusting them."}
            </p>

            {courses.length === 0 && (
              <button
                type="button"
                onClick={() =>
                  navigate("/admin/courses/add")
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <FaPlus />
                Add Your First Course
              </button>
            )}

          </div>

        ) : (

          /* ======================================
             COURSE GRID
          ====================================== */

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

            {filteredCourses.map((course) => (

              <div
                key={course._id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-slate-200/60"
              >

                {/* TOP ACCENT */}

                <div
                  className={`h-1.5 w-full ${
                    course.isActive !== false
                      ? "bg-blue-600"
                      : "bg-slate-300"
                  }`}
                />

                {/* =================================
                    CARD HEADER
                ================================= */}

                <div className="p-5 pb-4">

                  <div className="flex items-start justify-between gap-3">

                    <div className="flex min-w-0 items-start gap-3">

                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                          course.category === "tailoring"
                            ? "bg-pink-50 text-pink-600"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        <FaBook />
                      </div>

                      <div className="min-w-0">

                        <h2 className="truncate text-lg font-bold text-slate-800">
                          {course.name}
                        </h2>

                        <div className="mt-1.5 flex flex-wrap items-center gap-2">

                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                              course.category === "tailoring"
                                ? "bg-pink-50 text-pink-600"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            {formatCategory(
                              course.category
                            )}
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* STATUS */}

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        course.isActive !== false
                          ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                          : "bg-red-50 text-red-600 ring-1 ring-red-100"
                      }`}
                    >
                      {course.isActive !== false
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </div>

                </div>

                {/* =================================
                    CARD BODY
                ================================= */}

                <div className="px-5 pb-5">

                  {/* INFO BOX */}

                  <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/70">

                    {/* DURATION */}

                    <div className="border-r border-slate-200/70 p-4">

                      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                        <FaClock className="text-blue-500" />
                        Duration
                      </div>

                      <p className="truncate text-sm font-bold text-slate-700">
                        {course.duration || "Not specified"}
                      </p>

                    </div>

                    {/* FEE */}

                    <div className="p-4">

                      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                        <FaMoneyBillWave className="text-emerald-500" />
                        Course Fee
                      </div>

                      <p className="truncate text-sm font-bold text-slate-800">
                        ₹
                        {Number(
                          course.fee || 0
                        ).toLocaleString("en-IN")}
                      </p>

                    </div>

                  </div>

                  {/* DESCRIPTION */}

                  <div className="mt-4 min-h-[50px]">

                    {course.description ? (
                      <p className="line-clamp-2 text-sm leading-6 text-slate-500">
                        {course.description}
                      </p>
                    ) : (
                      <p className="text-sm italic text-slate-400">
                        No course description available.
                      </p>
                    )}

                  </div>

                </div>

                {/* =================================
                    CARD FOOTER
                ================================= */}

                <div className="flex gap-3 border-t border-slate-100 bg-slate-50/60 p-4">

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/admin/courses/${course._id}`
                      )
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <FaEdit className="text-xs" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(course)
                    }
                    disabled={
                      deletingId === course._id
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === course._id ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                    ) : (
                      <FaTrash className="text-xs" />
                    )}

                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
};

export default Course;

