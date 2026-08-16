import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaSave,
  FaUserGraduate,
  FaMoneyBillWave,
} from "react-icons/fa";

import { toast } from "react-hot-toast";

import api from "../../services/api";

const AddStudent = () => {
  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================

  const [courses, setCourses] = useState([]);

  const [loadingCourses, setLoadingCourses] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    dateOfBirth: "",
    gender: "",

    course: "",

    admissionDate: "",
    courseStartDate: "",
    courseEndDate: "",

    totalFee: "",
    totalPaid: "",

    paymentMethod: "cash",
    paymentDate: "",
    paymentNote: "",
  });

  // ==========================================
  // FETCH COURSES
  // ==========================================

    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);

        const response =
          await api.get("/courses");
  console.log("COURSE API RESPONSE:", response.data);
        setCourses(
          response.data.courses || []
        );
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data?.message ||
            "Failed to load courses"
        );
      } finally {
        setLoadingCourses(false);
      }
    };
  // const fetchCourses = async () => {
  //   try {
  //     setLoadingCourses(true);

  //     const response = await api.get("/courses");

  //     console.log("COURSES API RESPONSE:", response.data);
  //     console.log("COURSES:", response.data.courses);

  //     setCourses(response.data.courses || []);
  //   } catch (error) {
  //     console.error("COURSES API ERROR:", error);
  //     console.error("STATUS:", error.response?.status);
  //     console.error("DATA:", error.response?.data);

  //     toast.error(error.response?.data?.message || "Failed to load courses");
  //   } finally {
  //     setLoadingCourses(false);
  //   }
  // };

  useEffect(() => {
    fetchCourses();
  }, []);

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
  // COURSE CHANGE
  // ==========================================

  const handleCourseChange = (e) => {
    const courseId = e.target.value;

    const selectedCourse = courses.find((course) => course._id === courseId);

    setFormData((previous) => ({
      ...previous,

      course: courseId,

      totalFee: selectedCourse?.fee ?? "",
    }));
  };

  // ==========================================
  // FEE CALCULATION
  // ==========================================

  const totalFee = Number(formData.totalFee) || 0;

  const totalPaid = Number(formData.totalPaid) || 0;

  const remainingFee = totalFee - totalPaid;

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ==========================================
    // REQUIRED VALIDATION
    // ==========================================

    if (
      !formData.name.trim() ||
      !formData.mobile.trim() ||
      !formData.course ||
      formData.totalFee === ""
    ) {
      toast.error("Please fill all required fields");

      return;
    }

    // ==========================================
    // MOBILE VALIDATION
    // ==========================================

    if (!/^[0-9]{10}$/.test(formData.mobile.trim())) {
      toast.error("Please enter a valid 10-digit mobile number");

      return;
    }

    // ==========================================
    // PAYMENT VALIDATION
    // ==========================================

    if (totalPaid < 0) {
      toast.error("Paid amount cannot be negative");

      return;
    }

    if (totalPaid > totalFee) {
      toast.error("Paid amount cannot be greater than total fee");

      return;
    }

    // Payment method is required
    // only when money is being paid
    if (totalPaid > 0 && !formData.paymentMethod) {
      toast.error("Please select payment method");

      return;
    }

    try {
      setSubmitting(true);

      // ==========================================
      // REQUEST DATA
      // ==========================================

      const data = {
        name: formData.name.trim(),

        mobile: formData.mobile.trim(),

        email: formData.email.trim() || undefined,

        address: formData.address.trim() || undefined,

        dateOfBirth: formData.dateOfBirth || undefined,

        gender: formData.gender || undefined,

        course: formData.course,

        admissionDate: formData.admissionDate || undefined,

        courseStartDate: formData.courseStartDate || undefined,

        courseEndDate: formData.courseEndDate || undefined,

        totalFee,

        totalPaid,

        // ========================================
        // PAYMENT INFORMATION
        // ========================================

        paymentMethod: totalPaid > 0 ? formData.paymentMethod : undefined,

        paymentDate:
          totalPaid > 0 && formData.paymentDate
            ? formData.paymentDate
            : undefined,

        paymentNote:
          totalPaid > 0 && formData.paymentNote.trim()
            ? formData.paymentNote.trim()
            : undefined,
      };

      // ==========================================
      // API
      // ==========================================

      await api.post("/students", data);

      toast.success("Student registered successfully");

      // ==========================================
      // REDIRECT
      // ==========================================

      navigate("/admin/students");
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Failed to register student",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loadingCourses) {
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
    <div className="mx-auto max-w-5xl">
      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/students")}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <FaArrowLeft />
          Back to Students
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <FaUserGraduate />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-800">Add Student</h1>

            <p className="mt-1 text-sm text-slate-500">
              Register a new student
            </p>
          </div>
        </div>
      </div>

      {/* ==========================================
          FORM
      ========================================== */}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ==========================================
            PERSONAL INFORMATION
        ========================================== */}

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-slate-800">
            Personal Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            {/* NAME */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Full Name
                <span className="text-red-500"> *</span>
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter student name"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* MOBILE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Mobile Number
                <span className="text-red-500"> *</span>
              </label>

              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength="10"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* EMAIL */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@example.com"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* DOB */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Date of Birth
              </label>

              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* GENDER */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Gender
              </label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select gender</option>

                <option value="male">Male</option>

                <option value="female">Female</option>

                <option value="other">Other</option>
              </select>
            </div>

            {/* ADDRESS */}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Address
              </label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter complete address"
                rows="3"
                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* ==========================================
            COURSE INFORMATION
        ========================================== */}

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-slate-800">
            Course Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            {/* COURSE */}

            {/* <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Select Course
                <span className="text-red-500">
                  {" "}*
                </span>
              </label>

              <select
                name="course"
                value={formData.course}
                onChange={handleCourseChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >

                <option value="">
                  Select a course
                </option>

                {courses
                  .filter(
                    (course) =>
                      course.isActive !== false
                  )
                  .map((course) => (
                    <option
                      key={course._id}
                      value={course._id}
                    >
                      {course.name} —{" "}
                      {course.category} — ₹
                      {course.fee?.toLocaleString(
                        "en-IN"
                      )}
                    </option>
                  ))}
              </select>

            </div> */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Select Course
                <span className="text-red-500"> *</span>
              </label>

              <select
                name="course"
                value={formData.course}
                onChange={handleCourseChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select a course</option>

                {courses.map((course) => (
                  <option
                    key={course._id}
                    value={course._id}
                    disabled={course.isActive === false}
                  >
                    {course.name} — {course.category} — ₹
                    {Number(course.fee || 0).toLocaleString("en-IN")}
                    {course.isActive === false ? " — Inactive" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* COURSE START */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Course Start Date
              </label>

              <input
                type="date"
                name="courseStartDate"
                value={formData.courseStartDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* COURSE END */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Course End Date
              </label>

              <input
                type="date"
                name="courseEndDate"
                value={formData.courseEndDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* ADMISSION DATE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Admission Date
              </label>

              <input
                type="date"
                name="admissionDate"
                value={formData.admissionDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* ==========================================
            FEE INFORMATION
        ========================================== */}

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <FaMoneyBillWave />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Fee & Payment
              </h2>

              <p className="text-sm text-slate-500">
                Record the student's initial payment
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {/* TOTAL FEE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Total Fee
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  ₹
                </span>

                <input
                  type="number"
                  name="totalFee"
                  value={formData.totalFee}
                  readOnly
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 py-3 pl-9 pr-4 text-slate-700 outline-none"
                />
              </div>
            </div>

            {/* PAID */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Amount Paid
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  ₹
                </span>

                <input
                  type="number"
                  name="totalPaid"
                  value={formData.totalPaid}
                  onChange={handleChange}
                  min="0"
                  max={totalFee}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 py-3 pl-9 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* REMAINING */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Remaining Fee
              </label>

              <div
                className={`rounded-lg border px-4 py-3 font-bold ${
                  remainingFee === 0
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                ₹{remainingFee.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* ==========================================
              PAYMENT DETAILS
          ========================================== */}

          {totalPaid > 0 && (
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/50 p-5">
              <h3 className="mb-4 font-semibold text-slate-800">
                Payment Details
              </h3>

              <div className="grid gap-5 md:grid-cols-3">
                {/* PAYMENT METHOD */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Payment Method
                    <span className="text-red-500"> *</span>
                  </label>

                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="cash">Cash</option>

                    <option value="upi">UPI</option>

                    <option value="bank_transfer">Bank Transfer</option>

                    <option value="other">Other</option>
                  </select>
                </div>

                {/* PAYMENT DATE */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Payment Date
                  </label>

                  <input
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* NOTE */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Payment Note
                  </label>

                  <input
                    type="text"
                    name="paymentNote"
                    value={formData.paymentNote}
                    onChange={handleChange}
                    placeholder="Optional note"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ==========================================
            BUTTONS
        ========================================== */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/admin/students")}
            className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
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
                Registering...
              </>
            ) : (
              <>
                <FaSave />
                Register Student
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudent;
