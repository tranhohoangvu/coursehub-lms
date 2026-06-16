import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadCart() {
    const data = await api("/cart");
    setCart(data);
  }

  useEffect(() => { loadCart().catch((err) => setError(err.message)); }, []);

  async function removeItem(courseId) {
    await api(`/cart/items/${courseId}`, { method: "DELETE" });
    loadCart();
  }

  async function checkout() {
    try {
      setError("");
      const order = await api("/orders/checkout", { method: "POST" });
      setMessage(`Checkout successful! Order ID: ${order.id}`);
      loadCart();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!cart) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-muted)" }}>
        <div style={{ display: "inline-block", width: "40px", height: "40px", border: "4px solid var(--border-color)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "16px" }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <p>Loading cart...</p>
      </div>
    );
  }

  const total = cart.items.reduce((sum, item) => sum + item.course.price, 0);

  return (
    <div>
      <h1 style={{ marginBottom: "24px" }}>Shopping Cart</h1>
      
      {error && <p className="error" style={{ marginBottom: "24px" }}>{error}</p>}
      {message && <p className="success" style={{ marginBottom: "24px" }}>{message}</p>}

      {cart.items.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <svg style={{ width: "64px", height: "64px", color: "#cbd5e1", margin: "0 auto 16px auto", display: "block" }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>Your cart is empty</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>Explore our catalog and start adding courses to your learning list.</p>
          <Link className="btn" to="/">Browse Courses</Link>
        </div>
      ) : (
        <div className="detail-grid">
          {/* Cart Items List */}
          <div style={{ display: "grid", gap: "16px" }}>
            {cart.items.map((item) => (
              <div className="card cart-item-card" key={item.id} style={{ display: "flex", gap: "20px", alignItems: "center", padding: "16px" }}>
                <img 
                  src={item.course.thumbnailUrl || "https://placehold.co/600x400?text=Course"} 
                  alt={item.course.title} 
                  className="cart-item-img"
                  style={{ width: "90px", height: "60px", objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}
                />
                <div style={{ flex: 1 }}>
                  <Link to={`/courses/${item.courseId}`} style={{ fontWeight: "700", fontSize: "16px", color: "var(--text-main)" }} className="hover-primary">
                    {item.course.title}
                  </Link>
                  <div style={{ marginTop: "4px" }}>
                    <span className="badge" style={{ fontSize: "10px", padding: "2px 6px" }}>{item.course.category?.name || "General"}</span>
                  </div>
                </div>
                <div className="cart-item-actions" style={{ textAlign: "right" }}>
                  <span className="price" style={{ fontSize: "16px", fontWeight: "700", display: "block", marginBottom: "8px" }}>
                    {item.course.price === 0 ? "Free" : `${item.course.price.toLocaleString("vi-VN")} VND`}
                  </span>
                  <button className="btn danger" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => removeItem(item.courseId)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Checkout Panel */}
          <div className="card" style={{ padding: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 16px 0", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>Order Summary</h2>
            
            <div style={{ display: "grid", gap: "12px", fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Courses ({cart.items.length})</span>
                <span>{total.toLocaleString("vi-VN")} VND</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Discount</span>
                <span>0 VND</span>
              </div>
              <div className="divider" style={{ margin: "10px 0" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-main)", fontWeight: "800", fontSize: "16px" }}>
                <span>Total:</span>
                <span className="price" style={{ fontSize: "18px" }}>{total.toLocaleString("vi-VN")} VND</span>
              </div>
            </div>

            <button className="btn" style={{ width: "100%", height: "46px", fontSize: "15px" }} onClick={checkout}>
              Proceed to Checkout
            </button>
            <div style={{ textAlign: "center", marginTop: "12px", fontSize: "12px", color: "var(--text-muted)" }}>
              Mock checkout. No real money will be charged.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
