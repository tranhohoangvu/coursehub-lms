import React, { useEffect, useRef, useState } from "react";

export default function NumberTicker({
  value,
  prefix = "",
  suffix = "",
  duration = 1400,
  decimals = null,
  className = "",
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const elementRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  // Parse numeric target
  const targetNumber = typeof value === "string" ? parseFloat(value) : Number(value);
  const targetDecimals =
    decimals !== null
      ? decimals
      : String(value).includes(".")
      ? String(value).split(".")[1].length
      : 0;

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          startAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [value]);

  const startAnimation = () => {
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic curve
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = easeOut * targetNumber;

      setDisplayValue(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetNumber);
      }
    };

    requestAnimationFrame(animate);
  };

  const formatted =
    targetDecimals > 0
      ? displayValue.toFixed(targetDecimals)
      : Math.round(displayValue).toString();

  return (
    <span ref={elementRef} className={`tnum ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
