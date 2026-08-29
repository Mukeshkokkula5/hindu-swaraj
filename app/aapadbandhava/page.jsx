"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import EmergencyBloodTicker from "@/components/EmergencyBloodTicker";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000"
).replace(/\/$/, "");

const CATEGORIES = [
  { id: "ALL", label: "అన్ని కేసులు (All Cases)", icon: "🌟" },
  { id: "CHILD_CARE", label: "చిన్నారుల సంరక్షణ (Child Care)", icon: "👶" },
  { id: "MEDICAL_SURGERY", label: "అత్యవసర సర్జరీలు (Surgery)", icon: "🏥" },
  { id: "CANCER_TREATMENT", label: "క్యాన్సర్ చికిత్స (Cancer)", icon: "🎗️" },
  { id: "ACCIDENT_TRAUMA", label: "ప్రమాద గాయాలు (Accident)", icon: "🚑" },
  { id: "DISASTER_FIRE", label: "విపత్తు సహాయం (Disaster)", icon: "🔥" },
];

const formatIndianCurrencyWords = (numStr) => {
  const num = parseInt(numStr, 10);
  if (isNaN(num) || num <= 0) return "";
  if (num >= 10000000) {
    const cr = (num / 10000000).toFixed(2);
    return `₹${num.toLocaleString("en-IN")} (${cr} కోట్లు / Crores)`;
  }
  if (num >= 100000) {
    const lk = (num / 100000).toFixed(2);
    return `₹${num.toLocaleString("en-IN")} (${lk} లక్షలు / Lakhs)`;
  }
  if (num >= 1000) {
    const th = (num / 1000).toFixed(1);
    return `₹${num.toLocaleString("en-IN")} (${th} వేలు / Thousands)`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
};

export default function AapadbandhavaPortal() {
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState({
    total_cases: 3,
    total_needed: "710000.00",
    total_facilitated: "240000.00",
    lives_saved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [activeDirectPayCase, setActiveDirectPayCase] = useState(null);
  const [activeDetailCase, setActiveDetailCase] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedDocPreview, setSelectedDocPreview] = useState(null);
  const [generatedCertificate, setGeneratedCertificate] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Pay Modal Sub-tab (QR vs Bank)
  const [payTab, setPayTab] = useState("QR_UPI");

  // Contribution / Certificate Confirmation Form
  const [contribForm, setContribForm] = useState({
    donor_name: "",
    donor_phone: "",
    donor_city: "Jagtial",
    amount: "1000",
    utr_reference: "",
  });
  const [contribLoading, setContribLoading] = useState(false);
  const [contribError, setContribError] = useState("");

  // Application Form State with Strict Fields
  const [applyForm, setApplyForm] = useState({
    patient_name: "",
    patient_age: "",
    gender: "Male",
    city: "Jagtial",
    address: "",
    guardian_name: "",
    guardian_relation: "Father",
    guardian_phone: "",
    emergency_category: "MEDICAL_SURGERY",
    title: "",
    story: "",
    hospital_name: "",
    doctor_name: "",
    hospital_city: "Jagtial",
    target_amount: "",
    urgency_level: "CRITICAL_48_HOURS",
    primary_photo_url: "/images/activity-disaster.png",
    documents_urls: [],
    beneficiary_acc_name: "",
    beneficiary_bank_name: "",
    beneficiary_acc_no: "",
    beneficiary_ifsc: "",
    beneficiary_upi_id: "",
    beneficiary_upi_phone: "",
    beneficiary_qr_url: "",
  });

  const [isDeclared, setIsDeclared] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState(null);
  const [applyError, setApplyError] = useState("");

  useEffect(() => {
    fetchCases();
    checkUrlForCertificate();
  }, [selectedCategory, searchTerm]);

  const checkUrlForCertificate = async () => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const certCode = params.get("cert");
    if (certCode) {
      try {
        const res = await fetch(`${API_BASE}/aapadbandhava/public/certificate/${encodeURIComponent(certCode)}`);
        const json = await res.json();
        if (json.success && json.data) {
          setGeneratedCertificate({
            certificate_code: json.data.certificate_code,
            donor_name: json.data.donor_name,
            donor_city: json.data.donor_city,
            amount: json.data.amount,
            patient_name: json.data.patient_name,
            case_code: json.data.case_code,
            case_title: json.data.case_title,
            hospital_name: json.data.hospital_name,
            date: new Date(json.data.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
            association_name: "హిందూ స్వరాజ్ యూత్ అసోసియేషన్ జగిత్యాల",
            reg_no: "Regd. No. 784/2025",
            president_name: "Mukesh Kokkula (President, HSY)",
          });
        }
      } catch (err) {
        console.error("Failed to load certificate from URL:", err);
      }
    }
  };

  const fetchCases = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE}/aapadbandhava/public/cases?category=${selectedCategory}`;
      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim())}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setCases(json.data || []);
        if (json.stats) setStats(json.stats);
      }
    } catch (err) {
      console.error("Failed to load cases:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleShareWhatsApp = (c) => {
    try {
      fetch(`${API_BASE}/aapadbandhava/public/track-share/${c.id}`, {
        method: "POST",
      });
    } catch (e) {}

    const text = `🚨 *అత్యవసర ప్రాణ రక్షణ విజ్ఞప్తి (100% Ground Verified)* 🚨\n\n*${c.title}*\n\n👤 *పేషెంట్:* ${c.patient_name} (${c.patient_age || "N/A"} సం.)\n🏥 *హాస్పిటల్:* ${c.hospital_name}\n🎯 *అవసరమైన మొత్తం:* ₹${Number(c.target_amount).toLocaleString("en-IN")}\n\n💳 *డైరెక్ట్ UPI / PhonePe / GPay:* \`${c.beneficiary_upi_id || c.beneficiary_upi_phone || "లభ్యం"}\`\n🏦 *బ్యాంక్ ఖాతా:* \`${c.beneficiary_acc_no}\`\n🏛️ *IFSC కోడ్:* \`${c.beneficiary_ifsc}\`\n👤 *ఖాతాదారు:* ${c.beneficiary_acc_name}\n\n🛡️ *హిందూ స్వరాజ్ యూత్ అసోసియేషన్ జగిత్యాల (Regd. 784/2025)* స్వయంగా హాస్పిటల్‌కు వెళ్లి 100% ధృవీకరించిన కేసు. మధ్యవర్తులు లేరు.\n\nపూర్తి డాక్యుమెంట్లు & వివరాల కోసం ఇక్కడ చూడండి:\n👉 https://hinduswarajyouth.online/aapadbandhava`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareCertificateWhatsApp = (cert) => {
    const text = `🚩 *హిందూ స్వరాజ్ యూత్ అసోసియేషన్ — ఆపద్బాంధవ జీవనదాత సేవా ప్రశంసా పత్రం* 📜\n\nనేను జగిత్యాల ఆపద్బాంధవ ద్వారా ప్రాణాపాయంలో ఉన్న *${cert.patient_name}* గారి అత్యవసర చికిత్సకు నా వంతుగా *₹${Number(cert.amount).toLocaleString("en-IN")}* నిస్వార్థ సహాయాన్ని అందించాను.\n\n🆔 *Certificate ID:* \`${cert.certificate_code}\`\n🏛️ *సంస్థ:* హిందూ స్వరాజ్ యూత్ అసోసియేషన్ జగిత్యాల (Regd. 784/2025)\n\nమీరూ ఒక నిస్సహాయ ప్రాణాన్ని కాపాడే యజ్ఞంలో భాగస్వామ్యం అవ్వండి:\n👉 https://hinduswarajyouth.online/aapadbandhava`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  // ================= STRICT INPUT SANITIZERS =================
  const handleNameChange = (field, val) => {
    const sanitized = val.replace(/[^a-zA-Z\u0C00-\u0C7F\s.]/g, "");
    setApplyForm((prev) => ({ ...prev, [field]: sanitized }));
  };

  const handlePhoneChange = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 10);
    setApplyForm((prev) => ({ ...prev, guardian_phone: digits }));
  };

  const handleAgeChange = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 3);
    const num = parseInt(digits, 10);
    if (!digits || (num >= 0 && num <= 120)) {
      setApplyForm((prev) => ({ ...prev, patient_age: digits }));
    }
  };

  const handleAmountChange = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 9);
    setApplyForm((prev) => ({ ...prev, target_amount: digits }));
  };

  const handleAccNoChange = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 18);
    setApplyForm((prev) => ({ ...prev, beneficiary_acc_no: digits }));
  };

  const handleIfscChange = (val) => {
    const formatted = val.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
    setApplyForm((prev) => ({ ...prev, beneficiary_ifsc: formatted }));
  };

  const handleUpiChange = (val) => {
    const formatted = val.toLowerCase().replace(/[^a-z0-9.\-_@]/g, "");
    setApplyForm((prev) => ({ ...prev, beneficiary_upi_id: formatted }));
  };

  // File Upload Handlers
  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === "primary_photo_url") setUploadingPhoto(true);
    if (field === "documents_urls") setUploadingDoc(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/aapadbandhava/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.fileUrl) {
        if (field === "documents_urls") {
          setApplyForm((prev) => ({
            ...prev,
            documents_urls: [...prev.documents_urls, data.fileUrl],
          }));
        } else {
          setApplyForm((prev) => ({
            ...prev,
            [field]: data.fileUrl,
          }));
        }
      } else {
        alert("Upload failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Upload error: " + err.message);
    } finally {
      setUploadingPhoto(false);
      setUploadingDoc(false);
    }
  };

  const removeDocument = (index) => {
    setApplyForm((prev) => ({
      ...prev,
      documents_urls: prev.documents_urls.filter((_, idx) => idx !== index),
    }));
  };

  // Validation Check Helpers
  const isPhoneValid = /^[6-9]\d{9}$/.test(applyForm.guardian_phone);
  const isPatientNameValid = applyForm.patient_name.trim().length >= 3;
  const isAmountValid = parseInt(applyForm.target_amount, 10) >= 1000 && parseInt(applyForm.target_amount, 10) <= 50000000;
  const isAccNoValid = /^\d{9,18}$/.test(applyForm.beneficiary_acc_no);
  const isIfscValid = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(applyForm.beneficiary_ifsc);
  const hasDocuments = applyForm.documents_urls.length > 0;

  // Handle Contribution & Certificate Submission
  const handleContributionSubmit = async (e) => {
    e.preventDefault();
    if (!activeDirectPayCase) return;
    setContribError("");
    setContribLoading(true);

    try {
      const res = await fetch(`${API_BASE}/aapadbandhava/public/submit-contribution`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: activeDirectPayCase.id,
          donor_name: contribForm.donor_name.trim(),
          donor_phone: contribForm.donor_phone.trim(),
          donor_city: contribForm.donor_city.trim() || "Jagtial",
          amount: contribForm.amount,
          utr_reference: contribForm.utr_reference.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.certificate) {
        setGeneratedCertificate(data.data.certificate);
        setActiveDirectPayCase(null);
        fetchCases(); // Refresh raised progress bar
      } else {
        setContribError(data.error || "Failed to generate certificate");
      }
    } catch (err) {
      setContribError(err.message || "Network error");
    } finally {
      setContribLoading(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError("");

    if (!isPatientNameValid) {
      setApplyError("దయచేసి సరైన పేషెంట్ పేరు నమోదు చేయండి (కనీసం 3 అక్షరాలు ఉండాలి).");
      return;
    }
    if (!isPhoneValid) {
      setApplyError("దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి (6, 7, 8, లేదా 9 తో మొదలుకావాలి).");
      return;
    }
    if (!isAmountValid) {
      setApplyError("అవసరమైన మొత్తం ₹1,000 నుండి ₹5,00,00,000 మధ్య ఉండాలి.");
      return;
    }
    if (!isAccNoValid) {
      setApplyError("బ్యాంక్ ఖాతా సంఖ్య 9 నుండి 18 అంకెలు మాత్రమే ఉండాలి.");
      return;
    }
    if (!isIfscValid) {
      setApplyError("దయచేసి సరైన 11 అక్షరాల IFSC కోడ్ నమోదు చేయండి (ఉదా: SBIN0001234).");
      return;
    }
    if (!hasDocuments) {
      setApplyError("నకిలీ దరఖాస్తులను నిరోధించడానికి కనీసం ఒక హాస్పిటల్ ఎస్టిమేట్ బిల్లు లేదా డాక్టర్ ప్రిస్క్రిప్షన్ అప్‌లోడ్ చేయడం తప్పనిసరి.");
      return;
    }
    if (!isDeclared) {
      setApplyError("దయచేసి వివరాల యదార్థతను ధృవీకరిస్తూ డిక్లరేషన్ చెక్‌బాక్స్‌ను టిక్ చేయండి.");
      return;
    }

    setApplyLoading(true);

    try {
      const res = await fetch(`${API_BASE}/aapadbandhava/public/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applyForm),
      });
      const data = await res.json();
      if (data.success) {
        setApplySuccess(data.case_code || "HSY-AID-SUCCESS");
        fetchCases();
      } else {
        setApplyError(data.error || "Failed to submit application");
      }
    } catch (err) {
      setApplyError(err.message || "Network error. Please try again.");
    } finally {
      setApplyLoading(false);
    }
  };

  // UPI Deep Link Generator
  const getUpiUrl = (c, app) => {
    if (!c) return "#";
    const upiId = c.beneficiary_upi_id || c.beneficiary_upi_phone;
    if (!upiId) return "#";
    const name = encodeURIComponent(c.beneficiary_acc_name || "Beneficiary");
    const note = encodeURIComponent(`Aapadbandhava Aid for ${c.patient_name}`);
    const amt = contribForm.amount || "1000";

    const standardUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${name}&tn=${note}&am=${amt}&cu=INR`;
    if (app === "GPAY") return `gpay://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${name}&tn=${note}&am=${amt}&cu=INR`;
    if (app === "PHONEPE") return `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${name}&tn=${note}&am=${amt}&cu=INR`;
    if (app === "PAYTM") return `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${name}&tn=${note}&am=${amt}&cu=INR`;
    return standardUri;
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Live Emergency Ticker */}
      <EmergencyBloodTicker />

      {/* ================= 1. DEDICATED TOP NAVBAR ================= */}
      <nav className={styles.topNav}>
        <div className={styles.topNavContainer}>
          <Link href="/" className={styles.brandLink}>
            <Image
              src="/images/logo_v2.png"
              alt="Hindu Swaraj Logo"
              width={44}
              height={44}
              className={styles.brandLogo}
            />
            <div className={styles.brandTextGroup}>
              <div className={styles.brandTitle}>HINDU SWARAJ YOUTH</div>
              <div className={styles.brandSubtitle}>🚩 ఆపద్బాంధవ • EMERGENCY SEVA</div>
            </div>
          </Link>

          <div className={styles.navActionBtns}>
            <Link href="/" className={styles.backHomeBtn}>
              🏠 Back to Home
            </Link>
            <button
              onClick={() => {
                setApplySuccess(null);
                setApplyError("");
                setIsApplyModalOpen(true);
              }}
              className={styles.navApplyBtn}
            >
              🚨 అత్యవసర దరఖాస్తు (Apply for Aid)
            </button>
          </div>
        </div>
      </nav>

      {/* ================= 2. HERO SECTION (DHARMIC THEME WITH SHIVAJI MAHARAJ) ================= */}
      <header className={styles.hero}>
        <div className={styles.heroBackgroundGlow}></div>

        <div className={styles.heroContent}>
          {/* Left Side: Chhatrapati Shivaji Maharaj Portrait Card */}
          <div className={styles.shivajiFrameWrapper}>
            <div className={styles.shivajiCard}>
              <div className={styles.shivajiImageWrap}>
                <Image
                  src="/images/shivaji-aapadbandhava.jpg"
                  alt="Chhatrapati Shivaji Maharaj"
                  width={280}
                  height={270}
                  priority
                  className={styles.shivajiImage}
                />
              </div>
              <div className={styles.shivajiInsignia}>
                <span>🚩 ఛత్రపతి శివాజీ మహారాజ్ ప్రేరణతో</span>
              </div>
              <div className={styles.shivajiShloka}>
                || హిందూ స్వరాజ్య స్థాపనార్థం — దీన జనోద్ధారణార్థం ||
              </div>
            </div>
          </div>

          {/* Right Side: Inspiring Seva & Relief Content */}
          <div className={styles.heroRightText}>
            <div className={styles.quotePill}>
              <span className={styles.pulseDot}></span>
              <span>|| స్వధర్మే నిధనం శ్రేయః — ప్రజా సేవయే ఈశ్వర సేవ 🚩 ||</span>
            </div>

            <h1 className={styles.mainTitle}>
              హిందూ స్వరాజ్ <span className={styles.mainTitleHighlight}>ఆపద్బాంధవ</span>
            </h1>

            <p className={styles.subtitle}>
              <strong>ఆపదలో తోడుగా... ప్రాణానికి అండగా!</strong> అత్యవసర ప్రాణాంతక సర్జరీలు, చిన్నపిల్లల వైద్యం మరియు తీవ్ర ప్రమాదాల బారిన పడిన జగిత్యాల పేద ప్రజల కోసం హిందూ స్వరాజ్ యూత్ టీమ్ స్వయంగా హాస్పిటల్‌కు వెళ్లి ధృవీకరించిన (100% Ground Verified) నిస్వార్థ ప్రజా సహాయ నిధి.
            </p>

            <div className={styles.trustBadgesRow}>
              <div className={`${styles.trustBadgeItem} ${styles.trustBadgeItemHighlight}`}>
                <span>🛡️ 100% హాస్పిటల్ గ్రౌండ్ వెరిఫైడ్</span>
              </div>
              <div className={styles.trustBadgeItem}>
                <span>💸 0% మధ్యవర్తిత్వం (No Platform Fee)</span>
              </div>
              <div className={styles.trustBadgeItem}>
                <span>💳 నేరుగా బాధితుడి బ్యాంక్/UPI ఖాతాకే సాయం</span>
              </div>
            </div>

            <div className={styles.heroActions}>
              <button
                className={styles.primaryBtn}
                onClick={() => {
                  setApplySuccess(null);
                  setApplyError("");
                  setIsApplyModalOpen(true);
                }}
              >
                🚨 అత్యవసర సహాయం కోసం దరఖాస్తు (Apply for Aid)
              </button>
              <a href="#verified-cases" className={styles.secondaryBtn}>
                📋 ధృవీకరించిన కేసులు చూడండి (Explore Cases)
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ================= 3. IMPACT METRICS BAR ================= */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statNum}>₹{Number(stats.total_facilitated || 240000).toLocaleString("en-IN")}</div>
            <div className={styles.statLabel}>ప్రత్యక్షంగా చేరిన సహాయం (Direct Aid Facilitated)</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum}>{stats.total_cases || 3}+</div>
            <div className={styles.statLabel}>ధృవీకరించిన అత్యవసర కేసులు</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum}>100%</div>
            <div className={styles.statLabel}>హాస్పిటల్ &amp; డాక్టర్ క్షేత్రస్థాయి పరిశీలన</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum}>₹0</div>
            <div className={styles.statLabel}>కమీషన్ లేదా చార్జీలు (100% Free Seva)</div>
          </div>
        </div>
      </section>

      {/* ================= 4. HOW IT WORKS 4-STEP ================= */}
      <section className={styles.howItWorksSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>పారదర్శక విధానం (Transparent Workflow)</span>
          <h2 className={styles.sectionTitle}>ఆపద్బాంధవ సేవ ఎలా పనిచేస్తుంది?</h2>
        </div>

        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>01</span>
            <div className={styles.stepIcon}>📝</div>
            <h3 className={styles.stepTitle}>1. అత్యవసర దరఖాస్తు</h3>
            <p className={styles.stepDesc}>
              బాధితులు లేదా వారి కుటుంబసభ్యులు పేషెంట్ వివరాలు, ఫోటో మరియు హాస్పిటల్ ఎస్టిమేట్ బిల్లుతో దరఖాస్తు చేస్తారు.
            </p>
          </div>

          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>02</span>
            <div className={styles.stepIcon}>🏥</div>
            <h3 className={styles.stepTitle}>2. హాస్పిటల్ గ్రౌండ్ ఆడిట్</h3>
            <p className={styles.stepDesc}>
              హిందూ స్వరాజ్ యూత్ కార్యవర్గ సభ్యులు స్వయంగా హాస్పిటల్‌కు వెళ్లి డాక్టర్‌తో మాట్లాడి బిల్లులను పరిశీలిస్తారు.
            </p>
          </div>

          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>03</span>
            <div className={styles.stepIcon}>🛡️</div>
            <h3 className={styles.stepTitle}>3. 100% Verified బ్యాడ్జ్</h3>
            <p className={styles.stepDesc}>
              యదార్థమైన నిజమైన కేసులకు మాత్రమే సూపర్ అడ్మిన్ అధికారికంగా వెరిఫైడ్ బ్యాడ్జ్ కేటాయించి పోర్టల్‌లో లైవ్ చేస్తారు.
            </p>
          </div>

          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>04</span>
            <div className={styles.stepIcon}>💳</div>
            <h3 className={styles.stepTitle}>4. నేరుగా బాధితుడికే సాయం</h3>
            <p className={styles.stepDesc}>
              దాతలు పంపే ప్రతి పైసా మధ్యవర్తులు లేకుండా నేరుగా బాధితుడి లేదా హాస్పిటల్ ఖాతాకే బదిలీ అవుతుంది.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 5. CONTROLS & FILTER ================= */}
      <section id="verified-cases" className={styles.controlsSection}>
        <div className={styles.controlsWrap}>
          <div className={styles.categoryPills}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.catPill} ${selectedCategory === cat.id ? styles.catPillActive : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="పేషెంట్ / హాస్పిటల్ పేరు..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      </section>

      {/* ================= 6. CASES GRID ================= */}
      <section className={styles.casesSection}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
            <p>🔄 అత్యవసర కేసులు లోడ్ అవుతున్నాయి...</p>
          </div>
        ) : cases.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8", background: "#131a26", borderRadius: "20px" }}>
            <p style={{ fontSize: "1.2rem", marginBottom: "16px" }}>ఈ విభాగంలో ప్రస్తుతం కేసులు లేవు.</p>
            <button
              className={styles.primaryBtn}
              onClick={() => {
                setApplySuccess(null);
                setApplyError("");
                setIsApplyModalOpen(true);
              }}
            >
              🚨 కొత్త అత్యవసర దరఖాస్తును సమర్పించండి
            </button>
          </div>
        ) : (
          <div className={styles.casesGrid}>
            {cases.map((c) => {
              const target = Number(c.target_amount) || 1;
              const raised = Number(c.amount_raised) || 0;
              const percentage = Math.min(100, Math.round((raised / target) * 100));

              return (
                <div key={c.id} className={styles.caseCard}>
                  {/* Card Header & Image */}
                  <div className={styles.cardHeader}>
                    <img
                      src={c.primary_photo_url || "/images/activity-disaster.png"}
                      alt={c.patient_name}
                      className={styles.cardImage}
                    />
                    <div className={styles.cardBadges}>
                      <span
                        className={`${styles.urgencyBadge} ${
                          c.urgency_level === "URGENT_7_DAYS" ? styles.urgency7Days : ""
                        }`}
                      >
                        {c.urgency_level === "CRITICAL_48_HOURS"
                          ? "🚨 48 గంటలు అత్యవసరం"
                          : c.urgency_level === "URGENT_7_DAYS"
                          ? "⚡ 7 రోజుల్లో సర్జరీ"
                          : "🔴 అత్యవసర సాయం"}
                      </span>
                      <span className={styles.categoryTag}>
                        {c.emergency_category === "CHILD_CARE"
                          ? "👶 Child Care"
                          : c.emergency_category === "CANCER_TREATMENT"
                          ? "🎗️ Cancer Care"
                          : "🏥 Surgery"}
                      </span>
                    </div>

                    <div className={styles.verifiedBadgeOverlay}>
                      <span>🛡️ HSY 100% GROUND VERIFIED</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className={styles.cardBody}>
                    <h3 className={styles.caseTitle} title={c.title}>
                      {c.title}
                    </h3>

                    <div className={styles.patientMeta}>
                      <span>👤 {c.patient_name} ({c.patient_age || "N/A"} yrs)</span>
                      <span>•</span>
                      <span>📍 {c.city || "Jagtial"}</span>
                    </div>

                    <div className={styles.hospitalInfo}>
                      <span>🏥 {c.hospital_name}</span>
                      {c.doctor_name && <small>👨‍⚕️ {c.doctor_name}</small>}
                    </div>

                    {/* Progress */}
                    <div className={styles.progressArea}>
                      <div className={styles.progressNumbers}>
                        <span className={styles.amountRaised}>
                          ₹{raised.toLocaleString("en-IN")} <small style={{ color: "#94a3b8" }}>అందినవి</small>
                        </span>
                        <span className={styles.targetAmount}>
                          లక్ష్యం: ₹{target.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className={styles.progressBarTrack}>
                        <div className={styles.progressBarFill} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>

                    {/* Beneficiary Direct Box */}
                    <div className={styles.beneficiaryCardBox}>
                      <div className={styles.beneficiaryBoxHeader}>
                        <span>💳 ప్రత్యక్ష సహాయ వివరాలు</span>
                        <span>0% కమీషన్</span>
                      </div>
                      <div className={styles.beneficiaryDetails}>
                        <div><strong>ఖాతాదారు:</strong> {c.beneficiary_acc_name}</div>
                        <div><strong>UPI ID:</strong> {c.beneficiary_upi_id || c.beneficiary_upi_phone || "లభ్యం"}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={styles.cardFooter}>
                      <button
                        className={styles.donateDirectBtn}
                        onClick={() => {
                          setContribError("");
                          setActiveDirectPayCase(c);
                        }}
                      >
                        💳 నేరుగా సాయం చేయండి
                      </button>
                      <button
                        className={styles.viewDetailsBtn}
                        onClick={() => setActiveDetailCase(c)}
                      >
                        📄 పూర్తి వివరాలు
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= 7. TRUST BANNER ================= */}
      <section className={styles.trustBanner}>
        <div className={styles.trustBannerInner}>
          <div>
            <div className={styles.trustFeatureIcon}>🛡️</div>
            <div className={styles.trustFeatureTitle}>100% క్షేత్రస్థాయి పరిశీలన</div>
            <div className={styles.trustFeatureDesc}>
              హిందూ స్వరాజ్ యూత్ కార్యవర్గ సభ్యులు స్వయంగా హాస్పిటల్‌కు వెళ్లి డాక్టర్లు, బిల్లులు మరియు బాధితుల స్థితిని ధృవీకరించిన తర్వాతే అప్లోడ్ చేస్తారు.
            </div>
          </div>
          <div>
            <div className={styles.trustFeatureIcon}>💸</div>
            <div className={styles.trustFeatureTitle}>0% మధ్యవర్తిత్వం (No Middleman)</div>
            <div className={styles.trustFeatureDesc}>
              దాతలు పంపే ప్రతి రూపాయి నేరుగా పేషెంట్ లేదా హాస్పిటల్ ఖాతాకే వెళ్తుంది. అసోసియేషన్ ఎలాంటి ఫీజు లేదా కమీషన్ తీసుకోదు.
            </div>
          </div>
          <div>
            <div className={styles.trustFeatureIcon}>📜</div>
            <div className={styles.trustFeatureTitle}>పారదర్శక మెడికల్ రికార్డులు</div>
            <div className={styles.trustFeatureDesc}>
              హాస్పిటల్ ఎస్టిమేషన్ లెటర్, డాక్టర్ సంతకాలు మరియు చికిత్స రికార్డుల సాఫ్ట్ కాపీలను దాతలు సైట్‌లోనే చూసి నిర్ధారించుకోవచ్చు.
            </div>
          </div>
        </div>
      </section>

      {/* ================= 8. DIRECT PAY BENEFICIARY MODAL (DESKTOP QR & MOBILE UPI APPS) ================= */}
      {activeDirectPayCase && (
        <div className={styles.modalOverlay} onClick={() => setActiveDirectPayCase(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setActiveDirectPayCase(null)}>
              ✕
            </button>

            <div style={{ textAlign: "center", marginBottom: "14px" }}>
              <span className={styles.quotePill}>
                🛡️ 100% DIRECT BENEFICIARY PAYMENT (0% FEE)
              </span>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, marginTop: "8px" }}>
                {activeDirectPayCase.patient_name} కోసం ప్రత్యక్ష సహాయం
              </h2>
              <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                ఈ సహాయం నేరుగా బాధితుడి అధికారిక ఖాతాకు మాత్రమే చేరుతుంది.
              </p>
            </div>

            {/* Pay Sub-Tabs */}
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "14px" }}>
              <button
                className={`${styles.catPill} ${payTab === "QR_UPI" ? styles.catPillActive : ""}`}
                onClick={() => setPayTab("QR_UPI")}
              >
                📱 QR కోడ్ &amp; UPI యాప్స్
              </button>
              <button
                className={`${styles.catPill} ${payTab === "BANK_TRANSFER" ? styles.catPillActive : ""}`}
                onClick={() => setPayTab("BANK_TRANSFER")}
              >
                🏦 బ్యాంక్ ఖాతా వివరాలు (IMPS/NEFT)
              </button>
            </div>

            {payTab === "QR_UPI" ? (
              <div className={styles.qrCodeBox}>
                {/* Desktop QR Scan Notice */}
                <div className={styles.desktopQrGuide}>
                  <span>📱</span>
                  <span>మొబైల్ స్కానర్ లేదా కింద ఉన్న UPI యాప్స్‌తో నేరుగా పంపండి:</span>
                </div>

                <img
                  src={activeDirectPayCase.beneficiary_qr_url || "/images/logo_v2.png"}
                  alt="Direct UPI QR Code"
                  className={styles.qrImage}
                />

                {/* 1-Tap UPI Apps Trigger */}
                <div className={styles.upiAppsGrid}>
                  <a
                    href={getUpiUrl(activeDirectPayCase, "GPAY")}
                    className={`${styles.upiAppBtn} ${styles.upiAppGpay}`}
                  >
                    <span>🟢</span>
                    <span>Google Pay</span>
                  </a>
                  <a
                    href={getUpiUrl(activeDirectPayCase, "PHONEPE")}
                    className={`${styles.upiAppBtn} ${styles.upiAppPhonepe}`}
                  >
                    <span>🟣</span>
                    <span>PhonePe</span>
                  </a>
                  <a
                    href={getUpiUrl(activeDirectPayCase, "PAYTM")}
                    className={`${styles.upiAppBtn} ${styles.upiAppPaytm}`}
                  >
                    <span>🔵</span>
                    <span>Paytm</span>
                  </a>
                  <a
                    href={getUpiUrl(activeDirectPayCase, "ANY")}
                    className={`${styles.upiAppBtn} ${styles.upiAppAny}`}
                  >
                    <span>⚡</span>
                    <span>Any UPI App</span>
                  </a>
                </div>

                {/* Copy UPI ID Button */}
                {activeDirectPayCase.beneficiary_upi_id && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                    <code style={{ background: "rgba(255,255,255,0.08)", padding: "6px 12px", borderRadius: "6px", fontSize: "0.88rem" }}>
                      {activeDirectPayCase.beneficiary_upi_id}
                    </code>
                    <button
                      className={styles.copySmallBtn}
                      onClick={() => copyToClipboard(activeDirectPayCase.beneficiary_upi_id, "upi")}
                    >
                      {copiedKey === "upi" ? "✅ కాపీ అయింది" : "📋 కాపీ UPI ID"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Bank Transfer Copy List */
              <div className={styles.bankCopyList}>
                <div className={styles.bankCopyRow}>
                  <div>
                    <small style={{ color: "#94a3b8", display: "block" }}>ఖాతాదారు పేరు (A/C Holder):</small>
                    <strong>{activeDirectPayCase.beneficiary_acc_name}</strong>
                  </div>
                  <button
                    className={styles.copySmallBtn}
                    onClick={() => copyToClipboard(activeDirectPayCase.beneficiary_acc_name, "holder")}
                  >
                    {copiedKey === "holder" ? "✅ కాపీ అయింది" : "కాపీ"}
                  </button>
                </div>

                <div className={styles.bankCopyRow}>
                  <div>
                    <small style={{ color: "#94a3b8", display: "block" }}>బ్యాంక్ పేరు &amp; బ్రాంచ్:</small>
                    <strong>{activeDirectPayCase.beneficiary_bank_name}</strong>
                  </div>
                </div>

                <div className={styles.bankCopyRow}>
                  <div>
                    <small style={{ color: "#94a3b8", display: "block" }}>ఖాతా సంఖ్య (Account Number):</small>
                    <strong style={{ fontSize: "1.05rem", color: "#ff9933" }}>{activeDirectPayCase.beneficiary_acc_no}</strong>
                  </div>
                  <button
                    className={styles.copySmallBtn}
                    onClick={() => copyToClipboard(activeDirectPayCase.beneficiary_acc_no, "acc")}
                  >
                    {copiedKey === "acc" ? "✅ కాపీ అయింది" : "కాపీ A/C"}
                  </button>
                </div>

                <div className={styles.bankCopyRow}>
                  <div>
                    <small style={{ color: "#94a3b8", display: "block" }}>IFSC కోడ్:</small>
                    <strong>{activeDirectPayCase.beneficiary_ifsc}</strong>
                  </div>
                  <button
                    className={styles.copySmallBtn}
                    onClick={() => copyToClipboard(activeDirectPayCase.beneficiary_ifsc, "ifsc")}
                  >
                    {copiedKey === "ifsc" ? "✅ కాపీ అయింది" : "కాపీ IFSC"}
                  </button>
                </div>
              </div>
            )}

            {/* ================= CONFIRM & GENERATE SEVA CERTIFICATE ================= */}
            <div className={styles.confirmContributionBox}>
              <div className={styles.confirmTitle}>
                🎉 సహాయం పంపారా? మీ అధికారిక "సేవా ప్రశంసా పత్రం" పొందండి!
              </div>
              <p className={styles.confirmSubtitle}>
                మీరు పంపిన సహాయ వివరాలను నమోదు చేయగానే డిజిటల్ సర్టిఫికెట్ రూపొందించబడుతుంది.
              </p>

              {contribError && (
                <div style={{ color: "#f87171", fontSize: "0.85rem", fontWeight: 700, marginBottom: "8px" }}>
                  ⚠️ {contribError}
                </div>
              )}

              <form onSubmit={handleContributionSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", textAlign: "left" }}>
                <div className={styles.formGroup}>
                  <label style={{ fontSize: "0.78rem" }}>మీ పేరు (Donor Name) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ఉదా: ముకేష్ కొక్కుల"
                    value={contribForm.donor_name}
                    onChange={(e) => setContribForm({ ...contribForm, donor_name: e.target.value })}
                    className={styles.formInput}
                    style={{ padding: "8px 10px", fontSize: "0.85rem" }}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label style={{ fontSize: "0.78rem" }}>పంపిన మొత్తం (Amount in ₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="1000"
                    value={contribForm.amount}
                    onChange={(e) => setContribForm({ ...contribForm, amount: e.target.value })}
                    className={styles.formInput}
                    style={{ padding: "8px 10px", fontSize: "0.85rem" }}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label style={{ fontSize: "0.78rem" }}>మొబైల్ నంబర్ (WhatsApp)</label>
                  <input
                    type="tel"
                    placeholder="9848012345"
                    value={contribForm.donor_phone}
                    onChange={(e) => setContribForm({ ...contribForm, donor_phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    className={styles.formInput}
                    style={{ padding: "8px 10px", fontSize: "0.85rem" }}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label style={{ fontSize: "0.78rem" }}>ఊరు / నగరం (City)</label>
                  <input
                    type="text"
                    placeholder="Jagtial"
                    value={contribForm.donor_city}
                    onChange={(e) => setContribForm({ ...contribForm, donor_city: e.target.value })}
                    className={styles.formInput}
                    style={{ padding: "8px 10px", fontSize: "0.85rem" }}
                  />
                </div>

                <div className={styles.formFullWidth} style={{ marginTop: "4px" }}>
                  <button
                    type="submit"
                    disabled={contribLoading || !contribForm.donor_name.trim()}
                    className={styles.primaryBtn}
                    style={{ width: "100%", justifyContent: "center", padding: "10px 14px", fontSize: "0.92rem", background: "linear-gradient(135deg, #ffd700 0%, #ff7700 100%)", color: "#111827" }}
                  >
                    {contribLoading ? "రూపొందిస్తోంది..." : "📜 నా సేవా ప్రశంసా పత్రం రూపొందించండి (Generate Certificate)"}
                  </button>
                </div>
              </form>
            </div>

            {/* WhatsApp Share Button */}
            <div style={{ marginTop: "14px", display: "flex", gap: "10px" }}>
              <button
                className={styles.primaryBtn}
                style={{ width: "100%", justifyContent: "center", background: "#25D366", padding: "10px 14px" }}
                onClick={() => handleShareWhatsApp(activeDirectPayCase)}
              >
                📲 WhatsApp లో ఈ అత్యవసర కేసును షేర్ చేయండి
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 9. GRAND DIGITAL SEVA CERTIFICATE MODAL ================= */}
      {generatedCertificate && (
        <div className={styles.modalOverlay} onClick={() => setGeneratedCertificate(null)}>
          <div className={styles.certificateModalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setGeneratedCertificate(null)}>
              ✕
            </button>

            {/* Certificate Frame */}
            <div className={styles.certificateFrame} id="aapadbandhava-certificate">
              {/* 4 Ornate Gold Corner Accents */}
              <div className={styles.certCornerTopLeft}>⚜️</div>
              <div className={styles.certCornerTopRight}>⚜️</div>
              <div className={styles.certCornerBottomLeft}>⚜️</div>
              <div className={styles.certCornerBottomRight}>⚜️</div>

              <div className={styles.certWatermark}>
                <Image src="/images/logo_v2.png" alt="Watermark" width={340} height={340} />
              </div>

              {/* Sacred Shloka Bar */}
              <div className={styles.certTopShloka}>
                🚩 || పరోపకారార్థం ఇదం శరీరం — దీన జనోద్ధారణార్థం || 🚩
              </div>

              <div className={styles.certHeaderTop}>
                <div style={{ textAlign: "left" }}>
                  <div className={styles.certOrgName}>HINDU SWARAJ YOUTH WELFARE ASSOCIATION</div>
                  <div className={styles.certOrgSub}>REGD. NO. 784/2025 • JAGTIAL, TELANGANA</div>
                </div>
                <div className={styles.certCodeBadge}>
                  CERT ID: {generatedCertificate.certificate_code}
                </div>
              </div>

              <div className={styles.certMainTitle}>
                ఆపద్బాంధవ జీవనదాత సేవా ప్రశంసా పత్రం
              </div>
              <div className={styles.certSubTitle}>
                CERTIFICATE OF HUMANITARIAN APPRECIATION
              </div>

              <div className={styles.certRecipientTag}>ఈ ప్రశంసా పత్రం సగౌరవంగా సమర్పించడమైనది:</div>
              <div className={styles.certDonorName}>
                శ్రీ / శ్రీమతి {generatedCertificate.donor_name}
              </div>

              <p className={styles.certDescriptionText}>
                జగిత్యాల ఆపద్బాంధవ అత్యవసర ప్రజా సహాయ నిధి ద్వారా ప్రాణాపాయ స్థితిలో ఉన్న <strong>{generatedCertificate.patient_name}</strong> గారి అత్యవసర వైద్య చికిత్స నిమిత్తం అందించిన నిస్వార్థ సహాయానికి గాను హిందూ స్వరాజ్ యూత్ అసోసియేషన్ హృదయపూర్వక కృతజ్ఞతాభివందనాలతో ఈ ప్రశంసా పత్రాన్ని అందజేస్తోంది.
              </p>

              <div>
                <span className={styles.certAmountPill}>
                  💎 అందించిన సహాయం: ₹{Number(generatedCertificate.amount).toLocaleString("en-IN")}
                </span>
              </div>

              <div className={styles.certFooterRow}>
                <div className={styles.certSignatureBox}>
                  <div style={{ fontWeight: "bold", fontSize: "0.84rem", color: "#78350f" }}>తేదీ: {generatedCertificate.date}</div>
                  <div className={styles.certSignSub}>జగిత్యాల, తెలంగాణ</div>
                </div>

                <div className={styles.certSealBox}>
                  <div className={styles.certSealBadge}>
                    <span>🛡️</span>
                    <span>100% VERIFIED</span>
                    <span>SEVA SEAL</span>
                  </div>
                </div>

                <div className={styles.certSignatureBox}>
                  <div style={{ fontWeight: "900", fontSize: "0.92rem", color: "#78350f", letterSpacing: "0.5px" }}>Mukesh Kokkula</div>
                  <div className={styles.certSignTitle}>అధ్యక్షులు (President)</div>
                  <div className={styles.certSignSub}>హిందూ స్వరాజ్ యూత్ అసోసియేషన్</div>
                </div>
              </div>
            </div>

            {/* Certificate Action Buttons */}
            <div className={styles.certActionsRow}>
              <button
                className={styles.primaryBtn}
                style={{ background: "#25D366", borderColor: "#25D366" }}
                onClick={() => handleShareCertificateWhatsApp(generatedCertificate)}
              >
                📲 WhatsApp స్టేటస్‌లో షేర్ చేయండి
              </button>
              <button
                className={styles.secondaryBtn}
                onClick={() => window.print()}
              >
                🖨️ డౌన్‌లోడ్ / ప్రింట్ సర్టిఫికెట్
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 10. FULL CASE DETAILS & DOCUMENTS MODAL ================= */}
      {activeDetailCase && (
        <div className={styles.modalOverlay} onClick={() => setActiveDetailCase(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setActiveDetailCase(null)}>
              ✕
            </button>

            <span className={styles.quotePill}>
              🛡️ CASE CODE: {activeDetailCase.case_code}
            </span>

            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "10px 0 16px" }}>
              {activeDetailCase.title}
            </h2>

            {/* Verification Seal Card */}
            <div className={styles.verificationSealCard}>
              <div className={styles.sealHeader}>
                <span>🛡️</span>
                <span>హిందూ స్వరాజ్ యూత్ క్షేత్రస్థాయి పరిశీలన నివేదిక (HSY Ground Audit)</span>
              </div>
              <p className={styles.sealText}>
                {activeDetailCase.verification_report ||
                  "మా అసోసియేషన్ కార్యవర్గ సభ్యులు హాస్పిటల్ మరియు వైద్యులను స్వయంగా కలిసి ఈ కేసును 100% యదార్థమైనదిగా నిర్ధారించారు."}
              </p>
              <div style={{ display: "flex", gap: "16px", marginTop: "12px", fontSize: "0.85rem", color: "#ffd700", flexWrap: "wrap" }}>
                <span>✅ డాక్టర్ వెరిఫైడ్</span>
                <span>✅ హాస్పిటల్ ఎస్టిమేట్ ఆడిట్ పూర్తి</span>
                <span>✅ కుటుంబం గ్రౌండ్ విజిట్ పూర్తి</span>
                {activeDetailCase.assigned_member_name && (
                  <span>👨‍💼 ఇన్వెస్టిగేటర్: {activeDetailCase.assigned_member_name}</span>
                )}
              </div>
            </div>

            {/* Patient Story */}
            <div style={{ margin: "20px 0" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ff9933", marginBottom: "8px" }}>
                బాధితుడి నేపథ్యం &amp; చికిత్స వివరాలు:
              </h3>
              <p style={{ color: "#cbd5e1", lineHeight: 1.7, whiteSpace: "pre-line", fontSize: "0.95rem" }}>
                {activeDetailCase.story}
              </p>
            </div>

            {/* Medical Proofs & Documents */}
            {activeDetailCase.documents_urls && activeDetailCase.documents_urls.length > 0 && (
              <div style={{ margin: "24px 0" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#34d399", marginBottom: "8px" }}>
                  📄 ధృవీకరించిన మెడికల్ రికార్డులు &amp; బిల్లులు:
                </h3>
                <div className={styles.docsGallery}>
                  {activeDetailCase.documents_urls.map((doc, idx) => (
                    <div
                      key={idx}
                      className={styles.docThumbnail}
                      onClick={() => setSelectedDocPreview(doc)}
                    >
                      <img src={doc} alt={`Medical Document ${idx + 1}`} />
                      <div className={styles.docOverlay}>🔍 పెద్దదిగా చూడండి</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                className={styles.primaryBtn}
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => {
                  const c = activeDetailCase;
                  setActiveDetailCase(null);
                  setActiveDirectPayCase(c);
                }}
              >
                💳 నేరుగా బాధితుడికి సహాయం చేయండి
              </button>
              <button
                className={styles.secondaryBtn}
                style={{ background: "#25D366", borderColor: "#25D366", color: "#fff" }}
                onClick={() => handleShareWhatsApp(activeDetailCase)}
              >
                📲 WhatsApp లో షేర్ చేయండి
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 11. DOCUMENT LIGHTBOX PREVIEW ================= */}
      {selectedDocPreview && (
        <div className={styles.modalOverlay} onClick={() => setSelectedDocPreview(null)}>
          <div style={{ maxWidth: "90vw", maxHeight: "90vh", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setSelectedDocPreview(null)}>
              ✕
            </button>
            <img
              src={selectedDocPreview}
              alt="Medical Proof Preview"
              style={{ width: "100%", maxHeight: "85vh", objectFit: "contain", borderRadius: "12px" }}
            />
          </div>
        </div>
      )}

      {/* ================= 12. DEDICATED FULL-SIZE APPLICATION DESK ================= */}
      {isApplyModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsApplyModalOpen(false)}>
          <div className={styles.fullSizeModalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setIsApplyModalOpen(false)}>
              ✕
            </button>

            {applySuccess ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <span style={{ fontSize: "3.5rem" }}>🙏</span>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#34d399", margin: "14px 0" }}>
                  అత్యవసర సహాయ దరఖాస్తు విజయవంతంగా అందింది!
                </h2>
                <div style={{ background: "rgba(16, 185, 129, 0.12)", border: "1.5px solid #10b981", borderRadius: "14px", padding: "18px", margin: "20px auto", maxWidth: "480px" }}>
                  <p style={{ fontSize: "0.95rem", color: "#e2e8f0" }}>మీ అధికారిక అప్లికేషన్ రిఫరెన్స్ కోడ్:</p>
                  <strong style={{ fontSize: "1.6rem", color: "#ffd700", letterSpacing: "1px" }}>{applySuccess}</strong>
                </div>
                <p style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: 1.65, maxWidth: "680px", margin: "0 auto" }}>
                  హిందూ స్వరాజ్ యూత్ అసోసియేషన్ గ్రౌండ్ ఇన్వెస్టిగేషన్ టీమ్ త్వరలోనే మీ హాస్పిటల్ &amp; డాక్టర్‌ను స్వయంగా కలిసి మీ బిల్లులను ఆడిట్ చేస్తుంది. ధృవీకరణ పూర్తయ్యాక <strong>🛡️ 100% Ground Verified</strong> బ్యాడ్జ్‌తో మీ కేసును లైవ్ చేయడం జరుగుతుంది.
                </p>
                <button
                  className={styles.primaryBtn}
                  style={{ marginTop: "28px" }}
                  onClick={() => setIsApplyModalOpen(false)}
                >
                  ఓకే, అర్థమైంది (Close)
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit}>
                {/* Header */}
                <div className={styles.appDeskHeader}>
                  <span className={styles.quotePill}>🚨 ఉచిత అత్యవసర సహాయ దరఖాస్తు కేంద్రం (Emergency Aid Desk)</span>
                  <h2 className={styles.appDeskTitle}>
                    ఆపదలో ఉన్న పేదవారి వివరాలను సమర్పించండి
                  </h2>
                  <p className={styles.appDeskSubtitle}>
                    నకిలీ దరఖాస్తులను అరికట్టడానికి ప్రతి రికార్డును మా గ్రౌండ్ టీమ్ హాస్పిటల్‌కు స్వయంగా వెళ్లి పరిశీలిస్తుంది.
                  </p>
                  <div className={styles.antiFraudBadge}>
                    <span>🛡️ 100% పారదర్శక పరిశీలన • సరైన రికార్డులను మాత్రమే నమోదు చేయండి</span>
                  </div>
                </div>

                {applyError && (
                  <div style={{ background: "rgba(239, 68, 68, 0.18)", border: "1.5px solid #ef4444", color: "#fca5a5", padding: "14px 18px", borderRadius: "12px", marginBottom: "20px", fontSize: "0.92rem", fontWeight: 700 }}>
                    ⚠️ {applyError}
                  </div>
                )}

                {/* ================= STEP 1: PATIENT & HOSPITAL ================= */}
                <div className={styles.formSectionCard}>
                  <div className={styles.formSectionHeader}>
                    <div className={styles.formSectionTitle}>
                      <span>👤</span>
                      <span>స్టెప్ 1: పేషెంట్ &amp; హాస్పిటల్ ప్రాథమిక వివరాలు</span>
                    </div>
                    <span className={styles.formSectionStepBadge}>విభాగం 1 / 4</span>
                  </div>

                  <div className={styles.formGrid3}>
                    <div className={styles.formGroup}>
                      <label>
                        పేషెంట్ పూర్తి పేరు *
                        {applyForm.patient_name && (
                          <span className={`${styles.fieldValidationTag} ${isPatientNameValid ? styles.fieldValid : styles.fieldInvalid}`}>
                            {isPatientNameValid ? "✅ సరైన పేరు" : "⚠️ కనీసం 3 అక్షరాలు"}
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ఉదా: మాస్టర్ సాయికృష్ణ"
                        value={applyForm.patient_name}
                        onChange={(e) => handleNameChange("patient_name", e.target.value)}
                        className={`${styles.formInput} ${applyForm.patient_name ? (isPatientNameValid ? styles.formInputValid : styles.formInputInvalid) : ""}`}
                      />
                      <small className={styles.fieldHelperText}>సంఖ్యలు అనుమతించబడవు (అక్షరాలు మాత్రమే)</small>
                    </div>

                    <div className={styles.formGroup}>
                      <label>వయస్సు (సంవత్సరాలు) *</label>
                      <input
                        type="text"
                        required
                        placeholder="ఉదా: 6 లేదా 45"
                        value={applyForm.patient_age}
                        onChange={(e) => handleAgeChange(e.target.value)}
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>లింగం (Gender) *</label>
                      <select
                        value={applyForm.gender}
                        onChange={(e) => setApplyForm({ ...applyForm, gender: e.target.value })}
                        className={styles.formSelect}
                      >
                        <option value="Male">పురుషుడు (Male)</option>
                        <option value="Female">స్త్రీ (Female)</option>
                        <option value="Child">చిన్నారి (Child)</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>
                        సంరక్షకుడి పేరు (Guardian Name) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="తండ్రి / భర్త / తల్లి పేరు"
                        value={applyForm.guardian_name}
                        onChange={(e) => handleNameChange("guardian_name", e.target.value)}
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>సంబంధం (Relation)</label>
                      <select
                        value={applyForm.guardian_relation}
                        onChange={(e) => setApplyForm({ ...applyForm, guardian_relation: e.target.value })}
                        className={styles.formSelect}
                      >
                        <option value="Father">తండ్రి (Father)</option>
                        <option value="Mother">తల్లి (Mother)</option>
                        <option value="Husband">భర్త (Husband)</option>
                        <option value="Wife">భార్య (Wife)</option>
                        <option value="Son">కుమారుడు (Son)</option>
                        <option value="Daughter">కుమార్తె (Daughter)</option>
                        <option value="Self">స్వయంగా (Self)</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>
                        మొబైల్ నంబర్ (WhatsApp Contact) *
                        {applyForm.guardian_phone && (
                          <span className={`${styles.fieldValidationTag} ${isPhoneValid ? styles.fieldValid : styles.fieldInvalid}`}>
                            {isPhoneValid ? "✅ 10 అంకెలు సరిగ్గా ఉన్నాయి" : "⚠️ 10 అంకెల మొబైల్ అవసరం"}
                          </span>
                        )}
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="9848012345"
                        value={applyForm.guardian_phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className={`${styles.formInput} ${applyForm.guardian_phone ? (isPhoneValid ? styles.formInputValid : styles.formInputInvalid) : ""}`}
                      />
                      <small className={styles.fieldHelperText}>10 అంకెలు మాత్రమే (6-9 తో మొదలుకావాలి)</small>
                    </div>
                  </div>

                  <div className={styles.formGrid2}>
                    <div className={styles.formGroup}>
                      <label>చికిత్స పొందుతున్న హాస్పిటల్ పేరు *</label>
                      <input
                        type="text"
                        required
                        placeholder="ఉదా: ఏరియా హాస్పిటల్ జగిత్యాల / అపోలో హాస్పిటల్"
                        value={applyForm.hospital_name}
                        onChange={(e) => setApplyForm({ ...applyForm, hospital_name: e.target.value })}
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>చికిత్స అందిస్తున్న డాక్టర్ పేరు</label>
                      <input
                        type="text"
                        placeholder="ఉదా: డాక్టర్ రమేష్ గారు, కార్డియాలజిస్ట్"
                        value={applyForm.doctor_name}
                        onChange={(e) => handleNameChange("doctor_name", e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                </div>

                {/* ================= STEP 2: FINANCIAL TARGET & STORY ================= */}
                <div className={styles.formSectionCard}>
                  <div className={styles.formSectionHeader}>
                    <div className={styles.formSectionTitle}>
                      <span>💰</span>
                      <span>స్టెప్ 2: సహాయ నిధి లక్ష్యం &amp; సమస్య కథనం</span>
                    </div>
                    <span className={styles.formSectionStepBadge}>విభాగం 2 / 4</span>
                  </div>

                  <div className={styles.formGrid3}>
                    <div className={styles.formGroup}>
                      <label>సహాయ విభాగం (Category) *</label>
                      <select
                        value={applyForm.emergency_category}
                        onChange={(e) => setApplyForm({ ...applyForm, emergency_category: e.target.value })}
                        className={styles.formSelect}
                      >
                        <option value="MEDICAL_SURGERY">అత్యవసర సర్జరీ (Surgery)</option>
                        <option value="CHILD_CARE">చిన్నారుల ప్రాణరక్షణ (Child Care)</option>
                        <option value="CANCER_TREATMENT">క్యాన్సర్ చికిత్స (Cancer Care)</option>
                        <option value="ACCIDENT_TRAUMA">ప్రమాద గాయాలు (Accident Trauma)</option>
                        <option value="DISASTER_FIRE">విపత్తు / అగ్ని ప్రమాదం (Disaster)</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>
                        అవసరమైన మొత్తం (Target Amount in ₹) *
                        {applyForm.target_amount && (
                          <span className={`${styles.fieldValidationTag} ${isAmountValid ? styles.fieldValid : styles.fieldInvalid}`}>
                            {isAmountValid ? "✅ మొత్తం సరైనది" : "⚠️ కనీసం ₹1,000"}
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ఉదా: 250000"
                        value={applyForm.target_amount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        className={`${styles.formInput} ${applyForm.target_amount ? (isAmountValid ? styles.formInputValid : styles.formInputInvalid) : ""}`}
                      />
                      {applyForm.target_amount && (
                        <div className={styles.currencyWordsPreview}>
                          {formatIndianCurrencyWords(applyForm.target_amount)}
                        </div>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label>అత్యవసర స్థాయి (Urgency Level) *</label>
                      <select
                        value={applyForm.urgency_level}
                        onChange={(e) => setApplyForm({ ...applyForm, urgency_level: e.target.value })}
                        className={styles.formSelect}
                      >
                        <option value="CRITICAL_48_HOURS">🚨 48 గంటల్లో అత్యవసరం (Critical 48 Hours)</option>
                        <option value="URGENT_7_DAYS">⚡ 7 రోజుల్లో సర్జరీ (Urgent 7 Days)</option>
                        <option value="HIGH_PRIORITY">🔴 అత్యవసర సాయం (High Priority)</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGroup} style={{ marginBottom: "14px" }}>
                    <label>కేసు ప్రధాన శీర్షిక (Appeal Title) *</label>
                    <input
                      type="text"
                      required
                      placeholder="ఉదా: 6 ఏళ్ల బాబు గుండె ఆపరేషన్ కోసం అత్యవసర ప్రజా సహాయం"
                      value={applyForm.title}
                      onChange={(e) => setApplyForm({ ...applyForm, title: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>బాధితుడి పరిస్థితి &amp; ఆర్థిక స్థితి పూర్తి వివరణ (Story) *</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="పేషెంట్ ఆరోగ్య సమస్య ఏమిటి, కుటుంబ ఆర్థిక పరిస్థితి ఎలా ఉంది, సర్జరీకి డాక్టర్ ఇచ్చిన గడువు ఎంత..."
                      value={applyForm.story}
                      onChange={(e) => setApplyForm({ ...applyForm, story: e.target.value })}
                      className={styles.formTextarea}
                    />
                  </div>
                </div>

                {/* ================= STEP 3: DIRECT BENEFICIARY BANK & UPI ================= */}
                <div className={styles.formSectionCard}>
                  <div className={styles.formSectionHeader}>
                    <div className={styles.formSectionTitle}>
                      <span>💳</span>
                      <span>స్టెప్ 3: బాధితుడి ప్రత్యక్ష బ్యాంక్ &amp; UPI ఖాతా (Direct Beneficiary Details)</span>
                    </div>
                    <span className={styles.formSectionStepBadge}>విభాగం 3 / 4</span>
                  </div>

                  <p style={{ fontSize: "0.85rem", color: "#ffd700", marginBottom: "14px" }}>
                    ℹ️ దాతలు పంపే సహాయం ఏ మధ్యవర్తులు లేకుండా నేరుగా ఈ ఖాతాకే చేరుతుంది.
                  </p>

                  <div className={styles.formGrid2}>
                    <div className={styles.formGroup}>
                      <label>బ్యాంక్ ఖాతాదారు పేరు (Account Holder Name) *</label>
                      <input
                        type="text"
                        required
                        placeholder="పేషెంట్ లేదా సంరక్షకుడి పేరు (పాస్‌బుక్ ప్రకారం)"
                        value={applyForm.beneficiary_acc_name}
                        onChange={(e) => handleNameChange("beneficiary_acc_name", e.target.value)}
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>బ్యాంక్ పేరు &amp; బ్రాంచ్ (Bank &amp; Branch) *</label>
                      <input
                        type="text"
                        required
                        placeholder="ఉదా: Union Bank of India, Jagtial Main Branch"
                        value={applyForm.beneficiary_bank_name}
                        onChange={(e) => setApplyForm({ ...applyForm, beneficiary_bank_name: e.target.value })}
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>
                        ఖాతా సంఖ్య (Account Number) *
                        {applyForm.beneficiary_acc_no && (
                          <span className={`${styles.fieldValidationTag} ${isAccNoValid ? styles.fieldValid : styles.fieldInvalid}`}>
                            {isAccNoValid ? "✅ సరైన అంకెలు" : "⚠️ 9-18 అంకెలు ఉండాలి"}
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ఉదా: 084910100098765"
                        value={applyForm.beneficiary_acc_no}
                        onChange={(e) => handleAccNoChange(e.target.value)}
                        className={`${styles.formInput} ${applyForm.beneficiary_acc_no ? (isAccNoValid ? styles.formInputValid : styles.formInputInvalid) : ""}`}
                      />
                      <small className={styles.fieldHelperText}>సంఖ్యలు మాత్రమే (9 నుండి 18 అంకెలు)</small>
                    </div>

                    <div className={styles.formGroup}>
                      <label>
                        IFSC కోడ్ (11 Characters) *
                        {applyForm.beneficiary_ifsc && (
                          <span className={`${styles.fieldValidationTag} ${isIfscValid ? styles.fieldValid : styles.fieldInvalid}`}>
                            {isIfscValid ? "✅ IFSC సరిగ్గా ఉంది" : "⚠️ 11 అక్షరాల IFSC కోడ్ (ఉదా: SBIN0001234)"}
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ఉదా: UBIN0808491 లేదా SBIN0020150"
                        value={applyForm.beneficiary_ifsc}
                        onChange={(e) => handleIfscChange(e.target.value)}
                        className={`${styles.formInput} ${applyForm.beneficiary_ifsc ? (isIfscValid ? styles.formInputValid : styles.formInputInvalid) : ""}`}
                      />
                      <small className={styles.fieldHelperText}>ఆటోమేటిక్‌గా పెద్ద అక్షరాలుగా మారుతుంది</small>
                    </div>

                    <div className={styles.formGroup}>
                      <label>UPI ID (Google Pay / PhonePe / Paytm)</label>
                      <input
                        type="text"
                        placeholder="ఉదా: name@oksbi లేదా 9848012345@paytm"
                        value={applyForm.beneficiary_upi_id}
                        onChange={(e) => handleUpiChange(e.target.value)}
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>QR కోడ్ ఇమేజ్ అప్‌లోడ్ (ఐచ్ఛికం)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "beneficiary_qr_url")}
                        style={{ fontSize: "0.85rem", color: "#94a3b8" }}
                      />
                    </div>
                  </div>
                </div>

                {/* ================= STEP 4: MEDICAL PROOFS & LEGAL DECLARATION ================= */}
                <div className={styles.formSectionCard}>
                  <div className={styles.formSectionHeader}>
                    <div className={styles.formSectionTitle}>
                      <span>📄</span>
                      <span>స్టెప్ 4: మెడికల్ బిల్లులు &amp; ధృవీకరణ పత్రాలు (Mandatory Proofs)</span>
                    </div>
                    <span className={styles.formSectionStepBadge}>విభాగం 4 / 4</span>
                  </div>

                  <div className={styles.formGrid2}>
                    <div className={styles.formGroup}>
                      <label>📷 పేషెంట్ ఫోటో (Patient Photo)</label>
                      <div className={styles.uploadDropzone}>
                        <input
                          type="file"
                          accept="image/*"
                          id="patient-photo-file"
                          style={{ display: "none" }}
                          onChange={(e) => handleFileUpload(e, "primary_photo_url")}
                        />
                        <label htmlFor="patient-photo-file" style={{ cursor: "pointer", display: "block" }}>
                          <span style={{ fontSize: "1.8rem", display: "block", marginBottom: "6px" }}>📸</span>
                          <strong style={{ color: "#ff9933" }}>{uploadingPhoto ? "అప్‌లోడ్ అవుతోంది..." : "పేషెంట్ ఫోటోను ఎంచుకోండి"}</strong>
                          <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: "4px 0 0" }}>PNG, JPG లేదా WEBP ఫార్మాట్</p>
                        </label>
                      </div>
                      {applyForm.primary_photo_url && applyForm.primary_photo_url !== "/images/activity-disaster.png" && (
                        <small style={{ color: "#34d399", marginTop: "4px" }}>✅ ఫోటో విజయవంతంగా అప్‌లోడ్ అయింది</small>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label>
                        📄 హాస్పిటల్ ఎస్టిమేట్ బిల్లు / డాక్టర్ లెటర్ * (తప్పనిసరి)
                        <span className={`${styles.fieldValidationTag} ${hasDocuments ? styles.fieldValid : styles.fieldInvalid}`}>
                          {hasDocuments ? `✅ ${applyForm.documents_urls.length} ఫైల్స్ అప్‌లోడ్ అయ్యాయి` : "⚠️ కనీసం 1 ఫైల్ తప్పనిసరి"}
                        </span>
                      </label>
                      <div className={styles.uploadDropzone}>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          id="medical-doc-file"
                          style={{ display: "none" }}
                          onChange={(e) => handleFileUpload(e, "documents_urls")}
                        />
                        <label htmlFor="medical-doc-file" style={{ cursor: "pointer", display: "block" }}>
                          <span style={{ fontSize: "1.8rem", display: "block", marginBottom: "6px" }}>📑</span>
                          <strong style={{ color: "#34d399" }}>{uploadingDoc ? "డాక్యుమెంట్ అప్‌లోడ్ అవుతోంది..." : "+ మెడికల్ బిల్లు / ప్రిస్క్రిప్షన్ అప్‌లోడ్ చేయండి"}</strong>
                          <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: "4px 0 0" }}>PDF లేదా ఇమేజ్ ఫైల్స్ (బహుళ ఫైల్స్ జోడించవచ్చు)</p>
                        </label>
                      </div>

                      {/* Uploaded Chips */}
                      {applyForm.documents_urls.length > 0 && (
                        <div className={styles.uploadedDocsList}>
                          {applyForm.documents_urls.map((doc, idx) => (
                            <div key={idx} className={styles.docChip}>
                              <span>📄 డాక్యుమెంట్ #{idx + 1}</span>
                              <button
                                type="button"
                                className={styles.docDeleteBtn}
                                onClick={() => removeDocument(idx)}
                                title="తొలగించండి"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Anti-Fraud Declaration Checkbox */}
                  <div className={styles.declarationCard}>
                    <input
                      type="checkbox"
                      id="legal-declaration"
                      checked={isDeclared}
                      onChange={(e) => setIsDeclared(e.target.checked)}
                      className={styles.declarationCheckbox}
                    />
                    <label htmlFor="legal-declaration" className={styles.declarationText}>
                      <strong>ప్రమాణ పత్రం (Legal Seva Declaration):</strong> నేను సమర్పించిన పేషెంట్ వివరాలు, హాస్పిటల్ ఎస్టిమేట్ బిల్లులు మరియు బ్యాంక్ ఖాతా 100% యదార్థమైనవని ధృవీకరిస్తున్నాను. హిందూ స్వరాజ్ యూత్ అసోసియేషన్ గ్రౌండ్ ఇన్వెస్టిగేషన్ టీమ్ హాస్పిటల్ మరియు డాక్టర్‌ను స్వయంగా కలిసి పరిశీలించడానికి నేను సంపూర్ణంగా అంగీకరిస్తున్నాను.
                    </label>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className={styles.appDeskActions}>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => setIsApplyModalOpen(false)}
                  >
                    రద్దు చేయండి (Cancel)
                  </button>
                  <button
                    type="submit"
                    disabled={applyLoading || !isDeclared || !hasDocuments}
                    className={styles.primaryBtn}
                    style={{ padding: "14px 32px", fontSize: "1rem" }}
                  >
                    {applyLoading ? "సమర్పిస్తోంది... (Submitting)" : "🚀 అత్యవసర దరఖాస్తును సమర్పించండి"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
