"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function AppSplash({ onComplete }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 400);
    }, 1800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      onClick={() => {
        setFading(true);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 200);
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "radial-gradient(circle at 50% 35%, #2a0508 0%, #120102 60%, #080001 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        color: "#ffffff",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
        transform: fading ? "scale(1.04)" : "scale(1)",
        userSelect: "none",
        cursor: "pointer",
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: "absolute",
          width: "320px",
          height: "320px",
          background: "radial-gradient(circle, rgba(212, 160, 23, 0.22) 0%, rgba(216, 88, 24, 0.08) 50%, transparent 70%)",
          filter: "blur(40px)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      {/* Emblem */}
      <div
        style={{
          position: "relative",
          width: "130px",
          height: "130px",
          marginBottom: "20px",
          borderRadius: "50%",
          padding: "5px",
          background: "linear-gradient(135deg, #d4a017 0%, #fef08a 50%, #b45309 100%)",
          boxShadow: "0 0 50px rgba(212, 160, 23, 0.4), 0 10px 30px rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "pulseGlow 2s infinite alternate ease-in-out",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "#ffffff",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            src="/images/logo_v2.png"
            alt="Hindu Swaraj Emblem"
            width={120}
            height={120}
            priority
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>

      {/* Brand Title */}
      <h1
        style={{
          fontSize: "1.75rem",
          fontWeight: "900",
          letterSpacing: "2px",
          color: "#ffffff",
          textAlign: "center",
          margin: "0 0 4px 0",
          textShadow: "0 2px 14px rgba(0,0,0,0.8)",
        }}
      >
        HINDU SWARAJ
      </h1>

      <div
        style={{
          fontSize: "0.72rem",
          fontWeight: "800",
          letterSpacing: "3px",
          color: "#d4a017",
          textTransform: "uppercase",
          marginBottom: "12px",
        }}
      >
        Youth Welfare Association
      </div>

      <div
        style={{
          fontSize: "0.68rem",
          fontWeight: "700",
          color: "#cbd5e1",
          background: "rgba(255, 255, 255, 0.08)",
          padding: "3px 12px",
          borderRadius: "12px",
          border: "1px solid rgba(212, 160, 23, 0.2)",
          marginBottom: "28px",
        }}
      >
        REGD. NO. 784 / 2025 &bull; JAGTIAL
      </div>

      {/* Tilak Motto */}
      <div
        style={{
          maxWidth: "320px",
          textAlign: "center",
          padding: "12px 16px",
          borderTop: "1px solid rgba(212, 160, 23, 0.25)",
          borderBottom: "1px solid rgba(212, 160, 23, 0.25)",
          background: "rgba(0, 0, 0, 0.25)",
          borderRadius: "8px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.85rem",
            color: "#fef08a",
            fontStyle: "italic",
            lineHeight: 1.4,
          }}
        >
          "स्वराज्य हा माझा जन्मसिद्ध हक्क आहे आणि तो मी मिळవणारच!" 🚩
        </p>
      </div>

      {/* Spinner / Loading bar */}
      <div
        style={{
          position: "absolute",
          bottom: "36px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "0.75rem",
          color: "#94a3b8",
        }}
      >
        <div
          style={{
            width: "14px",
            height: "14px",
            border: "2px solid #d4a017",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <span>Launching Control Center...</span>
      </div>

      <style jsx global>{`
        @keyframes pulseGlow {
          0% {
            box-shadow: 0 0 25px rgba(212, 160, 23, 0.3);
          }
          100% {
            box-shadow: 0 0 55px rgba(212, 160, 23, 0.65);
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
