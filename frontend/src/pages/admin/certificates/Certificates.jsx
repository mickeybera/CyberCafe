
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  FaPlus,
  FaSearch,
  FaCertificate,
  FaDownload,
  FaBan,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import { toast } from "react-hot-toast";

// import api from "../../services/api";
import api from "../../../services/api";

const Certificates = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [certificates, setCertificates] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [category, setCategory] = useState("");

  // ==========================================
  // FETCH CERTIFICATES
  // ==========================================

  const fetchCertificates = async () => {
    try {
      setLoading(true);

      const response = await api.get("/certificates");

      setCertificates(
        response.data.certificates || []
      );
    } catch (error) {
      console.error(
        "Fetch Certificates Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load certificates"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchCertificates();
  }, []);

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const formatted = new Date(
      date
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return formatted;
  };

  // ==========================================
  // REVOKE CERTIFICATE
  // ==========================================

  const handleRevoke = async (certificateId) => {
    const confirmed = window.confirm(
      "Are you sure you want to revoke this certificate?\n\nThis certificate will no longer be considered valid."
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.put(
        `/certificates/${certificateId}/revoke`
      );

      toast.success(
        "Certificate revoked successfully"
      );

      fetchCertificates();
    } catch (error) {
      console.error(
        "Revoke Certificate Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to revoke certificate"
      );
    }
  };

  // ==========================================
  // DOWNLOAD CERTIFICATE
  // ==========================================

  const handleDownload = async (certificate) => {
    try {
      const response = await api.get(
        `/certificates/${certificate._id}/pdf`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download = `${certificate.certificateNumber}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Download Certificate Error:",
        error
      );

      toast.error(
        "Failed to download certificate"
      );
    }
  };

  // ==========================================
  // FILTER CERTIFICATES
  // ==========================================

  const filteredCertificates =
    certificates.filter((certificate) => {
      const searchText =
        search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        certificate.certificateNumber
          ?.toLowerCase()
          .includes(searchText) ||
        certificate.studentName
          ?.toLowerCase()
          .includes(searchText) ||
        certificate.courseName
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        !status ||
        certificate.status === status;

      const matchesCategory =
        !category ||
        certificate.category === category;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusStyle = (certificateStatus) => {
    if (certificateStatus === "revoked") {
      return "bg-red-100 text-red-700";
    }

    return "bg-green-100 text-green-700";
  };

  // ==========================================
  // CATEGORY STYLE
  // ==========================================

  const getCategoryStyle = (certificateCategory) => {
    if (certificateCategory === "tailoring") {
      return "bg-pink-100 text-pink-700";
    }

    return "bg-blue-100 text-blue-700";
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
    <div>
      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <FaCertificate />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Certificates
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage student certificates
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/admin/certificates/generate"
          className="flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <FaPlus />
          Generate Certificate
        </Link>
      </div>

      {/* ==========================================
          FILTERS
      ========================================== */}

      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* SEARCH */}

          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search certificate number, student or course..."
              className="w-full rounded-lg border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* CATEGORY */}

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
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
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">
              All Status
            </option>

            <option value="valid">
              Valid
            </option>

            <option value="revoked">
              Revoked
            </option>
          </select>
        </div>
      </div>

      {/* ==========================================
          DESKTOP TABLE
      ========================================== */}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                  Certificate
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                  Student
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                  Course
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                  Completion
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                  Issue Date
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredCertificates.length ===
              0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center"
                  >
                    <FaCertificate className="mx-auto text-4xl text-slate-300" />

                    <p className="mt-3 font-medium text-slate-500">
                      No certificates found
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCertificates.map(
                  (certificate) => (
                    <tr
                      key={certificate._id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* CERTIFICATE */}

                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">
                          {
                            certificate.certificateNumber
                          }
                        </p>

                        <span
                          className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getCategoryStyle(
                            certificate.category
                          )}`}
                        >
                          {certificate.category}
                        </span>
                      </td>

                      {/* STUDENT */}

                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">
                          {
                            certificate.studentName
                          }
                        </p>

                        <p className="text-xs text-slate-500">
                          {certificate.student
                            ?.mobile || "-"}
                        </p>
                      </td>

                      {/* COURSE */}

                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700">
                          {
                            certificate.courseName
                          }
                        </p>

                        <p className="text-xs text-slate-500">
                          Duration:{" "}
                          {certificate.duration ||
                            "-"}
                        </p>
                      </td>

                      {/* COMPLETION */}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(
                          certificate.completionDate
                        )}
                      </td>

                      {/* ISSUE */}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(
                          certificate.issueDate
                        )}
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                            certificate.status
                          )}`}
                        >
                          {certificate.status ===
                          "revoked" ? (
                            <FaTimesCircle />
                          ) : (
                            <FaCheckCircle />
                          )}

                          <span className="capitalize">
                            {certificate.status}
                          </span>
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {/* VIEW */}

                          <Link
                            to={`/admin/certificates/${certificate._id}`}
                            title="View certificate"
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          >
                            <FaEye />
                          </Link>

                          {/* DOWNLOAD */}

                          {certificate.status !==
                            "revoked" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDownload(
                                  certificate
                                )
                              }
                              title="Download PDF"
                              className="rounded-lg p-2 text-green-600 transition hover:bg-green-50"
                            >
                              <FaDownload />
                            </button>
                          )}

                          {/* REVOKE */}

                          {certificate.status !==
                            "revoked" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRevoke(
                                  certificate._id
                                )
                              }
                              title="Revoke certificate"
                              className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                            >
                              <FaBan />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        {/* ==========================================
            MOBILE CARDS
        ========================================== */}

        <div className="space-y-4 p-4 md:hidden">
          {filteredCertificates.length ===
          0 ? (
            <div className="py-12 text-center">
              <FaCertificate className="mx-auto text-4xl text-slate-300" />

              <p className="mt-3 text-slate-500">
                No certificates found
              </p>
            </div>
          ) : (
            filteredCertificates.map(
              (certificate) => (
                <div
                  key={certificate._id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  {/* HEADER */}

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-800">
                        {
                          certificate.studentName
                        }
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {
                          certificate.certificateNumber
                        }
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                        certificate.status
                      )}`}
                    >
                      {certificate.status ===
                      "revoked" ? (
                        <FaTimesCircle />
                      ) : (
                        <FaCheckCircle />
                      )}

                      <span className="capitalize">
                        {certificate.status}
                      </span>
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
                          certificate.courseName
                        }
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">
                        Category
                      </span>

                      <span className="font-medium capitalize text-slate-700">
                        {
                          certificate.category
                        }
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">
                        Completion
                      </span>

                      <span className="font-medium">
                        {formatDate(
                          certificate.completionDate
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">
                        Issued
                      </span>

                      <span className="font-medium">
                        {formatDate(
                          certificate.issueDate
                        )}
                      </span>
                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div className="mt-4 flex justify-end gap-2 border-t pt-3">
                    <Link
                      to={`/admin/certificates/${certificate._id}`}
                      className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600"
                    >
                      <FaEye />
                      View
                    </Link>

                    {certificate.status !==
                      "revoked" && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleDownload(
                              certificate
                            )
                          }
                          className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-600"
                        >
                          <FaDownload />
                          PDF
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleRevoke(
                              certificate._id
                            )
                          }
                          className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
                        >
                          <FaBan />
                          Revoke
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>

      {/* ==========================================
          SUMMARY
      ========================================== */}

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Certificates
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-800">
            {certificates.length}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Valid
          </p>

          <p className="mt-1 text-2xl font-bold text-green-600">
            {
              certificates.filter(
                (item) =>
                  item.status === "valid"
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Revoked
          </p>

          <p className="mt-1 text-2xl font-bold text-red-600">
            {
              certificates.filter(
                (item) =>
                  item.status === "revoked"
              ).length
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Certificates;

