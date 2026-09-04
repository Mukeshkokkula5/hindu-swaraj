"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);

  useEffect(() => {
    // Check if already in standalone/PWA installed mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      return;
    }

    // Check if dismissed recently (within 3 days)
    const dismissedAt = localStorage.getItem("hsy_app_install_dismissed");
    if (dismissedAt && Date.now() - Number(dismissedAt) < 3 * 24 * 60 * 60 * 1000) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleMobile = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleMobile);

    // Android/Chrome beforeinstallprompt listener
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // If on iOS and not standalone, show after a short delay
    let timer;
    if (isAppleMobile && !isStandalone) {
      timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSTip(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSTip(false);
    localStorage.setItem("hsy_app_install_dismissed", String(Date.now()));
  };

  if (!showBanner) return null;

  return (
    <aside
      aria-label="Install App"
      style={{
        position: "fixed",
        bottom: "18px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 28px)",
        maxWidth: "460px",
        background: "linear-gradient(135deg, #1B130E 0%, #2a080a 100%)",
        color: "#ffffff",
        borderRadius: "16px",
        padding: "14px 18px",
        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(212, 160, 23, 0.35)",
        zIndex: 9998,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        animation: "slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              overflow: "hidden",
              border: "1.5px solid #d4a017",
              flexShrink: 0,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src="/images/logo_v2.png"
              alt="Hindu Swaraj"
              width={44}
              height={44}
              style={{ objectFit: "contain" }}
            />
          </div>
          <div>
            <div style={{ fontWeight: "800", fontSize: "0.92rem", color: "#ffffff", lineHeight: 1.2 }}>
              Hindu Swaraj App 🚩
            </div>
            <div style={{ fontSize: "0.74rem", color: "#fbd38d", marginTop: "2px" }}>
              Install on your phone for quick 1-tap access
            </div>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          aria-label="Dismiss app prompt"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "none",
            color: "#cbd5e1",
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>

      {showIOSTip && (
        <div
          style={{
            background: "rgba(212, 160, 23, 0.15)",
            border: "1px dashed #d4a017",
            borderRadius: "8px",
            padding: "8px 12px",
            fontSize: "0.78rem",
            color: "#fef3c7",
            lineHeight: 1.4,
          }}
        >
          📱 <b>To Install on iPhone:</b> Tap Safari's <b>Share</b> button (⎋) at the bottom, then scroll down and select <b>"Add to Home Screen"</b> (➕).
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
        <button
          onClick={handleInstallClick}
          style={{
            flex: 1,
            background: "linear-gradient(135deg, #d4a017 0%, #d97706 100%)",
            color: "#1B130E",
            border: "none",
            borderRadius: "10px",
            padding: "9px 14px",
            fontWeight: "800",
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            boxShadow: "0 4px 12px rgba(212, 160, 23, 0.3)",
          }}
        >
          <span>📲</span>
          <span>{isIOS ? "How to Install on iPhone" : "Install App on Phone"}</span>
        </button>

        <button
          onClick={handleDismiss}
          style={{
            background: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "#e2e8f0",
            borderRadius: "10px",
            padding: "9px 14px",
            fontWeight: "600",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          Later
        </button>
      </div>
    </aside>
  );
}
