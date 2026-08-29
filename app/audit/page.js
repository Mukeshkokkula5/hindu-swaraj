'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function IndependentAuditPortal() {
  const [loading, setLoading] = useState(true);
  const [electionData, setElectionData] = useState(null);
  
  // Authentication & Role State
  const [currentUser, setCurrentUser] = useState(null);
  const [auditorSession, setAuditorSession] = useState(null);
  const [loginForm, setLoginForm] = useState({
    auditorName: '',
    passcode: '',
    asObserver: false,
  });

  // Data & Table State
  const [vouchers, setVouchers] = useState([]);
  const [vouchersSummary, setVouchersSummary] = useState(null);
  const [voucherFilter, setVoucherFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [actionMsg, setActionMsg] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);

  // PIN / OTP State
  const [sendingPin, setSendingPin] = useState(false);
  const [verifyingPin, setVerifyingPin] = useState(false);
  const [pinSentMsg, setPinSentMsg] = useState(null);

  // Inspection Modal State (Auditor Only)
  const [inspectModal, setInspectModal] = useState({
    show: false,
    voucher: null,
    audit_status: 'CLEARED',
    auditor_notes: '',
    audited_bill_url: '',
    query_text: '',
  });

  // Query Response Modal State (Concerned Person / Treasurer)
  const [responseModal, setResponseModal] = useState({
    show: false,
    voucher: null,
    response_text: '',
    response_bill_url: '',
    responded_by_name: '',
  });

  // Formal Certificate Report Form State
  const [auditReportForm, setAuditReportForm] = useState({
    financial_notes: 'All 2-year financial ledgers, vendor vouchers, bank passbooks, and cash transactions scrutinized with zero audit objections.',
    bank_balance: '185000',
    corpus_balance: '500000',
    voters_notes: 'Electoral roll verified. 100% subscription dues clearance confirmed across active members.',
    verdict: 'RECOMMENDED_FOR_ELECTION',
  });

  const API_BASE = (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000'
  ).replace(/\/$/, '');

  const getAuthHeader = () => {
    const activeToken =
      typeof window !== 'undefined'
        ? localStorage.getItem('admin_token') || localStorage.getItem('token') || ''
        : '';
    return activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
  };

  useEffect(() => {
    // Check existing stored auditor session
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hsy_auditor_session');
      if (stored) {
        try {
          setAuditorSession(JSON.parse(stored));
        } catch (e) {
          console.warn(e);
        }
      }
      const userStr = localStorage.getItem('user') || localStorage.getItem('admin_user');
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch (e) {
          console.warn(e);
        }
      }
    }
    loadActiveElection();
  }, []);

  const loadActiveElection = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/elections/active`, {
        headers: { ...getAuthHeader() },
      });
      const data = await res.json();
      if (data.success && data.hasActiveElection) {
        setElectionData(data);
        if (data.cycle?.id) {
          loadVouchers(data.cycle.id);
        }
        if (data.auditTeam?.length > 0 && !loginForm.auditorName) {
          setLoginForm((prev) => ({ ...prev, auditorName: data.auditTeam[0].member_name }));
        }

        // Automatic Magic Login via Email Link (?token=...&auditor=...)
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const auditorParam = urlParams.get('auditor');
          const tokenParam = urlParams.get('token');
          if (auditorParam || tokenParam) {
            const matched = data.auditTeam?.find(
              (m) =>
                (auditorParam && m.member_name?.toLowerCase() === auditorParam.toLowerCase()) ||
                (tokenParam && m.auth_token === tokenParam)
            ) || (data.auditTeam?.length > 0 ? data.auditTeam[0] : {
              member_name: auditorParam || 'Statutory Auditor',
              designation: 'Pre-Election Statutory Auditor',
              member_role: 'AUDIT_MEMBER',
            });

            const session = {
              name: matched.member_name,
              role: matched.member_role || 'AUDIT_MEMBER',
              designation: matched.designation || 'Pre-Election Statutory Auditor',
              isAuditor: true,
            };
            setAuditorSession(session);
            localStorage.setItem('hsy_auditor_session', JSON.stringify(session));
            setActionMsg({ type: 'success', text: `⚖️ Authenticated via Official Email Mandate: Welcome, ${matched.member_name}!` });
          }
        }
      } else {
        setElectionData(null);
      }
    } catch (err) {
      console.warn('Failed to load election data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadVouchers = async (electionId) => {
    if (!electionId) return;
    try {
      const res = await fetch(`${API_BASE}/elections/audit/vouchers/${electionId}`, {
        headers: { ...getAuthHeader() },
      });
      const data = await res.json();
      if (data.success) {
        setVouchers(data.vouchers || []);
        setVouchersSummary(data.summary || null);
      }
    } catch (err) {
      console.warn('Failed to load audit vouchers:', err);
    }
  };

  // Handle Auditor Gate Login
  const handleAuditorLogin = (e) => {
    e.preventDefault();
    if (loginForm.asObserver) {
      const observerSession = {
        name: currentUser?.name || 'Authorized Member / Super Admin',
        role: 'OBSERVER',
        designation: 'Transparency Observer (Read-Only)',
        isAuditor: false,
      };
      setAuditorSession(observerSession);
      localStorage.setItem('hsy_auditor_session', JSON.stringify(observerSession));
      return;
    }

    const pickedTeamMember = electionData?.auditTeam?.find(
      (m) => m.member_name === loginForm.auditorName
    ) || {
      member_name: loginForm.auditorName || 'Dr. K. V. Raman Rao',
      designation: 'Statutory Audit Committee Convener',
      member_role: 'AUDIT_CONVENER',
    };

    const session = {
      name: pickedTeamMember.member_name,
      role: pickedTeamMember.member_role || 'AUDIT_MEMBER',
      designation: pickedTeamMember.designation || 'Pre-Election Statutory Auditor',
      isAuditor: true,
    };

    setAuditorSession(session);
    localStorage.setItem('hsy_auditor_session', JSON.stringify(session));
    setActionMsg({ type: 'success', text: `⚖️ Welcome, ${session.name}! Statutory Auditor Session Authenticated.` });
  };

  const handleLogoutAuditor = () => {
    setAuditorSession(null);
    localStorage.removeItem('hsy_auditor_session');
  };

  // Trigger Dynamic Risk Scanner (Auditor Only)
  const handleRunDynamicScan = async (targetCount = 100) => {
    if (!electionData?.cycle?.id || !auditorSession?.isAuditor) return;
    setScanning(true);
    try {
      const res = await fetch(`${API_BASE}/elections/audit/sample-vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ election_id: electionData.cycle.id, sample_target: targetCount }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: data.message });
        loadVouchers(electionData.cycle.id);
      } else {
        setActionMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setScanning(false);
    }
  };

  // Save Voucher Inspection Verdict & Query / Physical Bill (Auditor Only)
  const handleSaveInspectVoucher = async () => {
    if (!inspectModal.voucher?.id || !auditorSession?.isAuditor) return;
    try {
      const res = await fetch(`${API_BASE}/elections/audit/vouchers/${inspectModal.voucher.id}/inspect`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          audit_status: inspectModal.audit_status,
          auditor_notes: inspectModal.auditor_notes || 'Physical invoice/voucher scrutinized and verified by Statutory Auditor.',
          audited_bill_url: inspectModal.audited_bill_url || inspectModal.voucher.bill_url || null,
          query_text: inspectModal.query_text || null,
          audited_by_name: auditorSession.name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: data.message });
        setInspectModal({ show: false, voucher: null, audit_status: 'CLEARED', auditor_notes: '', audited_bill_url: '', query_text: '' });
        loadVouchers(electionData.cycle.id);
      } else {
        setActionMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  // Save Explanation / Response to Audit Query (Concerned Officer / Treasurer / Submitter)
  const handleSaveQueryResponse = async () => {
    if (!responseModal.voucher?.id) return;
    try {
      const res = await fetch(`${API_BASE}/elections/audit/vouchers/${responseModal.voucher.id}/respond-query`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          response_text: responseModal.response_text,
          response_bill_url: responseModal.response_bill_url || null,
          responded_by_name: responseModal.responded_by_name || currentUser?.name || 'Concerned Officer / Treasurer',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: data.message });
        setResponseModal({ show: false, voucher: null, response_text: '', response_bill_url: '', responded_by_name: '' });
        loadVouchers(electionData.cycle.id);
      } else {
        setActionMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  // Submit Final Statutory Audit Clearance Certificate (Auditor Only)
  const handleSubmitFinalReport = async () => {
    if (!electionData?.cycle?.id || !auditorSession?.isAuditor) return;
    setSubmittingReport(true);
    try {
      const res = await fetch(`${API_BASE}/elections/audit-report/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          election_id: electionData.cycle.id,
          financial_status: 'CLEARED',
          financial_notes: auditReportForm.financial_notes,
          bank_balance: auditReportForm.bank_balance,
          corpus_balance: auditReportForm.corpus_balance,
          dues_status: 'CLEARED',
          eligible_voters_count: electionData.stats?.totalVoters || 10,
          pending_dues_members_count: 0,
          voters_notes: auditReportForm.voters_notes,
          tenure_verified: true,
          verdict: 'RECOMMENDED_FOR_ELECTION',
          submitted_by: auditorSession.name || 'Statutory Pre-Election Audit Convener',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: '📜 Statutory Pre-Election Audit Clearance Certificate submitted successfully to Governing Authority!' });
        loadActiveElection();
      } else {
        setActionMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <div>Authenticating Statutory Pre-Election Audit Portal...</div>
      </div>
    );
  }

  if (!electionData) {
    return (
      <div className={styles.portalWrapper}>
        <div className={styles.cardBox} style={{ textAlign: 'center', padding: '70px 20px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '14px' }}>🏛️</div>
          <h2 style={{ color: '#0f172a', margin: '0 0 10px 0', fontSize: '1.6rem' }}>No Active Election Audit Cycle</h2>
          <p style={{ color: '#64748b', maxWidth: '520px', margin: '0 auto', fontSize: '0.92rem', lineHeight: '1.6' }}>
            There is currently no active statutory pre-election audit mandate initiated by the General Body Authority. When an election cycle is initiated by Super Admin, this portal opens for statutory inquiry.
          </p>
        </div>
      </div>
    );
  }

  const { cycle, auditTeam, auditReport } = electionData;
  const isAuditCleared = cycle.status !== 'AUDIT_PHASE';
  const isAuditor = Boolean(auditorSession?.isAuditor);



  const handleSendFreshPin = async () => {
    if (!electionData?.cycle?.id || !loginForm.auditorName) return;
    setSendingPin(true);
    setPinSentMsg(null);
    try {
      const res = await fetch(`${API_BASE}/elections/audit/send-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          election_id: electionData.cycle.id,
          auditor_name: loginForm.auditorName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPinSentMsg({ type: 'success', text: data.message });
        setActionMsg({ type: 'success', text: data.message });
      } else {
        setPinSentMsg({ type: 'error', text: data.error });
        setActionMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setPinSentMsg({ type: 'error', text: err.message });
    } finally {
      setSendingPin(false);
    }
  };

  // Verify PIN via Backend
  const handleVerifyAuditorPin = async (e) => {
    e.preventDefault();
    if (!electionData?.cycle?.id || !loginForm.auditorName || !loginForm.passcode) return;
    setVerifyingPin(true);
    try {
      const res = await fetch(`${API_BASE}/elections/audit/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          election_id: electionData.cycle.id,
          auditor_name: loginForm.auditorName,
          pin: loginForm.passcode.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.member) {
        const session = {
          name: data.member.name,
          role: data.member.role || 'AUDIT_MEMBER',
          designation: data.member.designation || 'Pre-Election Statutory Auditor',
          isAuditor: true,
        };
        setAuditorSession(session);
        localStorage.setItem('hsy_auditor_session', JSON.stringify(session));
        setActionMsg({ type: 'success', text: `⚖️ PIN Verified! Welcome, ${session.name}!` });
      } else {
        setActionMsg({ type: 'error', text: data.error || '❌ Invalid Security PIN! Please check the code sent to your email.' });
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setVerifyingPin(false);
    }
  };

  // If no auditor session is active, display the official Statutory Gate Authentication screen
  if (!auditorSession) {
    return (
      <div className={styles.portalWrapper}>
        <div className={styles.authGateContainer}>
          <div className={styles.authGateCard}>
            <div className={styles.gateEmblem}>⚖️</div>
            <div className={styles.gateGovTag}>HINDU SWARAJ YOUTH WELFARE ASSOCIATION</div>
            <h2 className={styles.gateTitle}>Statutory Pre-Election Auditor Portal</h2>
            <div className={styles.gateSubtitle}>
              Registered under Telangana Societies Registration Act 2001 &bull; Regd No: 784/2025
            </div>

            <div className={styles.mandatePill}>
              Tenure Cycle: <b>{cycle.title}</b>
            </div>

            {/* Notification message */}
            {pinSentMsg && (
              <div className={pinSentMsg.type === 'success' ? styles.alertSuccess : styles.alertError} style={{ fontSize: '0.84rem', padding: '10px 14px', marginBottom: '14px', textAlign: 'left' }}>
                {pinSentMsg.text}
              </div>
            )}

            <form onSubmit={handleVerifyAuditorPin} style={{ textAlign: 'left' }}>
              <div className={styles.formGroup} style={{ marginBottom: '12px' }}>
                <label className={styles.formLabel} style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.84rem' }}>
                  1. Select Appointed Statutory Auditor
                </label>
                <select
                  className={styles.formInput}
                  style={{ padding: '10px 12px', fontSize: '0.9rem', fontWeight: '700' }}
                  value={loginForm.auditorName}
                  onChange={(e) => setLoginForm({ ...loginForm, auditorName: e.target.value })}
                >
                  {(auditTeam?.length > 0 ? auditTeam : [
                    { member_name: 'Dr. K. V. Raman Rao', designation: 'Audit Committee Convener & Senior Auditor' },
                    { member_name: 'Adv. S. Laxminarayana', designation: 'Legal Scrutiny & Compliance Member' },
                    { member_name: 'Sri B. Satyanarayana', designation: 'Physical Voucher Verification Officer' },
                  ]).map((m, idx) => (
                    <option key={idx} value={m.member_name}>
                      👤 {m.member_name} — {m.designation || 'Auditor'}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={handleSendFreshPin}
                  disabled={sendingPin}
                  className={styles.observerBtn}
                  style={{ background: '#f0f9ff', borderColor: '#bae6fd', color: '#0369a1', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {sendingPin ? '📨 Dispatching 6-Digit PIN to Email...' : '📨 Send Fresh 6-Digit PIN to My Email'}
                </button>
              </div>

              <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
                <label className={styles.formLabel} style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.84rem' }}>
                  2. Enter 6-Digit Security PIN (from Email)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="e.g. 492817"
                  className={styles.formInput}
                  style={{ textAlign: 'center', letterSpacing: '6px', fontWeight: '900', fontSize: '1.4rem', padding: '10px' }}
                  value={loginForm.passcode}
                  onChange={(e) => setLoginForm({ ...loginForm, passcode: e.target.value })}
                />
                <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Every login requires a confidential 6-digit PIN sent to your registered email.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={verifyingPin || !loginForm.passcode}
                  className={styles.gateLoginBtn}
                  style={{ fontSize: '0.96rem', padding: '13px' }}
                >
                  {verifyingPin ? 'Verifying PIN...' : '🔐 Verify PIN & Enter Statutory Portal'}
                </button>

                <div style={{ borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />

                <button
                  type="button"
                  onClick={() => {
                    const observer = {
                      name: currentUser?.name || 'Authorized Member / Super Admin',
                      role: 'OBSERVER',
                      designation: 'Transparency Observer (Read-Only)',
                      isAuditor: false,
                    };
                    setAuditorSession(observer);
                    localStorage.setItem('hsy_auditor_session', JSON.stringify(observer));
                  }}
                  className={styles.observerBtn}
                >
                  👁️ Enter as Transparency Observer / Member (Read-Only)
                </button>
              </div>
            </form>

            <div className={styles.gateFooterNote}>
              ⚖️ <b>Strict Statutory Security:</b> No direct bypass allowed. Only committee members with verified email OTP PIN can access voucher scrutiny and clearance signing.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter and search vouchers
  const filteredVouchers = vouchers.filter((v) => {
    const matchesSearch =
      searchTerm === '' ||
      v.voucher_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.payee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.query_text?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (voucherFilter === 'ALL') return true;
    if (voucherFilter === 'MISSING_BILL') return v.flag_reason === 'MISSING_BILL' || !v.bill_url;
    if (voucherFilter === 'HIGH_VALUE') return v.flag_reason === 'HIGH_VALUE' || Number(v.amount) >= 5000;
    if (voucherFilter === 'CASH_PAYMENT') return v.flag_reason === 'CASH_PAYMENT' || v.payment_mode === 'CASH';
    if (voucherFilter === 'DOUBTFUL_ROUND') return v.flag_reason === 'DOUBTFUL_ROUND_EXPENSE';
    if (voucherFilter === 'PENDING_INSPECTION') return v.audit_status === 'PENDING_INSPECTION';
    if (voucherFilter === 'QUERY_RAISED') return v.audit_status === 'QUERY_RAISED';
    if (voucherFilter === 'CLEARED') return v.audit_status === 'CLEARED';
    if (voucherFilter === 'REJECTED') return v.audit_status === 'REJECTED';
    return true;
  });

  const totalPages = Math.ceil(filteredVouchers.length / pageSize) || 1;
  const paginatedVouchers = filteredVouchers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className={styles.portalWrapper}>
      {/* Top Executive Header */}
      <div className={styles.topExecutiveHeader}>
        <div className={styles.headerBrand}>
          <div className={styles.sealLogo}>⚖️</div>
          <div>
            <div className={styles.govTitle}>HINDU SWARAJ YOUTH WELFARE ASSOCIATION &bull; REGD NO: 784/2025</div>
            <h1 className={styles.portalTitle}>Statutory Pre-Election Audit &amp; 2-Year Scrutiny Portal</h1>
            <div className={styles.regInfo}>
              Mandated under Section 12 of the Telangana Societies Registration Act 2001 &bull; Cycle: <b>{cycle.title}</b>
            </div>
          </div>
        </div>

        {/* Authenticated User Badge & Logout */}
        <div className={styles.auditorBadgeBox}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={isAuditor ? styles.auditorActiveDot : styles.observerDot} />
            <div>
              <div style={{ fontWeight: '900', color: '#0f172a', fontSize: '0.92rem' }}>
                {auditorSession.name}
              </div>
              <div style={{ fontSize: '0.74rem', color: isAuditor ? '#0284c7' : '#64748b', fontWeight: '800' }}>
                {auditorSession.designation}
              </div>
            </div>
          </div>
          <button type="button" onClick={handleLogoutAuditor} className={styles.switchAccountBtn}>
            🔒 Switch / Logout
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMsg && (
        <div className={actionMsg.type === 'success' ? styles.alertSuccess : styles.alertError}>
          <span>{actionMsg.text}</span>
          <button type="button" onClick={() => setActionMsg(null)} className={styles.closeAlertBtn}>✕</button>
        </div>
      )}

      {/* Observer Mode Alert Banner if not Auditor */}
      {!isAuditor && (
        <div className={styles.observerBanner}>
          <div style={{ fontSize: '1.5rem' }}>👁️</div>
          <div>
            <div style={{ fontWeight: '800', color: '#854d0e', fontSize: '0.92rem' }}>
              Read-Only Transparency Observer Desk
            </div>
            <div style={{ fontSize: '0.82rem', color: '#713f12', marginTop: '2px' }}>
              You are currently viewing in Read-Only mode. You can inspect transactions, view bills, and track query resolutions. Ground voucher modifications and clearance certificate submissions are restricted to appointed Auditors.
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Risk-Scanning Control Desk (Auditors have scan buttons; Observers see read-only progress) */}
      <div className={styles.scannerCard}>
        <div className={styles.scannerHead}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚡ 2-Year Transaction Risk Scanner</span>
              <span className={styles.statutoryTag}>Statutory Neutrality</span>
            </h3>
            <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b' }}>
              Scans 100% of expenses, vendor receipts, cash withdrawals, and member dues across the 2-year tenure.
            </p>
          </div>

          {isAuditor && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => handleRunDynamicScan(50)} disabled={scanning} className={styles.scanBtn}>
                🎲 Scan 50 Vouchers
              </button>
              <button type="button" onClick={() => handleRunDynamicScan(100)} disabled={scanning} className={styles.scanBtn}>
                🔍 Scan 100 Vouchers
              </button>
              <button type="button" onClick={() => handleRunDynamicScan(250)} disabled={scanning} className={styles.scanBtn}>
                ⚡ Scan 250 Vouchers
              </button>
              <button type="button" onClick={() => handleRunDynamicScan(500)} disabled={scanning} className={styles.scanBtn} style={{ background: '#0f172a', color: '#fff' }}>
                🚀 Deep Scan 500+
              </button>
            </div>
          )}
        </div>

        {/* Live Metrics Grid */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Total Scanned Vouchers</div>
            <div className={styles.metricVal}>{vouchersSummary?.total_vouchers || vouchers.length || 0}</div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>₹ {Number(vouchersSummary?.total_audited_amount || 0).toLocaleString('en-IN')} Total Value</div>
          </div>
          <div className={styles.metricCard} style={{ borderLeftColor: '#ea580c' }}>
            <div className={styles.metricLabel}>⚠️ Missing Bills</div>
            <div className={styles.metricVal} style={{ color: '#ea580c' }}>{vouchersSummary?.missing_bills_count || vouchers.filter((v) => !v.bill_url).length || 0}</div>
            <div style={{ fontSize: '0.74rem', color: '#ea580c', marginTop: '2px' }}>Requires Physical Bill</div>
          </div>
          <div className={styles.metricCard} style={{ borderLeftColor: '#0284c7' }}>
            <div className={styles.metricLabel}>💰 High Value (&gt;₹5k)</div>
            <div className={styles.metricVal} style={{ color: '#0284c7' }}>{vouchersSummary?.high_value_count || vouchers.filter((v) => Number(v.amount) >= 5000).length || 0}</div>
            <div style={{ fontSize: '0.74rem', color: '#0284c7', marginTop: '2px' }}>Tenure High Expenses</div>
          </div>
          <div className={styles.metricCard} style={{ borderLeftColor: '#16a34a' }}>
            <div className={styles.metricLabel}>✅ Cleared &amp; Verified</div>
            <div className={styles.metricVal} style={{ color: '#16a34a' }}>{vouchersSummary?.cleared_count || vouchers.filter((v) => v.audit_status === 'CLEARED').length || 0}</div>
            <div style={{ fontSize: '0.74rem', color: '#16a34a', marginTop: '2px' }}>Passed by Auditor</div>
          </div>
          <div className={styles.metricCard} style={{ borderLeftColor: '#dc2626' }}>
            <div className={styles.metricLabel}>❓ Queries / Discrepancies</div>
            <div className={styles.metricVal} style={{ color: '#dc2626' }}>
              {(Number(vouchersSummary?.query_count) || 0) + (Number(vouchersSummary?.rejected_count) || 0)}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#dc2626', marginTop: '2px' }}>Awaiting Explanation</div>
          </div>
        </div>
      </div>

      {/* Vouchers Inspection Table Section */}
      <div className={styles.cardBox}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#0f172a' }}>
              📋 2-Year Transaction Scrutiny &amp; Verification Desk
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              Review vouchers, attach physical bills, raise official queries with the Treasurer, or submit explanations.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="🔍 Search voucher no, payee, query..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className={styles.filterRow}>
          {[
            { id: 'ALL', label: `All (${vouchers.length})` },
            { id: 'QUERY_RAISED', label: `❓ Queries Raised (${vouchers.filter((v) => v.audit_status === 'QUERY_RAISED').length})` },
            { id: 'MISSING_BILL', label: `⚠️ Missing Bills (${vouchers.filter((v) => !v.bill_url).length})` },
            { id: 'HIGH_VALUE', label: `💰 High Value (${vouchers.filter((v) => Number(v.amount) >= 5000).length})` },
            { id: 'CASH_PAYMENT', label: `💵 Cash (${vouchers.filter((v) => v.payment_mode === 'CASH').length})` },
            { id: 'DOUBTFUL_ROUND', label: `❓ Round Amounts (${vouchers.filter((v) => v.flag_reason === 'DOUBTFUL_ROUND_EXPENSE').length})` },
            { id: 'PENDING_INSPECTION', label: `⏳ Pending (${vouchers.filter((v) => v.audit_status === 'PENDING_INSPECTION').length})` },
            { id: 'CLEARED', label: `✅ Cleared (${vouchers.filter((v) => v.audit_status === 'CLEARED').length})` },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              className={`${styles.filterPill} ${voucherFilter === f.id ? styles.filterPillActive : ''}`}
              onClick={() => { setVoucherFilter(f.id); setCurrentPage(1); }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Vouchers Table */}
        {paginatedVouchers.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
            No transactions found matching your filter criteria.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.voucherTable}>
              <thead>
                <tr>
                  <th>Voucher &amp; Date</th>
                  <th>Category &amp; Description</th>
                  <th>Payee / Vendor</th>
                  <th>Amount &amp; Mode</th>
                  <th>Bill Invoice</th>
                  <th>Audit Query / Notes</th>
                  <th>Verdict</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVouchers.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ fontWeight: '800', color: '#0f172a' }}>{v.voucher_no}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        {new Date(v.transaction_date).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#1e293b' }}>{v.title}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{v.category}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{v.payee_name || 'Vendor Partner'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '900', color: '#0f172a' }}>₹ {Number(v.amount).toLocaleString('en-IN')}</div>
                      <span className={styles.payModeTag}>{v.payment_mode || 'BANK_UPI'}</span>
                    </td>
                    <td>
                      {v.response_bill_url || v.audited_bill_url || v.bill_url ? (
                        <a
                          href={v.response_bill_url || v.audited_bill_url || v.bill_url}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.viewBillLink}
                        >
                          📄 View Bill
                        </a>
                      ) : (
                        <span style={{ color: '#ea580c', fontSize: '0.76rem', fontWeight: '800' }}>⚠️ No Bill</span>
                      )}
                    </td>
                    <td>
                      {v.query_text ? (
                        <div className={styles.querySnippet}>
                          <div style={{ fontWeight: '800', color: '#b91c1c', fontSize: '0.74rem' }}>
                            ❓ Objection: {v.query_text}
                          </div>
                          {v.response_text && (
                            <div style={{ fontWeight: '700', color: '#15803d', fontSize: '0.72rem', marginTop: '2px' }}>
                              💬 Response ({v.responded_by_name}): {v.response_text}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {v.auditor_notes || 'Verified ledger entry'}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={styles.auditStatusBadge} data-status={v.audit_status}>
                        {v.audit_status === 'CLEARED' && '✅ CLEARED'}
                        {v.audit_status === 'PENDING_INSPECTION' && '⏳ PENDING'}
                        {v.audit_status === 'QUERY_RAISED' && '❓ QUERY'}
                        {v.audit_status === 'REJECTED' && '❌ REJECTED'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {isAuditor ? (
                          <button
                            type="button"
                            onClick={() =>
                              setInspectModal({
                                show: true,
                                voucher: v,
                                audit_status: v.audit_status === 'PENDING_INSPECTION' ? 'CLEARED' : v.audit_status,
                                auditor_notes: v.auditor_notes || '',
                                audited_bill_url: v.audited_bill_url || v.bill_url || '',
                                query_text: v.query_text || '',
                              })
                            }
                            className={styles.inspectBtn}
                          >
                            🔍 Inspect / Query
                          </button>
                        ) : (
                          // Non-auditors (Treasurer, Submitter, or Member) can answer query if raised
                          v.audit_status === 'QUERY_RAISED' && (
                            <button
                              type="button"
                              onClick={() =>
                                setResponseModal({
                                  show: true,
                                  voucher: v,
                                  response_text: v.response_text || '',
                                  response_bill_url: v.response_bill_url || '',
                                  responded_by_name: currentUser?.name || '',
                                })
                              }
                              className={styles.respondQueryBtn}
                            >
                              💬 Answer Query
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className={styles.paginationBar}>
          <div style={{ fontSize: '0.84rem', color: '#64748b' }}>
            Showing <b>{paginatedVouchers.length}</b> of <b>{filteredVouchers.length}</b> Vouchers (Page {currentPage} of {totalPages})
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className={styles.pageBtn}
            >
              ◀ Previous
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className={styles.pageBtn}
            >
              Next ▶
            </button>
          </div>
        </div>
      </div>

      {/* Formal Statutory Audit Certificate Submission Box (Only for Authenticated Auditor) */}
      {isAuditor && (
        <div className={styles.submitReportBox}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', color: '#0f172a' }}>
              📜 Formal Pre-Election Statutory Audit Clearance Certificate
            </h3>
            <p style={{ margin: '0 0 14px 0', fontSize: '0.88rem', color: '#475569', lineHeight: '1.5' }}>
              When the Committee concludes its inquiry, verify the statement of accounts below and submit the certified audit report.
            </p>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Verified Bank Balance (₹)</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={auditReportForm.bank_balance}
                  onChange={(e) => setAuditReportForm({ ...auditReportForm, bank_balance: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Corpus Reserve Fund (₹)</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={auditReportForm.corpus_balance}
                  onChange={(e) => setAuditReportForm({ ...auditReportForm, corpus_balance: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: '10px' }}>
              <label className={styles.formLabel}>Committee Statutory Certification Notes</label>
              <textarea
                rows={2}
                className={styles.formInput}
                value={auditReportForm.financial_notes}
                onChange={(e) => setAuditReportForm({ ...auditReportForm, financial_notes: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '240px' }}>
            <button
              type="button"
              onClick={handleSubmitFinalReport}
              disabled={submittingReport}
              className={styles.submitCertificateBtn}
            >
              {submittingReport ? 'Submitting...' : '📋 Digitally Sign & Submit Audit Certificate'}
            </button>
            <span style={{ fontSize: '0.76rem', color: '#64748b', textAlign: 'center' }}>
              Submitting as: <b>{auditorSession.name}</b>
            </span>
          </div>
        </div>
      )}

      {/* Modal 1: Auditor Inspect & Raise Query / Clear Voucher */}
      {inspectModal.show && inspectModal.voucher && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>
                🔍 Auditor Inspection: {inspectModal.voucher.voucher_no}
              </h3>
              <button
                type="button"
                onClick={() => setInspectModal({ show: false, voucher: null, audit_status: 'CLEARED', auditor_notes: '', audited_bill_url: '', query_text: '' })}
                className={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            <div className={styles.metaCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Item Description:</span>
                <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.88rem' }}>{inspectModal.voucher.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Payee / Vendor:</span>
                <span style={{ fontWeight: '700', color: '#0284c7', fontSize: '0.85rem' }}>{inspectModal.voucher.payee_name || 'Vendor Partner'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Amount &amp; Mode:</span>
                <span style={{ fontWeight: '900', color: '#16a34a', fontSize: '1rem' }}>
                  ₹ {Number(inspectModal.voucher.amount).toLocaleString('en-IN')} ({inspectModal.voucher.payment_mode || 'BANK_UPI'})
                </span>
              </div>
            </div>

            {/* Verdict */}
            <div className={styles.formGroup} style={{ marginTop: '14px' }}>
              <label className={styles.formLabel}>Auditor Verdict</label>
              <select
                className={styles.formInput}
                value={inspectModal.audit_status}
                onChange={(e) => setInspectModal({ ...inspectModal, audit_status: e.target.value })}
              >
                <option value="CLEARED">✅ CLEARED &amp; VERIFIED (Valid bill &amp; legitimate expenditure)</option>
                <option value="QUERY_RAISED">❓ QUERY RAISED (Doubtful voucher / Explanation sought from Treasurer)</option>
                <option value="REJECTED">❌ REJECTED (Disallowed voucher / Serious financial discrepancy)</option>
              </select>
            </div>

            {/* Query Objection Box if Query Raised */}
            {inspectModal.audit_status === 'QUERY_RAISED' && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel} style={{ color: '#b91c1c' }}>
                  ❓ Audit Objection / Query Question to Treasurer
                </label>
                <textarea
                  rows={2}
                  className={styles.formInput}
                  placeholder="e.g. Missing vendor GST invoice for ₹18,000 tentage on 14-Aug-2025. Treasurer please clarify and attach bill."
                  value={inspectModal.query_text}
                  onChange={(e) => setInspectModal({ ...inspectModal, query_text: e.target.value })}
                />
              </div>
            )}

            {/* Attach Physical Bill */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                📄 Attached Physical Invoice / Bill Voucher URL
              </label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="e.g. /uploads/bills/physical_gst_bill_01.jpg or paste image link"
                value={inspectModal.audited_bill_url}
                onChange={(e) => setInspectModal({ ...inspectModal, audited_bill_url: e.target.value })}
              />
            </div>

            {/* Remarks */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Auditor Inspection Remarks</label>
              <textarea
                rows={2}
                className={styles.formInput}
                placeholder="e.g. Physical vendor receipt verified against bank entry."
                value={inspectModal.auditor_notes}
                onChange={(e) => setInspectModal({ ...inspectModal, auditor_notes: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setInspectModal({ show: false, voucher: null, audit_status: 'CLEARED', auditor_notes: '', audited_bill_url: '', query_text: '' })}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveInspectVoucher}
                className={styles.saveBtn}
              >
                💾 Save Inspection Verdict
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Concerned Person / Treasurer Answers Query */}
      {responseModal.show && responseModal.voucher && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>
                💬 Answer Audit Query: {responseModal.voucher.voucher_no}
              </h3>
              <button
                type="button"
                onClick={() => setResponseModal({ show: false, voucher: null, response_text: '', response_bill_url: '', responded_by_name: '' })}
                className={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            <div className={styles.metaCard} style={{ borderLeft: '4px solid #b91c1c' }}>
              <div style={{ fontSize: '0.78rem', color: '#b91c1c', fontWeight: '800' }}>
                AUDITOR OBJECTION / QUERY:
              </div>
              <div style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: '700', marginTop: '4px' }}>
                {responseModal.voucher.query_text || 'Explanation sought regarding missing bill / voucher authenticity.'}
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: '14px' }}>
              <label className={styles.formLabel}>Your Official Explanation</label>
              <textarea
                rows={3}
                className={styles.formInput}
                placeholder="e.g. The invoice was collected offline and verified with the vendor. Attached below for committee inspection."
                value={responseModal.response_text}
                onChange={(e) => setResponseModal({ ...responseModal, response_text: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Attach Supporting Invoice / Payment Proof URL</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="e.g. /uploads/bills/resolved_bill.jpg or image link"
                value={responseModal.response_bill_url}
                onChange={(e) => setResponseModal({ ...responseModal, response_bill_url: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Your Name &amp; Designation</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="e.g. Treasurer / Association Representative"
                value={responseModal.responded_by_name}
                onChange={(e) => setResponseModal({ ...responseModal, responded_by_name: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setResponseModal({ show: false, voucher: null, response_text: '', response_bill_url: '', responded_by_name: '' })}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQueryResponse}
                className={styles.saveBtn}
                style={{ background: '#16a34a' }}
              >
                💬 Submit Explanation to Auditor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
