export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-thumb" />
      <div className="skeleton-body">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="skeleton skeleton-line short" />
          <div className="skeleton skeleton-line" style={{ width: "20%" }} />
        </div>
        <div className="skeleton skeleton-line tall full" />
        <div className="skeleton skeleton-line medium" />
        <div className="skeleton skeleton-line full" />
        <div className="skeleton skeleton-line short" style={{ marginTop: "4px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
          <div className="skeleton skeleton-line" style={{ width: "30%", height: "24px" }} />
          <div className="skeleton skeleton-line" style={{ width: "25%", height: "36px", borderRadius: "14px" }} />
        </div>
      </div>
    </div>
  );
}
