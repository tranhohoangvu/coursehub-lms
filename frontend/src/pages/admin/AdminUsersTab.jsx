import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Pagination from "../../components/Pagination";

export default function AdminUsersTab({
  sortedUsers,
  sortConfig,
  requestSort,
  getRoleBadge,
  openEditUser,
  setDeleteConfirm,
  setShowAddUserModal,
  currentAdmin,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Reset page when sorted list length drops below current page threshold
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(sortedUsers.length / pageSize));
    if (currentPage > maxPage) {
      setCurrentPage(1);
    }
  }, [sortedUsers.length, currentPage]);

  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <button className="btn" onClick={() => setShowAddUserModal(true)}>
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th className="sortable-th" onClick={() => requestSort("name")}>
                <div className="sortable-th-inner">
                  <span>Name</span>
                  {sortConfig.key === "name" ? (
                    sortConfig.direction === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                  ) : (
                    <ArrowUpDown size={12} style={{ opacity: 0.35 }} />
                  )}
                </div>
              </th>
              <th className="sortable-th" onClick={() => requestSort("email")}>
                <div className="sortable-th-inner">
                  <span>Email Address</span>
                  {sortConfig.key === "email" ? (
                    sortConfig.direction === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                  ) : (
                    <ArrowUpDown size={12} style={{ opacity: 0.35 }} />
                  )}
                </div>
              </th>
              <th className="sortable-th" onClick={() => requestSort("role")}>
                <div className="sortable-th-inner">
                  <span>Access Role</span>
                  {sortConfig.key === "role" ? (
                    sortConfig.direction === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                  ) : (
                    <ArrowUpDown size={12} style={{ opacity: 0.35 }} />
                  )}
                </div>
              </th>
              <th className="sortable-th" onClick={() => requestSort("createdAt")}>
                <div className="sortable-th-inner">
                  <span>Registration Date</span>
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
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px" }}>
                  No users matching search query found.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: "600" }}>{u.name}</td>
                  <td style={{ color: "var(--text-muted)" }}>{u.email}</td>
                  <td>{getRoleBadge(u.role)}</td>
                  <td style={{ color: "var(--text-muted)" }}>
                    {new Date(u.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "8px" }}>
                      <button className="action-icon-btn" onClick={() => openEditUser(u)}>
                        <Edit size={14} /> Edit
                      </button>
                      {u.id !== currentAdmin?.id && (
                        <button
                          className="action-icon-btn danger-hover"
                          onClick={() => setDeleteConfirm({ type: "user", id: u.id, name: u.name })}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      )}
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
        totalItems={sortedUsers.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
