import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Pagination from "../../components/Pagination";

export default function AdminCoursesTab({
  sortedCourses,
  sortConfig,
  requestSort,
  getStatusBadge,
  openEditCourse,
  setDeleteConfirm,
  setShowAddCourseModal,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Reset page when sorted list length drops below current page threshold
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(sortedCourses.length / pageSize));
    if (currentPage > maxPage) {
      setCurrentPage(1);
    }
  }, [sortedCourses.length, currentPage]);

  const paginatedCourses = sortedCourses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <button className="btn" onClick={() => setShowAddCourseModal(true)}>
          <Plus size={16} /> Add Course
        </button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th className="sortable-th" onClick={() => requestSort("title")}>
                <div className="sortable-th-inner">
                  <span>Title</span>
                  {sortConfig.key === "title" ? (
                    sortConfig.direction === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                  ) : (
                    <ArrowUpDown size={12} style={{ opacity: 0.35 }} />
                  )}
                </div>
              </th>
              <th className="sortable-th" onClick={() => requestSort("instructorName")}>
                <div className="sortable-th-inner">
                  <span>Instructor</span>
                  {sortConfig.key === "instructorName" ? (
                    sortConfig.direction === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                  ) : (
                    <ArrowUpDown size={12} style={{ opacity: 0.35 }} />
                  )}
                </div>
              </th>
              <th className="sortable-th" onClick={() => requestSort("categoryName")}>
                <div className="sortable-th-inner">
                  <span>Category</span>
                  {sortConfig.key === "categoryName" ? (
                    sortConfig.direction === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                  ) : (
                    <ArrowUpDown size={12} style={{ opacity: 0.35 }} />
                  )}
                </div>
              </th>
              <th className="sortable-th" onClick={() => requestSort("price")}>
                <div className="sortable-th-inner">
                  <span>Price</span>
                  {sortConfig.key === "price" ? (
                    sortConfig.direction === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                  ) : (
                    <ArrowUpDown size={12} style={{ opacity: 0.35 }} />
                  )}
                </div>
              </th>
              <th className="sortable-th" onClick={() => requestSort("status")}>
                <div className="sortable-th-inner">
                  <span>Status</span>
                  {sortConfig.key === "status" ? (
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
            {paginatedCourses.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px" }}>
                  No courses matching search query found.
                </td>
              </tr>
            ) : (
              paginatedCourses.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: "600", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.title}
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>{c.instructorName || "Unknown"}</td>
                  <td>
                    <span className="badge">
                      {c.categoryName || "General"}
                    </span>
                  </td>
                  <td style={{ fontWeight: "700" }}>{c.price.toLocaleString("vi-VN")} VND</td>
                  <td>{getStatusBadge(c.status)}</td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "8px" }}>
                      <button className="action-icon-btn" onClick={() => openEditCourse(c)}>
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        className="action-icon-btn danger-hover"
                        onClick={() => setDeleteConfirm({ type: "course", id: c.id, name: c.title })}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={sortedCourses.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
