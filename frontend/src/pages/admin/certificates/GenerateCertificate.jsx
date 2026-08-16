
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaCertificate,
  FaSave,
  FaSearch,
  FaUserGraduate,
  FaTimes,
} from "react-icons/fa";

import { toast } from "react-hot-toast";

import api from "../../../services/api";

const GenerateCertificate = () => {
  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================

  const [search, setSearch] = useState("");

  const [students, setStudents] = useState([]);

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [searching, setSearching] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [formData, setFormData] = useState({
    studentId: "",
    completionDate: "",
  });

  // ==========================================
  // SEARCH STUDENTS
  // ==========================================

  const searchStudents = async (value) => {
    const searchText = value.trim();

    setSearch(value);

    // Clear results if search is empty
    if (!searchText) {
      setStudents([]);
      return;
    }

    try {
      setSearching(true);

      const response = await api.get(
        "/students/search",
        {
          params: {
            search: searchText,
            status: "completed",
            page: 1,
            limit: 10,
          },
        }
      );

      setStudents(
        response.data.students || []
      );
    } catch (error) {
      console.error(
        "Search Students Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to search students"
      );

      setStudents([]);
    } finally {
      setSearching(false);
    }
  };

  // ==========================================
  // SELECT STUDENT
  // ==========================================

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);

    setFormData((previous) => ({
      ...previous,
      studentId: student._id,
    }));

    setSearch(student.name);

    // Hide search results after selection
    setStudents([]);
  };

  // ==========================================
  // CLEAR STUDENT
  // ==========================================

  const handleClearStudent = () => {
    setSelectedStudent(null);

    setSearch("");

    setStudents([]);

    setFormData((previous) => ({
      ...previous,
      studentId: "",
    }));
  };

  // ==========================================
  // HANDLE FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // GENERATE CERTIFICATE
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.studentId) {
      toast.error("Please select a student");
      return;
    }

    if (!formData.completionDate) {
      toast.error(
        "Please select completion date"
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post(
        "/certificates",
        {
          studentId: formData.studentId,
          completionDate:
            formData.completionDate,
        }
      );

      toast.success(
        response.data.message ||
          "Certificate generated successfully"
      );

      navigate("/admin/certificates");
    } catch (error) {
      console.error(
        "Generate Certificate Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to generate certificate"
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

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="mb-6">

        <button
          type="button"
          onClick={() =>
            navigate("/admin/certificates")
          }
          className="mb-4 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <FaArrowLeft />

          Back to Certificates
        </button>

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <FaCertificate />
          </div>

          <div>

            <h1 className="text-3xl font-bold text-slate-800">
              Generate Certificate
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Search for a completed student and
              generate their certificate
            </p>

          </div>

        </div>

      </div>

      {/* ==========================================
          FORM
      ========================================== */}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-white p-6 shadow-sm"
      >

        {/* ==========================================
            STUDENT SEARCH
        ========================================== */}

        <div className="mb-6">

          <label className="mb-2 block text-sm font-medium text-slate-700">

            Search Student

            <span className="text-red-500">
              {" "}*
            </span>

          </label>

          <div className="relative">

            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                searchStudents(e.target.value)
              }
              placeholder="Search by student name or mobile number..."
              className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-12 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {searching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">

                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

              </div>
            )}

            {!searching &&
              search &&
              selectedStudent && (
                <button
                  type="button"
                  onClick={handleClearStudent}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                  title="Clear student"
                >
                  <FaTimes />
                </button>
              )}

          </div>

          {/* ==========================================
              SEARCH RESULTS
          ========================================== */}

          {search &&
            !selectedStudent &&
            !searching && (
              <div className="relative z-10">

                {students.length > 0 ? (

                  <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">

                    {students.map((student) => (

                      <button
                        type="button"
                        key={student._id}
                        onClick={() =>
                          handleSelectStudent(
                            student
                          )
                        }
                        className="flex w-full items-center gap-4 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-blue-50"
                      >

                        {/* ICON */}

                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <FaUserGraduate />
                        </div>

                        {/* STUDENT INFO */}

                        <div className="min-w-0 flex-1">

                          <p className="font-semibold text-slate-800">
                            {student.name}
                          </p>

                          <p className="text-sm text-slate-500">
                            {student.mobile}
                          </p>

                        </div>

                        {/* COURSE */}

                        <div className="hidden text-right sm:block">

                          <p className="text-sm font-medium text-slate-700">
                            {student.course?.name ||
                              "-"}
                          </p>

                          <p className="text-xs capitalize text-green-600">
                            {student.status}
                          </p>

                        </div>

                      </button>

                    ))}

                  </div>

                ) : (

                  <div className="mt-2 rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm">

                    <FaUserGraduate className="mx-auto text-2xl text-slate-300" />

                    <p className="mt-2 text-sm font-medium text-slate-600">
                      No completed student found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try searching with another name
                      or mobile number.
                    </p>

                  </div>

                )}

              </div>
            )}

        </div>

        {/* ==========================================
            SELECTED STUDENT INFORMATION
        ========================================== */}

        {selectedStudent && (

          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-5">

            <div className="mb-4 flex items-center justify-between">

              <h3 className="font-semibold text-slate-800">
                Selected Student
              </h3>

              <button
                type="button"
                onClick={handleClearStudent}
                className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-600"
              >
                <FaTimes />
                Change
              </button>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              {/* NAME */}

              <div>

                <p className="text-xs text-slate-500">
                  Student
                </p>

                <p className="font-semibold text-slate-800">
                  {selectedStudent.name}
                </p>

              </div>

              {/* MOBILE */}

              <div>

                <p className="text-xs text-slate-500">
                  Mobile
                </p>

                <p className="font-medium text-slate-800">
                  {selectedStudent.mobile}
                </p>

              </div>

              {/* COURSE */}

              <div>

                <p className="text-xs text-slate-500">
                  Course
                </p>

                <p className="font-medium text-slate-800">
                  {selectedStudent.course?.name ||
                    "-"}
                </p>

              </div>

              {/* CATEGORY */}

              <div>

                <p className="text-xs text-slate-500">
                  Category
                </p>

                <p className="font-medium capitalize text-slate-800">
                  {selectedStudent.course
                    ?.category || "-"}
                </p>

              </div>

              {/* STATUS */}

              <div>

                <p className="text-xs text-slate-500">
                  Status
                </p>

                <p className="font-semibold capitalize text-green-600">
                  {selectedStudent.status}
                </p>

              </div>

              {/* COURSE END DATE */}

              <div>

                <p className="text-xs text-slate-500">
                  Course End Date
                </p>

                <p className="font-medium text-slate-800">
                  {selectedStudent.courseEndDate
                    ? new Date(
                        selectedStudent.courseEndDate
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "-"}
                </p>

              </div>

            </div>

          </div>

        )}

        {/* ==========================================
            COMPLETION DATE
        ========================================== */}

        <div className="mb-6">

          <label className="mb-2 block text-sm font-medium text-slate-700">

            Completion Date

            <span className="text-red-500">
              {" "}*
            </span>

          </label>

          <input
            type="date"
            name="completionDate"
            value={formData.completionDate}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {selectedStudent?.courseEndDate && (
            <p className="mt-2 text-xs text-slate-500">
              Course end date:{" "}
              {new Date(
                selectedStudent.courseEndDate
              ).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}

        </div>

        {/* ==========================================
            BUTTONS
        ========================================== */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={() =>
              navigate("/admin/certificates")
            }
            className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              submitting ||
              !selectedStudent
            }
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {submitting ? (

              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />

                Generating...
              </>

            ) : (

              <>
                <FaSave />

                Generate Certificate
              </>

            )}

          </button>

        </div>

      </form>

    </div>
  );
};

export default GenerateCertificate;

