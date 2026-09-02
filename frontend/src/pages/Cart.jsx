import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  Sparkles,
  Lock,
  ArrowLeft,
  CreditCard
} from "lucide-react";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponAppliedMsg, setCouponAppliedMsg] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  async function loadCart() {
    const data = await api("/cart");
    setCart(data);
  }

  useEffect(() => {
    loadCart().catch((err) => setError(err.message));
  }, []);

  async function removeItem(courseId) {
    try {
      await api(`/cart/items/${courseId}`, { method: "DELETE" });
      loadCart();
    } catch (err) {
      setError(err.message);
    }
  }

  async function checkout() {
    try {
      setIsCheckingOut(true);
      setError("");
      setMessage("");
      const order = await api("/orders/checkout", { method: "POST" });
      setMessage(`Payment and enrollment successful! Order Reference #${order.id}`);
      loadCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCheckingOut(false);
    }
  }

  function handleApplyCoupon(e) {
    e.preventDefault();
    if (couponCode.toUpperCase().trim() === "DISCOUNT50" || couponCode.toUpperCase().trim() === "COURSEHUB") {
      setDiscountPercent(50);
      setCouponAppliedMsg("Coupon code applied! 50% discount active.");
    } else if (couponCode.trim()) {
      setDiscountPercent(20);
      setCouponAppliedMsg("Welcome promo applied! 20% discount active.");
    }
  }

  if (!cart) {
    return (
      <div style={{ textAlign: "center", padding: "100px 24px", color: "var(--text-muted)" }}>
        <div
          style={{
            display: "inline-block",
            width: "44px",
            height: "44px",
            border: "4px solid var(--border-color)",
            borderTopColor: "var(--primary)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "16px"
          }}
        ></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <p style={{ fontWeight: "600" }}>Loading your shopping cart...</p>
      </div>
    );
  }

  const rawTotal = cart.items.reduce((sum, item) => sum + Number(item.course.price || 0), 0);
  const discountAmount = Math.round((rawTotal * discountPercent) / 100);
  const finalTotal = Math.max(0, rawTotal - discountAmount);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: "0 0 6px 0", fontSize: "28px", fontWeight: "800", letterSpacing: "-0.6px" }}>
          Shopping Cart
        </h1>
        <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>
          Review your selected courses before completing your enrollment.
        </p>
      </div>

      {error && <div className="error" style={{ marginBottom: "24px" }}>{error}</div>}
      {message && (
        <div
          style={{
            background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
            border: "1px solid #10b981",
            color: "#065f46",
            padding: "20px 24px",
            borderRadius: "var(--radius-lg)",
            marginBottom: "28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <CheckCircle2 size={24} style={{ color: "#10b981" }} />
            <div>
              <strong style={{ display: "block", fontSize: "15px" }}>{message}</strong>
              <span style={{ fontSize: "13px" }}>You now have lifetime access to your newly enrolled courses.</span>
            </div>
          </div>
          <Link to="/my-courses" className="btn success" style={{ padding: "8px 18px", fontSize: "13.5px" }}>
            Start Learning Now <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {cart.items.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "64px 24px", maxWidth: "560px", margin: "0 auto" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "var(--primary-light)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px auto"
            }}
          >
            <ShoppingCart size={30} />
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "8px" }}>Your cart is empty</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px", lineHeight: "1.6" }}>
            Explore our cutting-edge catalog and add top-tier developer courses to your playlist.
          </p>
          <Link className="btn btn-glow" to="/">
            <Sparkles size={16} /> Explore Courses
          </Link>
        </div>
      ) : (
        <div className="detail-grid">
          {/* Cart Items List */}
          <div style={{ display: "grid", gap: "16px" }}>
            {cart.items.map((item) => {
              const isFree = Number(item.course.price) === 0;

              return (
                <div
                  className="card cart-item-card"
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center",
                    padding: "20px",
                    transition: "var(--transition-fast)"
                  }}
                >
                  <img
                    src={item.course.thumbnailUrl || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80"}
                    alt={item.course.title}
                    className="cart-item-img"
                    style={{
                      width: "120px",
                      height: "75px",
                      objectFit: "cover",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)",
                      flexShrink: 0
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80";
                    }}
                  />

                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <span className="badge" style={{ fontSize: "10px", padding: "2px 8px", marginBottom: "4px" }}>
                      {item.course.category?.name || "Development"}
                    </span>
                    <Link
                      to={`/courses/${item.courseId}`}
                      style={{ fontWeight: "700", fontSize: "16px", color: "var(--text-main)", display: "block" }}
                      className="hover-primary"
                    >
                      {item.course.title}
                    </Link>
                    <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                      By {item.course.instructor?.name || "Verified Instructor"}
                    </span>
                  </div>

                  <div className="cart-item-actions" style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                    {isFree ? (
                      <span className="price-tag free" style={{ fontSize: "14px" }}>FREE</span>
                    ) : (
                      <span className="price" style={{ fontSize: "17px", fontWeight: "800", color: "var(--text-main)" }}>
                        {Number(item.course.price).toLocaleString("vi-VN")}{" "}
                        <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>VND</span>
                      </span>
                    )}

                    <button
                      className="btn secondary"
                      style={{ padding: "6px 12px", fontSize: "12px", color: "var(--danger)", borderColor: "var(--danger-light)" }}
                      onClick={() => removeItem(item.courseId)}
                      title="Remove from cart"
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Order Summary & Checkout */}
          <div>
            <div className="card" style={{ padding: "28px" }}>
              <h2 style={{ fontSize: "19px", fontWeight: "800", margin: "0 0 18px 0", borderBottom: "1px solid var(--border-color)", paddingBottom: "14px" }}>
                Order Summary
              </h2>

              <div style={{ display: "grid", gap: "12px", fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Original Price ({cart.items.length} items)</span>
                  <span>{rawTotal.toLocaleString("vi-VN")} VND</span>
                </div>

                {discountPercent > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#10b981", fontWeight: "600" }}>
                    <span>Coupon Discount ({discountPercent}%)</span>
                    <span>-{discountAmount.toLocaleString("vi-VN")} VND</span>
                  </div>
                )}

                <div className="divider" style={{ margin: "8px 0" }}></div>

                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-main)", fontWeight: "800", fontSize: "17px" }}>
                  <span>Total Due:</span>
                  <span className="price" style={{ fontSize: "20px" }}>
                    {finalTotal.toLocaleString("vi-VN")} VND
                  </span>
                </div>
              </div>

              {/* Coupon Code Input */}
              <form onSubmit={handleApplyCoupon} style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <Tag size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="text"
                    className="input"
                    style={{ paddingLeft: "36px", height: "40px", fontSize: "13px" }}
                    placeholder="Promo: DISCOUNT50"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn secondary" style={{ height: "40px", padding: "0 14px", fontSize: "13px" }}>
                  Apply
                </button>
              </form>
              {couponAppliedMsg && <p style={{ fontSize: "12px", color: "#10b981", fontWeight: "600", marginTop: "-12px", marginBottom: "16px" }}>{couponAppliedMsg}</p>}

              {/* Proceed to Checkout Button */}
              <button
                className="btn btn-glow"
                style={{ width: "100%", height: "48px", fontSize: "15px" }}
                onClick={checkout}
                disabled={isCheckingOut}
              >
                <CreditCard size={18} />
                {isCheckingOut ? "Processing Payment..." : "Complete Enrollment"}
              </button>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "14px", fontSize: "12px", color: "var(--text-muted)" }}>
                <Lock size={12} />
                <span>256-Bit SSL Encrypted Checkout</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
