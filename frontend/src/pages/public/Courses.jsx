
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaSearch,
  FaBook,
  FaClock,
  FaMoneyBillWave,
  FaArrowRight,
  FaFilter,
  FaGraduationCap,
  FaLaptop,
  FaCut,
  FaCheckCircle,
  FaStar,
} from "react-icons/fa";

import { toast } from "react-hot-toast";

import api from "../../services/api";

const Courses = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  // ==========================================
  // FETCH PUBLIC COURSES
  // ==========================================

  const fetchCourses = async () => {
    try {
      setLoading(true);

      const response = await api.get("/courses");

      const courseList = response.data.courses || [];

      // Only active courses are visible publicly
      const activeCourses = courseList.filter(
        (course) => course.isActive !== false
      );

      setCourses(activeCourses);
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
  // CATEGORY ICON
  // ==========================================

  const getCategoryIcon = (category) => {
    if (category === "computer") {
      return <FaLaptop />;
    }

    if (category === "tailoring") {
      return <FaCut />;
    }

    return <FaBook />;
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

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [courses, search, category]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">

          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

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
    <div className="min-h-screen bg-slate-50">

      {/* ========================================
          HERO
      ======================================== */}

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-4 py-16 text-white sm:py-20">

        {/* Decorative circles */}

        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />

        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">

          <div className="grid items-center gap-10 lg:grid-cols-2">

            {/* LEFT */}

            <div>

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">

                <FaGraduationCap />

                Learn. Grow. Succeed.

              </div>

              <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">

                Build Your Future
                <span className="block text-blue-200">
                  With the Right Skills
                </span>

              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-blue-100 sm:text-lg">

                Explore our practical training programs
                designed to help you develop valuable
                skills and prepare for better
                opportunities.

              </p>

              <div className="mt-7 flex flex-wrap gap-3">

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("course-list")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      })
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 font-semibold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
                >
                  Explore Courses
                  <FaArrowRight />
                </button>

                <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 py-3 text-sm backdrop-blur-sm">

                  <FaCheckCircle className="text-blue-200" />

                  Professional Training

                </div>

              </div>

            </div>

            {/* RIGHT HERO CARD */}

            <div className="hidden lg:block">

              <div className="relative mx-auto max-w-md">

                <div className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md">

                  <div className="mb-6 flex items-center justify-between">

                    <div>

                      <p className="text-sm text-blue-100">
                        Available Programs
                      </p>

                      <p className="mt-1 text-4xl font-bold">
                        {courses.length}
                      </p>

                    </div>

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xl text-blue-600 shadow-lg">
                      <FaBook />
                    </div>

                  </div>

                  <div className="space-y-3">

                    <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
                        <FaLaptop />
                      </div>

                      <div>
                        <p className="font-semibold">
                          Computer Training
                        </p>

                        <p className="text-xs text-blue-100">
                          Practical digital skills
                        </p>
                      </div>

                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
                        <FaCut />
                      </div>

                      <div>
                        <p className="font-semibold">
                          Tailoring Training
                        </p>

                        <p className="text-xs text-blue-100">
                          Learn practical skills
                        </p>
                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ========================================
          STATS
      ======================================== */}

      <section className="relative z-10 -mt-7 px-4">

        <div className="mx-auto max-w-6xl">

          <div className="grid overflow-hidden rounded-2xl bg-white shadow-xl sm:grid-cols-3">

            <div className="border-b border-slate-100 p-5 text-center sm:border-b-0 sm:border-r">

              <p className="text-2xl font-bold text-blue-600">
                {courses.length}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Active Courses
              </p>

            </div>

            <div className="border-b border-slate-100 p-5 text-center sm:border-b-0 sm:border-r">

              <p className="text-2xl font-bold text-green-600">
                {courses.filter(
                  (course) =>
                    course.category === "computer"
                ).length}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Computer Courses
              </p>

            </div>

            <div className="p-5 text-center">

              <p className="text-2xl font-bold text-indigo-600">
                {courses.filter(
                  (course) =>
                    course.category === "tailoring"
                ).length}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Tailoring Courses
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ========================================
          COURSE SECTION
      ======================================== */}

      <main
        id="course-list"
        className="mx-auto max-w-6xl px-4 py-14"
      >

        {/* SECTION HEADER */}

        <div className="mb-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">

                <FaStar />

                Our Training Programs

              </div>

              <h2 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                Choose Your Course
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Find a course that matches your interests
                and start developing skills for your future.
              </p>

            </div>

            <p className="text-sm text-slate-500">

              Showing{" "}

              <span className="font-bold text-slate-800">
                {filteredCourses.length}
              </span>{" "}

              courses

            </p>

          </div>

        </div>

        {/* ========================================
            FILTER BOX
        ======================================== */}

        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <FaFilter />
            </div>

            Find the right course

          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_280px]">

            {/* SEARCH */}

            <div className="relative">

              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search by course name..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

            </div>

            {/* CATEGORY */}

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
              We couldn't find a course matching your
              search. Try another keyword or category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Clear Filters
            </button>

          </div>

        ) : (

          /* ======================================
             COURSE GRID
          ====================================== */

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {filteredCourses.map((course) => (

              <article
                key={course._id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl"
              >

                {/* TOP ACCENT */}

                <div className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-500" />

                {/* CARD HEADER */}

                <div className="p-6">

                  <div className="mb-5 flex items-start justify-between">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-xl text-blue-600 transition duration-300 group-hover:scale-110">

                      {getCategoryIcon(
                        course.category
                      )}

                    </div>

                    <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">

                      {formatCategory(
                        course.category
                      )}

                    </span>

                  </div>

                  {/* COURSE NAME */}

                  <h3 className="min-h-[56px] text-xl font-bold leading-7 text-slate-800 transition group-hover:text-blue-600">

                    {course.name}

                  </h3>

                  {/* DESCRIPTION */}

                  {course.description ? (

                    <p className="mt-3 line-clamp-3 min-h-[72px] text-sm leading-6 text-slate-500">

                      {course.description}

                    </p>

                  ) : (

                    <p className="mt-3 min-h-[72px] text-sm italic text-slate-400">
                      Practical training designed to
                      build valuable skills.
                    </p>

                  )}

                  {/* COURSE DETAILS */}

                  <div className="mt-6 grid grid-cols-2 gap-3">

                    {/* DURATION */}

                    <div className="rounded-xl bg-slate-50 p-3">

                      <div className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-500">

                        <FaClock className="text-blue-500" />

                        Duration

                      </div>

                      <p className="text-sm font-bold text-slate-700">

                        {course.duration}

                      </p>

                    </div>

                    {/* FEE */}

                    <div className="rounded-xl bg-slate-50 p-3">

                      <div className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-500">

                        <FaMoneyBillWave className="text-green-500" />

                        Course Fee

                      </div>

                      <p className="text-sm font-bold text-slate-700">

                        ₹
                        {Number(
                          course.fee || 0
                        ).toLocaleString("en-IN")}

                      </p>

                    </div>

                  </div>

                </div>

                {/* FOOTER */}

                <div className="border-t border-slate-100 bg-slate-50 p-4">

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/courses/${course._id}`
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                  >

                    View Course Details

                    <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />

                  </button>

                </div>

              </article>

            ))}

          </div>

        )}

      </main>

      {/* ========================================
          BOTTOM CTA
      ======================================== */}

      {courses.length > 0 && (

        <section className="px-4 pb-16">

          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-12 text-center text-white shadow-xl sm:px-10">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl">

              <FaGraduationCap />

            </div>

            <h2 className="mt-5 text-2xl font-bold sm:text-3xl">
              Ready to Learn Something New?
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">

              Explore our courses and choose the program
              that can help you take the next step toward
              your goals.

            </p>

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("course-list")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
              className="mt-6 rounded-lg bg-white px-6 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
            >
              Explore Courses
            </button>

          </div>

        </section>

      )}

    </div>
  );
};

export default Courses;

