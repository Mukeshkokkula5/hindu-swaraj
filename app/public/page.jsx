'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000'
).replace(/\/$/, '');

const OFFICIAL_DOCS = [
  {
    id: 'REG_CERT',
    title: 'Govt. Society Registration Certificate',
    badge: 'REGD. NO: 784/2025',
    icon: '📜',
    authority: 'Registrar of Societies, Govt. of Telangana',
    summary: 'Official incorporation and legal status under the Telangana Societies Registration Act, 2001 (Act 35 of 2001).',
    details: [
      'Registration Number: 784/2025',
      'Date of Registration: 14 January 2025',
      'Registered Name: Hindu Swaraj Youth Welfare Association',
      'Head Office: H.No. 4-1-140, Vani Nagar, Jagtial, Telangana - 505327',
      'Jurisdiction: Whole of Jagtial District & Telangana State',
    ],
  },
  {
    id: 'MOA_BYLAWS',
    title: 'Memorandum of Association & Bylaws',
    badge: 'OFFICIAL CONSTITUTION',
    icon: '📑',
    authority: 'General Body of Hindu Swaraj Youth',
    summary: 'The founding charter outlining objectives for youth leadership, 24/7 blood donation networks, emergency hospital relief, and cultural utsavams.',
    details: [
      'Clause 1: 100% Direct Emergency Medical Aid with 0% Administrative Deduction.',
      'Clause 2: Promotion of Youth Physical Fitness, Dharma & Community Service.',
      'Clause 3: 24/7 Rare Blood Donor Network across Jagtial District.',
      'Clause 4: Free Maha Annadanam & Festive Cultural Utsavams.',
    ],
  },
  {
    id: 'BANK_AUTH',
    title: 'Union Bank of India Official A/C Mandate',
    badge: 'VERIFIED BANK ACCOUNT',
    icon: '🏦',
    authority: 'Union Bank of India, Jagtial Branch',
    summary: 'Official non-profit institutional current account dedicated for public contributions and transparent seva audits.',
    details: [
      'Account Name: Hindu Swaraj Youth Welfare Association',
      'Account Number: 084910100054321',
      'IFSC Code: UBIN0808491',
      'Branch: Jagtial (505327)',
      'Authorized Signatories: President & Treasurer Joint Mandate',
    ],
  },
  {
    id: 'AUDIT_POLICY',
    title: 'Annual Social Audit & Public Transparency Policy',
    badge: '100% OPEN BOOKS',
    icon: '🛡️',
    authority: 'Governing Body Resolution No. 04',
    summary: 'Public charter guaranteeing open receipt verification, tokenized transaction lookups, and monthly public expenditure ledgers.',
    details: [
      'All public contributions receive an official digitized receipt with verifiable token.',
      'Emergency medical disbursements require medical super-speciality bill verification.',
      'Monthly income vs expense statement open for public inspection.',
    ],
  },
];

const RECENT_DISBURSEMENTS = [
  { date: '24 Aug 2026', title: 'Hospital Bill Aid for Emergency Cardiac Case (S. Rajesh)', category: 'AAPADBANDHAVA', amount: '₹45,000', location: 'Prathima Hospital, Jagtial' },
  { date: '20 Aug 2026', title: 'Maha Annadanam Provisions & Rice Sacks (3,000+ Devotees)', category: 'ANNADANAM', amount: '₹32,500', location: 'Hindu Swaraj Pandal Store' },
  { date: '15 Aug 2026', title: 'Independence Day Mega Blood Camp Refreshments & Medical Kits', category: 'BLOOD_SEVA', amount: '₹12,000', location: 'Red Cross Society Jagtial' },
  { date: '10 Aug 2026', title: 'Merit Student School Kits & Notebooks Distribution', category: 'YOUTH_AID', amount: '₹8,500', location: 'Govt. High School Jagtial' },
];

export default function PublicTransparencyPortal() {
  const [overview, setOverview] = useState({
    stats: {
      total_donations: 187299,
      total_donations_count: 54,
      total_blood_units: 16,
      total_volunteers: 42,
      total_members: 11,
      total_emergency_cases: 3,
      estimated_meals_served: 4500,
    },
    association: {
      name: "Hindu Swaraj Youth Welfare Association",
      reg_number: "Regd. No: 784/2025 (Govt. of Telangana)",
      address: "H.No. 4-1-140, Vani Nagar, Jagtial - 505327",
      phone: "+91 8499878425",
      email: "info@hinduswarajyouth.online",
      bank_name: "Union Bank of India",
      account_number: "084910100054321",
      ifsc: "UBIN0808491",
      branch: "Jagtial",
    }
  });

  const [resolutions, setResolutions] = useState([]);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Citizen Grievance Form State
  const [citizenForm, setCitizenForm] = useState({
    name: '',
    phone: '',
    area: '',
    category: 'COMMUNITY_DEVELOPMENT',
    title: '',
    message: '',
  });
  const [submittingGrievance, setSubmittingGrievance] = useState(false);
  const [grievanceResponse, setGrievanceResponse] = useState(null);

  useEffect(() => {
    fetchPublicData();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const verifyParam = params.get('verify');
      if (verifyParam) {
        setVerifyCode(verifyParam);
        doVerify(verifyParam);
      }
    }
  }, []);

  const fetchPublicData = async () => {
    try {
      const [ovRes, resRes] = await Promise.all([
        fetch(`${API_BASE_URL}/public/overview`),
        fetch(`${API_BASE_URL}/public/resolutions`),
      ]);
      const ovData = await ovRes.json();
      const resData = await resRes.json();
      if (ovData.success) setOverview(ovData);
      if (resData.success) setResolutions(resData.data || []);
    } catch (e) {
      console.warn("Public overview loaded with live fallback data:", e);
    }
  };

  const doVerify = async (code) => {
    const cleanCode = (code || '').trim();
    if (!cleanCode) return;
    setVerifying(true);
    setVerifyResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/public/verify/${encodeURIComponent(cleanCode)}`);
      const data = await res.json();
      setVerifyResult(data);
      setTimeout(() => {
        const el = document.getElementById('verifier-box');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (err) {
      setVerifyResult({
        valid: false,
        message: 'Network verification error. Please try again or call the official helpline.',
      });
    } finally {
      setVerifying(false);
    }
  };

  // Handle Certificate Verification Lookup
  const handleVerify = async (e) => {
    e.preventDefault();
    doVerify(verifyCode);
  };

  // Handle Citizen Grievance Submission
  const handleCitizenSubmit = async (e) => {
    e.preventDefault();
    setSubmittingGrievance(true);
    setGrievanceResponse(null);

    try {
      const res = await fetch(`${API_BASE_URL}/public/citizen-suggestion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(citizenForm),
      });
      const data = await res.json();
      if (data.success) {
        setGrievanceResponse(data);
        setCitizenForm({
          name: '',
          phone: '',
          area: '',
          category: 'COMMUNITY_DEVELOPMENT',
          title: '',
          message: '',
        });
      } else {
        alert(data.error || 'Failed to submit grievance');
      }
    } catch (err) {
      alert('Error submitting grievance. Please try again.');
    } finally {
      setSubmittingGrievance(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.ambientGlowTop}></div>

      {/* Top Navbar */}
      <nav className={styles.topNav}>
        <div className={styles.topNavContainer}>
          <Link href="/" className={styles.brandLink}>
            <Image src="/images/logo_v2.png" alt="Hindu Swaraj" width={40} height={40} />
            <div>
              <div style={{ fontWeight: '900', fontSize: '1rem', color: '#ffd700', lineHeight: 1.1 }}>
                HINDU SWARAJ YOUTH
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: '800', color: '#ffb74d', letterSpacing: '0.5px' }}>
                PUBLIC TRANSPARENCY &amp; CITIZEN PORTAL
              </div>
            </div>
          </Link>

          <Link href="/" className={styles.backHomeBtn}>
            🏠 Back to Home
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className={styles.heroSection}>
        <div className={styles.heroTag}>
          🏛️ 100% పారదర్శక సమాజ సేవ • Public Transparency &amp; Social Audit
        </div>
        <h1 className={styles.heroTitle}>
          ప్రజా వేదిక &amp; <span className={styles.heroTitleGold}>పారదర్శక సేవా నివేదిక</span>
        </h1>
        <p className={styles.heroSubtitle}>
          హిందూ స్వరాజ్ యూత్ వెల్ఫేర్ అసోసియేషన్ (జగిత్యాల) ద్వారా చేపట్టిన ప్రతి సేవా కార్యక్రమం, రక్తదానం, అత్యవసర వైద్య నిధుల వినియోగం మరియు సర్టిఫికెట్ల ప్రామాణీకరణ కోసం అధికారిక ప్రజా వేదిక.
        </p>
      </header>

      {/* Main Content */}
      <main className={styles.mainContainer}>
        {/* 1. Impact & Social Audit Metrics Grid */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>💖</div>
            <div>
              <div className={styles.metricNumber}>₹{Number(overview.stats.total_donations).toLocaleString('en-IN')}+</div>
              <div className={styles.metricLabel}>Total Seva Contributions Utilized</div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>🚨</div>
            <div>
              <div className={styles.metricNumber}>100%</div>
              <div className={styles.metricLabel}>Direct Medical Aid (0% Admin Cut)</div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>🩸</div>
            <div>
              <div className={styles.metricNumber}>{overview.stats.total_blood_units}+ Units</div>
              <div className={styles.metricLabel}>Emergency Blood Units Coordinated</div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>🍲</div>
            <div>
              <div className={styles.metricNumber}>{overview.stats.estimated_meals_served}+</div>
              <div className={styles.metricLabel}>Maha Annadanam Meals Served</div>
            </div>
          </div>
        </div>

        {/* 2. Universal Certificate & Receipt Validator */}
        <section id="verifier-box" className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span>🔍</span>
              <span>యూనివర్సల్ సర్టిఫికెట్ &amp; రసీదు ప్రామాణీకరణ (Live Authenticity Validator)</span>
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '4px 12px', borderRadius: '20px', fontWeight: '800' }}>
              ✓ BLOCKCHAIN-GRADE VERIFICATION
            </span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 16px' }}>
            Enter your Donation Receipt Token, Blood Hero Certificate ID, or Member/Volunteer ID to instantly verify its official authenticity against the association database:
          </p>

          <form onSubmit={handleVerify} className={styles.verifierBox}>
            <div className={styles.verifierInputRow}>
              <input
                type="text"
                placeholder="e.g. HSY-SEVA-2026-0001, HSY-BD-2026-0001, HSY/JGTL/2026/0004..."
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                className={styles.verifierInput}
              />
              <button type="submit" disabled={verifying} className={styles.verifyBtn}>
                {verifying ? '⚡ Verifying...' : '🔍 Check Authenticity'}
              </button>
            </div>

            {/* Verification Result Output */}
            {verifyResult && (
              <div className={verifyResult.valid ? styles.verifiedResultCard : styles.verifierBox} style={{ marginTop: '20px', borderColor: verifyResult.valid ? '#10b981' : '#ef4444' }}>
                {verifyResult.valid ? (
                  <>
                    <div className={styles.verifiedHeader}>
                      <div>
                        <div style={{ color: '#10b981', fontWeight: '900', fontSize: '1.2rem' }}>
                          ✅ 100% OFFICIALLY VERIFIED &amp; GENUINE
                        </div>
                        <div style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>
                          {verifyResult.title} • {verifyResult.ref_id}
                        </div>
                      </div>
                      <div className={styles.verifiedBadge}>GOVT REGD: 784/2025</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '0.9rem' }}>
                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>HOLDER NAME:</span>
                        <strong style={{ color: '#fff', fontSize: '1.1rem' }}>{verifyResult.holder_name}</strong>
                      </div>
                      {verifyResult.role && (
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>DESIGNATION / ROLE:</span>
                          <strong style={{ color: '#38bdf8', fontSize: '1.1rem' }}>{verifyResult.role}</strong>
                        </div>
                      )}
                      {verifyResult.amount && (
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>CONTRIBUTION AMOUNT:</span>
                          <strong style={{ color: '#ffd700', fontSize: '1.1rem' }}>{verifyResult.amount}</strong>
                        </div>
                      )}
                      {verifyResult.blood_group && (
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>BLOOD GROUP / UNITS:</span>
                          <strong style={{ color: '#f43f5e', fontSize: '1.1rem' }}>{verifyResult.blood_group} {verifyResult.units ? `(${verifyResult.units})` : ''}</strong>
                        </div>
                      )}
                      {verifyResult.status && (
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>MEMBERSHIP STATUS:</span>
                          <strong style={{ color: '#4ade80', fontSize: '1rem' }}>
                            {verifyResult.status === 'VERIFIED_MEMBER' ? 'ACTIVE LIFETIME MEMBER' : verifyResult.status}
                          </strong>
                        </div>
                      )}
                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>DATE &amp; AUTHORITY:</span>
                        <strong style={{ color: '#cbd5e1' }}>{new Date(verifyResult.date).toLocaleDateString('en-IN')} • {verifyResult.authority}</strong>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ color: '#fca5a5', fontWeight: '700', textAlign: 'center', padding: '12px' }}>
                    ⚠️ {verifyResult.message || 'No record found. Please verify the code or call helpline.'}
                  </div>
                )}
              </div>
            )}
          </form>
        </section>

        {/* 3. Official Document Vault */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span>🏛️</span>
              <span>అధికారిక పత్రాల నిలయం (Official Legal &amp; Document Vault)</span>
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#ffd700', background: 'rgba(255,215,0,0.15)', padding: '4px 12px', borderRadius: '20px', fontWeight: '800' }}>
              PUBLIC RTI COMPLIANT
            </span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 20px' }}>
            All foundational bylaws, registration charters, and institutional banking mandates are open for public inspection:
          </p>

          <div className={styles.docsGrid}>
            {OFFICIAL_DOCS.map((doc) => (
              <div key={doc.id} className={styles.docCard}>
                <div className={styles.docIconWrap}>{doc.icon}</div>
                <span className={styles.docBadge}>{doc.badge}</span>
                <div className={styles.docTitle}>{doc.title}</div>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4, margin: 0 }}>
                  {doc.summary}
                </p>
                <button
                  type="button"
                  className={styles.docViewBtn}
                  onClick={() => setSelectedDoc(doc)}
                >
                  👁️ Inspect Official Record
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Live Seva Expenditure Ledger */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span>📊</span>
              <span>లైవ్ సేవా ఖర్చుల లెక్కల పుస్తకం (Public Seva Ledger)</span>
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '4px 12px', borderRadius: '20px', fontWeight: '800' }}>
              100% ITEMIZED AUDIT
            </span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 20px' }}>
            Recent community aid disbursements and seva operational expenses funded by public contributions:
          </p>

          <div className={styles.ledgerBox}>
            <table className={styles.ledgerTable}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Seva Initiative / Beneficiary</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_DISBURSEMENTS.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '700', color: '#ffd700' }}>{item.date}</td>
                    <td><strong style={{ color: '#fff' }}>{item.title}</strong></td>
                    <td><span className={styles.ledgerCategoryTag}>{item.category}</span></td>
                    <td>{item.location}</td>
                    <td style={{ fontWeight: '900', color: '#34d399', fontSize: '1rem' }}>{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. Citizen Grievance & Suggestion Desk */}
        <section className={styles.sectionCard} id="grievance">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span>💡</span>
              <span>ప్రజా సలహాలు &amp; వినతుల వేదిక (Citizen Grievance &amp; Suggestions)</span>
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#60a5fa', background: 'rgba(59,130,246,0.15)', padding: '4px 12px', borderRadius: '20px', fontWeight: '800' }}>
              DIRECT TO EXECUTIVE COMMITTEE
            </span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 20px' }}>
            Are there community issues, blood camp requests, student coaching, or cleanliness drives needed in your colony in Jagtial? Submit directly:
          </p>

          <form onSubmit={handleCitizenSubmit}>
            <div className={styles.formGrid2}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Citizen Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Nagaraju or Anonymous"
                  className={styles.inputControl}
                  value={citizenForm.name}
                  onChange={(e) => setCitizenForm({ ...citizenForm, name: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Mobile Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+91 98480 00000"
                  className={styles.inputControl}
                  value={citizenForm.phone}
                  onChange={(e) => setCitizenForm({ ...citizenForm, phone: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.formGrid2}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Colony / Village / Area in Jagtial *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vani Nagar / Tower Circle / Jagtial Rural"
                  className={styles.inputControl}
                  value={citizenForm.area}
                  onChange={(e) => setCitizenForm({ ...citizenForm, area: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Suggestion Category *</label>
                <select
                  className={styles.inputControl}
                  value={citizenForm.category}
                  onChange={(e) => setCitizenForm({ ...citizenForm, category: e.target.value })}
                >
                  <option value="COMMUNITY_DEVELOPMENT">🏙️ Community &amp; Colony Development</option>
                  <option value="BLOOD_CAMP_REQUEST">🩸 Request Blood Donation Camp</option>
                  <option value="STUDENT_EDUCATION">📚 Youth Coaching &amp; Student Aids</option>
                  <option value="CLEAN_GREEN">🌳 Clean &amp; Green Jagtial Drive</option>
                  <option value="TEMPLE_FESTIVAL">🪔 Temple Seva &amp; Festival Support</option>
                </select>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Suggestion Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Need regular blood donation camp in our colony..."
                className={styles.inputControl}
                value={citizenForm.title}
                onChange={(e) => setCitizenForm({ ...citizenForm, title: e.target.value })}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Detailed Message / Request *</label>
              <textarea
                required
                rows={4}
                placeholder="Explain the suggestion, problem or community requirement in detail..."
                className={styles.inputControl}
                value={citizenForm.message}
                onChange={(e) => setCitizenForm({ ...citizenForm, message: e.target.value })}
              ></textarea>
            </div>

            <button type="submit" disabled={submittingGrievance} className={styles.submitCitizenBtn}>
              {submittingGrievance ? '⚡ Submitting...' : '📨 Submit Suggestion to Executive Committee'}
            </button>

            {grievanceResponse && (
              <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', borderRadius: '12px', color: '#6ee7b7', fontSize: '0.9rem' }}>
                {grievanceResponse.message}
              </div>
            )}
          </form>
        </section>

        {/* 6. Public Resolutions & Community Gazettes */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span>📜</span>
              <span>అసోసియేషన్ ప్రజా తీర్మానాలు (Public Resolutions &amp; Gazettes)</span>
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#ffd700', background: 'rgba(255,215,0,0.15)', padding: '4px 12px', borderRadius: '20px', fontWeight: '800' }}>
              OFFICIAL GOVERNANCE
            </span>
          </div>

          <div className={styles.resolutionsGrid}>
            {resolutions.map((res) => (
              <div key={res.id} className={styles.resolutionCard}>
                <div className={styles.resolutionDate}>
                  📅 {res.date} • {res.passed_by}
                </div>
                <div className={styles.resolutionTitle}>{res.title}</div>
                <div className={styles.resolutionDesc}>{res.description}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Official Accreditation & Legal Identity */}
        <section className={styles.sectionCard} style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)' }}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span>🏛️</span>
              <span>అధికారిక రిజిస్ట్రేషన్ &amp; బ్యాంక్ వివరాలు (Official Accreditation)</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', fontSize: '0.9rem', color: '#cbd5e1' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: '#ffd700', fontWeight: '800', marginBottom: '6px' }}>🏛️ Society Registration</div>
              <div><b>Regd. No</b>: 784/2025 (Govt. of Telangana)</div>
              <div><b>Societies Act</b>: Telangana Societies Registration Act, 2001</div>
              <div><b>Jurisdiction</b>: Jagtial District, Telangana - 505327</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: '#ffd700', fontWeight: '800', marginBottom: '6px' }}>🏦 Official Seva Bank Account</div>
              <div><b>Bank</b>: Union Bank of India</div>
              <div><b>A/C Name</b>: Hindu Swaraj Youth Welfare Association</div>
              <div><b>A/C No</b>: 084910100054321 • <b>IFSC</b>: UBIN0808491</div>
              <div><b>Branch</b>: Jagtial</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: '#ffd700', fontWeight: '800', marginBottom: '6px' }}>📞 Central Contact Desk</div>
              <div><b>Helpline</b>: +91 8499878425</div>
              <div><b>Email</b>: info@hinduswarajyouth.online</div>
              <div><b>Head Office</b>: H.No. 4-1-140, Vani Nagar, Jagtial - 505327</div>
            </div>
          </div>
        </section>
      </main>

      {/* Document Inspector Modal */}
      {selectedDoc && (
        <div className={styles.modalOverlay} onClick={() => setSelectedDoc(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.8rem' }}>{selectedDoc.icon}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#ffd700' }}>{selectedDoc.title}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{selectedDoc.authority}</span>
                </div>
              </div>
              <button className={styles.modalCloseBtn} onClick={() => setSelectedDoc(null)}>✕</button>
            </div>

            <div style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: '0.95rem' }}>
              <p style={{ fontWeight: '700', color: '#fff' }}>{selectedDoc.summary}</p>
              
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginTop: '14px' }}>
                <div style={{ color: '#ffd700', fontWeight: '800', fontSize: '0.82rem', marginBottom: '8px', textTransform: 'uppercase' }}>
                  📜 Document Clauses &amp; Legal Specifics:
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {selectedDoc.details.map((d, i) => (
                    <li key={i} style={{ marginBottom: '6px' }}>{d}</li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.78rem', color: '#6ee7b7' }}>
                ✓ Certified True Copy • Hindu Swaraj Youth Welfare Association (Regd. 784/2025)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
