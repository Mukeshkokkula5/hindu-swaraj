"use client";

import React, { useState, useEffect } from "react";

export default function AapadbandhavaAdminTab({
  isFullAdmin,
  isAuditor,
  isMember,
  currentUser,
  fetchAPI,
  API_BASE_URL,
}) {
  const [activeMainDesk, setActiveMainDesk] = useState("CASES"); // 'CASES' or 'DONATIONS'

  // Cases State
  const [cases, setCases] = useState([]);
  const [committeeMembers, setCommitteeMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Contributions / Donations Audit State
  const [contributions, setContributions] = useState([]);
  const [contribLoading, setContribLoading] = useState(false);
  const [contribFilter, setContribFilter] = useState("ALL"); // ALL, PENDING_VERIFICATION, APPROVED_DISPATCHED, REJECTED
  const [contribActionLoading, setContribActionLoading] = useState(null);

  // Modals for Cases
  const [assigningCase, setAssigningCase] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  const [reportModalCase, setGroundReportModalCase] = useState(null);
  const [reportText, setReportText] = useState("");
  const [doctorVerified, setDoctorVerified] = useState(true);
  const [billVerified, setBillVerified] = useState(true);
  const [homeVisitDone, setHomeVisitDone] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  const [viewingCase, setViewingCase] = useState(null);
  const [viewDocModal, setViewDocModal] = useState(null);

  const [updateModalCase, setUpdateModalCase] = useState(null);
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateContent, setUpdateContent] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  const [editingAmountCase, setEditingAmountCase] = useState(null);
  const [editRaisedAmount, setEditRaisedAmount] = useState("");
  const [editStatus, setEditStatus] = useState("VERIFIED_ACTIVE");
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    loadAllCases();
    loadAllContributions();
  }, []);

  const loadAllCases = async () => {
    try {
      setLoading(true);
      const res = await fetchAPI("/aapadbandhava/admin/all-cases");
      if (res && res.success) {
        setCases(res.cases || []);
        setCommitteeMembers(res.committeeMembers || []);
      }
    } catch (err) {
      console.error("Failed to load Aapadbandhava cases:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllContributions = async () => {
    try {
      setContribLoading(true);
      const res = await fetchAPI("/aapadbandhava/admin/contributions");
      if (res && res.success) {
        setContributions(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load contributions:", err);
    } finally {
      setContribLoading(false);
    }
  };

  // Handle Verify / Dispatch Certificate
  const handleVerifyContribution = async (contribId, action) => {
    const confirmText =
      action === "APPROVE"
        ? "ఈ దాత సహాయం పేషెంట్ ఖాతాకు చేరినట్లు నిర్ధారించి, అధికారిక సేవా ప్రశంసా పత్రాన్ని WhatsApp & Email కు పంపమంటారా?"
        : "ఈ ఎంట్రీని నకిలీదిగా తిరస్కరించమంటారా (Reject)?";

    if (!confirm(confirmText)) return;

    setContribActionLoading(contribId);
    try {
      const res = await fetchAPI(`/aapadbandhava/admin/verify-contribution/${contribId}`, {
        method: "PUT",
        body: JSON.stringify({ action }),
      });

      alert(res.message || "✅ Action completed successfully!");

      if (action === "APPROVE" && res.whatsapp_url) {
        const openWa = confirm("📲 దాత WhatsApp కు నేరుగా మెసేజ్ పంపడానికి WhatsApp Web / App ఓపెన్ చేయమంటారా?");
        if (openWa) {
          window.open(res.whatsapp_url, "_blank");
        }
      }

      loadAllContributions();
      loadAllCases(); // refresh raised amount on cases
    } catch (err) {
      alert("Failed to process contribution: " + err.message);
    } finally {
      setContribActionLoading(null);
    }
  };

  const handleAssignMember = async (e) => {
    e.preventDefault();
    if (!selectedMemberId || !assigningCase) return;
    setAssignLoading(true);
    try {
      const res = await fetchAPI(`/aapadbandhava/admin/assign/${assigningCase.id}`, {
        method: "PUT",
        body: JSON.stringify({ member_id: Number(selectedMemberId) }),
      });
      alert(res.message || "✅ Member assigned successfully for ground study!");
      setAssigningCase(null);
      setSelectedMemberId("");
      loadAllCases();
    } catch (err) {
      alert("Failed to assign member: " + err.message);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleSubmitGroundReport = async (e) => {
    e.preventDefault();
    if (!reportModalCase || !reportText.trim()) return;
    setReportLoading(true);
    try {
      const res = await fetchAPI(`/aapadbandhava/member/submit-report/${reportModalCase.id}`, {
        method: "PUT",
        body: JSON.stringify({
          verification_report: reportText.trim(),
          doctor_contact_verified: doctorVerified,
          hospital_bill_verified: billVerified,
          home_visit_done: homeVisitDone,
          verified_by_role: currentUser?.role || "Executive Committee Member",
        }),
      });
      alert(res.message || "✅ Ground report submitted successfully!");
      setGroundReportModalCase(null);
      setReportText("");
      loadAllCases();
    } catch (err) {
      alert("Failed to submit report: " + err.message);
    } finally {
      setReportLoading(false);
    }
  };

  const handlePublishCase = async (caseItem) => {
    if (
      !confirm(
        `Are you sure you want to 100% VERIFY & PUBLISH "${caseItem.patient_name}" case LIVE to the public portal?`
      )
    )
      return;

    try {
      const res = await fetchAPI(`/aapadbandhava/admin/verify-publish/${caseItem.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: "VERIFIED_ACTIVE",
          is_featured: true,
        }),
      });
      alert(res.message || "🛡️ Case 100% Verified and published live!");
      loadAllCases();
    } catch (err) {
      alert("Failed to publish case: " + err.message);
    }
  };

  const handleSaveAmountAndStatus = async (e) => {
    e.preventDefault();
    if (!editingAmountCase) return;
    setEditLoading(true);
    try {
      const res = await fetchAPI(`/aapadbandhava/admin/update-status/${editingAmountCase.id}`, {
        method: "PUT",
        body: JSON.stringify({
          amount_raised: Number(editRaisedAmount),
          status: editStatus,
        }),
      });
      alert(res.message || "✅ Status and amount updated successfully!");
      setEditingAmountCase(null);
      loadAllCases();
    } catch (err) {
      alert("Failed to update: " + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddMilestoneUpdate = async (e) => {
    e.preventDefault();
    if (!updateModalCase || !updateTitle || !updateContent) return;
    setUpdateLoading(true);
    try {
      const res = await fetchAPI(`/aapadbandhava/admin/add-case-update/${updateModalCase.id}`, {
        method: "POST",
        body: JSON.stringify({
          update_title: updateTitle,
          update_content: updateContent,
        }),
      });
      alert(res.message || "✅ Recovery update posted successfully!");
      setUpdateModalCase(null);
      setUpdateTitle("");
      setUpdateContent("");
      loadAllCases();
    } catch (err) {
      alert("Failed to post update: " + err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Filter cases
  const filteredCases = cases.filter((c) => {
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      const match =
        c.patient_name?.toLowerCase().includes(s) ||
        c.case_code?.toLowerCase().includes(s) ||
        c.hospital_name?.toLowerCase().includes(s) ||
        c.city?.toLowerCase().includes(s);
      if (!match) return false;
    }
    return true;
  });

  // Filter contributions
  const filteredContributions = contributions.filter((con) => {
    if (contribFilter !== "ALL" && con.status !== contribFilter) return false;
    return true;
  });

  const pendingCount = cases.filter((c) => c.status === "PENDING").length;
  const assignedCount = cases.filter((c) => c.status === "ASSIGNED_FOR_STUDY").length;
  const verifiedActiveCount = cases.filter((c) => c.status === "VERIFIED_ACTIVE").length;
  const closedCount = cases.filter((c) => c.status === "CLOSED_HELPED" || c.status === "GOAL_REACHED").length;

  const pendingContribCount = contributions.filter((con) => con.status === "PENDING_VERIFICATION").length;
  const approvedContribCount = contributions.filter((con) => con.status === "APPROVED_DISPATCHED").length;

  return (
    <div style={{ padding: "10px 0" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #450a0a 100%)",
          borderRadius: "16px",
          padding: "24px 30px",
          color: "#ffffff",
          marginBottom: "20px",
          border: "1px solid rgba(255, 119, 0, 0.3)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255, 119, 0, 0.2)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "800", color: "#ff9933", marginBottom: "8px" }}>
              <span>🛡️ 100% GROUND VERIFICATION &amp; SEVA AUDIT SUITE</span>
            </div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "900", margin: "0 0 6px", color: "#ffffff" }}>
              🚩 ఆపద్బాంధవ – Emergency Aid &amp; Donations Audit Desk
            </h2>
            <p style={{ margin: 0, fontSize: "0.88rem", opacity: 0.9, maxWidth: "700px" }}>
              అత్యవసర కేసుల పరిశీలన మరియు దాతలు పంపిన విరాళాల బ్యాంక్ స్టేట్‌మెంట్ ఆడిట్ చేసి అధికారిక సేవా ప్రశంసా పత్రాలను (WhatsApp &amp; Email) విడుదల చేసే కేంద్రం.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => {
                loadAllCases();
                loadAllContributions();
              }}
              disabled={loading || contribLoading}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "#fff",
                padding: "10px 18px",
                borderRadius: "8px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              🔄 రీఫ్రెష్ (Refresh All)
            </button>
          </div>
        </div>
      </div>

      {/* Main Desk Switcher Tabs */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveMainDesk("CASES")}
          style={{
            padding: "12px 24px",
            borderRadius: "10px",
            border: "none",
            background: activeMainDesk === "CASES" ? "linear-gradient(135deg, #ff7700 0%, #d84315 100%)" : "#ffffff",
            color: activeMainDesk === "CASES" ? "#ffffff" : "#475569",
            fontWeight: "800",
            fontSize: "0.95rem",
            cursor: "pointer",
            boxShadow: activeMainDesk === "CASES" ? "0 4px 14px rgba(255, 119, 0, 0.4)" : "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>🚨 అత్యవసర కేసులు &amp; గ్రౌండ్ ఇన్వెస్టిగేషన్</span>
          <span style={{ background: activeMainDesk === "CASES" ? "rgba(0,0,0,0.25)" : "#e2e8f0", padding: "2px 8px", borderRadius: "12px", fontSize: "0.8rem" }}>
            {cases.length}
          </span>
        </button>

        <button
          onClick={() => setActiveMainDesk("DONATIONS")}
          style={{
            padding: "12px 24px",
            borderRadius: "10px",
            border: "none",
            background: activeMainDesk === "DONATIONS" ? "linear-gradient(135deg, #10b981 0%, #047857 100%)" : "#ffffff",
            color: activeMainDesk === "DONATIONS" ? "#ffffff" : "#475569",
            fontWeight: "800",
            fontSize: "0.95rem",
            cursor: "pointer",
            boxShadow: activeMainDesk === "DONATIONS" ? "0 4px 14px rgba(16, 185, 129, 0.4)" : "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>📜 విరాళాల ఆడిట్ &amp; ప్రశంసా పత్రాల విడుదల</span>
          {pendingContribCount > 0 && (
            <span style={{ background: "#ef4444", color: "#fff", padding: "2px 8px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "900" }}>
              🚨 {pendingContribCount} Pending
            </span>
          )}
        </button>
      </div>

      {/* ================= VIEW 1: CASES DESK ================= */}
      {activeMainDesk === "CASES" ? (
        <>
          {/* Stats Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div style={{ background: "#ffffff", padding: "18px", borderRadius: "12px", border: "1px solid #e2e8f0", borderLeft: "4px solid #ef4444" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64748b" }}>🚨 కొత్త దరఖాస్తులు (Pending Review)</div>
              <div style={{ fontSize: "1.6rem", fontWeight: "900", color: "#ef4444", marginTop: "4px" }}>{pendingCount}</div>
            </div>

            <div style={{ background: "#ffffff", padding: "18px", borderRadius: "12px", border: "1px solid #e2e8f0", borderLeft: "4px solid #f59e0b" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64748b" }}>🔍 గ్రౌండ్ స్టడీ నడుస్తున్నవి (In Progress)</div>
              <div style={{ fontSize: "1.6rem", fontWeight: "900", color: "#f59e0b", marginTop: "4px" }}>{assignedCount}</div>
            </div>

            <div style={{ background: "#ffffff", padding: "18px", borderRadius: "12px", border: "1px solid #e2e8f0", borderLeft: "4px solid #10b981" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64748b" }}>🛡️ 100% వెరిఫైడ్ &amp; లైవ్ (Active)</div>
              <div style={{ fontSize: "1.6rem", fontWeight: "900", color: "#10b981", marginTop: "4px" }}>{verifiedActiveCount}</div>
            </div>

            <div style={{ background: "#ffffff", padding: "18px", borderRadius: "12px", border: "1px solid #e2e8f0", borderLeft: "4px solid #6366f1" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64748b" }}>🏆 సహాయం అందినవి (Closed &amp; Helped)</div>
              <div style={{ fontSize: "1.6rem", fontWeight: "900", color: "#6366f1", marginTop: "4px" }}>{closedCount}</div>
            </div>
          </div>

          {/* Filter Tabs & Search */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
              background: "#ffffff",
              padding: "16px 20px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { id: "ALL", label: `అన్నీ (${cases.length})` },
                { id: "PENDING", label: `🚨 Pending (${pendingCount})` },
                { id: "ASSIGNED_FOR_STUDY", label: `🔍 Assigned (${assignedCount})` },
                { id: "VERIFIED_ACTIVE", label: `🛡️ Verified Live (${verifiedActiveCount})` },
                { id: "CLOSED_HELPED", label: `✅ Closed (${closedCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    background: statusFilter === tab.id ? "#1e293b" : "#f1f5f9",
                    color: statusFilter === tab.id ? "#ffffff" : "#475569",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div>
              <input
                type="text"
                placeholder="🔍 Search patient, hospital, code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.85rem",
                  width: "240px",
                }}
              />
            </div>
          </div>

          {/* Cases List */}
          {filteredCases.length === 0 ? (
            <div style={{ background: "#ffffff", padding: "40px", textAlign: "center", borderRadius: "12px", color: "#64748b" }}>
              No cases found in this category.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {filteredCases.map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: "#ffffff",
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    padding: "20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                        <span style={{ fontWeight: "800", color: "#ff7700", fontSize: "0.85rem" }}>{c.case_code}</span>
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: "800",
                            background:
                              c.status === "PENDING"
                                ? "#fee2e2"
                                : c.status === "ASSIGNED_FOR_STUDY"
                                ? "#fef3c7"
                                : c.status === "VERIFIED_ACTIVE"
                                ? "#dcfce7"
                                : "#ede9fe",
                            color:
                              c.status === "PENDING"
                                ? "#b91c1c"
                                : c.status === "ASSIGNED_FOR_STUDY"
                                ? "#b45309"
                                : c.status === "VERIFIED_ACTIVE"
                                ? "#15803d"
                                : "#6d28d9",
                          }}
                        >
                          {c.status}
                        </span>
                      </div>

                      <h3 style={{ fontSize: "1.15rem", fontWeight: "800", margin: "0 0 4px", color: "#0f172a" }}>
                        {c.title}
                      </h3>

                      <div style={{ fontSize: "0.86rem", color: "#475569", display: "flex", gap: "14px", flexWrap: "wrap" }}>
                        <span>👤 <strong>{c.patient_name}</strong> ({c.patient_age} yrs, {c.gender})</span>
                        <span>🏥 {c.hospital_name}</span>
                        <span>📞 {c.guardian_phone} ({c.guardian_name})</span>
                        <span>💰 లక్ష్యం: ₹{Number(c.target_amount).toLocaleString("en-IN")} | సేకరించినవి: ₹{Number(c.amount_raised).toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        onClick={() => setViewingCase(c)}
                        style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc", fontSize: "0.82rem", fontWeight: "700", cursor: "pointer" }}
                      >
                        📄 View Details
                      </button>

                      {c.status === "PENDING" && (
                        <button
                          onClick={() => setAssigningCase(c)}
                          style={{ padding: "6px 14px", borderRadius: "6px", border: "none", background: "#f59e0b", color: "#fff", fontSize: "0.82rem", fontWeight: "800", cursor: "pointer" }}
                        >
                          👨‍💼 Assign Member
                        </button>
                      )}

                      {c.status === "ASSIGNED_FOR_STUDY" && (
                        <>
                          <button
                            onClick={() => {
                              setGroundReportModalCase(c);
                              setReportText(c.verification_report || "");
                            }}
                            style={{ padding: "6px 14px", borderRadius: "6px", border: "none", background: "#3b82f6", color: "#fff", fontSize: "0.82rem", fontWeight: "800", cursor: "pointer" }}
                          >
                            ✍️ Submit Ground Report
                          </button>
                          <button
                            onClick={() => handlePublishCase(c)}
                            style={{ padding: "6px 14px", borderRadius: "6px", border: "none", background: "#10b981", color: "#fff", fontSize: "0.82rem", fontWeight: "800", cursor: "pointer" }}
                          >
                            🛡️ 100% Verify &amp; Publish
                          </button>
                        </>
                      )}

                      {c.status === "VERIFIED_ACTIVE" && (
                        <>
                          <button
                            onClick={() => {
                              setEditingAmountCase(c);
                              setEditRaisedAmount(c.amount_raised);
                              setEditStatus(c.status);
                            }}
                            style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid #10b981", background: "#ecfdf5", color: "#065f46", fontSize: "0.82rem", fontWeight: "800", cursor: "pointer" }}
                          >
                            💰 Update Raised (₹{Number(c.amount_raised).toLocaleString("en-IN")})
                          </button>
                          <button
                            onClick={() => setUpdateModalCase(c)}
                            style={{ padding: "6px 14px", borderRadius: "6px", border: "none", background: "#6366f1", color: "#fff", fontSize: "0.82rem", fontWeight: "800", cursor: "pointer" }}
                          >
                            📢 Post Update
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* ================= VIEW 2: DONATIONS AUDIT & CERTIFICATE DISPATCH ================= */
        <>
          {/* Donations Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div style={{ background: "#ffffff", padding: "18px", borderRadius: "12px", border: "1px solid #e2e8f0", borderLeft: "4px solid #ef4444" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64748b" }}>🚨 పరిశీలించాల్సిన విరాళాలు (Pending Audit)</div>
              <div style={{ fontSize: "1.6rem", fontWeight: "900", color: "#ef4444", marginTop: "4px" }}>{pendingContribCount}</div>
            </div>

            <div style={{ background: "#ffffff", padding: "18px", borderRadius: "12px", border: "1px solid #e2e8f0", borderLeft: "4px solid #10b981" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64748b" }}>✅ నిర్ధారించినవి &amp; సర్టిఫికెట్ పంపినవి</div>
              <div style={{ fontSize: "1.6rem", fontWeight: "900", color: "#10b981", marginTop: "4px" }}>{approvedContribCount}</div>
            </div>

            <div style={{ background: "#ffffff", padding: "18px", borderRadius: "12px", border: "1px solid #e2e8f0", borderLeft: "4px solid #3b82f6" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64748b" }}>💎 మొత్తం నమోదైన విరాళాలు</div>
              <div style={{ fontSize: "1.6rem", fontWeight: "900", color: "#3b82f6", marginTop: "4px" }}>{contributions.length}</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            {[
              { id: "ALL", label: `అన్ని విరాళాలు (${contributions.length})` },
              { id: "PENDING_VERIFICATION", label: `🚨 Pending Audit (${pendingContribCount})` },
              { id: "APPROVED_DISPATCHED", label: `✅ Approved & Dispatched (${approvedContribCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setContribFilter(tab.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: contribFilter === tab.id ? "#10b981" : "#ffffff",
                  color: contribFilter === tab.id ? "#ffffff" : "#475569",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  border: "1px solid #cbd5e1",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contributions List */}
          {filteredContributions.length === 0 ? (
            <div style={{ background: "#ffffff", padding: "40px", textAlign: "center", borderRadius: "12px", color: "#64748b" }}>
              No donation records found in this filter.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {filteredContributions.map((con) => (
                <div
                  key={con.id}
                  style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    border: con.status === "PENDING_VERIFICATION" ? "1.5px solid #f59e0b" : "1px solid #e2e8f0",
                    padding: "18px 20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                        <span style={{ fontWeight: "900", color: "#b91c1c", fontSize: "1.05rem" }}>
                          ₹{Number(con.amount).toLocaleString("en-IN")}
                        </span>
                        <span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "800", color: "#64748b" }}>
                          {con.certificate_code}
                        </span>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: "800",
                            background:
                              con.status === "PENDING_VERIFICATION"
                                ? "#fef3c7"
                                : con.status === "APPROVED_DISPATCHED"
                                ? "#dcfce7"
                                : "#fee2e2",
                            color:
                              con.status === "PENDING_VERIFICATION"
                                ? "#b45309"
                                : con.status === "APPROVED_DISPATCHED"
                                ? "#15803d"
                                : "#b91c1c",
                          }}
                        >
                          {con.status === "PENDING_VERIFICATION" ? "⏳ Pending Audit" : "✅ Approved & Dispatched"}
                        </span>
                      </div>

                      <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
                        👤 {con.donor_name} ({con.donor_city || "Jagtial"})
                      </div>

                      <div style={{ fontSize: "0.85rem", color: "#475569", display: "flex", gap: "14px", flexWrap: "wrap" }}>
                        <span>📱 WhatsApp: <strong>{con.donor_phone}</strong></span>
                        {con.donor_email && <span>✉️ Email: <strong>{con.donor_email}</strong></span>}
                        <span>🏥 కేటాయించిన పేషెంట్: <strong>{con.patient_name}</strong></span>
                      </div>

                      {con.utr_reference && (
                        <div style={{ marginTop: "6px", fontSize: "0.82rem", background: "#f8fafc", padding: "4px 8px", borderRadius: "6px", display: "inline-block", color: "#334155" }}>
                          🔑 <strong>UTR / Txn Ref:</strong> {con.utr_reference}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                      {con.status === "PENDING_VERIFICATION" ? (
                        <>
                          <button
                            onClick={() => handleVerifyContribution(con.id, "APPROVE")}
                            disabled={contribActionLoading === con.id}
                            style={{
                              padding: "8px 16px",
                              borderRadius: "8px",
                              border: "none",
                              background: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
                              color: "#fff",
                              fontWeight: "800",
                              fontSize: "0.84rem",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <span>✅ నిర్ధారించండి &amp; పంపండి (Approve &amp; Dispatch)</span>
                          </button>

                          <button
                            onClick={() => handleVerifyContribution(con.id, "REJECT")}
                            disabled={contribActionLoading === con.id}
                            style={{
                              padding: "8px 12px",
                              borderRadius: "8px",
                              border: "1px solid #ef4444",
                              background: "#fff",
                              color: "#ef4444",
                              fontWeight: "700",
                              fontSize: "0.82rem",
                              cursor: "pointer",
                            }}
                          >
                            ❌ తిరస్కరించండి (Reject)
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              const cleanPhone = String(con.donor_phone).replace(/\D/g, "").slice(-10);
                              const certViewUrl = `https://hinduswarajyouth.online/aapadbandhava?cert=${con.certificate_code}`;
                              const whatsappText = `🚩 *హిందూ స్వరాజ్ యూత్ అసోసియేషన్ జగిత్యాల (Regd. 784/2025)* 🚩\n*ఆపద్బాంధవ అత్యవసర ప్రజా సహాయ నిధి*\n\nనమస్కారం శ్రీ/శ్రీమతి *${con.donor_name}* గారు 🙏,\n\nజగిత్యాల ఆపద్బాంధవ ద్వారా ప్రాణాపాయ స్థితిలో ఉన్న *${con.patient_name}* గారి అత్యవసర చికిత్స నిమిత్తం మీరు అందించిన *₹${Number(con.amount).toLocaleString("en-IN")}* విరాళం బాధితుడి ఖాతాకు చేరినట్లు మా అసోసియేషన్ విజయవంతంగా నిర్ధారించింది.\n\nమీ నిస్వార్థ సేవకు కృతజ్ఞతగా అసోసియేషన్ అధ్యక్షులు ముకేష్ కొక్కుల గారి సంతకంతో అధికారిక *సేవా ప్రశంసా పత్రం (Certificate of Appreciation)* జారీ చేయబడింది.\n\n🆔 *సర్టిఫికెట్ నంబర్:* \`${con.certificate_code}\`\n🔗 *మీ అధికారిక సర్టిఫికెట్ ఇక్కడ వీక్షించండి / డౌన్‌లోడ్ చేసుకోండి:*\n👉 ${certViewUrl}\n\n|| ప్రజా సేవయే ఈశ్వర సేవ || 🚩`;
                              window.open(`https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(whatsappText)}`, "_blank");
                            }}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "6px",
                              border: "none",
                              background: "#25D366",
                              color: "#fff",
                              fontWeight: "800",
                              fontSize: "0.82rem",
                              cursor: "pointer",
                            }}
                          >
                            📲 Open WhatsApp
                          </button>

                          <a
                            href={`/aapadbandhava?cert=${con.certificate_code}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              background: "#f8fafc",
                              color: "#334155",
                              fontWeight: "700",
                              fontSize: "0.82rem",
                              textDecoration: "none",
                            }}
                          >
                            📜 View Certificate
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ================= ASSIGN MEMBER MODAL ================= */}
      {assigningCase && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form
            onSubmit={handleAssignMember}
            style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", maxWidth: "450px", width: "90%" }}
          >
            <h3 style={{ margin: "0 0 12px", color: "#0f172a" }}>
              Assign Committee Member for Ground Study
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "16px" }}>
              Case: <strong>{assigningCase.title}</strong>
            </p>

            <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>
              Select Active Committee Member *
            </label>
            <select
              required
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", marginBottom: "20px" }}
            >
              <option value="">-- Choose Member --</option>
              {committeeMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role}) - {m.phone}
                </option>
              ))}
            </select>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setAssigningCase(null)}
                style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={assignLoading || !selectedMemberId}
                style={{ padding: "8px 18px", borderRadius: "6px", border: "none", background: "#f59e0b", color: "#fff", fontWeight: "800", cursor: "pointer" }}
              >
                {assignLoading ? "Assigning..." : "Confirm Assignment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= GROUND REPORT MODAL ================= */}
      {reportModalCase && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form
            onSubmit={handleSubmitGroundReport}
            style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", maxWidth: "560px", width: "90%" }}
          >
            <h3 style={{ margin: "0 0 12px", color: "#0f172a" }}>
              Ground Verification Report
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "16px" }}>
              Case: <strong>{reportModalCase.patient_name}</strong> ({reportModalCase.hospital_name})
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "#334155" }}>
                <input
                  type="checkbox"
                  checked={doctorVerified}
                  onChange={(e) => setDoctorVerified(e.target.checked)}
                />
                Spoke with Doctor and confirmed medical condition
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "#334155" }}>
                <input
                  type="checkbox"
                  checked={billVerified}
                  onChange={(e) => setBillVerified(e.target.checked)}
                />
                Audited hospital estimation bills and prescriptions
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "#334155" }}>
                <input
                  type="checkbox"
                  checked={homeVisitDone}
                  onChange={(e) => setHomeVisitDone(e.target.checked)}
                />
                Met the family in person and confirmed economic condition
              </label>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>
                Detailed Investigation Findings *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Enter what you observed, doctor statements, and exact hospital quote..."
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setGroundReportModalCase(null)}
                style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reportLoading || !reportText.trim()}
                style={{ padding: "8px 18px", borderRadius: "6px", border: "none", background: "#3b82f6", color: "#fff", fontWeight: "800", cursor: "pointer" }}
              >
                {reportLoading ? "Submitting..." : "Submit Ground Report"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= EDIT AMOUNT & STATUS MODAL ================= */}
      {editingAmountCase && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form
            onSubmit={handleSaveAmountAndStatus}
            style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", maxWidth: "440px", width: "90%" }}
          >
            <h3 style={{ margin: "0 0 12px", color: "#0f172a" }}>
              Update Raised Amount &amp; Status
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "16px" }}>
              Case: <strong>{editingAmountCase.patient_name}</strong>
            </p>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>
                Total Amount Raised (₹) *
              </label>
              <input
                type="number"
                required
                value={editRaisedAmount}
                onChange={(e) => setEditRaisedAmount(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>
                Case Status *
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              >
                <option value="VERIFIED_ACTIVE">🛡️ VERIFIED_ACTIVE (Fundraising Live)</option>
                <option value="GOAL_REACHED">🎯 GOAL_REACHED (Target Completed)</option>
                <option value="CLOSED_HELPED">🏆 CLOSED_HELPED (Patient Cured/Helped)</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setEditingAmountCase(null)}
                style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editLoading}
                style={{ padding: "8px 18px", borderRadius: "6px", border: "none", background: "#10b981", color: "#fff", fontWeight: "800", cursor: "pointer" }}
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= POST UPDATE MODAL ================= */}
      {updateModalCase && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <form
            onSubmit={handleAddMilestoneUpdate}
            style={{ background: "#ffffff", padding: "24px", borderRadius: "14px", maxWidth: "480px", width: "90%" }}
          >
            <h3 style={{ margin: "0 0 12px", color: "#0f172a" }}>
              Post Surgery / Recovery Update
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "16px" }}>
              Patient: <strong>{updateModalCase.patient_name}</strong>
            </p>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>
                Update Headline *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Surgery Successfully Completed & Patient Discharged"
                value={updateTitle}
                onChange={(e) => setUpdateTitle(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>
                Update Description *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Enter details of medical progress, discharge, or gratitude to donors..."
                value={updateContent}
                onChange={(e) => setUpdateContent(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setUpdateModalCase(null)}
                style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateLoading}
                style={{ padding: "8px 18px", borderRadius: "6px", border: "none", background: "#6366f1", color: "#fff", fontWeight: "800", cursor: "pointer" }}
              >
                {updateLoading ? "Posting..." : "Post Update"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= VIEW CASE DETAILS MODAL ================= */}
      {viewingCase && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setViewingCase(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "850px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "28px",
              position: "relative",
              boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setViewingCase(null)}
              style={{
                position: "absolute",
                top: "18px",
                right: "18px",
                background: "#f1f5f9",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                fontSize: "1rem",
                fontWeight: "900",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#475569",
              }}
            >
              ✕
            </button>

            {/* Modal Header */}
            <div style={{ borderBottom: "1.5px solid #e2e8f0", paddingBottom: "16px", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span style={{ background: "#ff7700", color: "#fff", padding: "3px 10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "900" }}>
                  {viewingCase.case_code}
                </span>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    fontWeight: "800",
                    background:
                      viewingCase.status === "PENDING"
                        ? "#fee2e2"
                        : viewingCase.status === "ASSIGNED_FOR_STUDY"
                        ? "#fef3c7"
                        : viewingCase.status === "VERIFIED_ACTIVE"
                        ? "#dcfce7"
                        : "#ede9fe",
                    color:
                      viewingCase.status === "PENDING"
                        ? "#b91c1c"
                        : viewingCase.status === "ASSIGNED_FOR_STUDY"
                        ? "#b45309"
                        : viewingCase.status === "VERIFIED_ACTIVE"
                        ? "#15803d"
                        : "#6d28d9",
                  }}
                >
                  {viewingCase.status}
                </span>
              </div>

              <h2 style={{ fontSize: "1.45rem", fontWeight: "900", color: "#0f172a", margin: "0 0 6px" }}>
                {viewingCase.title}
              </h2>
              <div style={{ fontSize: "0.88rem", color: "#64748b" }}>
                నమోదైన తేదీ: {new Date(viewingCase.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b" }}>లక్ష్యం (Target Amount)</div>
                <div style={{ fontSize: "1.25rem", fontWeight: "900", color: "#0f172a", marginTop: "2px" }}>
                  ₹{Number(viewingCase.target_amount).toLocaleString("en-IN")}
                </div>
              </div>

              <div style={{ background: "#ecfdf5", padding: "12px 16px", borderRadius: "10px", border: "1px solid #a7f3d0" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#065f46" }}>అందిన సహాయం (Raised)</div>
                <div style={{ fontSize: "1.25rem", fontWeight: "900", color: "#059669", marginTop: "2px" }}>
                  ₹{Number(viewingCase.amount_raised).toLocaleString("en-IN")}
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b" }}>అత్యవసర స్థాయి (Urgency)</div>
                <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#b91c1c", marginTop: "4px" }}>
                  {viewingCase.urgency_level === "CRITICAL_48_HOURS"
                    ? "🚨 48 గంటలు అత్యవసరం"
                    : viewingCase.urgency_level === "URGENT_7_DAYS"
                    ? "⚡ 7 రోజుల్లో సర్జరీ"
                    : "🔴 అత్యవసరం"}
                </div>
              </div>
            </div>

            {/* Section 1: Patient & Hospital Info */}
            <div style={{ background: "#f8fafc", padding: "16px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
              <h4 style={{ margin: "0 0 12px", color: "#0f172a", fontSize: "0.98rem", fontWeight: "800" }}>
                👤 పేషెంట్ &amp; హాస్పిటల్ వివరాలు (Patient &amp; Hospital Details):
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px", fontSize: "0.88rem" }}>
                <div><strong>పేషెంట్ పేరు:</strong> {viewingCase.patient_name}</div>
                <div><strong>వయస్సు / లింగం:</strong> {viewingCase.patient_age} సం., {viewingCase.gender}</div>
                <div><strong>ఊరు / చిరునామా:</strong> {viewingCase.city} ({viewingCase.address || "Jagtial"})</div>
                <div><strong>సంరక్షకుడు:</strong> {viewingCase.guardian_name} ({viewingCase.guardian_relation || "Guardian"})</div>
                <div><strong>మొబైల్ (WhatsApp):</strong> <a href={`tel:${viewingCase.guardian_phone}`} style={{ color: "#2563eb", fontWeight: "700" }}>{viewingCase.guardian_phone}</a></div>
                <div><strong>హాస్పిటల్:</strong> {viewingCase.hospital_name}</div>
                <div><strong>డాక్టర్:</strong> {viewingCase.doctor_name || "N/A"}</div>
                <div><strong>విభాగం:</strong> {viewingCase.emergency_category}</div>
              </div>
            </div>

            {/* Section 2: Story Description */}
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ margin: "0 0 8px", color: "#0f172a", fontSize: "0.98rem", fontWeight: "800" }}>
                📝 ఆరోగ్య పరిస్థితి &amp; కుటుంబ కథనం (Patient Story):
              </h4>
              <div style={{ background: "#ffffff", padding: "14px 18px", borderRadius: "10px", border: "1px solid #e2e8f0", color: "#334155", lineHeight: "1.65", fontSize: "0.9rem", whiteSpace: "pre-line" }}>
                {viewingCase.story}
              </div>
            </div>

            {/* Section 3: Ground Investigation Report */}
            <div style={{ background: "#fffbeb", padding: "16px 20px", borderRadius: "12px", border: "1.5px solid #fcd34d", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                <h4 style={{ margin: 0, color: "#92400e", fontSize: "0.98rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>🛡️</span>
                  <span>క్షేత్రస్థాయి పరిశీలన నివేదిక (HSY Ground Audit):</span>
                </h4>
                {viewingCase.assigned_member_name && (
                  <span style={{ fontSize: "0.8rem", color: "#78350f", background: "#fef3c7", padding: "2px 8px", borderRadius: "6px", fontWeight: "700" }}>
                    👨‍💼 ఇన్వెస్టిగేటర్: {viewingCase.assigned_member_name} ({viewingCase.assigned_member_phone || "Active"})
                  </span>
                )}
              </div>

              <div style={{ fontSize: "0.88rem", color: "#78350f", lineHeight: "1.6", whiteSpace: "pre-line", marginBottom: "12px" }}>
                {viewingCase.verification_report || "గ్రౌండ్ ఇన్వెస్టిగేషన్ రిపోర్ట్ ఇంకా నమోదు కాలేదు."}
              </div>

              <div style={{ display: "flex", gap: "14px", fontSize: "0.82rem", fontWeight: "700", color: "#92400e", flexWrap: "wrap" }}>
                <span>{viewingCase.doctor_contact_verified ? "✅ డాక్టర్‌తో మాట్లాడటం జరిగింది" : "⏳ డాక్టర్ వెరిఫికేషన్ పెండింగ్"}</span>
                <span>{viewingCase.hospital_bill_verified ? "✅ హాస్పిటల్ బిల్లులు పరిశీలించబడ్డాయి" : "⏳ బిల్లుల ఆడిట్ పెండింగ్"}</span>
                <span>{viewingCase.home_visit_done ? "✅ కుటుంబ స్థితిని స్వయంగా చూశాం" : "⏳ హోమ్ విజిట్ పెండింగ్"}</span>
              </div>
            </div>

            {/* Section 4: Direct Beneficiary Bank Details */}
            <div style={{ background: "#f8fafc", padding: "16px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
              <h4 style={{ margin: "0 0 12px", color: "#0f172a", fontSize: "0.98rem", fontWeight: "800" }}>
                💳 బాధితుడి ప్రత్యక్ష బ్యాంక్ &amp; UPI వివరాలు (Direct Beneficiary Account):
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px", fontSize: "0.88rem" }}>
                <div><strong>ఖాతాదారు పేరు:</strong> {viewingCase.beneficiary_acc_name}</div>
                <div><strong>బ్యాంక్ &amp; బ్రాంచ్:</strong> {viewingCase.beneficiary_bank_name}</div>
                <div><strong>ఖాతా సంఖ్య:</strong> <strong style={{ color: "#d97706", fontSize: "0.95rem" }}>{viewingCase.beneficiary_acc_no}</strong></div>
                <div><strong>IFSC కోడ్:</strong> <strong>{viewingCase.beneficiary_ifsc}</strong></div>
                <div><strong>UPI ID:</strong> {viewingCase.beneficiary_upi_id || viewingCase.beneficiary_upi_phone || "లభ్యం"}</div>
              </div>
            </div>

            {/* Section 5: Medical Documents & Uploaded Soft Copies */}
            {viewingCase.documents_urls && viewingCase.documents_urls.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ margin: "0 0 12px", color: "#0f172a", fontSize: "0.98rem", fontWeight: "800" }}>
                  📑 అప్‌లోడ్ చేసిన మెడికల్ బిల్లులు &amp; డాక్యుమెంట్లు ({viewingCase.documents_urls.length} Files):
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
                  {viewingCase.documents_urls.map((doc, idx) => (
                    <div
                      key={idx}
                      onClick={() => setViewDocModal(doc)}
                      style={{
                        cursor: "pointer",
                        border: "1.5px solid #cbd5e1",
                        borderRadius: "10px",
                        overflow: "hidden",
                        background: "#000",
                        position: "relative",
                        aspectRatio: "1",
                      }}
                    >
                      <img
                        src={doc}
                        alt={`Doc ${idx + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          insetInline: 0,
                          background: "rgba(0,0,0,0.7)",
                          color: "#fff",
                          fontSize: "0.72rem",
                          textAlign: "center",
                          padding: "4px",
                          fontWeight: "700",
                        }}
                      >
                        🔍 పెద్దదిగా చూడండి
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap", borderTop: "1.5px solid #e2e8f0", paddingTop: "18px" }}>
              <button
                type="button"
                onClick={() => setViewingCase(null)}
                style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", fontWeight: "700", cursor: "pointer" }}
              >
                క్లోజ్ (Close)
              </button>

              {viewingCase.status === "PENDING" && (
                <button
                  type="button"
                  onClick={() => {
                    const c = viewingCase;
                    setViewingCase(null);
                    setAssigningCase(c);
                  }}
                  style={{ padding: "8px 18px", borderRadius: "8px", border: "none", background: "#f59e0b", color: "#fff", fontWeight: "800", cursor: "pointer" }}
                >
                  👨‍💼 Assign Member
                </button>
              )}

              {viewingCase.status === "ASSIGNED_FOR_STUDY" && (
                <button
                  type="button"
                  onClick={() => {
                    const c = viewingCase;
                    setViewingCase(null);
                    handlePublishCase(c);
                  }}
                  style={{ padding: "8px 18px", borderRadius: "8px", border: "none", background: "#10b981", color: "#fff", fontWeight: "800", cursor: "pointer" }}
                >
                  🛡️ 100% Verify &amp; Publish
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= DOCUMENT LIGHTBOX MODAL ================= */}
      {viewDocModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setViewDocModal(null)}
        >
          <div style={{ maxWidth: "90vw", maxHeight: "90vh", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setViewDocModal(null)}
              style={{
                position: "absolute",
                top: "-15px",
                right: "-15px",
                background: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                fontSize: "1.1rem",
                fontWeight: "900",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              }}
            >
              ✕
            </button>
            <img
              src={viewDocModal}
              alt="Medical Document Preview"
              style={{ width: "100%", maxHeight: "85vh", objectFit: "contain", borderRadius: "12px" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
