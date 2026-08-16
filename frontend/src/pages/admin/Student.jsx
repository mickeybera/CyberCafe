import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaUserGraduate,
  FaChevronLeft,
  FaChevronRight,
  FaMoneyBillWave,
  FaMobileAlt,
  FaUniversity,
  FaCreditCard,
} from "react-icons/fa";

import { toast } from "react-hot-toast";

import api from "../../services/api";

const Students = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("");

  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    totalStudents: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // ==========================================
  // FETCH STUDENTS
  // ==========================================

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.append("page", page);
      params.append("limit", 10);

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (category) {
        params.append("category", category);
      }

      if (status) {
        params.append("status", status);
      }

      const response = await api.get(
        `/students/search?${params.toString()}`
      );

      setStudents(response.data.students || []);

      setPagination(
        response.data.pagination || {
          totalStudents: 0,
          currentPage: 1,
          totalPages: 1,
          limit: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (error) {
      console.error("Fetch Students Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load students"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH WHEN PAGE / FILTER CHANGES
  // ==========================================

  useEffect(() => {
    fetchStudents();
  }, [page, category, status]);

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = (e) => {
    e.preventDefault();

    setPage(1);

    fetchStudents();
  };

  // ==========================================
  // DELETE STUDENT
  // ==========================================

  const handleDelete = async (studentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/students/${studentId}`);

      toast.success(
        "Student deleted successfully"
      );

      fetchStudents();
    } catch (error) {
      console.error("Delete Student Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to delete student"
      );
    }
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-IN"
    );
  };

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusStyle = (studentStatus) => {
    if (studentStatus === "completed") {
      return "bg-green-100 text-green-700";
    }

    if (studentStatus === "dropped") {
      return "bg-red-100 text-red-700";
    }

    return "bg-blue-100 text-blue-700";
  };

  // ==========================================
  // PAYMENT MODE
  // ==========================================

  const getPaymentMethod = (student) => {
    const method =
      student?.paymentMethod || "cash";

    switch (method) {
      case "upi":
        return {
          label: "UPI",
          icon: <FaMobileAlt />,
          className:
            "bg-purple-100 text-purple-700",
        };

      case "bank_transfer":
        return {
          label: "Bank Transfer",
          icon: <FaUniversity />,
          className:
            "bg-blue-100 text-blue-700",
        };

      case "other":
        return {
          label: "Other",
          icon: <FaCreditCard />,
          className:
            "bg-orange-100 text-orange-700",
        };

      case "cash":
      default:
        return {
          label: "Cash",
          icon: <FaMoneyBillWave />,
          className:
            "bg-green-100 text-green-700",
        };
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading && students.length === 0) {
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
    <div>
      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="ml-2 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Students
          </h1>

          <p className="mt-1 text-sm text-green-500">
            Manage registered students
          </p>
        </div>

        <Link
          to="/admin/students/add"
          className="flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 mr-2"
        >
          <FaPlus />
          Add Student
        </Link>
      </div>

      {/* ==========================================
          SEARCH + FILTERS
      ========================================== */}

      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* SEARCH */}

          <form
            onSubmit={handleSearch}
            className="flex flex-1"
          >
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search by name or mobile..."
                className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              className="ml-2 rounded-lg bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700 hover:cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* CATEGORY */}

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">
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
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="dropped">
              Dropped
            </option>
          </select>
        </div>
      </div>

      {/* ==========================================
          STUDENT TABLE
      ========================================== */}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {/* ==========================================
            DESKTOP TABLE
        ========================================== */}

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {/* STUDENT */}

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                  Student
                </th>

                {/* MOBILE */}

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                  Mobile
                </th>

                {/* COURSE */}

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                  Course
                </th>

                {/* FEE */}

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                  Fee
                </th>

                {/* PAYMENT MODE */}

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                  Payment Mode
                </th>

                {/* STATUS */}

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                  Status
                </th>

                {/* ACTIONS */}

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center"
                  >
                    <FaUserGraduate className="mx-auto text-4xl text-slate-300" />

                    <p className="mt-3 font-medium text-slate-500">
                      No students found
                    </p>
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const payment =
                    getPaymentMethod(student);

                  return (
                    <tr
                      key={student._id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* STUDENT */}

                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-800">
                            {student.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            Joined{" "}
                            {formatDate(
                              student.admissionDate
                            )}
                          </p>
                        </div>
                      </td>

                      {/* MOBILE */}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {student.mobile}
                      </td>

                      {/* COURSE */}

                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {student.course?.name ||
                            "-"}
                        </p>

                        <p className="text-xs capitalize text-slate-500">
                          {student.course?.category ||
                            "-"}
                        </p>
                      </td>

                      {/* FEE */}

                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          ₹
                          {Number(
                            student.totalFee || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        <p className="text-xs text-green-600">
                          Paid: ₹
                          {Number(
                            student.totalPaid || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        <p className="text-xs text-red-500">
                          Due: ₹
                          {(
                            Number(
                              student.totalFee || 0
                            ) -
                            Number(
                              student.totalPaid || 0
                            )
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </td>

                      {/* PAYMENT MODE */}

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${payment.className}`}
                        >
                          {payment.icon}
                          {payment.label}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                            student.status
                          )}`}
                        >
                          {student.status ||
                            "active"}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {/* EDIT */}

                          <Link
                            to={`/admin/students/${student._id}`}
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                            title="Edit student"
                          >
                            <FaEdit />
                          </Link>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                student._id
                              )
                            }
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                            title="Delete student"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ==========================================
            MOBILE CARDS
        ========================================== */}

        <div className="space-y-4 p-4 md:hidden">
          {students.length === 0 ? (
            <div className="py-12 text-center">
              <FaUserGraduate className="mx-auto text-4xl text-slate-300" />

              <p className="mt-3 text-slate-500">
                No students found
              </p>
            </div>
          ) : (
            students.map((student) => {
              const payment =
                getPaymentMethod(student);

              const due =
                Number(
                  student.totalFee || 0
                ) -
                Number(
                  student.totalPaid || 0
                );

              return (
                <div
                  key={student._id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  {/* HEADER */}

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-800">
                        {student.name}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {student.mobile}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                        student.status
                      )}`}
                    >
                      {student.status ||
                        "active"}
                    </span>
                  </div>

                  {/* DETAILS */}

                  <div className="mt-4 space-y-3 text-sm">
                    {/* COURSE */}

                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">
                        Course
                      </span>

                      <span className="text-right font-medium">
                        {student.course?.name ||
                          "-"}
                      </span>
                    </div>

                    {/* TOTAL FEE */}

                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Total Fee
                      </span>

                      <span>
                        ₹
                        {Number(
                          student.totalFee || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>

                    {/* PAID */}

                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Paid
                      </span>

                      <span className="text-green-600">
                        ₹
                        {Number(
                          student.totalPaid || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>

                    {/* DUE */}

                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Due
                      </span>

                      <span className="font-semibold text-red-600">
                        ₹
                        {due.toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>

                    {/* PAYMENT MODE */}

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">
                        Payment Mode
                      </span>

                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${payment.className}`}
                      >
                        {payment.icon}
                        {payment.label}
                      </span>
                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div className="mt-4 flex justify-end gap-2 border-t pt-3">
                    <Link
                      to={`/admin/students/${student._id}`}
                      className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600"
                    >
                      <FaEdit />
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          student._id
                        )
                      }
                      className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600"
                    >
                      <FaTrash />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ==========================================
          PAGINATION
      ========================================== */}

      {pagination.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-sm">
          <p className="text-sm text-slate-500">
            Page{" "}
            <span className="font-semibold text-slate-700">
              {pagination.currentPage}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {pagination.totalPages}
            </span>
          </p>

          <div className="flex gap-2">
            {/* PREVIOUS */}

            <button
              type="button"
              disabled={
                !pagination.hasPreviousPage
              }
              onClick={() =>
                setPage(
                  (previous) =>
                    previous - 1
                )
              }
              className="rounded-lg border border-slate-300 p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaChevronLeft />
            </button>

            {/* NEXT */}

            <button
              type="button"
              disabled={
                !pagination.hasNextPage
              }
              onClick={() =>
                setPage(
                  (previous) =>
                    previous + 1
                )
              }
              className="rounded-lg border border-slate-300 p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;