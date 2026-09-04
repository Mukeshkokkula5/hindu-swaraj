"use client";

export default function MobileAppBottomNav({ activeTab, setActiveTab, onOpenMenu, hasTabAccess, pendingDuesCount = 0 }) {
  const tabs = [
    { key: "overview", label: "Home", icon: "🏠" },
    { key: "subscriptions", label: "Finance", icon: "💳", badge: pendingDuesCount > 0 ? pendingDuesCount : null },
    { key: "blood_seva", label: "Seva", icon: "🩸" },
    { key: "members", label: "Directory", icon: "👥" },
    { key: "menu", label: "Menu", icon: "☰" },
  ];

  return (
    <nav
      className="mobileAppBottomNav"
      aria-label="Mobile Bottom Navigation"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 990,
        background: "rgba(18, 2, 4, 0.92)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(212, 160, 23, 0.3)",
        boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "8px 10px calc(8px + env(safe-area-inset-bottom, 0px)) 10px",
      }}
    >
      {tabs.map((t) => {
        const isMenu = t.key === "menu";
        const isActive =
          t.key === activeTab ||
          (t.key === "subscriptions" && ["funds", "donations", "expenses", "reports", "member_credit_loans"].includes(activeTab)) ||
          (t.key === "blood_seva" && ["volunteers", "aapadbandhava", "complaints", "suggestions"].includes(activeTab)) ||
          (t.key === "members" && ["meetings", "elections"].includes(activeTab));

        return (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              if (isMenu) {
                if (onOpenMenu) onOpenMenu();
              } else {
                setActiveTab(t.key);
              }
            }}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px",
              padding: "6px 2px",
              borderRadius: "10px",
              cursor: "pointer",
              position: "relative",
              color: isActive ? "#d4a017" : "rgba(255, 255, 255, 0.65)",
              transition: "all 0.2s ease",
            }}
          >
            {/* Active glow pill */}
            {isActive && (
              <div
                style={{
                  position: "absolute",
                  top: "-8px",
                  width: "24px",
                  height: "3px",
                  borderRadius: "2px",
                  background: "#d4a017",
                  boxShadow: "0 0 10px #d4a017",
                }}
              />
            )}

            <div style={{ position: "relative", fontSize: "1.25rem", lineHeight: 1 }}>
              {t.icon}
              {t.badge && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-10px",
                    background: "#ea580c",
                    color: "#ffffff",
                    fontSize: "0.62rem",
                    fontWeight: "900",
                    padding: "1px 5px",
                    borderRadius: "10px",
                    border: "1px solid #ffffff",
                  }}
                >
                  {t.badge}
                </span>
              )}
            </div>

            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: isActive ? "800" : "600",
                letterSpacing: "0.3px",
              }}
            >
              {t.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
