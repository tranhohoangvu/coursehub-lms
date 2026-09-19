import { useState, useEffect } from "react";
import { Plus, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Pagination from "../../components/Pagination";

export default function AdminEnrollmentsTab({
  sortedEnrollments,
  sortConfig,
  requestSort,
  setDeleteConfirm,
  setShowEnrollModal,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Reset page when sorted list length drops below current page threshold
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(sortedEnrollments.length / pageSize));
    if (currentPage > maxPage) {
      setCurrentPage(1);
    }
  }, [sortedEnrollments.length, currentPage]);

  const paginatedEnrollments = sortedEnrollments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <button className="btn" onClick={() => setShowEnrollModal(true)}>
          <Plus size={16} /> Enroll Student
        </button>
      </div>
      
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th className="sortable-th" onClick={() => requestSort("userName")}>
                <div className="sortable-th-inner">
                  <span>Student Name</span>
                  {sortConfig.key === "userName" ? (
                    sortConfig.direction === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                  ) : (
                    <ArrowUpDown size={12} style={{ opacity: 0.35 }} />
                  )}
                </div>
              </th>
              <th className="sortable-th" onClick={() => requestSort("userEmail")}>
                <div className="sortable-th-inner">
                  <span>Student Email</span>
                  {sortConfig.key === "userEmail" ? (
                    sortConfig.direction === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                  ) : (
                    <ArrowUpDown size={12} style={{ opacity: 0.35 }} />
                  )}
                </div>
              </th>
              <th className="sortable-th" onClick={() => requestSort("courseTitle")}>
                <div className="sortable-th-inner">
                  <span>Course Title</span>
                  {sortConfig.key === "courseTitle" ? (
                    sortConfig.direction === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                  ) : (
                    <ArrowUpDown size={12} style={{ opacity: 0.35 }} />
                  )}
                </div>
              </th>
              <th className="sortable-th" onClick={() => requestSort("createdAt")}>
                <div className="sortable-th-inner">
                  <span>Enrollment Date</span>
                  {sortConfig.key === "createdAt" ? (
                    sortConfig.direction === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                  ) : (
                    <ArrowUpDown size={12} style={{ opacity: 0.35 }} />
                  )}
                </div>
              </th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEnrollments.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px" }}>
                  No enrollment records matching search query found.
                </td>
              </tr>
            ) : (
              paginatedEnrollments.map((e) => (
                <tr key={e.id}>
                  <td style={{ fontWeight: "600" }}>{e.userName}</td>
                  <td style={{ color: "var(--text-muted)" }}>{e.userEmail}</td>
                  <td style={{ fontWeight: "500", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {e.courseTitle}
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>
                    {new Date(e.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="action-icon-btn danger-hover"
                      onClick={() => setDeleteConfirm({ type: "enrollment", id: e.id, name: `${e.userName} -> ${e.courseTitle}` })}
                    >
                      <Trash2 size={14} /> Disenroll
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={sortedEnrollments.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
