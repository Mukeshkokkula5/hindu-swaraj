'use client';

import React, { useState, useEffect } from 'react';
import styles from './ElectionCommandDesk.module.css';

export default function ElectionCommandDesk({ token, currentUser, isSuperAdmin, isFullAdmin }) {
  const canManage = Boolean(isSuperAdmin);
  const [loading, setLoading] = useState(true);
  const [electionData, setElectionData] = useState(null);
  const [activeStage, setActiveStage] = useState('audit'); // 'audit' | 'commission' | 'schedule' | 'nominations' | 'polling' | 'results'
  const [actionMsg, setActionMsg] = useState(null);
  const [processing, setProcessing] = useState(false);

  // New Cycle Form State
  const [newCycleForm, setNewCycleForm] = useState({
    title: 'Executive Committee General Elections 2026–2028',
    term_years: 2,
    gazette_notes: 'Statutory Biennial General Elections under Telangana Societies Registration Act 2001 (Regd No: 784/2025).',
  });

  // Pre-Election Audit Form State
  const [auditForm, setAuditForm] = useState({
    financial_status: 'CLEARED',
    financial_notes: 'All financial ledgers, bank statements, and bill vouchers verified with zero discrepancy.',
    bank_balance: '185000',
    corpus_balance: '500000',
    dues_status: 'CLEARED',
    eligible_voters_count: '42',
    pending_dues_members_count: '0',
    voters_notes: '100% dues clearance verified. All active members placed on the official electoral roll.',
    tenure_verified: true,
    verdict: 'RECOMMENDED_FOR_ELECTION',
    approval_remarks: 'Statutory audit findings reviewed and verified. Election Commission authorized to issue notification.',
  });

  // Audit Summary State
  const [vouchersSummary, setVouchersSummary] = useState(null);

  // Election Schedule Form State
  const [scheduleForm, setScheduleForm] = useState({
    nomination_start: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    nomination_end: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
    scrutiny_date: new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 16),
    withdrawal_deadline: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 16),
    polling_start: new Date(Date.now() + 86400000 * 6).toISOString().slice(0, 16),
    polling_end: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16),
    results_date: new Date(Date.now() + 86400000 * 8).toISOString().slice(0, 16),
    gazette_notes: 'Official election notification issued as per society bylaws. Polling via secret digital ballot.',
  });

  // Scrutiny Modal State
  const [scrutinyModal, setScrutinyModal] = useState({
    show: false,
    nomination: null,
    status: 'ACCEPTED',
    remarks: '',
  });

  // Appoint / Modify Committee Modal State
  const [showCommitteeModal, setShowCommitteeModal] = useState(false);
  const [committeeForm, setCommitteeForm] = useState([
    { name: 'Dr. K. V. Raman Rao', role: 'AUDIT_CONVENER', designation: 'Pre-Election Audit Committee Convener & Senior Auditor', email: '' },
    { name: 'Adv. S. Laxminarayana', role: 'LEGAL_AUDITOR', designation: 'Legal Scrutiny & Compliance Member', email: '' },
    { name: 'Sri B. Satyanarayana', role: 'VOUCHER_OFFICER', designation: 'Physical Voucher & Bank Ledger Verification Officer', email: '' },
  ]);

  const API_BASE = (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000'
  ).replace(/\/$/, '');

  const getAuthHeader = () => {
    const activeToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('admin_token') || localStorage.getItem('token') || ''
        : '');
    return activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
  };

  useEffect(() => {
    loadElectionData();
  }, []);

  const loadElectionData = async () => {
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
        // Auto-select active tab based on status
        const status = data.cycle.status;
        if (status === 'AUDIT_PHASE') setActiveStage('audit');
        else if (status === 'AUDIT_CLEARED') setActiveStage('commission');
        else if (status === 'NOTIFIED') setActiveStage('nominations');
        else if (status === 'POLLING_ACTIVE' || status === 'POLLING_CLOSED') setActiveStage('polling');
        else if (status === 'RESULTS_DECLARED' || status === 'COMPLETED') setActiveStage('results');
      } else {
        setElectionData(null);
      }
    } catch (err) {
      console.warn('Failed to load election data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load audit vouchers for the active cycle
  const loadVouchers = async (electionId) => {
    if (!electionId) return;
    try {
      const res = await fetch(`${API_BASE}/elections/audit/vouchers/${electionId}`, {
        headers: { ...getAuthHeader() },
      });
      const data = await res.json();
      if (data.success) {
        setVouchersSummary(data.summary || null);
      }
    } catch (err) {
      console.warn('Failed to load audit vouchers summary:', err);
    }
  };

  // Save / Modify Pre-Election Audit Committee
  const handleSaveAuditCommittee = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!electionData?.cycle?.id) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/elections/audit-committee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ election_id: electionData.cycle.id, members: committeeForm }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: data.message });
        setShowCommitteeModal(false);
        loadElectionData();
      } else {
        setActionMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };



  // 1. Create Election Cycle
  const handleCreateCycle = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/elections/cycle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(newCycleForm),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: data.message });
        loadElectionData();
      } else {
        setActionMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  // 2. Submit Statutory Pre-Election Audit Report
  const handleSubmitAuditReport = async () => {
    if (!electionData?.cycle?.id) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/elections/audit-report/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          election_id: electionData.cycle.id,
          ...auditForm,
          submitted_by: currentUser?.name || 'Pre-Election Audit Committee Convener',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: data.message });
        loadElectionData();
      } else {
        setActionMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  // 3. Super Admin Formally Approves Audit Clearance
  const handleApproveAuditClearance = async () => {
    if (!electionData?.cycle?.id) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/elections/audit-report/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          election_id: electionData.cycle.id,
          approval_remarks: auditForm.approval_remarks,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: data.message });
        loadElectionData();
        setActiveStage('commission');
      } else {
        setActionMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  // 4. Appoint Independent Election Commission
  const handleAppointCommission = async () => {
    if (!electionData?.cycle?.id) return;
    setProcessing(true);
    try {
      const officers = [
        { name: 'Dr. K. V. Raman Rao', role: 'CHIEF_ELECTION_OFFICER', phone: '+91 9440123456', email: 'ro@hinduswarajyouth.online' },
        { name: 'Adv. S. Laxminarayana', role: 'ELECTION_OBSERVER', phone: '+91 9848123456', email: 'observer@hinduswarajyouth.online' },
        { name: 'Sri B. Satyanarayana', role: 'SCRUTINY_OFFICER', phone: '+91 9490123456', email: 'scrutiny@hinduswarajyouth.online' },
      ];
      const res = await fetch(`${API_BASE}/elections/commission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ election_id: electionData.cycle.id, officers }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: data.message });
        loadElectionData();
        setActiveStage('schedule');
      } else {
        setActionMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  // 5. Issue Gazette Election Notification & Schedule
  const handleIssueNotification = async () => {
    if (!electionData?.cycle?.id) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/elections/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ election_id: electionData.cycle.id, ...scheduleForm }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: data.message });
        loadElectionData();
        setActiveStage('nominations');
      } else {
        setActionMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  // 6. Returning Officer Scrutinizes Nomination
  const handleScrutinizeNomination = async () => {
    if (!scrutinyModal.nomination?.id) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/elections/nominations/${scrutinyModal.nomination.id}/scrutiny`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          status: scrutinyModal.status,
          scrutiny_remarks: scrutinyModal.remarks || `Statutory verification passed by Returning Officer.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: data.message });
        setScrutinyModal({ show: false, nomination: null, status: 'ACCEPTED', remarks: '' });
        loadElectionData();
      } else {
        setActionMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  // 7. Toggle Live Polling (Start / Stop)
  const handleTogglePolling = async (status) => {
    if (!electionData?.cycle?.id) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/elections/cycle/polling-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ election_id: electionData.cycle.id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: data.message });
        loadElectionData();
      } else {
        setActionMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  // 8. Seal Poll & Trigger Automated Counting
  const handleSealAndCount = async () => {
    if (!electionData?.cycle?.id) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/elections/voting/seal-and-count`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ election_id: electionData.cycle.id }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: data.message });
        loadElectionData();
        setActiveStage('results');
      } else {
        setActionMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  // 9. 1-Click Sync & Apply Winners to System Roles
  const handleApplyRoles = async () => {
    if (!electionData?.cycle?.id) return;
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/elections/apply-roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ election_id: electionData.cycle.id }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: data.message });
        loadElectionData();
      } else {
        setActionMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  // 10. Reset Cast Votes & Re-Open Polling for Testing
  const handleResetVotes = async () => {
    if (!electionData?.cycle?.id) return;
    if (!window.confirm('⚠️ ARE YOU SURE? This will delete all cast secret ballot votes, reset voter participation records, and re-open polling for fresh voting test.')) {
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/elections/reset-votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ election_id: electionData.cycle.id }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: data.message });
        loadElectionData();
        setActiveStage('polling');
      } else {
        setActionMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  // 11. Completely Reset / Wipe All Election Data
  const handleResetAll = async () => {
    if (!window.confirm('⚠️ WARNING: This will completely delete ALL election cycles, audit reports, nominations, votes, and results from database, starting a brand new clean slate. Proceed?')) {
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/elections/reset-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: data.message });
        setElectionData(null);
      } else {
        setActionMsg({ type: 'error', text: data.error });
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  // Print Official Certificate
  const handlePrintCertificate = (result) => {
    const printWin = window.open('', '_blank');
    printWin.document.write(`
      <html>
        <head>
          <title>Election Certificate - ${result.winner_name}</title>
          <style>
            body { font-family: 'Cinzel', 'Georgia', serif; padding: 40px; background: #fff; color: #1e293b; text-align: center; }
            .cert-box { border: 12px double #c2410c; padding: 40px; border-radius: 16px; background: #fffdfa; box-shadow: 0 8px 30px rgba(0,0,0,0.1); position: relative; }
            .cert-logo { width: 90px; height: 90px; border-radius: 50%; margin-bottom: 12px; }
            .org-title { font-size: 28px; font-weight: 800; color: #9a3412; letter-spacing: 1px; margin: 0; }
            .reg-no { font-size: 13px; font-weight: 700; color: #64748b; margin-top: 4px; }
            .proclamation { font-size: 32px; font-weight: 900; color: #1e293b; margin: 24px 0 10px 0; border-bottom: 2px solid #fdba74; display: inline-block; padding-bottom: 8px; }
            .cert-body { font-size: 18px; line-height: 1.8; color: #334155; margin: 30px 40px; }
            .winner-name { font-size: 26px; font-weight: 900; color: #c2410c; text-decoration: underline; }
            .post-name { font-size: 22px; font-weight: 800; color: #0369a1; }
            .meta-grid { display: flex; justify-content: space-between; margin-top: 50px; padding: 0 40px; }
            .sig-block { text-align: center; }
            .sig-line { width: 180px; height: 1px; background: #0f172a; margin-bottom: 8px; }
            .sig-title { font-size: 14px; font-weight: 700; color: #0f172a; }
            .seal-img { width: 100px; height: 100px; opacity: 0.85; }
            .cert-code { font-family: monospace; font-size: 12px; color: #64748b; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="cert-box">
            <img src="/images/logo_v2.png" class="cert-logo" alt="Logo" />
            <h1 class="org-title">HINDU SWARAJ YOUTH WELFARE ASSOCIATION</h1>
            <div class="reg-no">Registered under Telangana Societies Registration Act 2001 &bull; Regd No: 784/2025</div>
            <div class="proclamation">CERTIFICATE OF ELECTION &amp; PROCLAMATION</div>
            <div class="cert-body">
              This is to officially certify that <span class="winner-name">${result.winner_name}</span> has been duly elected as the
              <br/><span class="post-name">${result.post_name}</span>
              <br/>of the <b>Hindu Swaraj Youth Association</b> for the Biennial Executive Tenure <b>2026–2028</b> in the Democratic General Elections.
              <br/>${result.is_uncontested ? '<b>Declared Elected Unopposed (ఏకగ్రీవం)</b> by unanimous resolution.' : `Secured <b>${result.votes_secured} votes</b> with a winning margin of <b>${result.margin} votes</b>.`}
            </div>
            <div class="meta-grid">
              <div class="sig-block">
                <div class="sig-line"></div>
                <div class="sig-title">Returning Officer (RO)</div>
                <div style="font-size:12px; color:#64748b;">Statutory Election Commission</div>
              </div>
              <div>
                <img src="/images/logo_v2.png" class="seal-img" alt="Seal" />
                <div style="font-size:11px; font-weight:800; color:#9a3412;">OFFICIAL SEAL</div>
              </div>
              <div class="sig-block">
                <div class="sig-line"></div>
                <div class="sig-title">General Secretary / President</div>
                <div style="font-size:12px; color:#64748b;">Hindu Swaraj Youth Association</div>
              </div>
            </div>
            <div class="cert-code">Verification Code: ${result.certificate_code} &bull; Date of Proclamation: ${new Date(result.declared_at).toLocaleDateString('en-IN')}</div>
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <div className={styles.spinner} />
        <div>Loading Statutory Democratic Election Control Desk...</div>
      </div>
    );
  }

  // If no election is currently initialized
  if (!electionData) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>🗳️ Statutory Democratic Election Control Desk</h2>
            <p className={styles.subtitle}>
              Conforming strictly to the Telangana Societies Registration Act (2001) &bull; Regd No: 784/2025
            </p>
          </div>
        </div>

        <div className={styles.noElectionCard}>
          <div className={styles.noElecIcon}>🏛️</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e293b', margin: '0 0 10px 0' }}>
            No Active Election Cycle in Progress
          </h3>
          <p style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto 24px auto', lineHeight: '1.6' }}>
            As per society bylaws, all general body executive committee elections must begin with a 
            <b> Statutory Pre-Election Audit &amp; Inquiry</b> of financial ledgers, subscription dues, and voter records.
          </p>

          {canManage && (
            <form onSubmit={handleCreateCycle} className={styles.createCycleForm}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Election Title &amp; Tenure Period</label>
                <input
                  type="text"
                  className={styles.inputControl}
                  value={newCycleForm.title}
                  onChange={(e) => setNewCycleForm({ ...newCycleForm, title: e.target.value })}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Executive Committee Tenure (Years)</label>
                <select
                  className={styles.inputControl}
                  value={newCycleForm.term_years}
                  onChange={(e) => setNewCycleForm({ ...newCycleForm, term_years: parseInt(e.target.value, 10) })}
                >
                  <option value={2}>2 Years (Standard Statutory Term 2026–2028)</option>
                  <option value={1}>1 Year (Annual Term)</option>
                  <option value={3}>3 Years (Triennial Term)</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Statutory Proclamation Notes</label>
                <textarea
                  rows={2}
                  className={styles.inputControl}
                  value={newCycleForm.gazette_notes}
                  onChange={(e) => setNewCycleForm({ ...newCycleForm, gazette_notes: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={processing}
                className={styles.primaryActionBtn}
                style={{ width: '100%', marginTop: '12px' }}
              >
                {processing ? 'Initiating...' : '🚀 Initiate Election Cycle & Start Statutory Audit'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const { cycle, auditReport, auditTeam, commission, posts, nominations, results, stats } = electionData;
  const isAuditCleared = cycle.status !== 'AUDIT_PHASE';
  const isNotified = cycle.status === 'NOTIFIED' || cycle.status === 'POLLING_ACTIVE' || cycle.status === 'POLLING_CLOSED' || cycle.status === 'RESULTS_DECLARED' || cycle.status === 'COMPLETED';

  // Role checks for appointed committee members & officers
  const isAuditMember = Boolean(
    isSuperAdmin ||
    auditTeam?.some(
      (m) =>
        (currentUser?.id && Number(m.user_id) === Number(currentUser.id)) ||
        (currentUser?.name && m.member_name?.toLowerCase().includes(currentUser.name.toLowerCase()))
    )
  );

  const isCommissionOfficer = Boolean(
    isSuperAdmin ||
    commission?.some(
      (c) =>
        (currentUser?.name && c.officer_name?.toLowerCase().includes(currentUser.name.toLowerCase())) ||
        (currentUser?.email && c.email?.toLowerCase() === currentUser.email.toLowerCase())
    )
  );

  const canInspectVouchers = Boolean(isSuperAdmin || isAuditMember);
  const canManageElection = Boolean(isSuperAdmin);
  const canScrutinize = Boolean(isSuperAdmin || isCommissionOfficer);

  return (
    <div className={styles.container}>
      {/* Top Banner Header */}
      <div className={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 className={styles.title}>🗳️ {cycle.title}</h2>
            <span className={styles.statusBadge} data-status={cycle.status}>
              {cycle.status === 'AUDIT_PHASE' && '🔍 Pre-Election Audit in Progress'}
              {cycle.status === 'AUDIT_CLEARED' && '✅ Audit Cleared &bull; Commission Appointed'}
              {cycle.status === 'NOTIFIED' && '📢 Gazette Notification Active &bull; Nominations Open'}
              {cycle.status === 'POLLING_ACTIVE' && '🟢 Live Polling Booth Active'}
              {cycle.status === 'POLLING_CLOSED' && '🔒 Polling Closed &bull; Ready for Count'}
              {cycle.status === 'RESULTS_DECLARED' && '🏆 Election Results Proclaimed'}
              {cycle.status === 'COMPLETED' && '🎉 Roles Synchronized &bull; Completed'}
            </span>
          </div>
          <p className={styles.subtitle}>
            Hindu Swaraj Youth Welfare Association &bull; Regd No: 784/2025 &bull; Electoral Roll: <b>{stats?.totalVoters || 0} Registered Voters</b>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={loadElectionData}
            className={styles.refreshBtn}
            disabled={processing}
          >
            🔄 Refresh
          </button>

          {canManageElection && (
            <>
              <button
                type="button"
                onClick={handleResetVotes}
                disabled={processing}
                style={{
                  background: '#fff7ed',
                  border: '1px solid #fdba74',
                  color: '#c2410c',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
                title="Clear all cast secret votes & reset voter status to test voting again"
              >
                🔄 Re-Test Polling (Clear Votes)
              </button>

              <button
                type="button"
                onClick={handleResetAll}
                disabled={processing}
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  color: '#dc2626',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
                title="Completely wipe all election cycles, audit reports, and results to start 100% fresh"
              >
                💥 Reset All (Fresh Start)
              </button>
            </>
          )}
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMsg && (
        <div className={actionMsg.type === 'success' ? styles.alertSuccess : styles.alertError}>
          <span>{actionMsg.text}</span>
          <button type="button" onClick={() => setActionMsg(null)} className={styles.closeAlertBtn}>✕</button>
        </div>
      )}

      {/* Statutory 6-Stage Progress Stepper */}
      <div className={styles.stepperBar}>
        {[
          { id: 'audit', label: '1. Pre-Election Audit', icon: '🔍', active: true, done: isAuditCleared },
          { id: 'commission', label: '2. Election Commission', icon: '⚖️', active: isAuditCleared, done: commission?.length > 0 },
          { id: 'schedule', label: '3. Gazette Schedule', icon: '📢', active: commission?.length > 0, done: isNotified },
          { id: 'nominations', label: '4. Nominations & Scrutiny', icon: '📝', active: isNotified, done: nominations?.length > 0 },
          { id: 'polling', label: '5. Secret Digital Ballot', icon: '🗳️', active: isNotified, done: cycle.status === 'RESULTS_DECLARED' || cycle.status === 'COMPLETED' },
          { id: 'results', label: '6. Results & Certificates', icon: '🏆', active: cycle.status === 'RESULTS_DECLARED' || cycle.status === 'COMPLETED', done: cycle.status === 'COMPLETED' },
        ].map((st) => (
          <button
            key={st.id}
            type="button"
            className={`${styles.stepBtn} ${activeStage === st.id ? styles.stepBtnSelected : ''} ${st.done ? styles.stepBtnDone : ''}`}
            onClick={() => setActiveStage(st.id)}
          >
            <span className={styles.stepIcon}>{st.done ? '✓' : st.icon}</span>
            <span className={styles.stepLabel}>{st.label}</span>
          </button>
        ))}
      </div>

      {/* =========================================================================
          STAGE 1: STATUTORY PRE-ELECTION AUDIT & VOUCHER INSPECTION ENGINE
      ========================================================================= */}
      {activeStage === 'audit' && (
        <div className={styles.stageCard}>
          <div className={styles.stageHeader}>
            <div>
              <h3 className={styles.stageTitle}>🔍 Stage 1: Pre-Election Statutory Audit &amp; 2-Year Transaction Scrutiny</h3>
              <p className={styles.stageDesc}>
                Under Section 12 of the Telangana Societies Registration Act, elections cannot be notified without formal clearance of accounts, physical bill inspections, vendor vouchers, and no-dues scrutiny.
              </p>
            </div>
            {isAuditCleared ? (
              <span className={styles.verifiedTag}>✅ STATUTORY AUDIT CLEARED &amp; APPROVED</span>
            ) : (
              <span className={styles.pendingTag}>⏳ AUDIT INQUIRY IN PROGRESS</span>
            )}
          </div>

          {/* 1. Audit Committee Roster */}
          <div className={styles.auditCommitteeSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>
                  👥 Statutory Pre-Election Audit Committee
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                  Independent committee appointed to verify vouchers, spot-check bills, and inspect bank balances.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <a
                  href="/audit"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.smallActionBtn}
                  style={{ background: '#0f172a', color: '#fff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  🔐 Open Independent Auditor Portal (/audit) ↗
                </a>

                {canManage && (
                  <button
                    type="button"
                    onClick={() => {
                      if (auditTeam && auditTeam.length >= 3) {
                        setCommitteeForm([
                          { name: auditTeam[0].member_name, role: auditTeam[0].member_role || 'AUDIT_CONVENER', designation: auditTeam[0].designation || 'Pre-Election Audit Committee Convener & Senior Auditor', email: auditTeam[0].email || '' },
                          { name: auditTeam[1].member_name, role: auditTeam[1].member_role || 'LEGAL_AUDITOR', designation: auditTeam[1].designation || 'Legal Scrutiny & Compliance Member', email: auditTeam[1].email || '' },
                          { name: auditTeam[2].member_name, role: auditTeam[2].member_role || 'VOUCHER_OFFICER', designation: auditTeam[2].designation || 'Physical Voucher & Bank Ledger Verification Officer', email: auditTeam[2].email || '' },
                        ]);
                      }
                      setShowCommitteeModal(true);
                    }}
                    className={styles.smallActionBtn}
                    style={{ background: '#0284c7', color: '#fff', border: 'none' }}
                  >
                    ✏️ Appoint / Modify Committee
                  </button>
                )}
              </div>
            </div>

            <div className={styles.committeeGrid}>
              {(auditTeam?.length > 0 ? auditTeam : [
                { member_name: 'Dr. K. V. Raman Rao', designation: 'Audit Committee Convener & Senior Auditor' },
                { member_name: 'Adv. S. Laxminarayana', designation: 'Legal Scrutiny & Societies Act Compliance Member' },
                { member_name: 'Sri B. Satyanarayana', designation: 'Physical Voucher & Bank Ledger Verification Officer' },
              ]).map((m, idx) => (
                <div key={idx} className={styles.committeeMemberCard}>
                  <div className={styles.committeeAvatar}>📋</div>
                  <div>
                    <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>{m.member_name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: '700' }}>{m.designation}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Top Overview Cards */}
          <div className={styles.auditGrid} style={{ marginTop: '20px' }}>
            {/* 1. Accounts & Financial Books Scrutiny */}
            <div className={styles.auditCard}>
              <div className={styles.auditCardHead}>
                <span>💰 Financial Books &amp; Ledgers Audit</span>
                <span className={styles.auditChipGreen}>Verified</span>
              </div>
              <div className={styles.auditMetric}>
                <div>
                  <div className={styles.metricLabel}>Cash in Bank Balance</div>
                  <div className={styles.metricVal}>₹ {Number(auditForm.bank_balance).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className={styles.metricLabel}>Corpus Reserve Fund</div>
                  <div className={styles.metricVal}>₹ {Number(auditForm.corpus_balance).toLocaleString('en-IN')}</div>
                </div>
              </div>
              <div className={styles.auditNotes}>
                <b>Audit Remarks:</b> All bank statements and treasury balance verified with passbook records.
              </div>
            </div>

            {/* 2. Member Dues & Subscription Scrutiny */}
            <div className={styles.auditCard}>
              <div className={styles.auditCardHead}>
                <span>💳 Subscription Dues &amp; No-Dues Scrutiny</span>
                <span className={styles.auditChipGreen}>No Dues Pending</span>
              </div>
              <div className={styles.auditMetric}>
                <div>
                  <div className={styles.metricLabel}>Eligible Voting Members</div>
                  <div className={styles.metricVal}>{stats?.totalVoters || 10} Active</div>
                </div>
                <div>
                  <div className={styles.metricLabel}>Pending Dues Defaulters</div>
                  <div className={styles.metricVal} style={{ color: '#16a34a' }}>0 Members</div>
                </div>
              </div>
              <div className={styles.auditNotes}>
                <b>No-Dues Clearance:</b> 100% dues clearance verified across all active members on roll.
              </div>
            </div>

            {/* 3. Tenure & Governance Scrutiny */}
            <div className={styles.auditCard}>
              <div className={styles.auditCardHead}>
                <span>📜 Executive Committee Tenure Audit</span>
                <span className={styles.auditChipGreen}>Tenure Expired</span>
              </div>
              <div className={styles.auditNotes}>
                <b>Statutory Tenure Check:</b> Current 2-year executive body tenure has reached conclusion. General body elections recommended.
              </div>
            </div>
          </div>

          {/* =========================================================================
              3. STATUTORY INDEPENDENT AUDIT INQUIRY & PROGRESS (EXECUTIVE DESK)
          ========================================================================= */}
          <div className={styles.voucherSection}>
            <div className={styles.voucherSectionHead}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🛡️ Statutory Pre-Election Audit Inquiry &amp; Progress</span>
                  <span className={styles.sampleBadge}>Independent Scrutiny</span>
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  To guarantee statutory neutrality under Section 12 of the Telangana Societies Registration Act, ground voucher scrutiny and physical bill attachments are conducted exclusively by the appointed committee inside the <b>Independent Auditor Portal</b>.
                </p>
              </div>
            </div>

            {/* Live Inquiry Summary Metrics */}
            <div className={styles.voucherMetricsRow}>
              <div className={styles.vMetricBox}>
                <div className={styles.vMetricLabel}>Total Scanned Vouchers</div>
                <div className={styles.vMetricVal}>{vouchersSummary?.total_vouchers || 0}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>₹ {Number(vouchersSummary?.total_audited_amount || 0).toLocaleString('en-IN')} Total Value</div>
              </div>
              <div className={styles.vMetricBox} style={{ borderLeftColor: '#ea580c' }}>
                <div className={styles.vMetricLabel}>⚠️ Missing Bills</div>
                <div className={styles.vMetricVal} style={{ color: '#ea580c' }}>{vouchersSummary?.missing_bills_count || 0}</div>
                <div style={{ fontSize: '0.72rem', color: '#ea580c', marginTop: '2px' }}>Flagged for Inquiry</div>
              </div>
              <div className={styles.vMetricBox} style={{ borderLeftColor: '#0284c7' }}>
                <div className={styles.vMetricLabel}>💰 High Value (&gt;₹5k)</div>
                <div className={styles.vMetricVal} style={{ color: '#0284c7' }}>{vouchersSummary?.high_value_count || 0}</div>
                <div style={{ fontSize: '0.72rem', color: '#0284c7', marginTop: '2px' }}>Tenure High Expenses</div>
              </div>
              <div className={styles.vMetricBox} style={{ borderLeftColor: '#16a34a' }}>
                <div className={styles.vMetricLabel}>✅ Cleared &amp; Verified</div>
                <div className={styles.vMetricVal} style={{ color: '#16a34a' }}>{vouchersSummary?.cleared_count || 0}</div>
                <div style={{ fontSize: '0.72rem', color: '#16a34a', marginTop: '2px' }}>Passed by Committee</div>
              </div>
              <div className={styles.vMetricBox} style={{ borderLeftColor: '#dc2626' }}>
                <div className={styles.vMetricLabel}>❓ Queries / Rejected</div>
                <div className={styles.vMetricVal} style={{ color: '#dc2626' }}>
                  {(Number(vouchersSummary?.query_count) || 0) + (Number(vouchersSummary?.rejected_count) || 0)}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#dc2626', marginTop: '2px' }}>Discrepancies Flagged</div>
              </div>
            </div>

            {/* Committee Inquiry Status Notice */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 20px', marginTop: '14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ fontSize: '1.8rem' }}>📋</div>
              <div>
                <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>
                  {auditReport ? '✅ Formal Statutory Audit Clearance Certificate Submitted' : '⏳ Independent Committee Inquiry In Progress'}
                </div>
                <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '2px' }}>
                  {auditReport
                    ? `Submitted by ${auditReport.submitted_by} on ${new Date(auditReport.submitted_at).toLocaleDateString('en-IN')}: "${auditReport.financial_notes}"`
                    : 'The appointed Audit Committee is currently inspecting physical bills and verifying 2-year ledgers in the Auditor Portal. Super Admin can review and approve clearance once submitted.'}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Super Admin Formal Acceptance & Approval Box */}
          <div className={styles.actionBox} style={{ marginTop: '24px' }}>
            <div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#0f172a' }}>
                {isAuditCleared ? '✅ Pre-Election Statutory Audit Clearance Proclamation' : '📋 Statutory Audit Clearance Acceptance'}
              </h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                {isAuditCleared
                  ? `Audit Report approved by Super Admin on ${new Date(auditReport?.super_admin_approved_at || Date.now()).toLocaleDateString('en-IN')}. Stage 2 Election Commission is unblocked.`
                  : 'Review the Committee\'s certified findings above and formally accept the audit clearance to proceed to Stage 2.'}
              </p>
            </div>

            {!isAuditCleared && canManage && (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleApproveAuditClearance}
                  disabled={processing}
                  className={styles.primaryActionBtn}
                >
                  {processing ? 'Processing...' : '✅ Formally Accept Statutory Audit Clearance'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 2: INDEPENDENT ELECTION COMMISSION APPOINTMENT
      ========================================================================= */}
      {activeStage === 'commission' && (
        <div className={styles.stageCard}>
          <div className={styles.stageHeader}>
            <div>
              <h3 className={styles.stageTitle}>⚖️ Stage 2: Independent Election Commission &amp; Returning Officers</h3>
              <p className={styles.stageDesc}>
                To ensure 100% neutrality, appointed Election Officers take a statutory pledge and are strictly barred from contesting in this election.
              </p>
            </div>
            {commission?.length > 0 ? (
              <span className={styles.verifiedTag}>⚖️ COMMISSION CONSTITUTED ({commission.length} OFFICERS)</span>
            ) : (
              <span className={styles.pendingTag}>⏳ PENDING APPOINTMENT</span>
            )}
          </div>

          <div className={styles.commissionGrid}>
            {(commission?.length > 0 ? commission : [
              { officer_name: 'Dr. K. V. Raman Rao', officer_role: 'CHIEF_ELECTION_OFFICER', phone: '+91 9440123456', email: 'ro@hinduswarajyouth.online' },
              { officer_name: 'Adv. S. Laxminarayana', officer_role: 'ELECTION_OBSERVER', phone: '+91 9848123456', email: 'observer@hinduswarajyouth.online' },
              { officer_name: 'Sri B. Satyanarayana', officer_role: 'SCRUTINY_OFFICER', phone: '+91 9490123456', email: 'scrutiny@hinduswarajyouth.online' },
            ]).map((off, idx) => (
              <div key={idx} className={styles.officerCard}>
                <div className={styles.officerAvatar}>⚖️</div>
                <div style={{ flex: 1 }}>
                  <div className={styles.officerName}>{off.officer_name}</div>
                  <div className={styles.officerRole}>
                    {off.officer_role === 'CHIEF_ELECTION_OFFICER' && '👑 Chief Election Officer (Returning Officer)'}
                    {off.officer_role === 'ELECTION_OBSERVER' && '👁️ Senior Election Observer'}
                    {off.officer_role === 'SCRUTINY_OFFICER' && '🔍 Scrutiny & Verification Officer'}
                  </div>
                  <div className={styles.officerMeta}>
                    <span>📞 {off.phone || '+91 9440123456'}</span>
                    <span>✉️ {off.email || 'commission@hinduswarajyouth.online'}</span>
                  </div>
                </div>
                <span className={styles.neutralPledgeBadge}>Neutrality Pledged ✓</span>
              </div>
            ))}
          </div>

          {commission?.length === 0 && canManage && (
            <div className={styles.actionBox} style={{ marginTop: '20px' }}>
              <div>
                <h4 style={{ margin: '0 0 6px 0' }}>Appoint Neutral Returning Officers</h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                  Appoint the statutory 3-member independent election commission to conduct secret voting.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAppointCommission}
                disabled={processing}
                className={styles.primaryActionBtn}
              >
                {processing ? 'Appointing...' : '⚖️ Formally Appoint Election Commission'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          STAGE 3: GAZETTE ELECTION NOTIFICATION & SCHEDULE
      ========================================================================= */}
      {activeStage === 'schedule' && (
        <div className={styles.stageCard}>
          <div className={styles.stageHeader}>
            <div>
              <h3 className={styles.stageTitle}>📢 Stage 3: Gazette Election Notification &amp; Key Timeline</h3>
              <p className={styles.stageDesc}>
                Statutory election dates schedule for nominations, scrutiny, withdrawal, secret digital voting, and counting.
              </p>
            </div>
            {isNotified ? (
              <span className={styles.verifiedTag}>📢 GAZETTE NOTIFICATION ISSUED</span>
            ) : (
              <span className={styles.pendingTag}>⏳ PENDING NOTIFICATION RELEASE</span>
            )}
          </div>

          <div className={styles.scheduleGrid}>
            <div className={styles.scheduleRow}>
              <div className={styles.schedIcon}>📝</div>
              <div style={{ flex: 1 }}>
                <div className={styles.schedTitle}>Filing of Candidate Nominations</div>
                <div className={styles.schedDesc}>Eligible members submit nomination with proposer and seconder.</div>
              </div>
              <div className={styles.schedDates}>
                {new Date(cycle.nomination_start || scheduleForm.nomination_start).toLocaleDateString('en-IN')} &ndash; {new Date(cycle.nomination_end || scheduleForm.nomination_end).toLocaleDateString('en-IN')}
              </div>
            </div>

            <div className={styles.scheduleRow}>
              <div className={styles.schedIcon}>🔍</div>
              <div style={{ flex: 1 }}>
                <div className={styles.schedTitle}>Returning Officer Scrutiny of Nominations</div>
                <div className={styles.schedDesc}>Verification of candidate eligibility, manifestos, and no-dues clearance.</div>
              </div>
              <div className={styles.schedDates}>
                {new Date(cycle.scrutiny_date || scheduleForm.scrutiny_date).toLocaleDateString('en-IN')}
              </div>
            </div>

            <div className={styles.scheduleRow}>
              <div className={styles.schedIcon}>↩️</div>
              <div style={{ flex: 1 }}>
                <div className={styles.schedTitle}>Last Date for Withdrawal of Candidature</div>
                <div className={styles.schedDesc}>Voluntary withdrawal window and final publication of contesting candidates.</div>
              </div>
              <div className={styles.schedDates}>
                {new Date(cycle.withdrawal_deadline || scheduleForm.withdrawal_deadline).toLocaleDateString('en-IN')}
              </div>
            </div>

            <div className={styles.scheduleRow}>
              <div className={styles.schedIcon}>🗳️</div>
              <div style={{ flex: 1 }}>
                <div className={styles.schedTitle}>Secret Digital Ballot Polling Window</div>
                <div className={styles.schedDesc}>2-Step Email OTP authenticated secret digital voting booth.</div>
              </div>
              <div className={styles.schedDates}>
                {new Date(cycle.polling_start || scheduleForm.polling_start).toLocaleDateString('en-IN')} &ndash; {new Date(cycle.polling_end || scheduleForm.polling_end).toLocaleDateString('en-IN')}
              </div>
            </div>

            <div className={styles.scheduleRow}>
              <div className={styles.schedIcon}>🏆</div>
              <div style={{ flex: 1 }}>
                <div className={styles.schedTitle}>Automated Counting &amp; Proclamation of Results</div>
                <div className={styles.schedDesc}>Official declaration of winners and issuance of signed election certificates.</div>
              </div>
              <div className={styles.schedDates}>
                {new Date(cycle.results_date || scheduleForm.results_date).toLocaleDateString('en-IN')}
              </div>
            </div>
          </div>

          {!isNotified && canManage && (
            <div className={styles.actionBox} style={{ marginTop: '20px' }}>
              <div>
                <h4 style={{ margin: '0 0 6px 0' }}>Publish Official Gazette Notification</h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                  Release notification to all members and open the nomination filing window.
                </p>
              </div>
              <button
                type="button"
                onClick={handleIssueNotification}
                disabled={processing}
                className={styles.primaryActionBtn}
              >
                {processing ? 'Publishing...' : '📢 Release Gazette Notification & Open Nominations'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          STAGE 4: CANDIDATE NOMINATIONS & RETURNING OFFICER SCRUTINY
      ========================================================================= */}
      {activeStage === 'nominations' && (
        <div className={styles.stageCard}>
          <div className={styles.stageHeader}>
            <div>
              <h3 className={styles.stageTitle}>📝 Stage 4: Candidate Nominations &amp; Returning Officer Scrutiny</h3>
              <p className={styles.stageDesc}>
                Review nominations filed by members. Returning Officer accepts/rejects based on society statutory code.
              </p>
            </div>
            <span className={styles.verifiedTag}>
              {nominations?.length || 0} NOMINATIONS FILED
            </span>
          </div>

          {/* Contested Posts Roster */}
          <div className={styles.postsAccordion}>
            {posts?.map((p) => {
              const postNoms = nominations?.filter((n) => n.post_id === p.id) || [];
              return (
                <div key={p.id} className={styles.postBlock}>
                  <div className={styles.postBlockHead}>
                    <div>
                      <span className={styles.postTitleText}>{p.post_name}</span>
                      <span className={styles.vacanciesBadge}>{p.vacancies} Vacancy</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                      {postNoms.length} Candidates Nominated
                    </span>
                  </div>

                  {postNoms.length === 0 ? (
                    <div style={{ padding: '16px', color: '#94a3b8', fontSize: '0.88rem', textAlign: 'center' }}>
                      No nominations filed yet for this post.
                    </div>
                  ) : (
                    <div className={styles.candidateGrid}>
                      {postNoms.map((nom) => (
                        <div key={nom.id} className={styles.candidateCard}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <img
                              src={nom.candidate_photo_url || '/images/activity-leadership.png'}
                              alt={nom.candidate_name}
                              className={styles.candidatePhoto}
                            />
                            <div>
                              <div className={styles.candidateName}>{nom.candidate_name}</div>
                              <div className={styles.candidatePhone}>📞 {nom.candidate_phone || 'Verified Member'}</div>
                            </div>
                          </div>

                          <div className={styles.manifestoQuote}>
                            &ldquo;{nom.manifesto}&rdquo;
                          </div>

                          <div className={styles.proposerBox}>
                            <span><b>Proposed by:</b> {nom.proposer_name}</span>
                            <span><b>Seconded by:</b> {nom.seconder_name}</span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                            <span className={styles.nomStatusTag} data-status={nom.status}>
                              {nom.status}
                            </span>

                            {canScrutinize && nom.status === 'SUBMITTED' && (
                              <button
                                type="button"
                                onClick={() => setScrutinyModal({ show: true, nomination: nom, status: 'ACCEPTED', remarks: '' })}
                                className={styles.scrutinyActionBtn}
                              >
                                🔍 Scrutinize
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 5: SECRET DIGITAL BALLOT & LIVE POLLING CONTROL
      ========================================================================= */}
      {activeStage === 'polling' && (
        <div className={styles.stageCard}>
          <div className={styles.stageHeader}>
            <div>
              <h3 className={styles.stageTitle}>🗳️ Stage 5: Secret Digital Ballot &amp; Live Turnout Control</h3>
              <p className={styles.stageDesc}>
                100% secret digital balloting. Voter anonymity is guaranteed by separating participation logs from cast votes.
              </p>
            </div>
            <span className={styles.statusBadge} data-status={cycle.status}>
              {cycle.status === 'POLLING_ACTIVE' ? '🟢 LIVE POLLING BOOTH OPEN' : '🔒 POLLING CLOSED'}
            </span>
          </div>

          {/* Turnout Progress Bar */}
          <div className={styles.turnoutContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: '700' }}>
              <span>Electoral Participation &amp; Turnout</span>
              <span style={{ color: '#0284c7' }}>{stats?.turnoutPct || 0}% ({stats?.votedCount || 0} / {stats?.totalVoters || 0} Votes Cast)</span>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${stats?.turnoutPct || 0}%` }} />
            </div>
          </div>

          {/* Polling Control Actions */}
          <div className={styles.actionBox} style={{ marginTop: '24px' }}>
            <div>
              <h4 style={{ margin: '0 0 4px 0' }}>Election Commission Polling Controls</h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                Open voting to allow members to cast secret OTP ballots, or seal the booth to begin counting.
              </p>
            </div>

            {canScrutinize && (
              <div style={{ display: 'flex', gap: '10px' }}>
                {cycle.status !== 'POLLING_ACTIVE' && cycle.status !== 'RESULTS_DECLARED' && cycle.status !== 'COMPLETED' && (
                  <button
                    type="button"
                    onClick={() => handleTogglePolling('POLLING_ACTIVE')}
                    disabled={processing}
                    className={styles.startPollingBtn}
                  >
                    🟢 Open Live Polling Booth
                  </button>
                )}

                {cycle.status === 'POLLING_ACTIVE' && (
                  <button
                    type="button"
                    onClick={() => handleTogglePolling('POLLING_CLOSED')}
                    disabled={processing}
                    className={styles.stopPollingBtn}
                  >
                    🔒 Close &amp; Seal Polling Booth
                  </button>
                )}

                {cycle.status === 'POLLING_CLOSED' && (
                  <button
                    type="button"
                    onClick={handleSealAndCount}
                    disabled={processing}
                    className={styles.primaryActionBtn}
                  >
                    {processing ? 'Counting...' : '📊 Seal Poll & Trigger Automated Counting'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 6: RESULTS, PROCLAMATION & CERTIFICATES
      ========================================================================= */}
      {activeStage === 'results' && (
        <div className={styles.stageCard}>
          <div className={styles.stageHeader}>
            <div>
              <h3 className={styles.stageTitle}>🏆 Stage 6: Official Results Proclamation &amp; Winner Certificates</h3>
              <p className={styles.stageDesc}>
                Certified election results verified by the Independent Returning Officer with high-resolution downloadable certificates.
              </p>
            </div>
            <span className={styles.verifiedTag}>🏆 PROCLAMATION COMPLETED</span>
          </div>

          <div className={styles.resultsGrid}>
            {results?.map((res) => (
              <div key={res.id} className={styles.resultWinnerCard}>
                <div className={styles.winnerTrophy}>🏆</div>
                <div style={{ flex: 1 }}>
                  <div className={styles.winnerPost}>{res.post_name}</div>
                  <div className={styles.winnerName}>{res.winner_name}</div>
                  <div className={styles.winnerMeta}>
                    {res.is_uncontested ? (
                      <span style={{ color: '#059669', fontWeight: '800' }}>⭐ Elected Unopposed (ఏకగ్రీవం)</span>
                    ) : (
                      <span>Secured <b>{res.votes_secured} Votes</b> &bull; Margin: <b>+{res.margin} Votes</b></span>
                    )}
                  </div>
                  <div className={styles.certCode}>Proclamation ID: {res.certificate_code}</div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePrintCertificate(res)}
                  className={styles.printCertBtn}
                >
                  🪪 Print Official Certificate
                </button>
              </div>
            ))}
          </div>

          {/* 1-Click Database Role Migration Button */}
          {cycle.status === 'RESULTS_DECLARED' && canManage && (
            <div className={styles.actionBox} style={{ marginTop: '24px', background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.08), rgba(2, 132, 199, 0.08))' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: '#9a3412' }}>🔄 Automatic Executive Body Transition</h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                  Update system user accounts and roles in the database to match the newly elected executive committee officers.
                </p>
              </div>

              <button
                type="button"
                onClick={handleApplyRoles}
                disabled={processing}
                className={styles.primaryActionBtn}
                style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
              >
                {processing ? 'Applying...' : '🎉 1-Click Apply Elected Roles to Database'}
              </button>
            </div>
          )}
        </div>
      )}



      {/* =========================================================================
          MODAL 2: RETURNING OFFICER CANDIDATE SCRUTINY
      ========================================================================= */}
      {scrutinyModal.show && scrutinyModal.nomination && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', color: '#0f172a' }}>
              🔍 Returning Officer Scrutiny: {scrutinyModal.nomination.candidate_name}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 16px 0' }}>
              Nominated Post: <b>{scrutinyModal.nomination.post_name}</b>
            </p>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Scrutiny Decision</label>
              <select
                className={styles.inputControl}
                value={scrutinyModal.status}
                onChange={(e) => setScrutinyModal({ ...scrutinyModal, status: e.target.value })}
              >
                <option value="ACCEPTED">✅ ACCEPT NOMINATION (Valid Candidate)</option>
                <option value="REJECTED">❌ REJECT NOMINATION (Statutory Ineligibility)</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Official Returning Officer Remarks</label>
              <textarea
                rows={3}
                className={styles.inputControl}
                placeholder="e.g. Verified active membership, dues clearance, and proposer/seconder authenticity."
                value={scrutinyModal.remarks}
                onChange={(e) => setScrutinyModal({ ...scrutinyModal, remarks: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setScrutinyModal({ show: false, nomination: null, status: 'ACCEPTED', remarks: '' })}
                className={styles.modalCancelBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleScrutinizeNomination}
                disabled={processing}
                className={styles.primaryActionBtn}
              >
                {processing ? 'Recording...' : '💾 Save Scrutiny Verdict'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: APPOINT / MODIFY 3-MEMBER STATUTORY AUDIT COMMITTEE
      ========================================================================= */}
      {showCommitteeModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '720px', maxHeight: '88vh', overflowY: 'auto', padding: '26px 30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>✏️</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '900' }}>
                    Appoint / Modify Statutory Audit Committee
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                    Mandated under Section 12 of the Telangana Societies Registration Act 2001
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCommitteeModal(false)}
                className={styles.closeModalX}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAuditCommittee}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
                {committeeForm.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderLeft: idx === 0 ? '5px solid #0284c7' : idx === 1 ? '5px solid #9333ea' : '5px solid #16a34a',
                      borderRadius: '12px',
                      padding: '14px 18px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontWeight: '900', color: '#0f172a', fontSize: '0.92rem' }}>
                        👤 Member #{idx + 1}: {idx === 0 ? 'Convener & Chief Auditor' : idx === 1 ? 'Legal Scrutiny Member' : 'Voucher Verification Officer'}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#475569', fontWeight: '800', background: '#e2e8f0', padding: '2px 8px', borderRadius: '10px' }}>
                        {idx === 0 ? 'Statutory Convener' : idx === 1 ? 'Legal Compliance' : 'Physical Verification'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.2fr', gap: '12px', marginBottom: '8px' }}>
                      <div>
                        <label className={styles.inputLabel} style={{ fontSize: '0.78rem', marginBottom: '4px' }}>Full Legal Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. VINODH KUMAR"
                          className={styles.inputControl}
                          style={{ padding: '8px 12px', fontSize: '0.88rem' }}
                          value={m.name}
                          onChange={(e) => {
                            const updated = [...committeeForm];
                            updated[idx].name = e.target.value;
                            setCommitteeForm(updated);
                          }}
                        />
                      </div>
                      <div>
                        <label className={styles.inputLabel} style={{ fontSize: '0.78rem', marginBottom: '4px' }}>Official Designation</label>
                        <input
                          type="text"
                          placeholder="e.g. Pre-Election Audit Committee Convener"
                          className={styles.inputControl}
                          style={{ padding: '8px 12px', fontSize: '0.88rem' }}
                          value={m.designation}
                          onChange={(e) => {
                            const updated = [...committeeForm];
                            updated[idx].designation = e.target.value;
                            setCommitteeForm(updated);
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={styles.inputLabel} style={{ fontSize: '0.78rem', marginBottom: '4px' }}>
                        Auditor Email Address (for 6-Digit PIN &amp; Magic Link dispatch)
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. vinodhkumarkokkula@gmail.com"
                        className={styles.inputControl}
                        style={{ padding: '8px 12px', fontSize: '0.88rem' }}
                        value={m.email || ''}
                        onChange={(e) => {
                          const updated = [...committeeForm];
                          updated[idx].email = e.target.value;
                          setCommitteeForm(updated);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowCommitteeModal(false)}
                  className={styles.modalCancelBtn}
                  style={{ padding: '9px 18px', fontSize: '0.88rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className={styles.primaryActionBtn}
                  style={{ padding: '9px 24px', fontSize: '0.92rem' }}
                >
                  {processing ? 'Dispatching Mandates...' : '💾 Save & Dispatch Appointment Mandates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
