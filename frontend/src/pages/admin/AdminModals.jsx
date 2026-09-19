import { X, AlertTriangle } from "lucide-react";

export default function AdminModals({
  showAddUserModal,
  setShowAddUserModal,
  newUserForm,
  setNewUserForm,
  handleCreateUser,

  editingUser,
  setEditingUser,
  userForm,
  setUserForm,
  handleUpdateUser,

  showAddCourseModal,
  setShowAddCourseModal,
  newCourseForm,
  setNewCourseForm,
  handleCreateCourse,
  instructors,
  categories,

  editingCourse,
  setEditingCourse,
  courseForm,
  setCourseForm,
  handleUpdateCourse,

  showEnrollModal,
  setShowEnrollModal,
  enrollForm,
  setEnrollForm,
  handleCreateEnrollment,
  users,
  courses,

  deleteConfirm,
  setDeleteConfirm,
  handleDeleteUser,
  handleDeleteCourse,
  handleDeleteEnrollment,
}) {
  return (
    <>
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
                  placeholder="e.g. Alex Johnson"
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
                  placeholder="e.g. alex@example.com"
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
    </>
  );
}
