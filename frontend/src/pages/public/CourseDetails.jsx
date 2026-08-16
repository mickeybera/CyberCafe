
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaArrowRight,
  FaBook,
  FaClock,
  FaMoneyBillWave,
  FaCheckCircle,
  FaGraduationCap,
  FaInfoCircle,
} from "react-icons/fa";

import { toast } from "react-hot-toast";

import api from "../../services/api";

const CourseDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH COURSE
  // ==========================================

  const fetchCourse = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/courses/${id}`);

      setCourse(response.data.course);
    } catch (error) {
      console.error("Fetch Course Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load course"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
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
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">

          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading course details...
          </p>

        </div>
      </div>
    );
  }

  // ==========================================
  // COURSE NOT FOUND
  // ==========================================

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">

        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-3xl text-blue-600">
            <FaBook />
          </div>

          <h2 className="mt-6 text-2xl font-bold text-slate-800">
            Course Not Found
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            The course you are looking for may have been
            removed or is no longer available.
          </p>

          <button
            type="button"
            onClick={() => navigate("/courses")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <FaArrowLeft />
            Back to Courses
          </button>

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

      <section className="relative overflow-hidden bg-blue-600 text-white">

        {/* Decorative Background */}

        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />

        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/10" />

        <div className="absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">

          {/* BACK BUTTON */}

          <button
            type="button"
            onClick={() => navigate("/courses")}
            className="mb-8 inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <FaArrowLeft />
            Back to Courses
          </button>

          <div className="grid items-center gap-10 lg:grid-cols-[1fr_300px]">

            {/* COURSE INFO */}

            <div>

              <div className="mb-5 flex flex-wrap items-center gap-3">

                {/* CATEGORY */}

                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                  <FaBook />
                  {formatCategory(course.category)}
                </span>

                {/* ACTIVE STATUS */}

                {course.isActive !== false && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-green-400/20 px-4 py-2 text-sm font-semibold text-green-100">
                    <FaCheckCircle />
                    Currently Available
                  </span>
                )}

              </div>

              <h1 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
                {course.name}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
                Build your skills and improve your career
                opportunities with our professional training
                program.
              </p>

            </div>

            {/* COURSE ICON CARD */}

            <div className="hidden justify-center lg:flex">

              <div className="flex h-56 w-56 items-center justify-center rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-sm">

                <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-white text-6xl text-blue-600 shadow-xl">
                  <FaGraduationCap />
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ========================================
          MAIN CONTENT
      ======================================== */}

      <main className="mx-auto max-w-6xl px-4 py-10">

        <div className="grid gap-8 lg:grid-cols-[1fr_330px]">

          {/* ======================================
              LEFT CONTENT
          ====================================== */}

          <div className="space-y-8">

            {/* ====================================
                COURSE OVERVIEW
            ==================================== */}

            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FaInfoCircle />
                </div>

                <div>

                  <h2 className="text-xl font-bold text-slate-800">
                    Course Overview
                  </h2>

                  <p className="text-sm text-slate-500">
                    Everything you need to know about this course
                  </p>

                </div>

              </div>

              <div className="rounded-xl bg-slate-50 p-5">

                <p className="whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base">
                  {course.description ||
                    "No description is available for this course."}
                </p>

              </div>

            </section>

            {/* ====================================
                WHY THIS COURSE
            ==================================== */}

            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">

              <h2 className="text-xl font-bold text-slate-800">
                Why Choose This Course?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Start learning with a structured training
                program designed to improve your practical skills.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">

                {/* CARD 1 */}

                <div className="flex gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-blue-100 hover:bg-blue-50/30">

                  <FaCheckCircle className="mt-1 shrink-0 text-green-500" />

                  <div>

                    <h3 className="font-semibold text-slate-800">
                      Skill Development
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Develop useful skills through structured
                      training.
                    </p>

                  </div>

                </div>

                {/* CARD 2 */}

                <div className="flex gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-blue-100 hover:bg-blue-50/30">

                  <FaCheckCircle className="mt-1 shrink-0 text-green-500" />

                  <div>

                    <h3 className="font-semibold text-slate-800">
                      Practical Learning
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Focus on learning that can be applied in
                      real-world situations.
                    </p>

                  </div>

                </div>

                {/* CARD 3 */}

                <div className="flex gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-blue-100 hover:bg-blue-50/30">

                  <FaCheckCircle className="mt-1 shrink-0 text-green-500" />

                  <div>

                    <h3 className="font-semibold text-slate-800">
                      Affordable Training
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Access quality training at an affordable
                      course fee.
                    </p>

                  </div>

                </div>

                {/* CARD 4 */}

                <div className="flex gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-blue-100 hover:bg-blue-50/30">

                  <FaCheckCircle className="mt-1 shrink-0 text-green-500" />

                  <div>

                    <h3 className="font-semibold text-slate-800">
                      Career Support
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Gain skills that can help you move toward
                      better opportunities.
                    </p>

                  </div>

                </div>

              </div>

            </section>

          </div>

          {/* ======================================
              RIGHT SIDEBAR
          ====================================== */}

          <aside className="lg:sticky lg:top-6 lg:self-start">

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">

              {/* SIDEBAR HEADER */}

              <div className="bg-slate-900 px-5 py-5 text-white">

                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Course Information
                </p>

                <h2 className="mt-1 line-clamp-2 text-lg font-bold">
                  {course.name}
                </h2>

              </div>

              {/* INFORMATION */}

              <div className="divide-y divide-slate-100">

                {/* CATEGORY */}

                <div className="flex items-center gap-3 px-5 py-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FaBook />
                  </div>

                  <div>

                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Category
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-slate-800">
                      {formatCategory(course.category)}
                    </p>

                  </div>

                </div>

                {/* DURATION */}

                <div className="flex items-center gap-3 px-5 py-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <FaClock />
                  </div>

                  <div>

                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Duration
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-slate-800">
                      {course.duration}
                    </p>

                  </div>

                </div>

                {/* FEE */}

                <div className="flex items-center gap-3 px-5 py-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                    <FaMoneyBillWave />
                  </div>

                  <div>

                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Course Fee
                    </p>

                    <p className="mt-0.5 text-xl font-extrabold text-slate-800">
                      ₹
                      {Number(
                        course.fee || 0
                      ).toLocaleString("en-IN")}
                    </p>

                  </div>

                </div>

              </div>

              {/* CONTACT CTA */}

              <div className="border-t border-slate-100 bg-slate-50 p-5">

                <div className="mb-4 text-center">

                  <p className="text-sm font-semibold text-slate-800">
                    Interested in this course?
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Contact us for admission, timings,
                    syllabus, availability or any other details.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => navigate("/contact")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                >
                  Contact Us
                  <FaArrowRight />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/courses")}
                  className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <FaArrowLeft />
                  Browse Other Courses
                </button>

              </div>

            </div>

          </aside>

        </div>

      </main>

    </div>
  );
};

export default CourseDetails;

