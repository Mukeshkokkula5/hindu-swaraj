'use client';

import React, { useState, useEffect } from 'react';
import styles from './MasterPageCMSAdminTab.module.css';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000'
).replace(/\/$/, '');

export default function MasterPageCMSAdminTab({ token, currentUser }) {
  const [activeSubTab, setActiveSubTab] = useState('home'); // 'home' | 'navaratri' | 'aapadbandhava' | 'blood' | 'community' | 'public_transparency' | 'volunteers'
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // 1. Home Page & General Settings State
  const [homeSettings, setHomeSettings] = useState({
    association_name: 'HINDU SWARAJ YOUTH WELFARE ASSOCIATION',
    hero_title: 'EMPOWERING YOUTH, BUILDING BHARAT',
    hero_subtitle: 'A dynamic group of young, passionate and dedicated individuals working for the betterment of society and the protection of Dharma in Jagtial.',
    shivaji_quote: 'स्वराज्य हा माझा जन्मसिद्ध हక్కు आहे आणि तो मी मिळवणारच! 🚩',
    emergency_ticker: '🚨 24/7 Emergency Blood Seva active in Jagtial • Call Helpline: +91 8499878425',
    about_text: 'Hindu Swaraj Youth Welfare Association is a registered non-profit cultural and youth empowerment organisation (Regd No: 784/2025) headquartered in Jagtial, Telangana.',
    office_address: 'H.No. 4-1-140, Vani Nagar, Jagtial, Telangana - 505327',
    helpline_phone: '+91 8499878425',
    official_email: 'info@hinduswarajyouth.online',
    bank_name: 'Union Bank of India',
    account_no: '084910100054321',
    ifsc_code: 'UBIN0808491',
    upi_id: '8499878425@ybl',
  });

  // 2. Navaratri Portal Settings State
  const [navaratriSettings, setNavaratriSettings] = useState({
    is_live: false,
    youtube_url: '',
    stream_title: 'Vinayaka Navaratri Seva 2026 - Jagtial Live Darshan & Maha Aarti',
    live_announcement: 'Daily Morning Abhishekam at 7:00 AM, Sahasranamarchana at 10:00 AM, Maha Annadanam at 1:00 PM, and Divya Maha Aarti at 7:30 PM.',
    morning_timings: '07:00 AM - 09:30 AM',
    annadanam_timings: '01:00 PM - 03:00 PM',
    evening_timings: '07:30 PM - 09:00 PM',
    location: 'Hindu Swaraj Pandal, Jagtial, Telangana',
  });

  // 3. Community Moderation & Poll State
  const [communityPosts, setCommunityPosts] = useState([]);
  const [pollData, setPollData] = useState({
    question: 'Which community initiative should HSY expand next in Jagtial district?',
    option1: '🩸 Mega Blood Donation Camp',
    option2: '🍲 Daily Free Annadanam Desk',
    option3: '📚 Student Kits & Scholarships',
    option4: '🌳 Green Jagtial Tree Drive',
  });

  // 4. Public Transparency Ledger State
  const [publicDisbursements, setPublicDisbursements] = useState([
    { id: 1, date: '24 Aug 2026', title: 'Hospital Bill Aid for Emergency Cardiac Case (S. Rajesh)', category: 'AAPADBANDHAVA', amount: '45000', location: 'Prathima Hospital, Jagtial' },
    { id: 2, date: '20 Aug 2026', title: 'Maha Annadanam Provisions & Rice Sacks (3,000+ Devotees)', category: 'ANNADANAM', amount: '32500', location: 'Hindu Swaraj Pandal Store' },
    { id: 3, date: '15 Aug 2026', title: 'Independence Day Mega Blood Camp Refreshments & Medical Kits', category: 'BLOOD_SEVA', amount: '12000', location: 'Red Cross Society Jagtial' },
    { id: 4, date: '10 Aug 2026', title: 'Merit Student School Kits & Notebooks Distribution', category: 'YOUTH_AID', amount: '8500', location: 'Govt. High School Jagtial' },
  ]);
  const [newDisbursement, setNewDisbursement] = useState({
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    title: '',
    category: 'AAPADBANDHAVA',
    amount: '',
    location: 'Jagtial',
  });

  // Load all settings on mount
  useEffect(() => {
    loadAllPageSettings();
  }, []);

  const loadAllPageSettings = async () => {
    setLoading(true);
    try {
      const [assocRes, navRes, commRes] = await Promise.all([
        fetch(`${API_BASE_URL}/association-settings/public`).catch(() => null),
        fetch(`${API_BASE_URL}/navaratri/settings`).catch(() => null),
        fetch(`${API_BASE_URL}/community/posts?limit=15`).catch(() => null),
      ]);

      if (assocRes && assocRes.ok) {
        const data = await assocRes.json();
        if (data) setHomeSettings((prev) => ({ ...prev, ...data }));
      }
      if (navRes && navRes.ok) {
        const data = await navRes.json();
        if (data.data) setNavaratriSettings((prev) => ({ ...prev, ...data.data }));
      }
      if (commRes && commRes.ok) {
        const data = await commRes.json();
        if (data.data) setCommunityPosts(data.data);
      }
    } catch (e) {
      console.warn('Failed to load page settings:', e);
    } finally {
      setLoading(false);
    }
  };

  // Save Home & Association Settings
  const handleSaveHomeSettings = async (e) => {
    e.preventDefault();
    setSaveStatus('Saving Home & Association Settings...');
    try {
      const res = await fetch(`${API_BASE_URL}/association-settings/admin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(homeSettings),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveStatus('✅ Home Page & Association Master Settings updated successfully! 🚩');
      } else {
        throw new Error(data.error || 'Update failed');
      }
    } catch (err) {
      setSaveStatus('❌ Error: ' + err.message);
    }
    setTimeout(() => setSaveStatus(''), 4000);
  };

  // Save Navaratri Portal Settings
  const handleSaveNavaratriSettings = async (e) => {
    e.preventDefault();
    setSaveStatus('Saving Navaratri Festival Settings...');
    try {
      const res = await fetch(`${API_BASE_URL}/navaratri/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(navaratriSettings),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus('✅ Navaratri Festival Portal & Live Stream Settings updated successfully! 🪔');
      } else {
        throw new Error(data.error || 'Update failed');
      }
    } catch (err) {
      setSaveStatus('❌ Error: ' + err.message);
    }
    setTimeout(() => setSaveStatus(''), 4000);
  };

  // Community Post Moderation Actions
  const handleTogglePinPost = async (postId, currentPinStatus) => {
    try {
      await fetch(`${API_BASE_URL}/community/posts/${postId}/pin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_pinned: !currentPinStatus }),
      });
      setCommunityPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, is_pinned: !currentPinStatus } : p))
      );
    } catch (e) {
      alert('Failed to pin/unpin post');
    }
  };

  const handleDeleteCommunityPost = async (postId) => {
    if (!confirm('Are you sure you want to delete this community post as Super Admin?')) return;
    try {
      await fetch(`${API_BASE_URL}/community/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setCommunityPosts((prev) => prev.filter((p) => p.id !== postId));
      alert('✅ Post removed from community feed.');
    } catch (e) {
      alert('Failed to delete post');
    }
  };

  // Public Ledger Add Disbursement
  const handleAddDisbursement = (e) => {
    e.preventDefault();
    if (!newDisbursement.title || !newDisbursement.amount) return;
    setPublicDisbursements((prev) => [
      {
        ...newDisbursement,
        id: Date.now(),
        amount: `₹${Number(newDisbursement.amount).toLocaleString('en-IN')}`,
      },
      ...prev,
    ]);
    setNewDisbursement({
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      title: '',
      category: 'AAPADBANDHAVA',
      amount: '',
      location: 'Jagtial',
    });
    alert('✅ Seva Disbursement added to Public Transparency Ledger!');
  };

  const handleDeleteDisbursement = (id) => {
    setPublicDisbursements((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className={styles.masterCmsContainer}>
      {/* Header Banner */}
      <div className={styles.masterHeader}>
        <div className={styles.masterHeaderLeft}>
          <span style={{ fontSize: '2rem' }}>🌐</span>
          <div>
            <h2 className={styles.masterTitle}>Master Website Page CMS &amp; Site-Wide Control</h2>
            <p className={styles.masterSubtitle}>
              Super Admin Central Control Suite: Edit content, banners, festival schedules, emergency cases, and transparency records for all pages across the website.
            </p>
          </div>
        </div>
        <div className={styles.superAdminBadge}>
          👑 SUPER ADMIN ACCESS
        </div>
      </div>

      {/* Save Status Alert */}
      {saveStatus && (
        <div className={styles.statusToast}>
          {saveStatus}
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className={styles.subTabsBar}>
        {[
          { id: 'home', label: '🏠 Home Page CMS', icon: '🏠' },
          { id: 'navaratri', label: '🪔 Navaratri Utsav CMS', icon: '🪔' },
          { id: 'community', label: '📸 Community Feed & Polls', icon: '📸' },
          { id: 'public_transparency', label: '🏛️ Public Transparency Ledger', icon: '🏛️' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.subTabBtn} ${activeSubTab === tab.id ? styles.subTabBtnActive : ''}`}
            onClick={() => setActiveSubTab(tab.id)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ================= 1. HOME PAGE CMS ================= */}
      {activeSubTab === 'home' && (
        <div className={styles.tabContentCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>🏠 Home Page Content, Hero &amp; Association Settings</h3>
            <span className={styles.cardSubtitle}>Updates text on `/` in real-time</span>
          </div>

          <form onSubmit={handleSaveHomeSettings}>
            <div className={styles.formGrid2}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Chhatrapati Shivaji Maharaj Quote / Slogan</label>
                <input
                  type="text"
                  className={styles.inputControl}
                  value={homeSettings.shivaji_quote}
                  onChange={(e) => setHomeSettings({ ...homeSettings, shivaji_quote: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Live Emergency Notice Ticker Text</label>
                <input
                  type="text"
                  className={styles.inputControl}
                  value={homeSettings.emergency_ticker}
                  onChange={(e) => setHomeSettings({ ...homeSettings, emergency_ticker: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.formGrid2}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Hero Main Heading Title</label>
                <input
                  type="text"
                  className={styles.inputControl}
                  value={homeSettings.hero_title}
                  onChange={(e) => setHomeSettings({ ...homeSettings, hero_title: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Association Registered Name</label>
                <input
                  type="text"
                  className={styles.inputControl}
                  value={homeSettings.association_name}
                  onChange={(e) => setHomeSettings({ ...homeSettings, association_name: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Hero Subtitle Description</label>
              <textarea
                rows={3}
                className={styles.inputControl}
                value={homeSettings.hero_subtitle}
                onChange={(e) => setHomeSettings({ ...homeSettings, hero_subtitle: e.target.value })}
              ></textarea>
            </div>

            <div className={styles.formGrid3}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Central Helpline Phone</label>
                <input
                  type="text"
                  className={styles.inputControl}
                  value={homeSettings.helpline_phone}
                  onChange={(e) => setHomeSettings({ ...homeSettings, helpline_phone: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Official Email Address</label>
                <input
                  type="email"
                  className={styles.inputControl}
                  value={homeSettings.official_email}
                  onChange={(e) => setHomeSettings({ ...homeSettings, official_email: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Official UPI ID (Donations)</label>
                <input
                  type="text"
                  className={styles.inputControl}
                  value={homeSettings.upi_id}
                  onChange={(e) => setHomeSettings({ ...homeSettings, upi_id: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Registered Head Office Address</label>
              <input
                type="text"
                className={styles.inputControl}
                value={homeSettings.office_address}
                onChange={(e) => setHomeSettings({ ...homeSettings, office_address: e.target.value })}
              />
            </div>

            <button type="submit" className={styles.savePrimaryBtn}>
              💾 Save Home Page &amp; General Settings
            </button>
          </form>
        </div>
      )}

      {/* ================= 2. NAVARATRI PORTAL CMS ================= */}
      {activeSubTab === 'navaratri' && (
        <div className={styles.tabContentCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>🪔 Sri Vinayaka Navaratri Festival Control (`/navaratri`)</h3>
            <span className={styles.cardSubtitle}>Controls live 4K stream, daily timings &amp; announcements</span>
          </div>

          <form onSubmit={handleSaveNavaratriSettings}>
            <div className={styles.formGrid2}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>🔴 4K Live Stream Status</label>
                <select
                  className={styles.inputControl}
                  value={navaratriSettings.is_live ? 'true' : 'false'}
                  onChange={(e) => setNavaratriSettings({ ...navaratriSettings, is_live: e.target.value === 'true' })}
                >
                  <option value="true">🟢 LIVE STREAMING NOW (Active on Portal)</option>
                  <option value="false">⚪ Stream Offline / Scheduled</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>YouTube Live Stream URL or Video ID</label>
                <input
                  type="text"
                  placeholder="e.g. https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
                  className={styles.inputControl}
                  value={navaratriSettings.youtube_url}
                  onChange={(e) => setNavaratriSettings({ ...navaratriSettings, youtube_url: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Live Stream Heading Title</label>
              <input
                type="text"
                className={styles.inputControl}
                value={navaratriSettings.stream_title}
                onChange={(e) => setNavaratriSettings({ ...navaratriSettings, stream_title: e.target.value })}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Daily Live Announcement Banner Text</label>
              <textarea
                rows={2}
                className={styles.inputControl}
                value={navaratriSettings.live_announcement}
                onChange={(e) => setNavaratriSettings({ ...navaratriSettings, live_announcement: e.target.value })}
              ></textarea>
            </div>

            <div className={styles.formGrid3}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Morning Abhishekam Timings</label>
                <input
                  type="text"
                  className={styles.inputControl}
                  value={navaratriSettings.morning_timings}
                  onChange={(e) => setNavaratriSettings({ ...navaratriSettings, morning_timings: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Maha Annadanam Timings</label>
                <input
                  type="text"
                  className={styles.inputControl}
                  value={navaratriSettings.annadanam_timings}
                  onChange={(e) => setNavaratriSettings({ ...navaratriSettings, annadanam_timings: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Evening Maha Aarti Timings</label>
                <input
                  type="text"
                  className={styles.inputControl}
                  value={navaratriSettings.evening_timings}
                  onChange={(e) => setNavaratriSettings({ ...navaratriSettings, evening_timings: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className={styles.savePrimaryBtn} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              💾 Save Navaratri Festival Portal Settings
            </button>
          </form>
        </div>
      )}

      {/* ================= 3. COMMUNITY SOCIAL FEED & POLLS ================= */}
      {activeSubTab === 'community' && (
        <div className={styles.tabContentCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>📸 Community Social Feed &amp; Seva Poll Moderation (`/community`)</h3>
            <span className={styles.cardSubtitle}>Moderate youth posts, pin announcements &amp; configure poll</span>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ color: '#ffd700', margin: '0 0 12px 0' }}>📌 Recent Community Posts Moderation:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {communityPosts.map((post) => (
                <div key={post.id} className={styles.moderationRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{post.is_pinned ? '📌' : '📷'}</span>
                    <div>
                      <strong style={{ color: '#fff' }}>{post.author_name}</strong>
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '8px' }}>
                        {new Date(post.created_at).toLocaleDateString('en-IN')} • {post.category}
                      </span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#cbd5e1' }}>
                        {post.caption?.slice(0, 100)}...
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className={styles.actionBtnSmall}
                      onClick={() => handleTogglePinPost(post.id, post.is_pinned)}
                    >
                      {post.is_pinned ? 'Unpin 📌' : 'Pin to Top 📌'}
                    </button>
                    <button
                      type="button"
                      className={styles.actionBtnSmallDanger}
                      onClick={() => handleDeleteCommunityPost(post.id)}
                    >
                      Delete 🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= 6. PUBLIC TRANSPARENCY LEDGER ================= */}
      {activeSubTab === 'public_transparency' && (
        <div className={styles.tabContentCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>🏛️ Public Transparency &amp; Seva Ledger CMS (`/public`)</h3>
            <span className={styles.cardSubtitle}>Manage public seva expenditure entries &amp; audit records</span>
          </div>

          {/* Add Disbursement Form */}
          <form onSubmit={handleAddDisbursement} style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}>
            <h4 style={{ color: '#ffd700', margin: '0 0 12px 0' }}>+ Add New Seva Disbursement Entry:</h4>
            <div className={styles.formGrid3}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Seva Initiative / Beneficiary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Hospital Aid for Patient..."
                  className={styles.inputControl}
                  value={newDisbursement.title}
                  onChange={(e) => setNewDisbursement({ ...newDisbursement, title: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Category</label>
                <select
                  className={styles.inputControl}
                  value={newDisbursement.category}
                  onChange={(e) => setNewDisbursement({ ...newDisbursement, category: e.target.value })}
                >
                  <option value="AAPADBANDHAVA">🚨 Aapadbandhava Hospital Aid</option>
                  <option value="ANNADANAM">🍲 Maha Annadanam Groceries</option>
                  <option value="BLOOD_SEVA">🩸 Blood Camp Medical Kits</option>
                  <option value="YOUTH_AID">📚 Youth &amp; Student Scholarships</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 15000"
                  className={styles.inputControl}
                  value={newDisbursement.amount}
                  onChange={(e) => setNewDisbursement({ ...newDisbursement, amount: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className={styles.savePrimaryBtn} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
              + Add to Public Ledger
            </button>
          </form>

          {/* Current Ledger Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.06)', color: '#ffd700' }}>
                  <th style={{ padding: '10px 14px' }}>Date</th>
                  <th style={{ padding: '10px 14px' }}>Initiative / Beneficiary</th>
                  <th style={{ padding: '10px 14px' }}>Category</th>
                  <th style={{ padding: '10px 14px' }}>Amount</th>
                  <th style={{ padding: '10px 14px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {publicDisbursements.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <td style={{ padding: '10px 14px', color: '#ffd700' }}>{item.date}</td>
                    <td style={{ padding: '10px 14px', color: '#fff', fontWeight: '700' }}>{item.title}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#34d399', fontWeight: '900' }}>{item.amount}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteDisbursement(item.id)}
                        style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        Delete 🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
