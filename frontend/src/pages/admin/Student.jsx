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
  FaFilePdf,
  FaFileExcel,
  FaDownload,
  FaFilter,
  FaTimes,
} from "react-icons/fa";

import { toast } from "react-hot-toast";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  const [exporting, setExporting] = useState(false);

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
  // CLEAR FILTERS
  // ==========================================

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setStatus("");
    setPage(1);
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
      console.error(
        "Delete Student Error:",
        error
      );

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
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
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
  // EXPORT DATA PREPARATION
  // ==========================================

  const getExportData = () => {
    return students.map((student, index) => {
      const totalFee = Number(
        student.totalFee || 0
      );

      const totalPaid = Number(
        student.totalPaid || 0
      );

      const due = totalFee - totalPaid;

      const paymentMethod =
        student?.paymentMethod || "cash";

      const paymentLabel =
        paymentMethod === "upi"
          ? "UPI"
          : paymentMethod ===
            "bank_transfer"
          ? "Bank Transfer"
          : paymentMethod === "other"
          ? "Other"
          : "Cash";

      return {
        "S.No": index + 1,

        "Student Name":
          student.name || "-",

        Mobile:
          student.mobile || "-",

        Course:
          student.course?.name || "-",

        Category:
          student.course?.category || "-",

        "Admission Date":
          formatDate(
            student.admissionDate
          ),

        "Total Fee":
          totalFee,

        "Paid Amount":
          totalPaid,

        "Due Amount":
          due,

        "Payment Mode":
          paymentLabel,

        Status:
          student.status || "active",
      };
    });
  };

  // ==========================================
  // EXPORT EXCEL
  // ==========================================

  const exportExcel = () => {
    if (students.length === 0) {
      toast.error(
        "No students available to export"
      );

      return;
    }

    try {
      setExporting(true);

      const data = getExportData();

      const worksheet =
        XLSX.utils.json_to_sheet(data);

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Students"
      );

      // Column widths
      worksheet["!cols"] = [
        { wch: 8 },
        { wch: 25 },
        { wch: 16 },
        { wch: 25 },
        { wch: 18 },
        { wch: 18 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 18 },
        { wch: 15 },
      ];

      XLSX.writeFile(
        workbook,
        "students-list.xlsx"
      );

      toast.success(
        "Excel exported successfully"
      );
    } catch (error) {
      console.error(
        "Excel Export Error:",
        error
      );

      toast.error(
        "Failed to export Excel"
      );
    } finally {
      setExporting(false);
    }
  };

  // ==========================================
  // EXPORT PDF
  // ==========================================

  const exportPDF = () => {
    if (students.length === 0) {
      toast.error(
        "No students available to export"
      );

      return;
    }

    try {
      setExporting(true);

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // ======================================
      // TITLE
      // ======================================

      doc.setFontSize(18);

      doc.text(
        "CyberCafe Management System",
        14,
        15
      );

      doc.setFontSize(13);

      doc.text(
        "Student List",
        14,
        23
      );

      // ======================================
      // FILTER INFORMATION
      // ======================================

      doc.setFontSize(9);

      let filterText =
        "Filters: ";

      if (search.trim()) {
        filterText += `Search: ${search.trim()} | `;
      }

      if (category) {
        filterText += `Category: ${category} | `;
      }

      if (status) {
        filterText += `Status: ${status} | `;
      }

      if (
        !search.trim() &&
        !category &&
        !status
      ) {
        filterText += "All Students";
      }

      doc.text(
        filterText,
        14,
        30
      );

      doc.text(
        `Generated: ${new Date().toLocaleString(
          "en-IN"
        )}`,
        14,
        36
      );

      // ======================================
      // TABLE DATA
      // ======================================

      const tableData = students.map(
        (student, index) => {
          const totalFee = Number(
            student.totalFee || 0
          );

          const totalPaid = Number(
            student.totalPaid || 0
          );

          const due =
            totalFee - totalPaid;

          const paymentMethod =
            student?.paymentMethod ||
            "cash";

          const paymentLabel =
            paymentMethod === "upi"
              ? "UPI"
              : paymentMethod ===
                "bank_transfer"
              ? "Bank Transfer"
              : paymentMethod === "other"
              ? "Other"
              : "Cash";

          return [
            index + 1,
            student.name || "-",
            student.mobile || "-",
            student.course?.name ||
              "-",
            `₹${totalFee.toLocaleString(
              "en-IN"
            )}`,
            `₹${totalPaid.toLocaleString(
              "en-IN"
            )}`,
            `₹${due.toLocaleString(
              "en-IN"
            )}`,
            paymentLabel,
            student.status || "active",
            formatDate(
              student.admissionDate
            ),
          ];
        }
      );

      // ======================================
      // PDF TABLE
      // ======================================

      autoTable(doc, {
        startY: 42,

        head: [
          [
            "S.No",
            "Student",
            "Mobile",
            "Course",
            "Total Fee",
            "Paid",
            "Due",
            "Payment",
            "Status",
            "Admission",
          ],
        ],

        body: tableData,

        theme: "grid",

        styles: {
          fontSize: 8,
          cellPadding: 3,
          valign: "middle",
        },

        headStyles: {
          fontSize: 8,
          fontStyle: "bold",
        },

        alternateRowStyles: {
          fillColor: [
            248,
            250,
            252,
          ],
        },

        margin: {
          left: 10,
          right: 10,
        },
      });

      // ======================================
      // FOOTER
      // ======================================

      const pageCount =
        doc.internal.getNumberOfPages();

      for (
        let i = 1;
        i <= pageCount;
        i++
      ) {
        doc.setPage(i);

        doc.setFontSize(8);

        doc.text(
          `Page ${i} of ${pageCount}`,
          270,
          200,
          {
            align: "right",
          }
        );
      }

      doc.save(
        "students-list.pdf"
      );

      toast.success(
        "PDF exported successfully"
      );
    } catch (error) {
      console.error(
        "PDF Export Error:",
        error
      );

      toast.error(
        "Failed to export PDF"
      );
    } finally {
      setExporting(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (
    loading &&
    students.length === 0
  ) {
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
    <div className="mx-auto max-w-[1600px]">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl text-blue-600">
            <FaUserGraduate />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Students
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage registered students
            </p>
          </div>

        </div>

        <div className="flex flex-wrap gap-2">

          {/* EXPORT EXCEL */}

          <button
            type="button"
            onClick={exportExcel}
            disabled={
              exporting ||
              students.length === 0
            }
            className="hover:cursor-pointer flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaFileExcel />

            Excel
          </button>

          {/* EXPORT PDF */}

          <button
            type="button"
            onClick={exportPDF}
            disabled={
              exporting ||
              students.length === 0
            }
            className="hover:cursor-pointer flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaFilePdf />

            PDF
          </button>

          {/* ADD STUDENT */}

          <Link
            to="/admin/students/add"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <FaPlus />

            Add Student
          </Link>

        </div>

      </div>

      {/* ======================================
          SEARCH + FILTERS
      ====================================== */}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-4 flex items-center justify-between">

          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <FaFilter className="text-blue-600" />

            Search & Filters
          </div>

          {(search ||
            category ||
            status) && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600"
            >
              <FaTimes />

              Clear Filters
            </button>
          )}

        </div>

        <div className="flex flex-col gap-3 xl:flex-row">

          {/* SEARCH */}

          <form
            onSubmit={handleSearch}
            className="flex flex-1 gap-2"
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
                className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />

            </div>

            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 font-semibold text-white transition hover:bg-blue-700"
            >
              Search
            </button>

          </form>

          {/* CATEGORY */}

          <select
            value={category}
            onChange={(e) => {
              setCategory(
                e.target.value
              );

              setPage(1);
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
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
              setStatus(
                e.target.value
              );

              setPage(1);
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
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

      {/* ======================================
          SUMMARY
      ====================================== */}

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

        <p className="text-sm text-slate-500">
          Showing{" "}

          <span className="font-bold text-slate-800">
            {students.length}
          </span>{" "}

          students on this page

          {pagination.totalStudents >
            0 && (
            <>
              {" "}
              of{" "}

              <span className="font-bold text-slate-800">
                {
                  pagination.totalStudents
                }
              </span>
            </>
          )}
        </p>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <FaDownload />

          Export current list
        </div>

      </div>

      {/* ======================================
          STUDENT TABLE
      ====================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* ====================================
            DESKTOP TABLE
        ==================================== */}

        <div
          className="
            hidden
            overflow-x-auto
            md:block
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >

          <table className="w-full min-w-[1200px]">

            <thead className="bg-slate-50">

              <tr>

                <th className="w-[220px] whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Student
                </th>

                <th className="w-[140px] whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mobile
                </th>

                <th className="w-[220px] whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Course
                </th>

                <th className="w-[180px] whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Fee
                </th>

                <th className="w-[170px] whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Payment Mode
                </th>

                <th className="w-[130px] whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="w-[130px] whitespace-nowrap px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {students.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="px-6 py-16 text-center"
                  >

                    <FaUserGraduate className="mx-auto text-5xl text-slate-200" />

                    <p className="mt-4 font-semibold text-slate-600">
                      No students found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search or filters.
                    </p>

                  </td>

                </tr>

              ) : (

                students.map(
                  (student) => {

                    const payment =
                      getPaymentMethod(
                        student
                      );

                    const totalFee =
                      Number(
                        student.totalFee ||
                          0
                      );

                    const totalPaid =
                      Number(
                        student.totalPaid ||
                          0
                      );

                    const due =
                      totalFee -
                      totalPaid;

                    return (
                      <tr
                        key={
                          student._id
                        }
                        className="transition hover:bg-blue-50/40"
                      >

                        {/* STUDENT */}

                        <td className="px-6 py-4">

                          <div className="min-w-[180px]">

                            <p className="truncate font-semibold text-slate-800">
                              {
                                student.name
                              }
                            </p>

                            <p className="mt-1 whitespace-nowrap text-xs text-slate-500">
                              Joined{" "}
                              {formatDate(
                                student.admissionDate
                              )}
                            </p>

                          </div>

                        </td>

                        {/* MOBILE */}

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          {
                            student.mobile ||
                            "-"
                          }
                        </td>

                        {/* COURSE */}

                        <td className="px-6 py-4">

                          <div className="min-w-[180px]">

                            <p className="truncate text-sm font-medium text-slate-700">
                              {
                                student
                                  .course
                                  ?.name ||
                                "-"
                              }
                            </p>

                            <p className="mt-1 text-xs capitalize text-slate-500">
                              {
                                student
                                  .course
                                  ?.category ||
                                "-"
                              }
                            </p>

                          </div>

                        </td>

                        {/* FEE */}

                        <td className="px-6 py-4">

                          <div className="whitespace-nowrap">

                            <p className="text-sm font-semibold text-slate-800">
                              ₹
                              {totalFee.toLocaleString(
                                "en-IN"
                              )}
                            </p>

                            <p className="mt-1 text-xs text-green-600">
                              Paid: ₹
                              {totalPaid.toLocaleString(
                                "en-IN"
                              )}
                            </p>

                            <p className="text-xs text-red-500">
                              Due: ₹
                              {due.toLocaleString(
                                "en-IN"
                              )}
                            </p>

                          </div>

                        </td>

                        {/* PAYMENT */}

                        <td className="px-6 py-4">

                          <span
                            className={`inline-flex whitespace-nowrap items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${payment.className}`}
                          >
                            {
                              payment.icon
                            }

                            {
                              payment.label
                            }
                          </span>

                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4">

                          <span
                            className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                              student.status
                            )}`}
                          >
                            {
                              student.status ||
                              "active"
                            }
                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-4">

                          <div className="flex justify-end gap-2">

                            <Link
                              to={`/admin/students/${student._id}`}
                              className="rounded-lg p-2.5 text-blue-600 transition hover:bg-blue-100"
                              title="Edit student"
                            >
                              <FaEdit />
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  student._id
                                )
                              }
                              className="rounded-lg p-2.5 text-red-600 transition hover:bg-red-100"
                              title="Delete student"
                            >
                              <FaTrash />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>

        {/* ====================================
            MOBILE CARDS
        ==================================== */}

        <div className="space-y-4 p-4 md:hidden">

          {students.length === 0 ? (

            <div className="py-12 text-center">

              <FaUserGraduate className="mx-auto text-4xl text-slate-300" />

              <p className="mt-3 text-slate-500">
                No students found
              </p>

            </div>

          ) : (

            students.map(
              (student) => {

                const payment =
                  getPaymentMethod(
                    student
                  );

                const due =
                  Number(
                    student.totalFee ||
                      0
                  ) -
                  Number(
                    student.totalPaid ||
                      0
                  );

                return (
                  <div
                    key={
                      student._id
                    }
                    className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-sm"
                  >

                    {/* HEADER */}

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <h3 className="truncate font-bold text-slate-800">
                          {
                            student.name
                          }
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {
                            student.mobile ||
                            "-"
                          }
                        </p>

                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                          student.status
                        )}`}
                      >
                        {
                          student.status ||
                          "active"
                        }
                      </span>

                    </div>

                    {/* DETAILS */}

                    <div className="mt-4 space-y-3 text-sm">

                      <div className="flex justify-between gap-3">

                        <span className="text-slate-500">
                          Course
                        </span>

                        <span className="text-right font-medium text-slate-700">
                          {
                            student
                              .course
                              ?.name ||
                            "-"
                          }
                        </span>

                      </div>

                      <div className="flex justify-between">

                        <span className="text-slate-500">
                          Total Fee
                        </span>

                        <span className="font-medium">
                          ₹
                          {Number(
                            student.totalFee ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>

                      </div>

                      <div className="flex justify-between">

                        <span className="text-slate-500">
                          Paid
                        </span>

                        <span className="font-medium text-green-600">
                          ₹
                          {Number(
                            student.totalPaid ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>

                      </div>

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

                      <div className="flex items-center justify-between">

                        <span className="text-slate-500">
                          Payment Mode
                        </span>

                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${payment.className}`}
                        >
                          {
                            payment.icon
                          }

                          {
                            payment.label
                          }
                        </span>

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">

                      <Link
                        to={`/admin/students/${student._id}`}
                        className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
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
                        className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        <FaTrash />

                        Delete
                      </button>

                    </div>

                  </div>
                );
              }
            )

          )}

        </div>

      </div>

      {/* ======================================
          PAGINATION
      ====================================== */}

      {pagination.totalPages >
        1 && (

        <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">

          <p className="text-sm text-slate-500">

            Page{" "}

            <span className="font-bold text-slate-800">
              {
                pagination.currentPage
              }
            </span>

            {" "}of{" "}

            <span className="font-bold text-slate-800">
              {
                pagination.totalPages
              }
            </span>

          </p>

          <div className="flex gap-2">

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
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaChevronLeft />
            </button>

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
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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