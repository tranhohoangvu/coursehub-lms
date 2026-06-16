import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  AlertTriangle,
  Activity,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export default function Admin() {
  const { user: currentAdmin } = useAuth();
  
  // Data lists state
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  
  // UI Control state
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit User Modal state
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", role: "", password: "" });

  // Add User Modal state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: "", email: "", role: "STUDENT", password: "" });
  
  // Edit Course Modal state
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    price: 0,
    categoryId: "",
    status: "",
    thumbnailUrl: "",
  });

  // Add Course Modal state
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseForm, setNewCourseForm] = useState({
    title: "",
    description: "",
    price: 0,
    categoryId: "",
    status: "DRAFT",
    instructorId: "",
    thumbnailUrl: "",
  });

  // Enroll Student Modal state
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollForm, setEnrollForm] = useState({ userId: "", courseId: "" });

  // Delete Confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState({ type: "", id: "", name: "" });

  // Helper to load all dashboard datasets
  const loadData = () => {
    setLoading(true);
    Promise.all([
      api("/admin/dashboard"),
      api("/admin/users"),
      api("/admin/courses"),
      api("/admin/enrollments"),
      api("/admin/categories"),
      api("/admin/instructors"),
    ])
      .then(([dash, userList, courseList, enrollList, catList, instructorList]) => {
        setDashboard(dash);
        setUsers(userList);
        setCourses(courseList);
        setEnrollments(enrollList);
        setCategories(catList);
        setInstructors(instructorList);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Show auto-dismissing success banner
  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  // ----------------------------------------
  // User Actions
  // ----------------------------------------
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const created = await api("/admin/users", {
        method: "POST",
        body: JSON.stringify(newUserForm),
      });

      setUsers((prev) => [created, ...prev]);
      setShowAddUserModal(false);
      setNewUserForm({ name: "", email: "", role: "STUDENT", password: "" });
      triggerSuccess(`Successfully created user: ${created.name}`);

      // reload dashboard stats in case roles changed counts
      const dash = await api("/admin/dashboard");
      setDashboard(dash);

      // reload instructors list if role is instructor/admin
      if (created.role === "INSTRUCTOR" || created.role === "ADMIN") {
        const instructorList = await api("/admin/instructors");
        setInstructors(instructorList);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const openEditUser = (user) => {
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, role: user.role, password: "" });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const payload = { ...userForm };
      if (!payload.password) delete payload.password; // do not update if empty
      
      const updated = await api(`/admin/users/${editingUser.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setEditingUser(null);
      triggerSuccess(`Successfully updated user ${updated.name}`);
      
      // reload dashboard stats and instructors list
      const [dash, instructorList] = await Promise.all([
        api("/admin/dashboard"),
        api("/admin/instructors")
      ]);
      setDashboard(dash);
      setInstructors(instructorList);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      setError("");
      await api(`/admin/users/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== id));
      // update enrollments and courses lists since foreign keys cascade delete
      setEnrollments((prev) => prev.filter((e) => e.userId !== id));
      setCourses((prev) => prev.filter((c) => c.instructorId !== id));
      setDeleteConfirm({ type: "", id: "", name: "" });
      triggerSuccess("Successfully deleted user and all their associated data");
      
      // refresh stats and instructors
      const [dash, instructorList] = await Promise.all([
        api("/admin/dashboard"),
        api("/admin/instructors")
      ]);
      setDashboard(dash);
      setInstructors(instructorList);
    } catch (err) {
      setError(err.message);
    }
  };

  // ----------------------------------------
  // Course Actions
  // ----------------------------------------
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourseForm.instructorId) return setError("Please select an instructor");
    try {
      setError("");
      const created = await api("/admin/courses", {
        method: "POST",
        body: JSON.stringify(newCourseForm),
      });

      setCourses((prev) => [created, ...prev]);
      setShowAddCourseModal(false);
      setNewCourseForm({
        title: "",
        description: "",
        price: 0,
        categoryId: "",
        status: "DRAFT",
        instructorId: "",
        thumbnailUrl: "",
      });
      triggerSuccess(`Successfully created course: "${created.title}"`);

      // reload dashboard stats
      const dash = await api("/admin/dashboard");
      setDashboard(dash);
    } catch (err) {
      setError(err.message);
    }
  };

  const openEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      price: course.price,
      categoryId: course.categoryId || "",
      status: course.status,
      thumbnailUrl: course.thumbnailUrl || "",
    });
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const updated = await api(`/courses/${editingCourse.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...courseForm,
          categoryId: courseForm.categoryId || null,
        }),
      });

      setCourses((prev) =>
        prev.map((c) =>
          c.id === updated.id
            ? {
                ...c,
                ...updated,
                categoryName: categories.find((cat) => cat.id === updated.categoryId)?.name || "General",
              }
            : c
        )
      );
      setEditingCourse(null);
      triggerSuccess(`Successfully updated course "${updated.title}"`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCourse = async (id) => {
    try {
      setError("");
      await api(`/admin/courses/${id}`, { method: "DELETE" });
      setCourses((prev) => prev.filter((c) => c.id !== id));
      setEnrollments((prev) => prev.filter((e) => e.courseId !== id));
      setDeleteConfirm({ type: "", id: "", name: "" });
      triggerSuccess("Successfully deleted course");
      
      // refresh stats
      const dash = await api("/admin/dashboard");
      setDashboard(dash);
    } catch (err) {
      setError(err.message);
    }
  };

  // ----------------------------------------
  // Enrollment Actions
  // ----------------------------------------
  const handleCreateEnrollment = async (e) => {
    e.preventDefault();
    if (!enrollForm.userId || !enrollForm.courseId) return setError("Please select a student and a course");
    try {
      setError("");
      await api("/admin/enrollments", {
        method: "POST",
        body: JSON.stringify(enrollForm),
      });

      // reload enrollments to fetch with student & course details
      const enrollList = await api("/admin/enrollments");
      setEnrollments(enrollList);
      setShowEnrollModal(false);
      setEnrollForm({ userId: "", courseId: "" });
      triggerSuccess("Student enrolled successfully");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteEnrollment = async (id) => {
    try {
      setError("");
      await api(`/admin/enrollments/${id}`, { method: "DELETE" });
      setEnrollments((prev) => prev.filter((e) => e.id !== id));
      setDeleteConfirm({ type: "", id: "", name: "" });
      triggerSuccess("Student disenrolled successfully");
    } catch (err) {
      setError(err.message);
    }
  };

  // ----------------------------------------
  // Filter search results
  // ----------------------------------------
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.instructorName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.categoryName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEnrollments = enrollments.filter(
    (e) =>
      (e.userName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.userEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.courseTitle || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to get role badge color styling
  const getRoleBadge = (role) => {
    switch (role) {
      case "ADMIN":
        return <span className="badge admin">Admin</span>;
      case "INSTRUCTOR":
        return <span className="badge instructor">Instructor</span>;
      default:
        return <span className="badge" style={{ background: "#e2e8f0", color: "#334155" }}>Student</span>;
    }
  };

  // Helper to get course status badge style
  const getStatusBadge = (status) => {
    switch (status) {
      case "PUBLISHED":
        return <span className="badge success">Published</span>;
      case "DRAFT":
        return <span className="badge" style={{ background: "#cbd5e1", color: "#1e293b" }}>Draft</span>;
      case "BLOCKED":
        return <span className="badge" style={{ background: "#fecaca", color: "#991b1b" }}>Blocked</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  // Reset search filter when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");
  };

  // Standard modal overlay style
  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.4)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    animation: "fadeIn 0.2s ease-out",
  };

  // Standard modal dialog style
  const modalContentStyle = {
    background: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: "32px",
    width: "100%",
    maxWidth: "520px",
    boxShadow: "var(--shadow-xl)",
    animation: "slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    maxHeight: "90vh",
    overflowY: "auto",
  };

  if (loading && !dashboard) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-muted)" }}>
        <div style={{ display: "inline-block", width: "40px", height: "40px", border: "4px solid var(--border-color)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "16px" }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <p>Loading administration panel...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Styles Injection */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .tab-btn {
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          border-radius: var(--radius-md);
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: var(--transition-smooth);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .tab-btn.active {
          background: var(--primary-light);
          color: var(--primary);
        }
        .tab-btn:hover:not(.active) {
          background: var(--bg-surface);
          color: var(--text-main);
          box-shadow: var(--shadow-sm);
        }
        .action-icon-btn {
          border: 1px solid var(--border-color);
          background: var(--bg-surface);
          color: var(--text-muted);
          padding: 8px 12px;
          border-radius: var(--radius-md);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          transition: var(--transition-smooth);
        }
        .action-icon-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: var(--primary-light);
        }
        .action-icon-btn.danger-hover:hover {
          border-color: var(--danger);
          color: var(--danger);
          background: var(--danger-light);
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "8px" }}>
        <div>
          <h1 style={{ marginBottom: "4px" }}>System Management</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Full administrative authority over platform profiles, course inventory, and student enrollments.
          </p>
        </div>
      </div>

      {/* Message Alerts */}
      {successMsg && (
        <div className="success" style={{ margin: "20px 0", animation: "fadeIn 0.3s ease" }}>
          <CheckCircle2 size={18} />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="error" style={{ margin: "20px 0", animation: "fadeIn 0.3s ease" }}>
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {/* Nav Tabs */}
      <div className="tabs-container" style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "24px", overflowX: "auto" }}>
        <button className={`tab-btn ${activeTab === "overview" ? "active" : ""}`} onClick={() => handleTabChange("overview")}>
          <LayoutDashboard size={16} /> Overview
        </button>
        <button className={`tab-btn ${activeTab === "users" ? "active" : ""}`} onClick={() => handleTabChange("users")}>
          <Users size={16} /> Users ({users.length})
        </button>
        <button className={`tab-btn ${activeTab === "courses" ? "active" : ""}`} onClick={() => handleTabChange("courses")}>
          <BookOpen size={16} /> Courses ({courses.length})
        </button>
        <button className={`tab-btn ${activeTab === "enrollments" ? "active" : ""}`} onClick={() => handleTabChange("enrollments")}>
          <GraduationCap size={16} /> Enrollments ({enrollments.length})
        </button>
      </div>

      {/* Search filter for tables */}
      {activeTab !== "overview" && (
        <div style={{ position: "relative", marginBottom: "20px", maxWidth: "400px" }}>
          <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} size={16} />
          <input
            className="input"
            style={{ paddingLeft: "36px", height: "42px" }}
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div>
          {/* Stats Cards */}
          <div className="grid" style={{ marginBottom: "40px" }}>
            <div className="card" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ padding: "12px", background: "rgba(79, 70, 229, 0.1)", color: "var(--primary)", borderRadius: "var(--radius-md)", display: "flex" }}>
                <Users size={24} />
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", fontWeight: "600", textTransform: "uppercase" }}>Total Users</span>
                <span style={{ fontSize: "28px", fontWeight: "800" }}>{dashboard?.totalUsers}</span>
              </div>
            </div>

            <div className="card" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ padding: "12px", background: "rgba(124, 58, 237, 0.1)", color: "#7c3aed", borderRadius: "var(--radius-md)", display: "flex" }}>
                <BookOpen size={24} />
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", fontWeight: "600", textTransform: "uppercase" }}>Total Courses</span>
                <span style={{ fontSize: "28px", fontWeight: "800" }}>{dashboard?.totalCourses}</span>
              </div>
            </div>

            <div className="card" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ padding: "12px", background: "rgba(16, 185, 129, 0.1)", color: "var(--success)", borderRadius: "var(--radius-md)", display: "flex" }}>
                <GraduationCap size={24} />
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", fontWeight: "600", textTransform: "uppercase" }}>Paid Orders</span>
                <span style={{ fontSize: "28px", fontWeight: "800" }}>{dashboard?.paidOrders}</span>
              </div>
            </div>

            <div className="card" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ padding: "12px", background: "rgba(245, 158, 11, 0.1)", color: "var(--warning)", borderRadius: "var(--radius-md)", display: "flex" }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", fontWeight: "600", textTransform: "uppercase" }}>Revenue</span>
                <span style={{ fontSize: "20px", fontWeight: "800", color: "var(--warning)", display: "block" }}>
                  {(dashboard?.revenue || 0).toLocaleString("vi-VN")} VND
                </span>
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="detail-grid">
            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Activity size={18} className="text-primary" /> Recent Activity Status
              </h3>
              <p>Platform status is operational. All APIs are working properly. Database is actively connected.</p>
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button className="btn" onClick={() => handleTabChange("users")}>Manage Users</button>
                <button className="btn secondary" onClick={() => handleTabChange("courses")}>Manage Courses</button>
              </div>
            </div>
            <div className="card">
              <h3 style={{ marginBottom: "12px" }}>System Information</h3>
              <ul style={{ listStyleType: "none", fontSize: "14px", display: "grid", gap: "8px" }}>
                <li><strong>Node.JS Environment:</strong> Production</li>
                <li><strong>Database Engine:</strong> Supabase PostgreSQL</li>
                <li><strong>Admin Account:</strong> {currentAdmin?.email}</li>
                <li><strong>System Time:</strong> {new Date().toLocaleDateString("vi-VN")}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS */}
      {activeTab === "users" && (
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
                  <th>Name</th>
                  <th>Email Address</th>
                  <th>Access Role</th>
                  <th>Registration Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px" }}>
                      No users matching search query found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: "600" }}>{u.name}</td>
                      <td style={{ color: "var(--text-muted)" }}>{u.email}</td>
                      <td>{getRoleBadge(u.role)}</td>
                      <td style={{ color: "var(--text-muted)" }}>
                        {new Date(u.createdAt).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })}
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
        </div>
      )}

      {/* TAB 3: COURSES */}
      {activeTab === "courses" && (
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
                  <th>Title</th>
                  <th>Instructor</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px" }}>
                      No courses matching search query found.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: "600", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.title}
                      </td>
                      <td style={{ color: "var(--text-muted)" }}>{c.instructorName || "Unknown"}</td>
                      <td>
                        <span className="badge" style={{ background: "#e0e7ff", color: "#312e81" }}>
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
        </div>
      )}

      {/* TAB 4: ENROLLMENTS */}
      {activeTab === "enrollments" && (
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
                  <th>Student Name</th>
                  <th>Student Email</th>
                  <th>Course Title</th>
                  <th>Enrollment Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px" }}>
                      No enrollment records matching search query found.
                    </td>
                  </tr>
                ) : (
                  filteredEnrollments.map((e) => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: "600" }}>{e.userName}</td>
                      <td style={{ color: "var(--text-muted)" }}>{e.userEmail}</td>
                      <td style={{ fontWeight: "500", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {e.courseTitle}
                      </td>
                      <td style={{ color: "var(--text-muted)" }}>
                        {new Date(e.createdAt).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })}
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
        </div>
      )}

      {/* ======================================== */}
      {/* MODAL DIALOGS */}
      {/* ======================================== */}

      {/* ADD USER MODAL */}
      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ margin: 0 }}>Add New User Account</h3>
              <button
                style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}
                onClick={() => setShowAddUserModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <form className="form" onSubmit={handleCreateUser} style={{ width: "100%" }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="input"
                  required
                  placeholder="e.g. Harry Potter"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="input"
                  type="email"
                  required
                  placeholder="e.g. harry@hogwarts.edu"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role Access Privilege</label>
                <select
                  className="input"
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm((prev) => ({ ...prev, role: e.target.value }))}
                >
                  <option value="STUDENT">Student</option>
                  <option value="INSTRUCTOR">Instructor</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="input"
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm((prev) => ({ ...prev, password: e.target.value }))}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "16px" }}>
                <button type="button" className="btn secondary" onClick={() => setShowAddUserModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ margin: 0 }}>Edit User Profile</h3>
              <button
                style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}
                onClick={() => setEditingUser(null)}
              >
                <X size={20} />
              </button>
            </div>
            
            <form className="form" onSubmit={handleUpdateUser} style={{ width: "100%" }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="input"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="input"
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role Access Privilege</label>
                {editingUser.role === "ADMIN" ? (
                  <input className="input" disabled value="Admin" />
                ) : (
                  <select
                    className="input"
                    value={userForm.role}
                    onChange={(e) => setUserForm((prev) => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="INSTRUCTOR">Instructor</option>
                  </select>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Update Password (optional)</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Leave empty to keep current password"
                  value={userForm.password}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "16px" }}>
                <button type="button" className="btn secondary" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD COURSE MODAL */}
      {showAddCourseModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ margin: 0 }}>Add New Course</h3>
              <button
                style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}
                onClick={() => setShowAddCourseModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <form className="form" onSubmit={handleCreateCourse} style={{ width: "100%" }}>
              <div className="form-group">
                <label className="form-label">Course Title</label>
                <input
                  className="input"
                  required
                  placeholder="e.g. Advanced Golang Programming"
                  value={newCourseForm.title}
                  onChange={(e) => setNewCourseForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="input"
                  required
                  placeholder="Enter detailed course overview here..."
                  value={newCourseForm.description}
                  onChange={(e) => setNewCourseForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Price (VND)</label>
                  <input
                    className="input"
                    type="number"
                    required
                    min={0}
                    value={newCourseForm.price}
                    onChange={(e) => setNewCourseForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="input"
                    value={newCourseForm.status}
                    onChange={(e) => setNewCourseForm((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Instructor</label>
                <select
                  className="input"
                  required
                  value={newCourseForm.instructorId}
                  onChange={(e) => setNewCourseForm((prev) => ({ ...prev, instructorId: e.target.value }))}
                >
                  <option value="">-- Select Instructor --</option>
                  {instructors.map((ins) => (
                    <option key={ins.id} value={ins.id}>
                      {ins.name} ({ins.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="input"
                  value={newCourseForm.categoryId}
                  onChange={(e) => setNewCourseForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                >
                  <option value="">General</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Thumbnail URL</label>
                <input
                  className="input"
                  placeholder="https://images.unsplash.com/... or leave blank"
                  value={newCourseForm.thumbnailUrl}
                  onChange={(e) => setNewCourseForm((prev) => ({ ...prev, thumbnailUrl: e.target.value }))}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "16px" }}>
                <button type="button" className="btn secondary" onClick={() => setShowAddCourseModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn">
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COURSE MODAL */}
      {editingCourse && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ margin: 0 }}>Edit Course</h3>
              <button
                style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}
                onClick={() => setEditingCourse(null)}
              >
                <X size={20} />
              </button>
            </div>
            
            <form className="form" onSubmit={handleUpdateCourse} style={{ width: "100%" }}>
              <div className="form-group">
                <label className="form-label">Course Title</label>
                <input
                  className="input"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="input"
                  required
                  value={courseForm.description}
                  onChange={(e) => setCourseForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Price (VND)</label>
                  <input
                    className="input"
                    type="number"
                    required
                    min={0}
                    value={courseForm.price}
                    onChange={(e) => setCourseForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="input"
                    value={courseForm.status}
                    onChange={(e) => setCourseForm((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="input"
                  value={courseForm.categoryId}
                  onChange={(e) => setCourseForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                >
                  <option value="">General</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Thumbnail URL</label>
                <input
                  className="input"
                  value={courseForm.thumbnailUrl}
                  onChange={(e) => setCourseForm((prev) => ({ ...prev, thumbnailUrl: e.target.value }))}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "16px" }}>
                <button type="button" className="btn secondary" onClick={() => setEditingCourse(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENROLL STUDENT MODAL */}
      {showEnrollModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ margin: 0 }}>Enroll Student in Course</h3>
              <button
                style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}
                onClick={() => setShowEnrollModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <form className="form" onSubmit={handleCreateEnrollment} style={{ width: "100%" }}>
              <div className="form-group">
                <label className="form-label">Select Student</label>
                <select
                  className="input"
                  required
                  value={enrollForm.userId}
                  onChange={(e) => setEnrollForm((prev) => ({ ...prev, userId: e.target.value }))}
                >
                  <option value="">-- Choose student profile --</option>
                  {users
                    .filter((u) => u.role === "STUDENT")
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Course</label>
                <select
                  className="input"
                  required
                  value={enrollForm.courseId}
                  onChange={(e) => setEnrollForm((prev) => ({ ...prev, courseId: e.target.value }))}
                >
                  <option value="">-- Choose course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.instructorName || "Unknown"})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "16px" }}>
                <button type="button" className="btn secondary" onClick={() => setShowEnrollModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn">
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm.type && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <h3 style={{ marginTop: 0, color: "var(--danger)", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={20} /> Confirm Deletion
            </h3>
            <p style={{ margin: "16px 0", color: "var(--text-muted)" }}>
              Are you sure you want to delete this {deleteConfirm.type} : <strong>{deleteConfirm.name}</strong>?
              {deleteConfirm.type === "user" && " This action will cascade and delete all their uploaded courses, reviews, progress, and cart data."}
              {deleteConfirm.type === "course" && " This action will cascade and delete all associated student enrollments, lessons, reviews, and progression."}
              This action is permanent and cannot be undone.
            </p>
            
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                className="btn secondary"
                onClick={() => setDeleteConfirm({ type: "", id: "", name: "" })}
              >
                Cancel
              </button>
              <button
                className="btn danger"
                onClick={() => {
                  if (deleteConfirm.type === "user") handleDeleteUser(deleteConfirm.id);
                  if (deleteConfirm.type === "course") handleDeleteCourse(deleteConfirm.id);
                  if (deleteConfirm.type === "enrollment") handleDeleteEnrollment(deleteConfirm.id);
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
