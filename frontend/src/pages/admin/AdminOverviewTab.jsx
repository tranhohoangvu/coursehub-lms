import { Users, BookOpen, GraduationCap, TrendingUp, BarChart3 } from "lucide-react";

export default function AdminOverviewTab({
  dashboard,
  monthlyChartData,
  maxMonthlyRevenue,
  users,
  courses,
  enrollments,
  setActiveTab,
}) {
  return (
    <div>
      {/* Stats Cards */}
      <div className="grid" style={{ marginBottom: "32px" }}>
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

      {/* CSS Bar Chart: Revenue Trends */}
      <div className="card" style={{ padding: "28px", marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <BarChart3 size={20} style={{ color: "var(--primary)" }} />
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>Monthly Revenue Analytics</h3>
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
              Tuition gross revenue volume across the last 6 months
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "12px", color: "var(--text-muted)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "linear-gradient(180deg, var(--primary) 0%, #818cf8 100%)" }} />
              <span>Gross Volume (VND)</span>
            </div>
          </div>
        </div>

        <div className="css-bar-chart">
          {monthlyChartData.map((d, i) => {
            const pct = maxMonthlyRevenue > 0 ? Math.max(8, Math.round((d.revenue / maxMonthlyRevenue) * 100)) : 10;
            return (
              <div key={i} className="chart-col">
                <div className="chart-tooltip">
                  {d.revenue.toLocaleString("vi-VN")} VND · {d.orders} orders
                </div>
                <div className="chart-bar-fill" style={{ height: `${pct}%` }} />
                <span className="chart-col-label">{d.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Summary Split */}
      <div className="detail-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Recent Enrollments */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "800" }}>Recent Enrollments</h4>
            <button className="btn secondary" style={{ fontSize: "12px", padding: "4px 10px" }} onClick={() => setActiveTab("enrollments")}>
              View All
            </button>
          </div>
          <div style={{ display: "grid", gap: "12px" }}>
            {enrollments.slice(0, 4).map((e) => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border-color)", fontSize: "13px" }}>
                <div>
                  <strong style={{ display: "block" }}>{e.userName}</strong>
                  <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>{e.courseTitle}</span>
                </div>
                <span style={{ color: "var(--text-light)", fontSize: "11px" }}>
                  {new Date(e.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Active Courses */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "800" }}>Top Catalog Courses</h4>
            <button className="btn secondary" style={{ fontSize: "12px", padding: "4px 10px" }} onClick={() => setActiveTab("courses")}>
              Manage Courses
            </button>
          </div>
          <div style={{ display: "grid", gap: "12px" }}>
            {courses.slice(0, 4).map((c) => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border-color)", fontSize: "13px" }}>
                <div>
                  <strong style={{ display: "block" }}>{c.title}</strong>
                  <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>By {c.instructorName || "Admin"}</span>
                </div>
                <span style={{ fontWeight: "700", color: "var(--primary)" }}>
                  {c.price === 0 ? "FREE" : `${Number(c.price).toLocaleString("vi-VN")} VND`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
