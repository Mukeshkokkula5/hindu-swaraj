'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import EmergencyBloodTicker from '@/components/EmergencyBloodTicker';
import styles from './page.module.css';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000'
).replace(/\/$/, '');

const BLOOD_GROUPS = ['ALL', 'O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];

const JAGTIAL_HOSPITALS = [
  { name: 'District Area Hospital & Blood Centre', location: 'Near Tower Circle, Jagtial', phone: '+91 8499878425', type: 'Govt. 24/7 Centre' },
  { name: 'Indian Red Cross Society Blood Bank', location: 'Collectorate Road, Jagtial', phone: '+91 8499878425', type: 'Voluntary Blood Bank' },
  { name: 'Prathima Institute of Medical Sciences / Hospital', location: 'Karimnagar - Jagtial Highway', phone: '+91 8499878425', type: 'Multi-Speciality' },
  { name: 'Mother & Child Care Govt. Hospital', location: 'Dharmapuri Road, Jagtial', phone: '+91 8499878425', type: 'Govt. Maternity & Pediatric' },
];

const resolveBloodPhotoUrl = (url) => {
  if (!url || typeof url !== 'string') return '/images/activity-blood.png';
  const trimmed = url.trim();
  if (!trimmed) return '/images/activity-blood.png';
  if (trimmed.startsWith('data:')) return trimmed;
  if (trimmed.startsWith('http://localhost') || trimmed.startsWith('http://127.0.0.1')) {
    return trimmed.replace(/https?:\/\/[^\/]+/, API_BASE_URL);
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/images/')) return trimmed;
  const clean = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${API_BASE_URL}${clean}`;
};

export default function BloodDonationPage() {
  const [heroes, setHeroes] = useState([]);
  const [stats, setStats] = useState({
    total_donations: 4,
    total_units: 4,
    unique_donors: 4,
    lives_impacted: 12,
  });
  const [assocInfo, setAssocInfo] = useState({});
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCertDonor, setSelectedCertDonor] = useState(null);

  // SOS Request Form State
  const [sosForm, setSosForm] = useState({
    patient_name: '',
    blood_group: 'O+',
    units: 1,
    hospital: 'Area Hospital Jagtial',
    contact_phone: '',
    urgency: 'CRITICAL_IMMEDIATE',
    notes: '',
  });
  const [sosLoading, setSosLoading] = useState(false);
  const [sosSubmitted, setSosSubmitted] = useState(false);
  const [sosDispatchResult, setSosDispatchResult] = useState(null);

  // Donor Registration State
  const [donorForm, setDonorForm] = useState({
    name: '',
    phone: '',
    blood_group: 'O+',
    area: 'Jagtial Town',
    weight: '55+ kg',
  });
  const [donorSubmitted, setDonorSubmitted] = useState(false);
  const [donorLoading, setDonorLoading] = useState(false);

  // Live Blood Match Radar State
  const [radarBloodGroup, setRadarBloodGroup] = useState('O+');
  const [matchedDonors, setMatchedDonors] = useState([]);
  const [compatibleGroups, setCompatibleGroups] = useState(['O+', 'O-']);
  const [radarLoading, setRadarLoading] = useState(false);
  const [copiedBroadcast, setCopiedBroadcast] = useState(false);

  useEffect(() => {
    fetchHeroes();
    fetchMatchedDonors('O+');
  }, []);

  const fetchMatchedDonors = async (bg) => {
    setRadarLoading(true);
    try {
      const encodedBg = encodeURIComponent(bg);
      const res = await fetch(`${API_BASE_URL}/blood-donations/match-donors?blood_group=${encodedBg}`);
      const data = await res.json();
      if (data.success) {
        setMatchedDonors(data.donors || []);
        setCompatibleGroups(data.compatible_groups || [bg]);
      }
    } catch (e) {
      console.warn("Failed to fetch matched donors:", e);
    } finally {
      setRadarLoading(false);
    }
  };

  const handleSelectRadarGroup = (bg) => {
    setRadarBloodGroup(bg);
    fetchMatchedDonors(bg);
  };

  const handleCopyBroadcastText = () => {
    const text = `🚨 *URGENT BLOOD REQUIREMENT IN JAGTIAL*\n• *Required Group*: ${radarBloodGroup}\n• *Compatible Groups*: ${compatibleGroups.join(', ')}\n• *Association*: Hindu Swaraj Youth Welfare Association (Jagtial)\n• *24/7 Helpline*: +91 8499878425\n\nIf you or someone you know can donate in Jagtial, please contact immediately! 🚩`;
    navigator.clipboard.writeText(text);
    setCopiedBroadcast(true);
    setTimeout(() => setCopiedBroadcast(false), 3000);
  };

  const fetchHeroes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/blood-donations/public`);
      const data = await res.json();
      if (data.success) {
        setHeroes(data.heroes || []);
        if (data.stats) setStats(data.stats);
        if (data.assoc_info) setAssocInfo(data.assoc_info);
      }
    } catch (err) {
      console.error('Failed to fetch blood heroes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSosSubmit = async (e) => {
    e.preventDefault();
    setSosLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/blood-donations/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sosForm),
      });
      const data = await res.json();
      if (data.success) {
        setSosSubmitted(true);
        setSosDispatchResult(data);
        if (data.whatsapp_url && typeof window !== 'undefined') {
          window.open(data.whatsapp_url, '_blank');
        }
      } else {
        alert(data.error || 'Failed to dispatch SOS alert. Please call helpline directly.');
      }
    } catch (err) {
      console.error('SOS dispatch error:', err);
      alert('Network error while dispatching SOS. Please call helpline directly.');
    } finally {
      setSosLoading(false);
    }
  };

  const handleDonorRegister = async (e) => {
    e.preventDefault();
    setDonorLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/volunteer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: donorForm.name,
          phone: donorForm.phone,
          blood_group: donorForm.blood_group,
          city: donorForm.area,
          areas_of_interest: '🩸 Voluntary Blood Donation Emergency Pool',
          availability: '24/7 Emergency Calls',
          message: `Registered as voluntary blood donor (${donorForm.blood_group}) in Jagtial. Weight: ${donorForm.weight}.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDonorSubmitted(true);
      } else {
        alert(data.error || 'Failed to register. Please try again.');
      }
    } catch (err) {
      alert('Registration failed. Please contact helpline directly.');
    } finally {
      setDonorLoading(false);
    }
  };

  const filteredHeroes = heroes.filter((h) => {
    const matchesGroup = selectedGroup === 'ALL' || h.blood_group === selectedGroup;
    const s = searchQuery.toLowerCase();
    const matchesSearch =
      !s ||
      (h.donor_name && h.donor_name.toLowerCase().includes(s)) ||
      (h.hospital_or_camp && h.hospital_or_camp.toLowerCase().includes(s)) ||
      (h.certificate_id && h.certificate_id.toLowerCase().includes(s));
    return matchesGroup && matchesSearch;
  });

  return (
    <div className={styles.pageWrapper}>
      {/* Live Emergency Ticker */}
      <EmergencyBloodTicker />

      {/* Top Navbar */}
      <nav className={styles.topNav}>
        <div className={styles.topNavContainer}>
          <Link href="/" className={styles.brandLink}>
            <Image src="/images/logo_v2.png" alt="Hindu Swaraj Logo" width={40} height={40} />
            <div>
              <div style={{ fontWeight: '900', fontSize: '1rem', color: '#7f1d1d', lineHeight: 1.1 }}>
                HINDU SWARAJ YOUTH
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: '800', color: '#b91c1c', letterSpacing: '0.5px' }}>
                BLOOD SEVA NETWORK • JAGTIAL
              </div>
            </div>
          </Link>

          <div className={styles.navActionBtns}>
            <Link href="/" className={styles.backHomeBtn}>
              🏠 Back to Home
            </Link>
            <a
              href="https://wa.me/918499878425?text=🚨%20URGENT%20BLOOD%20REQUEST%20IN%20JAGTIAL"
              target="_blank"
              rel="noreferrer"
              className={styles.urgentSosBtn}
            >
              🚨 Emergency SOS
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className={styles.heroSection}>
        <div className={styles.heroTag}>
          🩸 24/7 జగిత్యాల అత్యవసర రక్తదాన సేవ • Life Saving Mission
        </div>
        <h1 className={styles.heroTitle}>
          రక్తదానమే ప్రాణదానం • <span className={styles.heroTitleHighlight}>యువత రక్తదాన వేదిక</span>
        </h1>
        <p className={styles.heroSubtitle}>
          జగిత్యాల జిల్లా మరియు పరిసర ప్రాంతాలలో అత్యవసర రోగులకు, ప్రమాద బాధితులకు తక్షణమే రక్తాన్ని సమకూర్చే నిస్వార్థ యువకుల సేవ &amp; డిజిటల్ ప్రశంసా వేదిక.
        </p>

        <div className={styles.heroCtas}>
          <a href="#sos-section" className={styles.ctaPrimary}>
            🚨 Need Urgent Blood? Request SOS
          </a>
          <a href="#register-donor" className={styles.ctaSecondary}>
            🦸‍♂️ Join as Volunteer Donor
          </a>
        </div>
      </header>

      {/* Impact Stats Ribbon */}
      <div className={styles.statsContainer}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🩸</div>
            <div className={styles.statNumber}>{stats.total_units || 4}+ Units</div>
            <div className={styles.statLabel}>Total Blood Units Donated</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>❤️</div>
            <div className={styles.statNumber}>{stats.lives_impacted || 12}+ Lives</div>
            <div className={styles.statLabel}>Estimated Lives Saved (3x)</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>🦸‍♂️</div>
            <div className={styles.statNumber}>{stats.unique_donors || 4}+ Heroes</div>
            <div className={styles.statLabel}>Registered Youth Donors</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📜</div>
            <div className={styles.statNumber}>100%</div>
            <div className={styles.statLabel}>Verified Govt. Recognised Certs</div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className={styles.mainContainer}>
        {/* ============================================================
            🩸 LIVE BLOOD MATCH DESK & COMPATIBILITY RADAR
        ============================================================ */}
        <section className={styles.radarSection}>
          <div className={styles.radarHeaderRow}>
            <div>
              <h2 className={styles.radarTitle}>
                <span>⚡</span>
                <span>లైవ్ బ్లడ్ మ్యాచ్ డెస్క్ • Live Blood Match &amp; Donor Radar</span>
              </h2>
              <p style={{ color: '#9f1239', fontSize: '0.88rem', margin: '6px 0 0 0', fontWeight: '600' }}>
                Select patient’s required blood group below to instantly locate registered donors in Jagtial and verified compatible groups:
              </p>
            </div>
            <div style={{ background: '#ffe4e6', padding: '6px 14px', borderRadius: '30px', color: '#be123c', fontWeight: '800', fontSize: '0.82rem' }}>
              🟢 {matchedDonors.length} Verified Donors Available
            </div>
          </div>

          {/* Blood Group Selector Pills */}
          <div className={styles.radarPillsRow}>
            {['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map((bg) => (
              <button
                key={bg}
                type="button"
                className={`${styles.radarPill} ${radarBloodGroup === bg ? styles.radarPillActive : ''}`}
                onClick={() => handleSelectRadarGroup(bg)}
              >
                <span>🩸</span>
                <span>{bg}</span>
                {bg.includes('-') && <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>(Rare)</span>}
              </button>
            ))}
          </div>

          {/* Compatibility Banner */}
          <div className={styles.compatibilityBanner}>
            <div className={styles.compatCol}>
              <span className={styles.compatLabel}>📥 Patient ({radarBloodGroup}) Can Safely Receive From:</span>
              <div className={styles.compatTagsRow}>
                {compatibleGroups.map((g) => (
                  <span key={g} className={`${styles.compatBadge} ${g === radarBloodGroup ? styles.compatBadgeExact : ''}`}>
                    {g === radarBloodGroup ? `✓ ${g} (Exact Match)` : `${g} (Compatible)`}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.compatCol}>
              <span className={styles.compatLabel}>📤 1-Click WhatsApp Jagtial SOS Text:</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleCopyBroadcastText}
                  className={styles.backHomeBtn}
                  style={{ background: '#ffe4e6', borderColor: '#fda4af', color: '#9f1239', padding: '5px 12px', fontSize: '0.78rem', fontWeight: '800' }}
                >
                  {copiedBroadcast ? '✓ Copied to Clipboard!' : '📋 Copy Jagtial SOS Text'}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`🚨 *URGENT BLOOD REQUIREMENT IN JAGTIAL*\n• *Required Group*: ${radarBloodGroup}\n• *Compatible Groups*: ${compatibleGroups.join(', ')}\n• *Helpline*: +91 8499878425\n\nPlease contact Hindu Swaraj Youth Jagtial if available to donate!`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.donorWhatsAppBtn}
                  style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                >
                  📲 Share on WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Matched Donors Grid */}
          {radarLoading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#be123c', fontWeight: '700' }}>
              ⚡ Scanning Jagtial Volunteer &amp; Member Blood Registry...
            </div>
          ) : (
            <div className={styles.matchedDonorsGrid}>
              {matchedDonors.map((donor) => (
                <div key={donor.id} className={styles.donorMatchCard}>
                  <div className={styles.donorCardHeader}>
                    <img
                      src={resolveBloodPhotoUrl(donor.photo_url)}
                      alt={donor.name}
                      className={styles.donorAvatar}
                    />
                    <div className={styles.donorMeta}>
                      <div className={styles.donorName}>{donor.name}</div>
                      <div className={styles.donorBadge}>{donor.badge}</div>
                    </div>
                    <div className={styles.donorBloodBadge}>
                      {donor.blood_group}
                    </div>
                  </div>

                  <div className={styles.donorLocationInfo}>
                    <span>📍</span>
                    <span>{donor.city} • {donor.availability}</span>
                  </div>

                  <div className={styles.donorActionBtns}>
                    <a
                      href={`tel:${donor.phone || '8499878425'}`}
                      className={styles.donorCallBtn}
                    >
                      📞 Call
                    </a>
                    <a
                      href={`https://wa.me/${(donor.phone || '918499878425').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`🚨 Namaste ${donor.name}! Urgent ${donor.blood_group} blood is needed in Jagtial. Can you donate or coordinate?`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.donorWhatsAppBtn}
                    >
                      💬 WhatsApp SOS
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ============================================================
            FORMS SECTION: EMERGENCY SOS & DONOR REGISTRATION
        ============================================================ */}
        <div className={styles.formsGrid} id="sos-section">
          {/* Form 1: Emergency Blood SOS Request */}
          <div className={`${styles.formCard} ${styles.sosCard}`}>
            <h3 className={styles.formTitle} style={{ color: '#991b1b' }}>
              <span>🚨</span> 24/7 Emergency Blood SOS Request
            </h3>
            <p className={styles.formDesc}>
              Fill this quick form to automatically dispatch high-priority email alerts to all members and broadcast on the Hindu Swaraj emergency network.
            </p>

            <form onSubmit={handleSosSubmit}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  className={styles.inputControl}
                  value={sosForm.patient_name}
                  onChange={(e) => setSosForm({ ...sosForm, patient_name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className={styles.inputGroup}>
                <div>
                  <label className={styles.inputLabel}>Required Blood Group *</label>
                  <select
                    className={styles.inputControl}
                    value={sosForm.blood_group}
                    onChange={(e) => setSosForm({ ...sosForm, blood_group: e.target.value })}
                    style={{ fontWeight: '800' }}
                  >
                    <option value="O+">O+ Positive</option>
                    <option value="A+">A+ Positive</option>
                    <option value="B+">B+ Positive</option>
                    <option value="AB+">AB+ Positive</option>
                    <option value="O-">O- Negative (Rare)</option>
                    <option value="A-">A- Negative (Rare)</option>
                    <option value="B-">B- Negative (Rare)</option>
                    <option value="AB-">AB- Negative (Rare)</option>
                  </select>
                </div>

                <div>
                  <label className={styles.inputLabel}>Units Needed *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    className={styles.inputControl}
                    value={sosForm.units}
                    onChange={(e) => setSosForm({ ...sosForm, units: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Hospital / Location in Jagtial *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Area Hospital Jagtial / Prathima Hospital"
                  className={styles.inputControl}
                  value={sosForm.hospital}
                  onChange={(e) => setSosForm({ ...sosForm, hospital: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Attender Contact Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98480 12345"
                  className={styles.inputControl}
                  value={sosForm.contact_phone}
                  onChange={(e) => setSosForm({ ...sosForm, contact_phone: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Urgency Level / Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Immediate requirement for emergency surgery / ICU"
                  className={styles.inputControl}
                  value={sosForm.notes}
                  onChange={(e) => setSosForm({ ...sosForm, notes: e.target.value })}
                />
              </div>

              <button type="submit" disabled={sosLoading} className={styles.submitBtnRed}>
                {sosLoading ? '⚡ Broadcasting Emergency Alert to Network...' : '🚨 Broadcast Emergency SOS Alert to All Members'}
              </button>
            </form>
          </div>

          {/* Form 2: Register as Volunteer Blood Donor */}
          <div className={styles.formCard} id="register-donor">
            <h3 className={styles.formTitle} style={{ color: '#15803d' }}>
              <span>🦸‍♂️</span> Register as a Volunteer Donor
            </h3>
            <p className={styles.formDesc}>
              Join our emergency volunteer database in Jagtial. We only call you when someone in your area urgently needs your blood group.
            </p>

            {donorSubmitted ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#166534' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎉</div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: '800' }}>Thank You for Registering!</h4>
                <p style={{ fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                  You are now registered in the Hindu Swaraj Emergency Blood Donor Pool. Your willingness to save lives is truly appreciated.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDonorRegister}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mukesh Kokkula"
                    className={styles.inputControl}
                    value={donorForm.name}
                    onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className={styles.inputGroup}>
                  <div>
                    <label className={styles.inputLabel}>Your Blood Group *</label>
                    <select
                      className={styles.inputControl}
                      value={donorForm.blood_group}
                      onChange={(e) => setDonorForm({ ...donorForm, blood_group: e.target.value })}
                      style={{ fontWeight: '800' }}
                    >
                      <option value="O+">O+ Positive</option>
                      <option value="A+">A+ Positive</option>
                      <option value="B+">B+ Positive</option>
                      <option value="AB+">AB+ Positive</option>
                      <option value="O-">O- Negative</option>
                      <option value="A-">A- Negative</option>
                      <option value="B-">B- Negative</option>
                      <option value="AB-">AB- Negative</option>
                    </select>
                  </div>

                  <div>
                    <label className={styles.inputLabel}>Weight (Eligibility)</label>
                    <select
                      className={styles.inputControl}
                      value={donorForm.weight}
                      onChange={(e) => setDonorForm({ ...donorForm, weight: e.target.value })}
                    >
                      <option value="50-60 kg">50 - 60 kg</option>
                      <option value="60-75 kg">60 - 75 kg</option>
                      <option value="75+ kg">75+ kg</option>
                    </select>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Your WhatsApp / Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 84998 78425"
                    className={styles.inputControl}
                    value={donorForm.phone}
                    onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Colony / Village in Jagtial *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vani Nagar / Ashok Nagar / Jagtial"
                    className={styles.inputControl}
                    value={donorForm.area}
                    onChange={(e) => setDonorForm({ ...donorForm, area: e.target.value })}
                  />
                </div>

                <button type="submit" disabled={donorLoading} className={styles.submitBtnGreen}>
                  {donorLoading ? 'Registering...' : '🤝 Enroll in Jagtial Donor Pool'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ============================================================
            HALL OF HEROES: REAL DONOR PHOTOS & CERTIFICATES
        ============================================================ */}
        <section className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>📸 Hall of Heroes • రక్తదాన వీరుల వేదిక</span>
          <h2 className={styles.sectionTitle}>రక్తదాన సేవకులు &amp; అసలైన ఫోటో రికార్డ్స్</h2>
          <p className={styles.sectionSubtitle}>
            స్వయంగా రక్తం ఇచ్చి ప్రాణాలు కాపాడిన జగిత్యాల యువకుల ఫోటోలు మరియు అధికారిక డిజిటల్ ప్రశంసా పత్రాలు.
          </p>
        </section>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="🔍 Search donor name, hospital, or certificate ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: '480px', width: '100%', padding: '10px 16px', borderRadius: '30px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
          />
        </div>

        <div className={styles.filterBar}>
          {BLOOD_GROUPS.map((grp) => (
            <button
              key={grp}
              type="button"
              className={`${styles.filterChip} ${selectedGroup === grp ? styles.filterChipActive : ''}`}
              onClick={() => setSelectedGroup(grp)}
            >
              {grp === 'ALL' ? '🩸 All Blood Groups' : grp}
            </button>
          ))}
        </div>

        {/* Heroes Photo Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
            <p style={{ fontWeight: '600' }}>Loading Blood Donation Heroes...</p>
          </div>
        ) : filteredHeroes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', background: '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1', margin: '0 auto 40px auto' }}>
            <p style={{ fontSize: '1rem', color: '#64748b', margin: 0 }}>
              No donor records found matching your selection.
            </p>
          </div>
        ) : (
          <div className={styles.heroesGrid}>
            {filteredHeroes.map((hero) => {
              return (
                <div key={hero.id} className={styles.heroCard}>
                  <div className={styles.photoWrapper}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveBloodPhotoUrl(hero.photo_url)}
                      alt={`${hero.donor_name} donating blood`}
                      className={styles.heroPhoto}
                      onError={(e) => {
                        e.currentTarget.src = '/images/activity-blood.png';
                      }}
                    />
                    <div className={styles.bloodGroupBadge}>
                      🩸 {hero.blood_group}
                    </div>
                    {hero.donation_count_milestone > 1 && (
                      <div className={styles.milestoneBadge}>
                        ⭐ {hero.donation_count_milestone}x Milestone
                      </div>
                    )}
                  </div>

                  <div className={styles.heroContent}>
                    <h3 className={styles.heroName}>{hero.donor_name}</h3>
                    <div className={styles.heroHonor}>
                      {hero.honor_badge || 'Rakta Datha'} {hero.member_id ? `• ${hero.member_id}` : ''}
                    </div>

                    <div className={styles.heroDetail}>
                      <span>📍</span>
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>{hero.hospital_or_camp}</span>
                    </div>

                    <div className={styles.heroDetail}>
                      <span>🗓️</span>
                      <span>
                        {new Date(hero.donation_date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {' • '}
                        <strong>{hero.units} Unit ({hero.units * 350}ml)</strong>
                      </span>
                    </div>

                    {hero.notes && (
                      <div style={{ fontSize: '0.8rem', color: '#64748b', background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid #dc2626', margin: '10px 0 14px 0', fontStyle: 'italic' }}>
                        &quot;{hero.notes}&quot;
                      </div>
                    )}

                    <button
                      type="button"
                      className={styles.certActionBtn}
                      onClick={() => setSelectedCertDonor(hero)}
                    >
                      <span>📜</span> View Official Certificate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============================================================
            JAGTIAL HOSPITALS & BLOOD CENTRES DIRECTORY
        ============================================================ */}
        <div className={styles.hospitalsSection}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🏥</span> Jagtial Key Hospitals &amp; Blood Centres Directory
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
            Official list of major hospitals and blood centres in Jagtial district where our voluntary donors regularly assist patients.
          </p>

          <div className={styles.hospitalsGrid}>
            {JAGTIAL_HOSPITALS.map((hosp, idx) => (
              <div key={idx} className={styles.hospitalCard}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#dc2626', background: '#fee2e2', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '8px' }}>
                  {hosp.type}
                </span>
                <h4 className={styles.hospitalName}>{hosp.name}</h4>
                <p className={styles.hospitalLocation}>📍 {hosp.location}</p>
                <a href={`tel:${hosp.phone}`} className={styles.hospitalCallBtn}>
                  📞 Call Helpline: {hosp.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ============================================================
          SOS DISPATCH SUCCESS MODAL
      ============================================================ */}
      {sosDispatchResult && (
        <div className={styles.modalOverlay} onClick={() => setSosDispatchResult(null)}>
          <div style={{ background: '#ffffff', border: '4px solid #dc2626', borderRadius: '18px', padding: '32px 28px', maxWidth: '560px', width: '100%', textAlign: 'center', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSosDispatchResult(null)}
              style={{ position: 'absolute', top: '12px', right: '12px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontWeight: '900' }}
            >
              ✕
            </button>

            <div style={{ fontSize: '3rem', marginBottom: '10px', animation: 'bounce 1s infinite' }}>🚨</div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#991b1b', margin: '0 0 8px 0' }}>
              EMERGENCY BROADCAST DISPATCHED!
            </h2>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px', margin: '16px 0', textAlign: 'left', fontSize: '0.88rem', color: '#7f1d1d' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span>✅</span> <b>Automated Email Dispatch:</b> Alerts dispatched to {sosDispatchResult.total_recipients || 'all'} registered members &amp; donors!
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span>✅</span> <b>Homepage Live Alert:</b> Live emergency ticker is now active on the public website.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✅</span> <b>WhatsApp Hotline:</b> Dispatched to the emergency team hotline.
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Patient <b>{sosForm.patient_name}</b> ({sosForm.blood_group} - {sosForm.units} Unit) at <b>{sosForm.hospital}</b>. Attender: <b>{sosForm.contact_phone}</b>.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <a
                href={`https://wa.me/918499878425?text=🚨%20CONFIRMING%20BLOOD%20SOS%20FOR%20${encodeURIComponent(sosForm.patient_name)}%20(${encodeURIComponent(sosForm.blood_group)})`}
                target="_blank"
                rel="noreferrer"
                style={{ background: '#22c55e', color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '800', fontSize: '0.9rem' }}
              >
                💬 Open WhatsApp Hotline
              </a>
              <button
                type="button"
                onClick={() => setSosDispatchResult(null)}
                style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          CERTIFICATE OF APPRECIATION MODAL
      ============================================================ */}
      {selectedCertDonor && (
        <div className={styles.modalOverlay} onClick={() => setSelectedCertDonor(null)}>
          <div className={styles.certificateSheet} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedCertDonor(null)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontWeight: '900',
                fontSize: '1rem',
                color: '#475569',
              }}
            >
              ✕
            </button>

            {/* Certificate Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #b91c1c', paddingBottom: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#991b1b', letterSpacing: '1px', textTransform: 'uppercase' }}>
                ॥ పరోపకారార్థం ఇదం శరీరం • రక్తదానమే ప్రాణదానం ॥
              </div>
              <h2 style={{ fontSize: '1.55rem', fontWeight: '900', color: '#580505', margin: '4px 0' }}>
                {assocInfo.association_name || 'HINDU SWARAJ YOUTH WELFARE ASSOCIATION'}
              </h2>
              <div style={{ fontSize: '0.78rem', color: '#78350f', fontWeight: '700' }}>
                {assocInfo.regd_no || 'Regd. No: 784/2025 (Govt. of Telangana)'} • Jagtial - 505327
              </div>
            </div>

            {/* Certificate Title */}
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)', color: '#fef08a', padding: '6px 22px', borderRadius: '30px', fontWeight: '900', fontSize: '1rem' }}>
                🩸 రక్తదాన జీవనదాత ప్రశంసా పత్రం
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', marginTop: '4px' }}>
                CERTIFICATE OF APPRECIATION FOR VOLUNTARY BLOOD DONATION
              </div>
            </div>

            {/* Certificate Body with Photo */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', margin: '20px 0', flexWrap: 'wrap' }}>
              <div style={{ width: '110px', height: '130px', borderRadius: '10px', border: '3px solid #d4af37', overflow: 'hidden', flexShrink: 0, background: '#f8fafc', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveBloodPhotoUrl(selectedCertDonor.photo_url)}
                  alt={selectedCertDonor.donor_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.src = '/images/activity-blood.png';
                  }}
                />
              </div>

              <div style={{ flex: 1, minWidth: '240px' }}>
                <p style={{ fontSize: '0.95rem', color: '#1e293b', lineHeight: '1.65', margin: 0 }}>
                  This is proudly certified to <strong style={{ fontSize: '1.2rem', color: '#7f1d1d', textDecoration: 'underline' }}>{selectedCertDonor.donor_name}</strong>
                  {selectedCertDonor.member_id && ` (ID: ${selectedCertDonor.member_id})`}, in deep gratitude for voluntarily donating <strong>{selectedCertDonor.units} Unit</strong> of <strong>Blood Group ({selectedCertDonor.blood_group})</strong> at <strong>{selectedCertDonor.hospital_or_camp}</strong> on <strong>{new Date(selectedCertDonor.donation_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>.
                </p>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px', fontStyle: 'italic' }}>
                  Certificate ID: <b style={{ fontFamily: 'monospace', color: '#0284c7' }}>{selectedCertDonor.certificate_id}</b>
                </div>
              </div>
            </div>

            {/* Signatures & Seal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '24px', paddingTop: '14px', borderTop: '1.5px dashed #cbd5e1', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ textAlign: 'center', width: '130px' }}>
                {assocInfo.gs_signature_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveBloodPhotoUrl(assocInfo.gs_signature_url)}
                    alt="GS Sign"
                    style={{ height: '38px', objectFit: 'contain' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.parentElement.querySelector('.fallback-sig');
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                ) : null}
                <div
                  className="fallback-sig"
                  style={{
                    height: '38px',
                    fontWeight: '700',
                    fontStyle: 'italic',
                    color: '#334155',
                    display: assocInfo.gs_signature_url ? 'none' : 'block',
                    lineHeight: '38px',
                  }}
                >
                  Mani Deep
                </div>
                <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '2px', fontSize: '0.72rem', fontWeight: '800' }}>
                  General Secretary
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                {assocInfo.association_seal_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveBloodPhotoUrl(assocInfo.association_seal_url)}
                    alt="Seal"
                    style={{ width: '55px', height: '55px', objectFit: 'contain' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.parentElement.querySelector('.fallback-seal');
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="fallback-seal"
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    border: '2px dashed #b91c1c',
                    display: assocInfo.association_seal_url ? 'none' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6rem',
                    fontWeight: '900',
                    color: '#b91c1c',
                    margin: '0 auto',
                  }}
                >
                  SEAL
                </div>
              </div>

              <div style={{ textAlign: 'center', width: '130px' }}>
                {assocInfo.president_signature_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveBloodPhotoUrl(assocInfo.president_signature_url)}
                    alt="President Sign"
                    style={{ height: '38px', objectFit: 'contain' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.parentElement.querySelector('.fallback-sig');
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                ) : null}
                <div
                  className="fallback-sig"
                  style={{
                    height: '38px',
                    fontWeight: '700',
                    fontStyle: 'italic',
                    color: '#334155',
                    display: assocInfo.president_signature_url ? 'none' : 'block',
                    lineHeight: '38px',
                  }}
                >
                  Rajesh Kumar
                </div>
                <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '2px', fontSize: '0.72rem', fontWeight: '800' }}>
                  President
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => typeof window !== 'undefined' && window.print()}
                style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                🖨️ Print Certificate
              </button>
              <a
                href={`https://wa.me/?text=🩸%20Proud%20to%20receive%20Blood%20Donation%20Certificate%20from%20Hindu%20Swaraj%20Youth!%20Donor:%20${encodeURIComponent(selectedCertDonor.donor_name)}%20(${encodeURIComponent(selectedCertDonor.blood_group)})`}
                target="_blank"
                rel="noreferrer"
                style={{ background: '#22c55e', color: '#fff', textDecoration: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem' }}
              >
                📲 Share on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
