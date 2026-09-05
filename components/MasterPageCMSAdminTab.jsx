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

  // 5. 50-Day Corona Seva Settings State
  const [covidSevaSettings, setCovidSevaSettings] = useState({
    hero_title: '50 DAYS NON-STOP CORONA FOOD SEVA MAHAYAGNAM',
    hero_subtitle: 'Standing strong for Jagtial during the dark times of the COVID-19 pandemic. Over 50 consecutive days of unceasing, selfless Annadanam for the hungry and stranded.',
    story_telugu: `కరోనా మహమ్మారి జగిత్యాల పట్టణాన్ని వణికించిన రోజుల్లో... లాక్‌డౌన్ ఆంక్షల వల్ల బస్టాండ్లు, రైల్వే స్టేషన్లు, రోడ్లపై తిండిలేక అలమటించిన అన్నార్థులు, వలస కార్మికులు, అనాథలు మరియు ఆసుపత్రి రోగులకు మేమున్నామంటూ హిందూ స్వరాజ్ యూత్ సభ్యులు అండగా నిలిచారు.

నిరంతరం 50 రోజుల పాటు ప్రతి రోజూ ఉదయం, సాయంత్రం వేడివేడి పౌష్టికాహార భోజన ప్యాకెట్లు తయారు చేసి జగిత్యాల నలుమూలలా స్వయంగా వెళ్లి పంపిణీ చేశారు. 

ఈ మహా సంకల్పానికి సహకరించిన ప్రతి ఒక్క దాతకు, రక్తదాతలకు, కార్యకర్తలకు, జగిత్యాల పోలీస్ యంత్రాంగానికి మరియు మున్సిపల్ సిబ్బందికి మా హృదయపూర్వక ధన్యవాదాలు.`,
    story_english: `During the unprecedented peak of the COVID-19 nationwide lockdowns in 2020, Jagtial faced severe distress. Stranded migrant workers, daily wage laborers, hospital attendants, and impoverished citizens were left without basic sustenance.

Hindu Swaraj Youth stepped up to the frontlines. With safety precautions and burning compassion, our volunteers organized a community kitchen that prepared and distributed hygienic, hot meals daily without missing a single day for 50 consecutive days.`,
    youtube_url: 'https://www.youtube.com/watch?v=kYJ3W2F_c2o',
    video_title: '50 Days Corona Annadanam Documentary - Hindu Swaraj Youth Jagtial',
    stat_days: 50,
    stat_meals: '50,000+',
    stat_volunteers: '100+',
    stat_families: '5,000+',
    photos: [
      { url: '/images/medical-camp/photo-1.jpg', title: 'నిరంతర అన్నదాన తయారీ', caption: 'రోజూ వేలాది మందికి పౌష్టికాహార భోజనం తయారీ' },
      { url: '/images/medical-camp/photo-2.jpg', title: 'వీధుల్లో భోజన ప్యాకెట్ల పంపిణీ', caption: 'జగిత్యాల వీధుల్లో ఆకలితో ఉన్న వారికి నేరుగా అందజేత' },
      { url: '/images/medical-camp/photo-3.jpg', title: 'వలస కార్మికులకు ఆహార ప్యాకెట్లు', caption: 'నడచి వెళ్లే కార్మికులకు మంచినీరు మరియు అన్నదానం' },
      { url: '/images/navaratri-medical-felicitation.jpg', title: 'నిస్వార్థ సేవా బృందం', caption: '50 రోజుల సేవా యజ్ఞంలో పాల్గొన్న హిందూ స్వరాజ్ కార్యకర్తలు' }
    ],
    newspaper_clippings: [
      { paper_name: 'ఈనాడు (Eenadu)', clipping_date: 'మే 2020', headline: 'కరోనా కష్టకాలంలో హిందూ స్వరాజ్ యూత్ అన్నదానం ఆదర్శం', image_url: '/images/activity-disaster.png' },
      { paper_name: 'సాక్షి (Sakshi)', clipping_date: 'జూన్ 2020', headline: '50 రోజులు నిరాటంకంగా అన్నదానం అందించిన యువత', image_url: '/images/hero-shivaji.png' },
      { paper_name: 'నమస్తే తెలంగాణ (Namasthe Telangana)', clipping_date: 'జూన్ 2020', headline: 'లాక్‌డౌన్‌లో అన్నార్థుల ఆకలి తీర్చిన హిందూ స్వరాజ్ సేవా సైన్యం', image_url: '/images/activity-disaster.png' }
    ],
    certificates: [
      { title: 'Covid Seva Ratna Award', issuer: 'జగిత్యాల పౌర సమాజం & రెవెన్యూ డిపార్ట్‌మెంట్', year: '2020', description: 'లాక్‌డౌన్ సమయంలో నిరంతర ప్రజాసేవ, ఆహార పంపిణీకి గాను అందించిన ప్రశంసా పత్రం.' },
      { title: 'Corona Warriors Appreciation Certificate', issuer: 'జిల్లా యంత్రాంగం, జగిత్యాల', year: '2020', description: 'కోవిడ్-19 విపత్కర పరిస్థితుల్లో ప్రాణాలకు తెగించి అన్నదానం చేసినందుకు ప్రత్యేక గుర్తింపు.' }
    ],
    is_active: true
  });
  const [uploadingCovidFile, setUploadingCovidFile] = useState(false);

  // Load all settings on mount
  useEffect(() => {
    loadAllPageSettings();
  }, []);

  const loadAllPageSettings = async () => {
    setLoading(true);
    try {
      const [assocRes, navRes, commRes, covidRes] = await Promise.all([
        fetch(`${API_BASE_URL}/association-settings/public`).catch(() => null),
        fetch(`${API_BASE_URL}/navaratri/settings`).catch(() => null),
        fetch(`${API_BASE_URL}/community/posts?limit=15`).catch(() => null),
        fetch(`${API_BASE_URL}/covid-seva/admin`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }).catch(() => null),
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
      if (covidRes && covidRes.ok) {
        const data = await covidRes.json();
        if (data && data.data) {
          setCovidSevaSettings((prev) => ({
            ...prev,
            ...data.data,
            photos: Array.isArray(data.data.photos) ? data.data.photos : prev.photos,
            newspaper_clippings: Array.isArray(data.data.newspaper_clippings) ? data.data.newspaper_clippings : prev.newspaper_clippings,
            certificates: Array.isArray(data.data.certificates) ? data.data.certificates : prev.certificates,
          }));
        }
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

  // ------------------ COVID SEVA HELPERS & HANDLERS ------------------
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.includes('youtube.com/embed/')) return trimmed;
    const match = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([\w-]{11})/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    if (/^[\w-]{11}$/.test(trimmed)) {
      return `https://www.youtube.com/embed/${trimmed}`;
    }
    return trimmed;
  };

  const resolveImgSrc = (url) => {
    if (!url) return '/images/activity-disaster.png';
    if (url.startsWith('data:')) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/uploads/')) return `${API_BASE_URL}${url}`;
    return url;
  };

  const compressImageToBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const maxDim = 1280;
            let width = img.width;
            let height = img.height;

            if (width > height && width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            resolve(dataUrl);
          } catch (err) {
            resolve(e.target.result);
          }
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleSaveCovidSevaSettings = async (e) => {
    if (e) e.preventDefault();
    setSaveStatus('⏳ Saving 50-Day Corona Food Seva Memorial Settings...');
    try {
      const res = await fetch(`${API_BASE_URL}/covid-seva/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(covidSevaSettings),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus('✅ 50-Day Corona Seva Memorial Settings updated successfully! 🍲');
        alert('✅ 50-Day Corona Seva Settings saved successfully in database! 🍲');
      } else {
        throw new Error(data.error || 'Update failed');
      }
    } catch (err) {
      setSaveStatus('❌ Error: ' + err.message);
      alert('❌ Save Error: ' + err.message);
    }
    setTimeout(() => setSaveStatus(''), 5000);
  };

  const handleUploadCovidMedia = async (e, type, index) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCovidFile(true);
    try {
      // 1. Instant client-side optimized base64 conversion (permanent & survives serverless restarts)
      const base64Data = await compressImageToBase64(file);
      if (base64Data) {
        if (type === 'photo') {
          setCovidSevaSettings((prev) => {
            const updated = [...prev.photos];
            updated[index] = { ...updated[index], url: base64Data };
            return { ...prev, photos: updated };
          });
        } else if (type === 'clipping') {
          setCovidSevaSettings((prev) => {
            const updated = [...prev.newspaper_clippings];
            updated[index] = { ...updated[index], image_url: base64Data };
            return { ...prev, newspaper_clippings: updated };
          });
        }
      }

      // 2. Also send to server upload endpoint
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE_URL}/covid-seva/admin/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.success && data.url) {
          if (data.url.startsWith('data:') || data.url.startsWith('http')) {
            if (type === 'photo') {
              setCovidSevaSettings((prev) => {
                const updated = [...prev.photos];
                updated[index] = { ...updated[index], url: data.url };
                return { ...prev, photos: updated };
              });
            } else if (type === 'clipping') {
              setCovidSevaSettings((prev) => {
                const updated = [...prev.newspaper_clippings];
                updated[index] = { ...updated[index], image_url: data.url };
                return { ...prev, newspaper_clippings: updated };
              });
            }
          }
        }
      } catch (uploadErr) {
        console.warn('Server upload note:', uploadErr.message);
      }

      alert('✅ Photo loaded & ready! Now click "Save All 50-Day Corona Food Seva Memorial Settings" below.');
    } catch (err) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploadingCovidFile(false);
    }
  };

  const handleAddPhoto = () => {
    setCovidSevaSettings((prev) => ({
      ...prev,
      photos: [
        ...prev.photos,
        { url: '/images/activity-disaster.png', title: 'కొత్త ఫోటో శీర్షిక', caption: 'కరోనా సేవా వివరాలు' },
      ],
    }));
  };

  const handleUpdatePhoto = (index, field, value) => {
    setCovidSevaSettings((prev) => {
      const updated = [...prev.photos];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, photos: updated };
    });
  };

  const handleDeletePhoto = (index) => {
    setCovidSevaSettings((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleAddClipping = () => {
    setCovidSevaSettings((prev) => ({
      ...prev,
      newspaper_clippings: [
        ...prev.newspaper_clippings,
        { paper_name: 'ఈనాడు', clipping_date: 'మే 2020', headline: 'వార్తా కథనం ముఖ్యాంశం', image_url: '/images/activity-disaster.png' },
      ],
    }));
  };

  const handleUpdateClipping = (index, field, value) => {
    setCovidSevaSettings((prev) => {
      const updated = [...prev.newspaper_clippings];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, newspaper_clippings: updated };
    });
  };

  const handleDeleteClipping = (index) => {
    setCovidSevaSettings((prev) => ({
      ...prev,
      newspaper_clippings: prev.newspaper_clippings.filter((_, i) => i !== index),
    }));
  };

  const handleAddCertificate = () => {
    setCovidSevaSettings((prev) => ({
      ...prev,
      certificates: [
        ...prev.certificates,
        { title: 'సేవా పురస్కారం / Certificate of Honor', issuer: 'అధికారిక సంస్థ పేరు', year: '2020', description: 'పురస్కారం వివరాలు...' },
      ],
    }));
  };

  const handleUpdateCertificate = (index, field, value) => {
    setCovidSevaSettings((prev) => {
      const updated = [...prev.certificates];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, certificates: updated };
    });
  };

  const handleDeleteCertificate = (index) => {
    setCovidSevaSettings((prev) => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index),
    }));
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
          { id: 'covid_seva', label: '🍲 50-Day Corona Food Seva CMS', icon: '🍲' },
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

      {/* ================= 2. 50-DAY CORONA FOOD SEVA CMS ================= */}
      {activeSubTab === 'covid_seva' && (
        <div className={styles.tabContentCard}>
          <div className={styles.cardHeader}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 className={styles.cardTitle}>🍲 50-Day Corona Food Seva Memorial CMS (`/covid-seva`)</h3>
                <span className={styles.cardSubtitle}>Manage YouTube documentary link, live statistics, story texts, historical photos, newspaper clippings, and certificates</span>
              </div>
              <a
                href="/covid-seva"
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'rgba(255, 179, 0, 0.15)',
                  border: '1px solid #ffb300',
                  color: '#ffd700',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                👁️ View Live Page ↗
              </a>
            </div>
          </div>

          <form onSubmit={handleSaveCovidSevaSettings}>
            {/* Section 1: YouTube Video */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionBlockTitle}>
                <span>🎥 YouTube Video Documentary &amp; Player</span>
              </div>
              <div className={styles.formGrid2}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>YouTube Video URL or Video ID</label>
                  <input
                    type="text"
                    placeholder="e.g. https://www.youtube.com/watch?v=kYJ3W2F_c2o or short youtu.be URL"
                    className={styles.inputControl}
                    value={covidSevaSettings.youtube_url || ''}
                    onChange={(e) => setCovidSevaSettings({ ...covidSevaSettings, youtube_url: e.target.value })}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Paste regular watch link, shorts link, or direct 11-character video ID.
                  </span>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Video Title / Caption</label>
                  <input
                    type="text"
                    placeholder="Documentary title..."
                    className={styles.inputControl}
                    value={covidSevaSettings.video_title || ''}
                    onChange={(e) => setCovidSevaSettings({ ...covidSevaSettings, video_title: e.target.value })}
                  />
                </div>
              </div>

              {/* Instant YouTube Live Preview */}
              {covidSevaSettings.youtube_url && getYouTubeEmbedUrl(covidSevaSettings.youtube_url) && (
                <div style={{ marginTop: '10px' }}>
                  <label className={styles.inputLabel} style={{ color: '#38bdf8' }}>
                    📺 Video Live Preview:
                  </label>
                  <div style={{ position: 'relative', width: '100%', maxWidth: '520px', aspectRatio: '16/9', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.2)', marginTop: '6px' }}>
                    <iframe
                      src={getYouTubeEmbedUrl(covidSevaSettings.youtube_url)}
                      title="Preview"
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: 4 Key Seva Impact Stats */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionBlockTitle}>
                <span>📊 50-Days Key Impact Statistics</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Days of Seva</label>
                  <input
                    type="text"
                    className={styles.inputControl}
                    value={covidSevaSettings.stat_days || ''}
                    onChange={(e) => setCovidSevaSettings({ ...covidSevaSettings, stat_days: e.target.value })}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Meals Distributed</label>
                  <input
                    type="text"
                    className={styles.inputControl}
                    value={covidSevaSettings.stat_meals || ''}
                    onChange={(e) => setCovidSevaSettings({ ...covidSevaSettings, stat_meals: e.target.value })}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Youth Volunteers</label>
                  <input
                    type="text"
                    className={styles.inputControl}
                    value={covidSevaSettings.stat_volunteers || ''}
                    onChange={(e) => setCovidSevaSettings({ ...covidSevaSettings, stat_volunteers: e.target.value })}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Families Supported</label>
                  <input
                    type="text"
                    className={styles.inputControl}
                    value={covidSevaSettings.stat_families || ''}
                    onChange={(e) => setCovidSevaSettings({ ...covidSevaSettings, stat_families: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Hero & Story Texts */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionBlockTitle}>
                <span>📜 Hero Titles &amp; Seva Story Narration</span>
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Hero Main Heading Title</label>
                  <input
                    type="text"
                    className={styles.inputControl}
                    value={covidSevaSettings.hero_title || ''}
                    onChange={(e) => setCovidSevaSettings({ ...covidSevaSettings, hero_title: e.target.value })}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Hero Subtitle</label>
                  <input
                    type="text"
                    className={styles.inputControl}
                    value={covidSevaSettings.hero_subtitle || ''}
                    onChange={(e) => setCovidSevaSettings({ ...covidSevaSettings, hero_subtitle: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>తెలుగు సేవా చరిత్ర (Telugu Story Narrative)</label>
                  <textarea
                    rows={6}
                    className={styles.inputControl}
                    value={covidSevaSettings.story_telugu || ''}
                    onChange={(e) => setCovidSevaSettings({ ...covidSevaSettings, story_telugu: e.target.value })}
                  ></textarea>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>English Story Narrative</label>
                  <textarea
                    rows={6}
                    className={styles.inputControl}
                    value={covidSevaSettings.story_english || ''}
                    onChange={(e) => setCovidSevaSettings({ ...covidSevaSettings, story_english: e.target.value })}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Section 4: Photo Archive */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionBlockTitle}>
                <span>📸 Historical Photo Archive ({covidSevaSettings.photos?.length || 0})</span>
                <button type="button" className={styles.addBtnSmall} onClick={handleAddPhoto}>
                  + Add New Photo
                </button>
              </div>

              <div className={styles.itemsGrid}>
                {covidSevaSettings.photos?.map((photo, index) => (
                  <div key={index} className={styles.itemCard}>
                    <div className={styles.itemCardTop}>
                      <span style={{ fontSize: '0.8rem', color: '#ffd700', fontWeight: '800' }}>Photo #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(index)}
                        style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem' }}
                      >
                        Delete 🗑️
                      </button>
                    </div>

                    <img
                      src={resolveImgSrc(photo.url)}
                      alt={photo.title || 'Photo'}
                      className={styles.itemThumbnail}
                      onError={(e) => { e.target.src = '/images/activity-disaster.png'; }}
                    />

                    <div className={styles.uploadRow}>
                      <label className={styles.uploadFileLabel}>
                        📁 {uploadingCovidFile ? 'Uploading...' : 'Upload Image'}
                        <input
                          type="file"
                          accept="image/*"
                          className={styles.uploadFileInput}
                          disabled={uploadingCovidFile}
                          onChange={(e) => handleUploadCovidMedia(e, 'photo', index)}
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="Or paste image URL"
                        className={styles.inputControl}
                        style={{ padding: '6px 10px', fontSize: '0.8rem', flex: 1 }}
                        value={photo.url || ''}
                        onChange={(e) => handleUpdatePhoto(index, 'url', e.target.value)}
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Photo title (Telugu / English)..."
                      className={styles.inputControl}
                      style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                      value={photo.title || ''}
                      onChange={(e) => handleUpdatePhoto(index, 'title', e.target.value)}
                    />

                    <input
                      type="text"
                      placeholder="Photo caption..."
                      className={styles.inputControl}
                      style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                      value={photo.caption || ''}
                      onChange={(e) => handleUpdatePhoto(index, 'caption', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: Newspaper Press Clippings */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionBlockTitle}>
                <span>📰 Newspaper Press Clippings ({covidSevaSettings.newspaper_clippings?.length || 0})</span>
                <button type="button" className={styles.addBtnSmall} onClick={handleAddClipping}>
                  + Add Press Clipping
                </button>
              </div>

              <div className={styles.itemsGrid}>
                {covidSevaSettings.newspaper_clippings?.map((clipping, index) => (
                  <div key={index} className={styles.itemCard}>
                    <div className={styles.itemCardTop}>
                      <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: '800' }}>Clipping #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteClipping(index)}
                        style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem' }}
                      >
                        Delete 🗑️
                      </button>
                    </div>

                    <img
                      src={resolveImgSrc(clipping.image_url)}
                      alt={clipping.headline || 'Clipping'}
                      className={styles.itemThumbnail}
                      onError={(e) => { e.target.src = '/images/activity-disaster.png'; }}
                    />

                    <div className={styles.uploadRow}>
                      <label className={styles.uploadFileLabel}>
                        📁 {uploadingCovidFile ? 'Uploading...' : 'Upload Clipping'}
                        <input
                          type="file"
                          accept="image/*"
                          className={styles.uploadFileInput}
                          disabled={uploadingCovidFile}
                          onChange={(e) => handleUploadCovidMedia(e, 'clipping', index)}
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="Image URL"
                        className={styles.inputControl}
                        style={{ padding: '6px 10px', fontSize: '0.8rem', flex: 1 }}
                        value={clipping.image_url || ''}
                        onChange={(e) => handleUpdateClipping(index, 'image_url', e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '6px' }}>
                      <input
                        type="text"
                        placeholder="Paper (e.g. ఈనాడు)"
                        className={styles.inputControl}
                        style={{ padding: '6px 8px', fontSize: '0.8rem' }}
                        value={clipping.paper_name || ''}
                        onChange={(e) => handleUpdateClipping(index, 'paper_name', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Date (e.g. మే 2020)"
                        className={styles.inputControl}
                        style={{ padding: '6px 8px', fontSize: '0.8rem' }}
                        value={clipping.clipping_date || ''}
                        onChange={(e) => handleUpdateClipping(index, 'clipping_date', e.target.value)}
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="News Headline..."
                      className={styles.inputControl}
                      style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                      value={clipping.headline || ''}
                      onChange={(e) => handleUpdateClipping(index, 'headline', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Section 6: Appreciation Certificates */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionBlockTitle}>
                <span>🏆 Appreciation Certificates &amp; Honors ({covidSevaSettings.certificates?.length || 0})</span>
                <button type="button" className={styles.addBtnSmall} onClick={handleAddCertificate}>
                  + Add Certificate
                </button>
              </div>

              <div className={styles.itemsGrid}>
                {covidSevaSettings.certificates?.map((cert, index) => (
                  <div key={index} className={styles.itemCard}>
                    <div className={styles.itemCardTop}>
                      <span style={{ fontSize: '0.8rem', color: '#eab308', fontWeight: '800' }}>Award #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCertificate(index)}
                        style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.72rem' }}
                      >
                        Delete 🗑️
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Certificate / Award Title"
                      className={styles.inputControl}
                      style={{ padding: '6px 10px', fontSize: '0.85rem', fontWeight: '700' }}
                      value={cert.title || ''}
                      onChange={(e) => handleUpdateCertificate(index, 'title', e.target.value)}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: '6px' }}>
                      <input
                        type="text"
                        placeholder="Issuing Authority / Dept."
                        className={styles.inputControl}
                        style={{ padding: '6px 8px', fontSize: '0.8rem' }}
                        value={cert.issuer || ''}
                        onChange={(e) => handleUpdateCertificate(index, 'issuer', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Year (e.g. 2020)"
                        className={styles.inputControl}
                        style={{ padding: '6px 8px', fontSize: '0.8rem' }}
                        value={cert.year || ''}
                        onChange={(e) => handleUpdateCertificate(index, 'year', e.target.value)}
                      />
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Description & Recognition details..."
                      className={styles.inputControl}
                      style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                      value={cert.description || ''}
                      onChange={(e) => handleUpdateCertificate(index, 'description', e.target.value)}
                    ></textarea>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Save Alert / Notification */}
            {saveStatus && (
              <div
                className={styles.statusToast}
                style={{
                  marginTop: '16px',
                  background: saveStatus.includes('Error') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  border: saveStatus.includes('Error') ? '1px solid #ef4444' : '1px solid #10b981',
                  color: saveStatus.includes('Error') ? '#fca5a5' : '#6ee7b7',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {saveStatus}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '16px' }}>
              <button
                type="button"
                onClick={handleSaveCovidSevaSettings}
                className={styles.savePrimaryBtn}
                style={{
                  background: 'linear-gradient(135deg, #ff7700 0%, #ea580c 100%)',
                  fontSize: '1rem',
                  padding: '14px 28px',
                  margin: 0,
                  opacity: saveStatus.includes('Saving') ? 0.7 : 1,
                  cursor: saveStatus.includes('Saving') ? 'not-allowed' : 'pointer',
                }}
              >
                {saveStatus.includes('Saving')
                  ? '⏳ Saving Settings to Database...'
                  : '💾 Save All 50-Day Corona Food Seva Memorial Settings'}
              </button>

              <a
                href="/covid-seva"
                target="_blank"
                rel="noreferrer"
                style={{
                  color: '#ffd700',
                  textDecoration: 'underline',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                }}
              >
                Open `/covid-seva` page in new tab ↗
              </a>
            </div>
          </form>
        </div>
      )}

      {/* ================= 3. NAVARATRI PORTAL CMS ================= */}
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
