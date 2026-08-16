
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaSave,
  FaUserGraduate,
  FaCheckCircle,
  FaTimesCircle,
  FaPlayCircle,
} from "react-icons/fa";

import { toast } from "react-hot-toast";

import api from "../../services/api";

const EditStudent = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // ==========================================
  // STATES
  // ==========================================

  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);

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
    status: "active",
    totalFee: "",
    totalPaid: "",
  });

  // ==========================================
  // FETCH STUDENT + COURSES
  // ==========================================

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [studentResponse, courseResponse] =
        await Promise.all([
          api.get(`/students/${id}`),
          api.get("/courses"),
        ]);

      const student = studentResponse.data.student;

      setCourses(courseResponse.data.courses || []);

      setFormData({
        name: student.name || "",
        mobile: student.mobile || "",
        email: student.email || "",
        address: student.address || "",

        dateOfBirth: student.dateOfBirth
          ? formatDateForInput(student.dateOfBirth)
          : "",

        gender: student.gender || "",

        course:
          student.course?._id ||
          student.course ||
          "",

        admissionDate: student.admissionDate
          ? formatDateForInput(student.admissionDate)
          : "",

        courseStartDate: student.courseStartDate
          ? formatDateForInput(student.courseStartDate)
          : "",

        courseEndDate: student.courseEndDate
          ? formatDateForInput(student.courseEndDate)
          : "",

        status: student.status || "active",

        totalFee: student.totalFee ?? "",

        totalPaid: student.totalPaid ?? "",
      });
    } catch (error) {
      console.error("Fetch Student Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load student"
      );

      navigate("/admin/students");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDateForInput = (date) => {
    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "";
    }

    const year = d.getFullYear();

    const month = String(
      d.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      d.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

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
  // HANDLE STATUS CHANGE
  // ==========================================

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;

    setFormData((previous) => {
      let newEndDate = previous.courseEndDate;

      // If student is completed and no end date exists,
      // automatically set today's date.
      if (
        newStatus === "completed" &&
        !previous.courseEndDate
      ) {
        newEndDate = formatDateForInput(new Date());
      }

      return {
        ...previous,
        status: newStatus,
        courseEndDate: newEndDate,
      };
    });
  };

  // ==========================================
  // COURSE CHANGE
  // ==========================================

  const handleCourseChange = (e) => {
    const courseId = e.target.value;

    const selectedCourse = courses.find(
      (course) => course._id === courseId
    );

    setFormData((previous) => ({
      ...previous,
      course: courseId,

      totalFee:
        selectedCourse?.fee ??
        previous.totalFee,
    }));
  };

  // ==========================================
  // FEE CALCULATION
  // ==========================================

  const totalFee =
    Number(formData.totalFee) || 0;

  const totalPaid =
    Number(formData.totalPaid) || 0;

  const remainingFee =
    totalFee - totalPaid;

  // ==========================================
  // STATUS INFORMATION
  // ==========================================

  const getStatusInfo = () => {
    switch (formData.status) {
      case "completed":
        return {
          icon: <FaCheckCircle />,
          title: "Course Completed",
          message:
            "This student has successfully completed the course.",
          className:
            "border-green-200 bg-green-50 text-green-700",
        };

      case "dropped":
        return {
          icon: <FaTimesCircle />,
          title: "Course Dropped",
          message:
            "This student has stopped or left the course.",
          className:
            "border-red-200 bg-red-50 text-red-700",
        };

      case "active":
      default:
        return {
          icon: <FaPlayCircle />,
          title: "Currently Active",
          message:
            "This student is currently attending the course.",
          className:
            "border-blue-200 bg-blue-50 text-blue-700",
        };
    }
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required fields
    if (
      !formData.name.trim() ||
      !formData.mobile.trim() ||
      !formData.course ||
      formData.totalFee === ""
    ) {
      toast.error(
        "Please fill all required fields"
      );

      return;
    }

    // Mobile validation
    if (
      !/^[0-9]{10}$/.test(
        formData.mobile.trim()
      )
    ) {
      toast.error(
        "Please enter a valid 10-digit mobile number"
      );

      return;
    }

    // Fee validation
    if (totalFee < 0) {
      toast.error(
        "Total fee cannot be negative"
      );

      return;
    }

    if (totalPaid < 0) {
      toast.error(
        "Paid amount cannot be negative"
      );

      return;
    }

    if (totalPaid > totalFee) {
      toast.error(
        "Paid amount cannot be greater than total fee"
      );

      return;
    }

    // Status validation
    const allowedStatuses = [
      "active",
      "completed",
      "dropped",
    ];

    if (
      !allowedStatuses.includes(
        formData.status
      )
    ) {
      toast.error("Invalid student status");

      return;
    }

    try {
      setSubmitting(true);

      const data = {
        name: formData.name.trim(),

        mobile: formData.mobile.trim(),

        email:
          formData.email.trim() || undefined,

        address:
          formData.address.trim() || undefined,

        dateOfBirth:
          formData.dateOfBirth || undefined,

        gender:
          formData.gender || undefined,

        course: formData.course,

        admissionDate:
          formData.admissionDate || undefined,

        courseStartDate:
          formData.courseStartDate || undefined,

        courseEndDate:
          formData.courseEndDate || undefined,

        // IMPORTANT
        status: formData.status,

        totalFee,

        totalPaid,
      };

      const response = await api.put(
        `/students/${id}`,
        data
      );

      if (response.data.success) {
        toast.success(
          "Student updated successfully"
        );

        navigate("/admin/students");
      } else {
        toast.error(
          response.data.message ||
            "Failed to update student"
        );
      }
    } catch (error) {
      console.error(
        "Update Student Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update student"
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

  const statusInfo = getStatusInfo();

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
          type="button"
          onClick={() =>
            navigate("/admin/students")
          }
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
            <h1 className="text-3xl font-bold text-slate-800">
              Edit Student
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Update student information
            </p>
          </div>

        </div>

      </div>

      {/* ==========================================
          FORM
      ========================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

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
                <span className="text-red-500">
                  {" "}*
                </span>
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* MOBILE */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Mobile Number
                <span className="text-red-500">
                  {" "}*
                </span>
              </label>

              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                maxLength="10"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >

                <option value="">
                  Select gender
                </option>

                <option value="male">
                  Male
                </option>

                <option value="female">
                  Female
                </option>

                <option value="other">
                  Other
                </option>

              </select>

            </div>

            {/* STATUS */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Student Status
                <span className="text-red-500">
                  {" "}*
                </span>
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleStatusChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >

                <option value="active">
                  Active — Currently Studying
                </option>

                <option value="completed">
                  Completed — Course Finished
                </option>

                <option value="dropped">
                  Dropped — Left Course
                </option>

              </select>

              {/* STATUS MESSAGE */}

              <div
                className={`mt-3 flex items-start gap-3 rounded-lg border p-3 text-sm ${statusInfo.className}`}
              >

                <div className="mt-0.5">
                  {statusInfo.icon}
                </div>

                <div>
                  <p className="font-semibold">
                    {statusInfo.title}
                  </p>

                  <p className="mt-1 opacity-80">
                    {statusInfo.message}
                  </p>
                </div>

              </div>

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
                rows="3"
                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Course
                <span className="text-red-500">
                  {" "}*
                </span>
              </label>

              <select
                name="course"
                value={formData.course}
                onChange={handleCourseChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >

                <option value="">
                  Select course
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

            {/* START DATE */}

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

            {/* END DATE */}

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

              {formData.status === "completed" && (
                <p className="mt-2 text-xs text-green-600">
                  The course completion date is recorded here.
                </p>
              )}

              {formData.status === "dropped" && (
                <p className="mt-2 text-xs text-red-600">
                  You can use this date to record when the
                  student stopped the course.
                </p>
              )}

            </div>

          </div>

        </div>

        {/* ==========================================
            FEE INFORMATION
        ========================================== */}

        <div className="rounded-xl bg-white p-6 shadow-sm">

          <h2 className="mb-2 text-lg font-bold text-slate-800">
            Fee Information
          </h2>

          <p className="mb-5 text-sm text-slate-500">
            Payment is managed manually.
          </p>

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
                  value={formData.totalFee}
                  readOnly
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 py-3 pl-9 pr-4 outline-none"
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
                  className="w-full rounded-lg border border-slate-300 py-3 pl-9 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>

            {/* DUE */}

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
                ₹
                {Math.max(
                  remainingFee,
                  0
                ).toLocaleString("en-IN")}
              </div>

            </div>

          </div>

        </div>

        {/* ==========================================
            BUTTONS
        ========================================== */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={() =>
              navigate("/admin/students")
            }
            className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {submitting ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Updating...
              </>
            ) : (
              <>
                <FaSave />
                Update Student
              </>
            )}

          </button>

        </div>

      </form>
    </div>
  );
};

export default EditStudent;

