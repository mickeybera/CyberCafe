
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

      toast.success(
        "Course deleted successfully"
      );
    } catch (error) {
      console.error(
        "Delete Course Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete course"
      );
    } finally {
      setDeletingId(null);
    }
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
            <FaBook />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Courses
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your training courses
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/courses/add")
          }
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <FaPlus />
          Add Course
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

        <div className="grid gap-4 md:grid-cols-3">

          {/* SEARCH */}

          <div className="relative">

            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search course..."
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
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
          COURSE COUNT
      ======================================== */}

      <div className="mb-4 flex items-center justify-between">

        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {filteredCourses.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-700">
            {courses.length}
          </span>{" "}
          courses
        </p>

      </div>

      {/* ========================================
          EMPTY STATE
      ======================================== */}

      {filteredCourses.length === 0 ? (
        <div className="rounded-xl bg-white px-6 py-16 text-center shadow-sm">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
            <FaBook />
          </div>

          <h2 className="text-lg font-bold text-slate-800">
            No courses found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {courses.length === 0
              ? "You haven't added any courses yet."
              : "Try changing your search or filters."}
          </p>

          {courses.length === 0 && (
            <button
              type="button"
              onClick={() =>
                navigate("/admin/courses/add")
              }
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
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

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {filteredCourses.map((course) => (

            <div
              key={course._id}
              className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
            >

              {/* CARD HEADER */}

              <div className="border-b border-slate-100 p-5">

                <div className="flex items-start justify-between gap-3">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <FaBook />
                    </div>

                    <div className="min-w-0">

                      <h2 className="truncate text-lg font-bold text-slate-800">
                        {course.name}
                      </h2>

                      <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                        {course.category}
                      </span>

                    </div>

                  </div>

                  {/* STATUS */}

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      course.isActive !== false
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {course.isActive !== false
                      ? "Active"
                      : "Inactive"}
                  </span>

                </div>

              </div>

              {/* CARD BODY */}

              <div className="space-y-4 p-5">

                {/* DURATION */}

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <FaClock className="text-blue-500" />
                    Duration
                  </div>

                  <span className="font-semibold text-slate-700">
                    {course.duration}
                  </span>

                </div>

                {/* FEE */}

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <FaMoneyBillWave className="text-green-500" />
                    Course Fee
                  </div>

                  <span className="text-lg font-bold text-slate-800">
                    ₹
                    {Number(
                      course.fee || 0
                    ).toLocaleString("en-IN")}
                  </span>

                </div>

                {/* DESCRIPTION */}

                {course.description && (
                  <p className="line-clamp-2 text-sm leading-6 text-slate-500">
                    {course.description}
                  </p>
                )}

              </div>

              {/* CARD FOOTER */}

              <div className="flex gap-3 border-t border-slate-100 bg-slate-50 p-4">

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/admin/courses/${course._id}`
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
                    handleDelete(course)
                  }
                  disabled={
                    deletingId === course._id
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingId === course._id ? (
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

export default Course;

