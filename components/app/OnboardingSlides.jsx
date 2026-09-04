"use client";
import { useState } from "react";

const SLIDES = [
  {
    icon: "🏛️",
    badge: "DEMOCRATIC GOVERNANCE",
    title: "100% Transparent Financial Audit",
    subtitle: "Real-time fund tracking, balance sheets, and verified statutory resolutions.",
    color: "#d4a017",
    bgGradient: "linear-gradient(135deg, rgba(212, 160, 23, 0.15) 0%, rgba(128, 10, 13, 0.25) 100%)",
  },
  {
    icon: "🩸",
    badge: "24/7 EMERGENCY SEVA",
    title: "Emergency Blood Donor Network",
    subtitle: "Instant voluntary blood matching across Jagtial & Telangana for life-saving crisis calls.",
    color: "#ef4444",
    bgGradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(128, 10, 13, 0.3) 100%)",
  },
  {
    icon: "💳",
    badge: "MONTHLY WELFARE FUND",
    title: "Monthly Member Dues (₹216)",
    subtitle: "Youth Development (50%), Emergency Medical Welfare (30%), and Public Seva (20%).",
    color: "#10b981",
    bgGradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(128, 10, 13, 0.25) 100%)",
  },
  {
    icon: "🪪",
    badge: "DIGITAL IDENTITY",
    title: "Official Verified Member PVC Card",
    subtitle: "Encrypted QR verification for official duties, meetings, and statutory election voting.",
    color: "#3b82f6",
    bgGradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(128, 10, 13, 0.25) 100%)",
  },
];

export default function OnboardingSlides({ onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const current = SLIDES[currentIndex];

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99990,
        background: "radial-gradient(circle at 50% 20%, #200406 0%, #0d0102 70%, #000 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "24px 20px",
        color: "#ffffff",
        overflow: "hidden",
      }}
    >
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "1.2rem" }}>🚩</span>
          <span style={{ fontSize: "0.82rem", fontWeight: "800", letterSpacing: "1px", color: "#d4a017" }}>
            HINDU SWARAJ
          </span>
        </div>
        <button
          onClick={onFinish}
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#cbd5e1",
            padding: "5px 14px",
            borderRadius: "20px",
            fontSize: "0.78rem",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Skip Intro
        </button>
      </div>

      {/* Main Slide Card (Glassmorphic) */}
      <div
        key={currentIndex}
        style={{
          background: "rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(212, 160, 23, 0.3)",
          borderRadius: "24px",
          padding: "36px 24px",
          textAlign: "center",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
          position: "relative",
          animation: "fadeInSlide 0.35s ease-out",
        }}
      >
        {/* Glow ambient circle inside card */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "200px",
            height: "200px",
            background: current.bgGradient,
            filter: "blur(40px)",
            borderRadius: "50%",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 20px",
              borderRadius: "20px",
              background: "rgba(255, 255, 255, 0.08)",
              border: `2px solid ${current.color}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.4rem",
              boxShadow: `0 8px 24px ${current.color}33`,
            }}
          >
            {current.icon}
          </div>

          <div
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "0.68rem",
              fontWeight: "800",
              letterSpacing: "1px",
              color: current.color,
              background: `${current.color}18`,
              border: `1px solid ${current.color}44`,
              marginBottom: "12px",
            }}
          >
            {current.badge}
          </div>

          <h2
            style={{
              fontSize: "1.45rem",
              fontWeight: "900",
              color: "#ffffff",
              marginBottom: "10px",
              lineHeight: 1.25,
            }}
          >
            {current.title}
          </h2>

          <p
            style={{
              fontSize: "0.88rem",
              color: "#cbd5e1",
              lineHeight: 1.5,
              margin: "0 auto",
              maxWidth: "320px",
            }}
          >
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Footer Navigation: Dots & Buttons */}
      <div>
        {/* Dot Indicators */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "20px" }}>
          {SLIDES.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrentIndex(i)}
              style={{
                width: currentIndex === i ? "24px" : "8px",
                height: "8px",
                borderRadius: "4px",
                background: currentIndex === i ? "#d4a017" : "rgba(255, 255, 255, 0.2)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              style={{
                padding: "12px 18px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#e2e8f0",
                fontSize: "0.88rem",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Back
            </button>
          )}

          <button
            onClick={handleNext}
            style={{
              flex: 1,
              padding: "14px 20px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #d4a017 0%, #b45309 100%)",
              border: "none",
              color: "#120102",
              fontSize: "0.92rem",
              fontWeight: "900",
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(212, 160, 23, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span>{currentIndex === SLIDES.length - 1 ? "Sign In to NGO Desk" : "Continue"}</span>
            <span>➔</span>
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
