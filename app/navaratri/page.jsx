"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://hindu-backend-beta.vercel.app"
).replace(/\/$/, "");

const getMediaUrl = (url, fallback = "/images/navaratri-ganesha.jpg") => {
  if (!url || !String(url).trim()) return fallback;
  const trimmed = String(url).trim();
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/uploads/")) {
    return `${API_BASE}${trimmed}`;
  }
  if (trimmed.startsWith("uploads/")) {
    return `${API_BASE}/${trimmed}`;
  }
  if (trimmed.startsWith("/images/")) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return trimmed;
  }
  return `${API_BASE}/${trimmed}`;
};

const getAudioUrl = (url) => {
  if (!url || !String(url).trim()) {
    return "https://assets.mixkit.co/music/preview/mixkit-meditation-flute-and-bells-ambient-sound-581.mp3";
  }
  const trimmed = String(url).trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/uploads/")) {
    return `${API_BASE}${trimmed}`;
  }
  if (trimmed.startsWith("uploads/")) {
    return `${API_BASE}/${trimmed}`;
  }
  return `${API_BASE}/${trimmed.replace(/^\//, "")}`;
};

// Universal YouTube embed URL parser for Live streams, Regular videos, youtu.be, and Shorts
const getYouTubeEmbedUrl = (urlOrId) => {
  if (!urlOrId) return "";
  const trimmed = urlOrId.trim();

  // If already an embed URL
  if (trimmed.includes("youtube.com/embed/") || trimmed.includes("youtube-nocookie.com/embed/")) {
    return trimmed;
  }

  // 1. Direct ID (11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return `https://www.youtube.com/embed/${trimmed}?autoplay=0&rel=0`;
  }

  // 2. youtu.be/ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=0&rel=0`;
  }

  // 3. youtube.com/watch?v=ID or &v=ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=0&rel=0`;
  }

  // 4. youtube.com/live/ID
  const liveMatch = trimmed.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
  if (liveMatch && liveMatch[1]) {
    return `https://www.youtube.com/embed/${liveMatch[1]}?autoplay=0&rel=0`;
  }

  // 5. youtube.com/shorts/ID
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch && shortsMatch[1]) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}?autoplay=0&rel=0`;
  }

  // 6. Generic regex
  const genericMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/|shorts\/))([\w-]{11})/
  );
  if (genericMatch && genericMatch[1]) {
    return `https://www.youtube.com/embed/${genericMatch[1]}?autoplay=0&rel=0`;
  }

  return "";
};

// Fallback initial schedule (11 Days - Jagtial)
const DEFAULT_SCHEDULE = [
  {
    id: 1,
    day_number: 1,
    date_str: "14 Sep 2026 (Mon)",
    title: "Day 1 - Vinayaka Chavithi Pratishtapana",
    alankaram: "Swarna Ganapathi Alankaram",
    morning_puja: "07:00 AM - Ganapathi Homam, Kalasha Sthapana & Prana Pratishta Mahotsavam",
    evening_aarti: "07:30 PM - Maha Mangala Harathi, 108 Modaka Nivedana & Bhajan Sandhya",
    annadanam_info: "12:30 PM - Maha Annadanam for 1,500+ devotees",
    special_events: "Grand Swarna Kavacha Dharana & Vedic Chanting by youth priests",
    status: "ACTIVE",
  },
  {
    id: 2,
    day_number: 2,
    date_str: "15 Sep 2026 (Tue)",
    title: "Day 2 - Panchamrutha Abhishekam",
    alankaram: "Bala Ganapathi Alankaram",
    morning_puja: "07:30 AM - Ekadasa Dravya Abhishekam & Bilva Archana",
    evening_aarti: "07:30 PM - Deeparadhana & Lalitha Sahasranama Parayana",
    annadanam_info: "01:00 PM - Nithya Annadanam Seva",
    special_events: "Devotional singing competition for local youth & children",
    status: "UPCOMING",
  },
  {
    id: 3,
    day_number: 3,
    date_str: "16 Sep 2026 (Wed)",
    title: "Day 3 - Gaja Vahana Seva",
    alankaram: "Siddhi Buddhi Sametha Ganapathi",
    morning_puja: "07:30 AM - Ashtothara Shata Kalasabhishekam",
    evening_aarti: "07:30 PM - Divya Gaja Vahana Harathi & Drum Seva",
    annadanam_info: "01:00 PM - Maha Prasadam Distribution",
    special_events: "Spiritual Discourse on Dharma & Youth Values by visiting scholars",
    status: "UPCOMING",
  },
  {
    id: 4,
    day_number: 4,
    date_str: "17 Sep 2026 (Thu)",
    title: "Day 4 - Valli Devasena & Ganapathi Puja",
    alankaram: "Mayura Vahana Alankaram",
    morning_puja: "07:30 AM - Sugandha Dravya Abhishekam & Ganapathi Atharvasheersha",
    evening_aarti: "07:30 PM - Akhanda Deeparadhana & Harikatha Gana Seva",
    annadanam_info: "01:00 PM - Maha Annadanam",
    special_events: "Harikatha rendition on Ganesha Leelalu by Jagtial artists",
    status: "UPCOMING",
  },
  {
    id: 5,
    day_number: 5,
    date_str: "18 Sep 2026 (Fri)",
    title: "Day 5 - Lalitha Devi Sametha Ganapathi",
    alankaram: "Sri Chakra Alankaram",
    morning_puja: "07:00 AM - Kumkumarchana & Sri Suktha / Chandi Parayana",
    evening_aarti: "07:30 PM - Suvasini Puja & Maha Deepothsavam",
    annadanam_info: "01:00 PM - Annadanam Seva",
    special_events: "Classical devotional dance (Kuchipudi & Bharatanatyam) by youth team",
    status: "UPCOMING",
  },
  {
    id: 6,
    day_number: 6,
    date_str: "19 Sep 2026 (Sat)",
    title: "Day 6 - Sahasra Modaka Maha Yagnam",
    alankaram: "Maha Ganapathi Alankaram",
    morning_puja: "08:00 AM - 1008 Modaka Maha Homam & Purnahuti",
    evening_aarti: "07:30 PM - Gaja Vahana Aarti & Bhajans",
    annadanam_info: "01:00 PM - Vishesha Modaka Prasadam & Annadanam",
    special_events: "Kolatam & folk devotional dance by youth groups",
    status: "UPCOMING",
  },
  {
    id: 7,
    day_number: 7,
    date_str: "20 Sep 2026 (Sun)",
    title: "Day 7 - Pushpa Yagam & Pushpalankaram",
    alankaram: "Vana Durga Sahitha Ganapathi",
    morning_puja: "07:30 AM - Ashtottara Pushpanjali & Rudra Parayana",
    evening_aarti: "07:30 PM - Grand Pushpa Vrishti Aarti (1 Quintal fresh flowers)",
    annadanam_info: "01:00 PM - Maha Annadanam for 2,500+ devotees",
    special_events: "Mega Blood Donation Camp at Jagtial Pandal premises by volunteers",
    status: "UPCOMING",
  },
  {
    id: 8,
    day_number: 8,
    date_str: "21 Sep 2026 (Mon)",
    title: "Day 8 - Simha Vahana Utsavam",
    alankaram: "Raja Ganapathi Royal Alankaram",
    morning_puja: "07:30 AM - Ekadasa Dravya Abhishekam",
    evening_aarti: "07:30 PM - Rajadhi Raja Maha Aarti & Chhatrapati Shivaji tribute",
    annadanam_info: "01:00 PM - Nithya Annaprasadam",
    special_events: "Youth leadership felicitation & seva awards",
    status: "UPCOMING",
  },
  {
    id: 9,
    day_number: 9,
    date_str: "22 Sep 2026 (Tue)",
    title: "Day 9 - Maha Purnahuti & Laddu Auction",
    alankaram: "Vishwa Roopa Ganapathi Alankaram",
    morning_puja: "08:30 AM - Maha Ganapathi Yagnam & Maha Purnahuti",
    evening_aarti: "06:00 PM - Jagtial Maha Ganapathi Laddu Auction & Divya Harathi",
    annadanam_info: "01:00 PM - Grand Maha Annadanam (3,000+ devotees)",
    special_events: "Acrobatic Dhol Tasha performance by Hindu Swaraj Team",
    status: "UPCOMING",
  },
  {
    id: 10,
    day_number: 10,
    date_str: "23 Sep 2026 (Wed)",
    title: "Day 10 - Shobha Yatra (Grand Procession)",
    alankaram: "Digvijaya Alankaram",
    morning_puja: "09:00 AM - Visarjan Special Archana & Send-off Aarti",
    evening_aarti: "04:00 PM - Grand Shobha Yatra across Jagtial Main Roads",
    annadanam_info: "All Day - Continuous water & buttermilk seva to yatris",
    special_events: "Cultural tableaux, Dhol Tasha, Lezim & Saffron rally",
    status: "UPCOMING",
  },
  {
    id: 11,
    day_number: 11,
    date_str: "24 Sep 2026 (Thu)",
    title: "Day 11 - Jaladhivasa Nimajjana Seva",
    alankaram: "Nirmalya Seva & Nimajjanam",
    morning_puja: "08:00 AM - Nimajjana Prarthana at Jagtial Temple Lake",
    evening_aarti: "12:00 PM - Sacred Nimajjanam with full Vedic honors",
    annadanam_info: "01:00 PM - Shanti Puja & Prasad Distribution",
    special_events: "Conclusion of Navaratri Seva Mahotsavam 2026",
    status: "UPCOMING",
  },
];

// Fallback initial posts
const DEFAULT_POSTS = [
  {
    id: 1,
    day_number: 1,
    title: "Ganesh Chaturthi Grand Pratishtapana 2026",
    description:
      "Grand welcoming of Lord Ganesha in Jagtial with full Vedic rituals and youth seva team.",
    image_url: "/images/navaratri-ganesha.jpg",
    category: "Puja & Darshan",
    created_at: "2026-09-14T08:00:00.000Z",
  },
  {
    id: 2,
    day_number: 1,
    title: "Evening Maha Mangala Aarti & Deeparadhana",
    description:
      "Divya Harathi performed with hundreds of devotees singing devotional bhajans.",
    image_url: "/images/navaratri-aarti.jpg",
    category: "Maha Aarti",
    created_at: "2026-09-14T19:30:00.000Z",
  },
  {
    id: 3,
    day_number: 2,
    title: "2nd Day - Divya Sahasranamarchana & Maha Aarti",
    description:
      "Special Laksha Modaka puja and grand evening Aarti with Jagtial devotees.",
    image_url: "/images/navaratri-aarti.jpg",
    category: "Maha Aarti",
    created_at: "2026-09-15T19:30:00.000Z",
  },
];

// Fallback default sponsors
const DEFAULT_SPONSORS = [
  {
    id: 1,
    name: "Sri Venkateshwara Swarna Kireetam & Jewellers",
    category: "TITLE_SPONSOR",
    tagline: "Official Swarna Kavacham & Grand Aarti Title Sponsor • Main Road, Jagtial",
    logo_url: "/images/navaratri-ganesha.jpg",
    contact_phone: "+91 98480 12345",
    website_url: "https://hinduswaraj.org",
  },
  {
    id: 2,
    name: "Gayatri Agro & Modern Rice Industries",
    category: "ANNADANAM_PATRON",
    tagline: "Maha Annadanam Chief Patron • Sponsoring Daily Sacred Prasadam for 3,000+ Devotees",
    logo_url: "/images/navaratri-aarti.jpg",
    contact_phone: "+91 94400 54321",
    website_url: "",
  },
  {
    id: 3,
    name: "Lakshmi Srinivasa Silk & Handloom Vastralaya",
    category: "AARTI_SPONSOR",
    tagline: "Divya Pattu Vastrams & Daily Pushpalankarana Partner • Jagtial",
    logo_url: "/images/navaratri-ganesha.jpg",
    contact_phone: "+91 99890 67890",
    website_url: "",
  },
  {
    id: 4,
    name: "Telangana Fiber Net & Digital Broadcasters",
    category: "MEDIA_PARTNER",
    tagline: "Official Ultra-HD 4K Live Broadcast & YouTube Streaming Partner",
    logo_url: "/images/logo_v2.png",
    contact_phone: "+91 84998 78425",
    website_url: "",
  },
];

export default function NavaratriPage() {
  const [settings, setSettings] = useState({
    is_live: false,
    youtube_url: "",
    youtube_embed_id: "",
    stream_title: "Vinayaka Navaratri Seva 2026 - Jagtial Live Darshan & Maha Aarti",
    live_announcement: "Daily Morning Abhishekam at 7:00 AM, Sahasranamarchana at 10:00 AM, Maha Annadanam at 1:00 PM, and Divya Maha Aarti at 7:30 PM live from Jagtial Pandal.",
    banner_image: "/images/navaratri-ganesha.jpg",
    location: "Jagtial, Telangana",
    start_date: "2026-09-14",
    end_date: "2026-09-24",
    ticker_text: "🔴 LIVE: Vinayaka Navaratri Seva Mahotsavam 2026 in Jagtial • Daily Sahasranamarchana, Maha Annadanam & Divya Mangala Aarti • Book your Gotra Namavali Seva online",
    ticker_active: true,
    ad_banner_url: "/images/navaratri-aarti.jpg",
    ad_banner_link: "#seva-booking",
    ad_banner_title: "Sri Venkateshwara Swarna Kireetam & Jewellers",
    ad_banner_tagline: "Official Grand Aarti & Swarna Kavacha Sponsor • Jagtial",
    ad_banner_active: true,
    annadanam_count_today: 2850,
    laddu_auction_info: "Grand Maha Laddu Auction on Day 9 (22 Sep) at 6:00 PM",
    pandal_map_url: "https://maps.google.com/?q=Jagtial+Telangana",
    bg_audio_url: "https://assets.mixkit.co/music/preview/mixkit-meditation-flute-and-bells-ambient-sound-581.mp3",
    bg_audio_title: "Om Gam Ganapataye Namaha • 108 Divine Dhun",
    bg_audio_artist: "Sacred Jagtial Pandal Vedic Chants",
    bg_audio_active: true,
    bg_audio_autoplay: true,
  });

  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [selectedDay, setSelectedDay] = useState(1);
  const [posts, setPosts] = useState(DEFAULT_POSTS);
  const [sponsors, setSponsors] = useState(DEFAULT_SPONSORS);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [wishes, setWishes] = useState([]);
  
  // Devotee prayer form state
  const [prayerForm, setPrayerForm] = useState({
    devotee_name: "",
    mobile: "",
    email: "",
    gotram: "",
    city: "Jagtial",
    message: "",
    offering_amount: 51, // Default ₹51 sacred offering
  });
  const [prayerSubmitting, setPrayerSubmitting] = useState(false);
  const [prayerSuccess, setPrayerSuccess] = useState("");
  const [prayerError, setPrayerError] = useState("");

  // Virtual Puja State
  const [diyaCount, setDiyaCount] = useState(108);
  const [flowerCount, setFlowerCount] = useState(256);
  const [virtualFeedback, setVirtualFeedback] = useState("");
  const [animatingPetals, setAnimatingPetals] = useState(false);

  // 🔔 Devotional Audio & Temple Bell States
  const [isPlayingMantra, setIsPlayingMantra] = useState(false);
  const [isBellRinging, setIsBellRinging] = useState(false);
  const [currentCommercialIdx, setCurrentCommercialIdx] = useState(0);
  const audioRef = useRef(null);

  // 🪔 Virtual Aarti Sanctum & Razorpay E-Hundi States
  const [isAartiWaving, setIsAartiWaving] = useState(false);
  const [flowerParticles, setFlowerParticles] = useState([]);
  const [coconutState, setCoconutState] = useState(false);
  const [camphorState, setCamphorState] = useState(false);
  const [eHundiAmount, setEHundiAmount] = useState(51);
  const [eHundiCustom, setEHundiCustom] = useState("");
  const [eHundiDonorName, setEHundiDonorName] = useState("");
  const [eHundiMobile, setEHundiMobile] = useState("");
  const [eHundiGotram, setEHundiGotram] = useState("");
  const [eHundiLoading, setEHundiLoading] = useState(false);

  const triggerAartiPradakshina = () => {
    playTempleBell();
    setIsAartiWaving(true);
    setVirtualFeedback("🪔 స్వామివారికి దివ్య కర్పూర పంచముఖ హారతి సమర్పించబడింది! జయ గణేశా పాహిమాం! 🚩");
    if (!isPlayingMantra && audioRef.current && settings.bg_audio_active !== false) {
      toggleDevotionalMusic();
    }
    setTimeout(() => setIsAartiWaving(false), 4500);
  };

  const triggerFlowerShower = () => {
    playTempleBell();
    setFlowerCount((c) => c + 10);
    const newParticles = Array.from({ length: 18 }).map((_, idx) => ({
      id: Date.now() + idx,
      left: `${15 + Math.random() * 70}%`,
      dx: `${(Math.random() - 0.5) * 160}px`,
      icon: ["🌸", "🌺", "🌼", "💐", "✨"][Math.floor(Math.random() * 5)],
    }));
    setFlowerParticles(newParticles);
    setVirtualFeedback("🌸 వినాయకుని దివ్య చరణారవిందములకు పుష్పాంజలి సమర్పించబడింది!");
    setTimeout(() => setFlowerParticles([]), 2600);
  };

  const triggerBreakCoconut = () => {
    playTempleBell();
    setCoconutState(true);
    setVirtualFeedback("🥥 కొబ్బరికాయ సమర్పించబడింది! ॥ శ్రీ సిద్ధి వినాయక ప్రసన్నః — మీ సకల సంకల్పములు సిద్ధింపబడుగాక! ॥ 🚩");
    setTimeout(() => setCoconutState(false), 5000);
  };

  const triggerLightCamphor = () => {
    playTempleBell();
    setCamphorState(true);
    setDiyaCount((c) => c + 1);
    setVirtualFeedback("🪔 దివ్య కర్పూర కాంతులు ప్రజ్వరిల్లాయి! సర్వ విఘ్నాలు తొలగిపోవుగాక!");
    setTimeout(() => setCamphorState(false), 4000);
  };

  const handleEHundiRazorpaySubmit = async (e) => {
    e.preventDefault();
    const finalAmount = eHundiCustom ? parseFloat(eHundiCustom) : eHundiAmount;
    if (!finalAmount || finalAmount < 1) {
      alert("దయచేసి సరైన హుండీ కానుక మొత్తాన్ని ఎంచుకోండి (కనీసం ₹1)");
      return;
    }
    if (!eHundiDonorName.trim()) {
      alert("దయచేసి మీ పేరు నమోదు చేయండి");
      return;
    }
    const cleanMob = eHundiMobile.replace(/\D/g, "").slice(-10);
    if (!cleanMob || cleanMob.length < 10) {
      alert("దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి");
      return;
    }

    setEHundiLoading(true);

    try {
      // 1. Create Razorpay order
      const res = await fetch(`${API_BASE}/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payer_name: eHundiDonorName.trim(),
          email: "",
          mobile_number: cleanMob,
          address: `Jagtial | Gotram: ${eHundiGotram || "N/A"}`,
          amount: finalAmount,
          fund_type: "Vinayaka Navaratri Sacred E-Hundi Seva",
        }),
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error || "Failed to initiate payment");

      // 2. Load Razorpay SDK
      const loadRazorpay = () => {
        return new Promise((resolve) => {
          if (typeof window !== "undefined" && window.Razorpay) return resolve(true);
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert("Razorpay payment gateway failed to load. Please check internet connection.");
        setEHundiLoading(false);
        return;
      }

      const options = {
        key: orderData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummy",
        amount: orderData.amount,
        currency: "INR",
        name: "HINDU SWARAJ YOUTH",
        description: `Vinayaka Navaratri E-Hundi Seva • ₹${finalAmount}`,
        image: "/images/logo_v2.png",
        order_id: orderData.order_id,
        prefill: {
          name: eHundiDonorName.trim(),
          contact: cleanMob,
        },
        theme: {
          color: "#ff7700",
        },
        handler: async (response) => {
          try {
            // Verify payment
            await fetch(`${API_BASE}/payment/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            // Record wish / hundi entry
            const wishRes = await fetch(`${API_BASE}/navaratri/wishes`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                devotee_name: eHundiDonorName.trim(),
                mobile: cleanMob,
                gotram: eHundiGotram || "శివ / కాశ్యప గోత్రం (Shiva Gotram)",
                city: "Jagtial",
                message: `🪔 E-Hundi Sacred Offering of ₹${finalAmount}`,
                offering_amount: finalAmount,
                payment_id: response.razorpay_payment_id,
              }),
            });
            const wishData = await wishRes.json();

            // Trigger Blessing Certificate & Flower Shower
            triggerFlowerShower();
            handleOpenCertificate({
              devotee_name: eHundiDonorName.trim(),
              gotram: eHundiGotram.trim() || "శివ / కాశ్యప గోత్రం (Shiva Gotram)",
              city: "Jagtial, Telangana",
              seva_tier: `శ్రీ వినాయక దివ్య ఈ-హుండీ సమర్పణ (₹${finalAmount.toLocaleString("en-IN")})`,
              seva_date: "Vinayaka Navaratri Mahotsavam 2026",
              token_no: wishData?.token_no || `HSY-HUNDI-${Date.now().toString().slice(-4)}`,
              amount: finalAmount,
            });

            setEHundiDonorName("");
            setEHundiMobile("");
            setEHundiGotram("");
            setEHundiCustom("");
          } catch (err) {
            console.error("Verification error:", err);
            alert("Payment recorded! Generating certificate...");
          }
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
    } catch (err) {
      alert("Payment initiation error: " + err.message);
    } finally {
      setEHundiLoading(false);
    }
  };

  // Web Audio API Synthesizer for Authentic Brass Temple Bell (ఘంటానాదం)
  const playTempleBell = () => {
    setIsBellRinging(true);
    setTimeout(() => setIsBellRinging(false), 900);
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();

      // Pure resonant metallic brass bell acoustic harmonics
      const freqs = [587.33, 1174.66, 1760.0, 2349.32, 3135.96, 4698.64];
      const gains = [0.55, 0.38, 0.22, 0.14, 0.08, 0.04];
      const decays = [3.4, 2.6, 1.9, 1.3, 0.8, 0.5];

      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = i === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        g.gain.setValueAtTime(gains[i], ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + decays[i]);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + decays[i]);
      });
    } catch (err) {
      console.warn("Temple bell audio synth:", err);
    }
  };

  const toggleDevotionalMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMantra) {
      audioRef.current.pause();
      setIsPlayingMantra(false);
    } else {
      const targetUrl = getAudioUrl(settings.bg_audio_url);
      if (audioRef.current.src !== targetUrl) {
        audioRef.current.src = targetUrl;
      }
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => {
          setIsPlayingMantra(true);
        })
        .catch((e) => {
          console.warn("Audio play issue:", e);
        });
    }
  };

  // Auto-play attempt & First-Interaction Unblocker
  useEffect(() => {
    let hasTriggered = false;

    const startDevotionalAudio = () => {
      if (hasTriggered || !audioRef.current || settings.bg_audio_active === false) return;

      const targetUrl = getAudioUrl(settings.bg_audio_url);
      if (audioRef.current.src !== targetUrl) {
        audioRef.current.src = targetUrl;
      }
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => {
          hasTriggered = true;
          setIsPlayingMantra(true);
        })
        .catch(() => {
          // Autoplay blocked by browser policy until first click/touch/scroll
        });
    };

    // 1. Direct immediate attempt
    startDevotionalAudio();

    // 2. Global first-interaction auto-trigger on any user gesture
    const handleFirstGesture = () => {
      if (!hasTriggered) {
        startDevotionalAudio();
      }
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener("click", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
      window.removeEventListener("scroll", handleFirstGesture);
      window.removeEventListener("mousemove", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
    };

    window.addEventListener("click", handleFirstGesture, { passive: true });
    window.addEventListener("touchstart", handleFirstGesture, { passive: true });
    window.addEventListener("scroll", handleFirstGesture, { passive: true, once: true });
    window.addEventListener("mousemove", handleFirstGesture, { passive: true, once: true });
    window.addEventListener("keydown", handleFirstGesture, { passive: true, once: true });

    return () => {
      cleanup();
    };
  }, [settings.bg_audio_url, settings.bg_audio_active]);

  // Lightbox State
  const [activeLightbox, setActiveLightbox] = useState(null);

  // Seva Sponsorship States
  const [showSevaModal, setShowSevaModal] = useState(false);
  const [selectedSevaTier, setSelectedSevaTier] = useState("Modaka Seva");
  const [sevaAmount, setSevaAmount] = useState(251);
  const [customAmountInput, setCustomAmountInput] = useState("");
  const [sevaForm, setSevaForm] = useState({
    name: "",
    mobile: "",
    email: "",
    gotram: "",
    nakshatram: "",
    sevaDate: "Day 1 - 14 Sep 2026 (Mon)",
    address: "Jagtial, Telangana",
  });
  const [sevaLoading, setSevaLoading] = useState(false);
  const [sevaError, setSevaError] = useState("");
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoOrderData, setDemoOrderData] = useState(null);
  const [activeOfferingPayment, setActiveOfferingPayment] = useState(null);

  // 📜 Divine Blessing Certificate States
  const [showBlessingCert, setShowBlessingCert] = useState(false);
  const [blessingCertData, setBlessingCertData] = useState(null);

  const handleOpenCertificate = (data = {}) => {
    const token = data.token_no || `HSY-NAV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const devName = data.devotee_name || data.name || (prayerForm.devotee_name ? prayerForm.devotee_name.trim() : "") || "భక్తుని కుటుంబ సభ్యులు (Devotee & Family)";
    const gotramName = data.gotram || (prayerForm.gotram ? prayerForm.gotram.trim() : "") || "శివ / కాశ్యప గోత్రం (Shiva Gotram)";
    const cityName = data.city || (prayerForm.city ? prayerForm.city.trim() : "") || "Jagtial, Telangana";

    setBlessingCertData({
      devotee_name: devName,
      gotram: gotramName,
      nakshatram: data.nakshatram || "",
      seva_tier: data.seva_tier || data.selectedSevaTier || "శ్రీ వినాయక దివ్య సహస్రనామార్చన & సంకల్ప పూజ",
      seva_date: data.seva_date || data.sevaDate || "Vinayaka Navaratri Mahotsavam 2026",
      amount: data.amount || 501,
      token_no: token,
      city: cityName,
    });
    setShowBlessingCert(true);
  };

  // Load Data from Backend
  useEffect(() => {
    async function loadNavaratriData() {
      try {
        const resInfo = await fetch(`${API_BASE}/navaratri/info`);
        if (resInfo.ok) {
          const infoJson = await resInfo.json();
          if (infoJson.success && infoJson.data) {
            setSettings(infoJson.data);
          }
        }
      } catch (e) {
        console.warn("Backend /navaratri/info not reachable, using defaults");
      }

      try {
        const resSchedule = await fetch(`${API_BASE}/navaratri/schedule`);
        if (resSchedule.ok) {
          const scheduleJson = await resSchedule.json();
          if (scheduleJson.success && scheduleJson.data && scheduleJson.data.length > 0) {
            setSchedule(scheduleJson.data);
          }
        }
      } catch (e) {
        console.warn("Backend /navaratri/schedule not reachable, using defaults");
      }

      try {
        const resPosts = await fetch(`${API_BASE}/navaratri/posts`);
        if (resPosts.ok) {
          const postsJson = await resPosts.json();
          if (postsJson.success && postsJson.data && postsJson.data.length > 0) {
            setPosts(postsJson.data);
          }
        }
      } catch (e) {
        console.warn("Backend /navaratri/posts not reachable, using defaults");
      }

      try {
        const resSponsors = await fetch(`${API_BASE}/navaratri/sponsors`);
        if (resSponsors.ok) {
          const sponsorsJson = await resSponsors.json();
          if (sponsorsJson.success && sponsorsJson.data && sponsorsJson.data.length > 0) {
            setSponsors(sponsorsJson.data);
          }
        }
      } catch (e) {
        console.warn("Backend /navaratri/sponsors not reachable, using defaults");
      }

      // Auto-open certificate if linked from email (?token=HSY-NAV-2026-XXXX)
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const tokenParam = params.get("token");
        if (tokenParam) {
          handleOpenCertificate({
            token_no: tokenParam,
            devotee_name: params.get("name") || "భక్తుని కుటుంబ సభ్యులు (Devotee & Family)",
            gotram: params.get("gotram") || "శివ / కాశ్యప గోత్రం (Shiva Gotram)",
            city: params.get("city") || "Jagtial, Telangana",
            seva_tier: "శ్రీ వినాయక దివ్య గోత్ర నామావళి & సంకల్ప పూజ",
            seva_date: "Vinayaka Navaratri Mahotsavam 2026",
          });
        }
      }
    }

    loadNavaratriData();
  }, []);

  // Commercial Ad auto-rotation interval (Every 5 seconds)
  useEffect(() => {
    if (sponsors.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentCommercialIdx((prev) => (prev + 1) % sponsors.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sponsors]);

  const handleLightDiya = () => {
    playTempleBell();
    setDiyaCount((c) => c + 1);
    setAnimatingPetals(true);
    setVirtualFeedback("🪔 You lit a sacred Diya for Lord Ganesha! May your life be illuminated with wisdom & prosperity.");
    if (!isPlayingMantra && audioRef.current && settings.bg_audio_active !== false) {
      toggleDevotionalMusic();
    }
    setTimeout(() => setAnimatingPetals(false), 2000);
  };

  const handleOfferFlowers = () => {
    playTempleBell();
    setFlowerCount((c) => c + 1);
    setAnimatingPetals(true);
    setVirtualFeedback("🌸 Flower petals offered to Lord Ganesha's holy lotus feet!");
    if (!isPlayingMantra && audioRef.current && settings.bg_audio_active !== false) {
      toggleDevotionalMusic();
    }
    setTimeout(() => setAnimatingPetals(false), 2000);
  };

  const handleSubmitPrayer = async (e) => {
    e.preventDefault();
    if (!prayerForm.devotee_name.trim()) {
      setPrayerError("దయచేసి భక్తుని / కుటుంబ సభ్యుల పేరును నమోదు చేయండి.");
      return;
    }

    const cleanMob = prayerForm.mobile.trim().replace(/[^0-9]/g, "");
    if (!cleanMob || cleanMob.length < 10) {
      setPrayerError("దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి.");
      return;
    }

    setPrayerSubmitting(true);
    setPrayerSuccess("");
    setPrayerError("");

    const numOffering = Number(prayerForm.offering_amount) || 0;
    const offeringLabel = numOffering > 0
      ? `శ్రీ వినాయక దివ్య కానుక సేవ (₹${numOffering.toLocaleString("en-IN")})`
      : "శ్రీ వినాయక ఉచిత గోత్ర నామావళి & నిత్య సంకల్ప పూజ";

    // 1. If Free (₹0), directly submit to backend with anti-spam check
    if (numOffering === 0) {
      try {
        const res = await fetch(`${API_BASE}/navaratri/wishes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...prayerForm,
            mobile: cleanMob,
            offering_amount: 0,
          }),
        });

        const resData = await res.json();
        if (!res.ok) {
          throw new Error(resData.error || "Failed to submit prayer");
        }

        setPrayerSuccess(
          prayerForm.email && prayerForm.email.trim()
            ? "🙏 మీ గోత్ర నామావళి & పూజా సంకల్పం సమర్పించబడింది! మీ ఆశీర్వచన సర్టిఫికేట్ మీ ఇమెయిల్‌కి కూడా పంపబడింది 📧."
            : "🙏 మీ గోత్ర నామావళి & పూజా సంకల్పం సమర్పించబడింది! మీ ఆశీర్వచన సర్టిఫికేట్ సిద్ధమైంది."
        );

        handleOpenCertificate({
          devotee_name: prayerForm.devotee_name.trim(),
          gotram: prayerForm.gotram.trim() || "శివ / కాశ్యప గోత్రం (Shiva Gotram)",
          city: prayerForm.city.trim() || "Jagtial, Telangana",
          seva_tier: offeringLabel,
          seva_date: "Vinayaka Navaratri Mahotsavam 2026",
          token_no: resData.token_no,
          amount: 0,
        });

        setPrayerForm({
          devotee_name: "",
          mobile: "",
          email: "",
          gotram: "",
          city: "Jagtial",
          message: "",
          offering_amount: 51,
        });
      } catch (err) {
        setPrayerError(err.message || "Failed to submit prayer");
      } finally {
        setPrayerSubmitting(false);
      }
      return;
    }

    // 2. If Paid Offering (₹51, ₹101, ₹116, ₹2116), initiate Razorpay Payment Order
    try {
      const res = await fetch(`${API_BASE}/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payer_name: prayerForm.devotee_name.trim(),
          email: prayerForm.email ? prayerForm.email.trim() : "",
          mobile_number: cleanMob,
          address: `${prayerForm.city || "Jagtial"} | Gotram: ${prayerForm.gotram || "N/A"}`,
          amount: numOffering,
          fund_type: "Vinayaka Navaratri Sacred Offering",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create offering order");
      }

      const pendingOfferingData = {
        ...prayerForm,
        mobile: cleanMob,
        offering_amount: numOffering,
        offeringLabel,
      };

      setActiveOfferingPayment(pendingOfferingData);

      // Fallback for Sandbox / Test Mode
      if (data.order_id && data.order_id.startsWith("order_test_")) {
        setDemoOrderData(data);
        setShowDemoModal(true);
        setPrayerSubmitting(false);
        return;
      }

      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        setPrayerError("Razorpay gateway failed to load. Please check internet connection.");
        setPrayerSubmitting(false);
        return;
      }

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "Hindu Swaraj Youth Welfare Association",
        description: `Navaratri Offering: ${offeringLabel}`,
        image: "/images/logo_v2.png",
        order_id: data.order_id,
        handler: async function (response) {
          try {
            await fetch(`${API_BASE}/payment/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || data.order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature || "test_signature",
              }),
            });

            // Save wish to database with verified payment ID
            const wishRes = await fetch(`${API_BASE}/navaratri/wishes`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...pendingOfferingData,
                payment_id: response.razorpay_payment_id,
              }),
            });
            const wishData = await wishRes.json();

            setPrayerSuccess(
              pendingOfferingData.email
                ? "🙏 మీ గోత్ర నామావళి & పూజా కానుక సమర్పించబడింది! మీ ఆశీర్వచన సర్టిఫికేట్ మీ ఇమెయిల్‌కి కూడా పంపబడింది 📧."
                : "🙏 మీ గోత్ర నామావళి & పూజా కానుక సమర్పించబడింది! మీ ఆశీర్వచన సర్టిఫికేట్ సిద్ధమైంది."
            );

            handleOpenCertificate({
              devotee_name: pendingOfferingData.devotee_name,
              gotram: pendingOfferingData.gotram || "శివ / కాశ్యప గోత్రం (Shiva Gotram)",
              city: pendingOfferingData.city || "Jagtial, Telangana",
              seva_tier: offeringLabel,
              seva_date: "Vinayaka Navaratri Mahotsavam 2026",
              token_no: wishData.token_no,
              amount: numOffering,
            });

            setPrayerForm({
              devotee_name: "",
              mobile: "",
              email: "",
              gotram: "",
              city: "Jagtial",
              message: "",
              offering_amount: 51,
            });
            setActiveOfferingPayment(null);
          } catch (err) {
            console.error("Offering save error 👉", err);
            handleOpenCertificate({
              devotee_name: pendingOfferingData.devotee_name,
              gotram: pendingOfferingData.gotram || "శివ / కాశ్యప గోత్రం (Shiva Gotram)",
              city: pendingOfferingData.city || "Jagtial, Telangana",
              seva_tier: offeringLabel,
              seva_date: "Vinayaka Navaratri Mahotsavam 2026",
              amount: numOffering,
            });
          }
        },
        prefill: {
          name: prayerForm.devotee_name,
          email: prayerForm.email || "",
          contact: cleanMob,
        },
        theme: {
          color: "#ff6b00",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error("Offering payment error 👉", err);
      setPrayerError(err.message || "Failed to initiate payment gateway");
    } finally {
      setPrayerSubmitting(false);
    }
  };

  const openSevaBooking = (tierName, amount) => {
    setSelectedSevaTier(tierName);
    setSevaAmount(amount);
    setCustomAmountInput(amount ? String(amount) : "");
    setSevaError("");
    setShowSevaModal(true);
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSevaPayment = async (e) => {
    e.preventDefault();
    const finalAmount = Number(customAmountInput) || Number(sevaAmount);
    if (!sevaForm.name || !sevaForm.mobile || !sevaForm.email || !finalAmount) {
      setSevaError("Please fill all required fields (Name, Mobile, Email, Amount).");
      return;
    }
    setSevaError("");
    setSevaLoading(true);

    try {
      const res = await fetch(`${API_BASE}/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payer_name: sevaForm.name,
          email: sevaForm.email,
          mobile_number: sevaForm.mobile,
          address: `${sevaForm.address} | Gotram: ${sevaForm.gotram || "N/A"} | Nakshatram: ${sevaForm.nakshatram || "N/A"} | Seva: ${selectedSevaTier} (${sevaForm.sevaDate})`,
          amount: finalAmount,
          fund_type: "Vinayaka Navaratri Seva",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create seva order");
      }

      if (data.order_id && data.order_id.startsWith("order_test_")) {
        setDemoOrderData(data);
        setShowDemoModal(true);
        setSevaLoading(false);
        return;
      }

      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        setSevaError("Razorpay gateway failed to load. Please check internet connection.");
        setSevaLoading(false);
        return;
      }

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "Hindu Swaraj Youth Welfare Association",
        description: `Navaratri Seva: ${selectedSevaTier}`,
        image: "/images/logo_v2.png",
        order_id: data.order_id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_BASE}/payment/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || data.order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature || "test_signature",
              }),
            });
            if (verifyRes.ok) {
              window.location.href = `/payment-success?payment_id=${response.razorpay_payment_id}`;
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (err) {
            console.error("Verification error", err);
            window.location.href = `/payment-success?payment_id=${response.razorpay_payment_id}`;
          }
        },
        prefill: {
          name: sevaForm.name,
          email: sevaForm.email,
          contact: sevaForm.mobile,
        },
        theme: {
          color: "#ff6b00",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error("Payment error 👉", err);
      setSevaError(err.message || "Something went wrong initiating payment.");
    } finally {
      setSevaLoading(false);
    }
  };

  const handleSimulateSuccess = async () => {
    if (!demoOrderData) return;
    setSevaLoading(true);
    try {
      const testPayId = `pay_test_${Date.now()}`;
      await fetch(`${API_BASE}/payment/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: demoOrderData.order_id,
          razorpay_payment_id: testPayId,
          razorpay_signature: "test_signature",
        }),
      });

      // If this was an offering from the prayer wall:
      if (activeOfferingPayment) {
        const wishRes = await fetch(`${API_BASE}/navaratri/wishes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...activeOfferingPayment,
            payment_id: testPayId,
          }),
        });
        const wishData = await wishRes.json();

        setPrayerSuccess(
          activeOfferingPayment.email
            ? "🙏 మీ గోత్ర నామావళి & పూజా కానుక సమర్పించబడింది! మీ ఆశీర్వచన సర్టిఫికేట్ మీ ఇమెయిల్‌కి కూడా పంపబడింది 📧."
            : "🙏 మీ గోత్ర నామావళి & పూజా కానుక సమర్పించబడింది! మీ ఆశీర్వచన సర్టిఫికేట్ సిద్ధమైంది."
        );

        handleOpenCertificate({
          devotee_name: activeOfferingPayment.devotee_name,
          gotram: activeOfferingPayment.gotram || "శివ / కాశ్యప గోత్రం (Shiva Gotram)",
          city: activeOfferingPayment.city || "Jagtial, Telangana",
          seva_tier: activeOfferingPayment.offeringLabel,
          seva_date: "Vinayaka Navaratri Mahotsavam 2026",
          token_no: wishData.token_no,
          amount: activeOfferingPayment.offering_amount,
        });

        setPrayerForm({
          devotee_name: "",
          mobile: "",
          email: "",
          gotram: "",
          city: "Jagtial",
          message: "",
          offering_amount: 51,
        });
        setActiveOfferingPayment(null);
        setShowDemoModal(false);
        return;
      }

      window.location.href = `/payment-success?payment_id=${testPayId}`;
    } catch (err) {
      console.error(err);
    } finally {
      setSevaLoading(false);
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (activeCategory === "ALL") return true;
    return p.category === activeCategory;
  });

  const currentScheduleItem =
    schedule.find((s) => s.day_number === selectedDay) || schedule[0] || DEFAULT_SCHEDULE[0];

  const shareLiveStream = () => {
    const text = encodeURIComponent(
      `🚩 Watch Vinayaka Navaratri Seva 2026 Live Darshan & Aarti from Jagtial!\n\nJoin Live: ${typeof window !== "undefined" ? window.location.href : ""}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Top Ambient Glows */}
      <div className={styles.bgGlowTop}></div>
      <div className={styles.bgGlowCenter}></div>

      {/* Festival Sticky Top Bar */}
      <header className={styles.festivalHeader}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.backHomeBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            Back to Home
          </Link>

          <div className={styles.headerBrand}>
            <Image
              src="/images/logo_v2.png"
              alt="Hindu Swaraj Youth"
              width={40}
              height={40}
              style={{ borderRadius: "50%" }}
            />
            <div>
              <div className={styles.headerBrandTitle}>VINAYAKA NAVARATRI SEVA</div>
              <div className={styles.headerBrandSub}>Jagtial Pandal • Sep 14 to Sep 24, 2026</div>
            </div>
          </div>

          <div className={styles.headerActions}>
            {settings.is_live && (
              <span className={styles.headerLiveBadge}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }}></span>
                LIVE NOW
              </span>
            )}
            <button
              type="button"
              onClick={() => openSevaBooking("Modaka Seva", 251)}
              className={styles.headerSevaBtn}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              Book Seva
            </button>
          </div>
        </div>
      </header>

      {/* 🧭 STICKY FESTIVE QUICK NAVIGATION ANCHOR BAR */}
      <nav className={styles.quickNavBar}>
        <div className={styles.quickNavInner}>
          <a
            href="#live-stream"
            className={`${styles.quickNavPill} ${settings.is_live ? styles.quickNavPillLive : ""}`}
          >
            🔴 {settings.is_live ? "Live 4K Darshan" : "Live Stream"}
          </a>
          <a href="#virtual-aarti" className={styles.quickNavPill} style={{ background: "rgba(255, 215, 0, 0.2)", borderColor: "#ffd700", color: "#ffd700" }}>
            🪔 దివ్య హారతి & ఈ-హుండీ
          </a>
          <a href="#devotee-prayers" className={styles.quickNavPill}>
            🙏 Virtual Puja
          </a>
          <a href="#seva-booking" className={styles.quickNavPill}>
            🤝 Seva Booking
          </a>
          <a href="#puja-schedule" className={styles.quickNavPill}>
            📅 Puja Schedule
          </a>
          <a href="#photo-updates" className={styles.quickNavPill}>
            📸 Darshan Photos
          </a>
          <a href="#sponsors-showcase" className={styles.quickNavPill}>
            📢 Sponsors
          </a>
          <a href="#pandal-location" className={styles.quickNavPill}>
            📍 Location &amp; Helpline
          </a>
        </div>
      </nav>

      {/* 📢 Running Flash News & Puja Ticker */}
      {settings.ticker_active && settings.ticker_text && (
        <div className={styles.tickerContainer}>
          <div className={styles.tickerLabel}>
            <span>🔴 LIVE NOTICE</span>
          </div>
          <div className={styles.tickerTrack}>
            <span className={styles.tickerText}>{settings.ticker_text}</span>
            <span className={styles.tickerText}>✨ 🪔 {settings.ticker_text}</span>
          </div>
        </div>
      )}

      {/* =====================================================
          HERO SECTION
      ===================================================== */}
      <section className={styles.heroSection}>
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <div className={styles.shlokaBox}>
              "{settings.shloka || "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥"}" 🚩
            </div>

            <div className={styles.eventBadge}>
              <span>✨ 11 Days Grand Festival • {settings.location || "Jagtial, Telangana"}</span>
            </div>

            <h1 className={styles.heroTitle}>
              Vinayaka Navaratri Seva
            </h1>

            <p className={styles.heroSubtitle}>
              Experience the divine grace of Lord Ganesha live from {settings.location || "Jagtial"}. Join us for daily
              Vedic Abhishekam, Alankarams, Maha Annadanam, and Evening Divya Mangala Aarti organized
              by {settings.pandal_name || "Hindu Swaraj Youth Pandal, Jagtial"}.
            </p>

            <div className={styles.heroHighlights}>
              <div className={styles.highlightCard}>
                <span className={styles.highlightNumber}>{settings.start_date ? settings.start_date.substring(5) : "SEP 14"}</span>
                <span className={styles.highlightLabel}>Pratishtapana</span>
              </div>
              <div className={styles.highlightCard}>
                <span className={styles.highlightNumber}>11 Days</span>
                <span className={styles.highlightLabel}>Puja & Seva</span>
              </div>
              <div className={styles.highlightCard}>
                <span className={styles.highlightNumber}>3,000+</span>
                <span className={styles.highlightLabel}>Daily Annadanam</span>
              </div>
            </div>

            <div className={styles.heroButtons}>
              <a href="#live-stream" className={styles.btnPrimary}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                </svg>
                Watch Live Stream
              </a>
              <a href="#puja-schedule" className={styles.btnSecondary}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                </svg>
                Daily Schedule
              </a>
              <a href="#photo-updates" className={styles.btnSecondary}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
                Daily Photos Feed
              </a>
            </div>
          </div>

          <div className={styles.heroImageWrap}>
            <img
              src={getMediaUrl(settings.banner_image, "/images/navaratri-ganesha.jpg")}
              alt="Jagtial Maha Ganapathi Darshan"
              className={styles.heroImage}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/navaratri-ganesha.jpg";
              }}
            />
            <div className={styles.heroImageOverlay}>
              <div className={styles.darshanLocation}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                {settings.pandal_name || "Hindu Swaraj Youth Pandal, Jagtial"}
              </div>
              <div className={styles.darshanTitle}>
                Maha Ganapathi Darshanam
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ROW 1: LIVE STREAM (LEFT) + DEVOTEE VIRTUAL PUJA & PRAYERS (RIGHT)
      ===================================================== */}
      <div className={styles.dualSectionGrid}>
        {/* LEFT COLUMN: LIVE BROADCAST */}
        <section className={styles.dualColCard} id="live-stream">
          <div className={styles.colCardHeader}>
            <div className={styles.colCardBadge}>🔴 Live 4K Broadcast</div>
            <h2 className={styles.colCardHeading}>YouTube Live Darshan &amp; Aarti</h2>
            <p className={styles.colCardSub}>
              Watch live rituals, morning Abhishekam, and evening Maha Harathi directly from {settings.location || "Jagtial"}.
            </p>
          </div>

          <div className={styles.livePlayerCard}>
            <div className={styles.livePlayerHeader}>
              <div className={styles.liveStatusIndicator}>
                <span className={`${styles.liveDot} ${settings.is_live ? styles.active : ""}`}></span>
                <span className={styles.liveStatusText}>
                  {settings.is_live
                    ? "LIVE BROADCAST ACTIVE"
                    : `NEXT: Morning ${settings.morning_timings ? settings.morning_timings.split("-")[0].trim() : "07:00 AM"} & Evening ${settings.evening_timings ? settings.evening_timings.split("-")[0].trim() : "07:30 PM"}`}
                </span>
              </div>

              <button
                type="button"
                className={styles.shareWhatsAppBtn}
                onClick={shareLiveStream}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
                Share
              </button>
            </div>

            <div className={styles.iframeWrapper}>
              {(() => {
                const embedUrl = getYouTubeEmbedUrl(settings.youtube_url || settings.youtube_embed_id);
                if (embedUrl) {
                  return (
                    <iframe
                      src={embedUrl}
                      title={settings.stream_title || "Vinayaka Navaratri Live Stream"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      style={{ width: "100%", height: "100%", border: "none" }}
                    ></iframe>
                  );
                }
                return (
                  <div className={styles.streamPlaceholder}>
                    <div className={styles.streamPlaceholderIcon}>🪔</div>
                    <div className={styles.streamPlaceholderTitle}>
                      {settings.stream_title || "Vinayaka Navaratri Seva Live Stream"}
                    </div>
                    <div className={styles.streamPlaceholderSub}>
                      {settings.live_announcement ||
                        "Live Darshan stream starts every morning at 7:00 AM and evening at 7:30 PM. Stay tuned!"}
                    </div>
                    <a
                      href={settings.youtube_url || "https://www.youtube.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.btnPrimary}
                      style={{ padding: "8px 18px", fontSize: "0.85rem" }}
                    >
                      Open in YouTube ↗
                    </a>
                  </div>
                );
              })()}
            </div>

            {/* Timings summary bar */}
            <div className={styles.liveFooterCompact}>
              <div className={styles.timingItem}>
                <span className={styles.timingDot}>🌅</span>
                <div>
                  <div className={styles.timingTitle}>Morning Abhishekam</div>
                  <div className={styles.timingHour}>{settings.morning_timings || "07:00 AM - 09:30 AM"}</div>
                </div>
              </div>
              <div className={styles.timingItem}>
                <span className={styles.timingDot}>🍲</span>
                <div>
                  <div className={styles.timingTitle}>Maha Annadanam</div>
                  <div className={styles.timingHour}>{settings.annadanam_timings || "01:00 PM - 03:00 PM"}</div>
                </div>
              </div>
              <div className={styles.timingItem}>
                <span className={styles.timingDot}>🪔</span>
                <div>
                  <div className={styles.timingTitle}>Evening Maha Aarti</div>
                  <div className={styles.timingHour}>{settings.evening_timings || "07:30 PM - 09:00 PM"}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: DEVOTEE VIRTUAL PUJA & GOTRA NAMAVALI */}
        <section className={styles.dualColCard} id="devotee-prayers">
          <div className={styles.colCardHeader}>
            <div className={styles.colCardBadge}>🙏 Virtual Seva &amp; Gotra Sankalpam</div>
            <h2 className={styles.colCardHeading}>Devotee Prayers &amp; Virtual Harathi</h2>
            <p className={styles.colCardSub}>
              Light a virtual lamp and submit your Gotra Namavali for daily Vedic Sankalpam in Jagtial.
            </p>
          </div>

          <div className={styles.interactiveSevaWrap}>
            {/* Quick Diya & Flowers row */}
            <div className={styles.virtualDiyaBar}>
              <div className={styles.diyaActionLeft}>
                <span
                  className={styles.diyaTouchBtn}
                  onClick={handleLightDiya}
                  title="Touch to light Diya"
                >
                  🪔
                </span>
                <div>
                  <div style={{ fontWeight: "800", color: "#fff", fontSize: "0.88rem" }}>
                    Light a Sacred Diya
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#fed7aa" }}>
                    {diyaCount} Diyas Lit Today by Devotees
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                  onClick={handleLightDiya}
                >
                  🪔 Light ({diyaCount})
                </button>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                  onClick={handleOfferFlowers}
                >
                  🌸 Flowers ({flowerCount})
                </button>
              </div>
            </div>

            {virtualFeedback && (
              <div className={styles.pujaFeedbackAlert} style={{ padding: "6px 10px", fontSize: "0.8rem", margin: "8px 0" }}>
                {virtualFeedback}
              </div>
            )}

            {/* Prayer Form */}
            <div className={styles.prayerWallCard}>
              {prayerError && (
                <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#fca5a5", padding: "8px 12px", borderRadius: "8px", marginBottom: "10px", fontSize: "0.82rem" }}>
                  ⚠️ {prayerError}
                </div>
              )}

              {prayerSuccess && (
                <div className={styles.pujaFeedbackAlert} style={{ marginBottom: 10, padding: "8px 12px", fontSize: "0.84rem" }}>
                  {prayerSuccess}
                </div>
              )}

              <form onSubmit={handleSubmitPrayer} className={styles.prayerForm}>
                <div className={styles.inputRow}>
                  <input
                    type="text"
                    placeholder="Devotee / Family Name *"
                    required
                    value={prayerForm.devotee_name}
                    onChange={(e) => setPrayerForm({ ...prayerForm, devotee_name: e.target.value })}
                    className={styles.darkInput}
                  />
                  <input
                    type="tel"
                    placeholder="10-Digit Mobile *"
                    required
                    maxLength={10}
                    value={prayerForm.mobile}
                    onChange={(e) => setPrayerForm({ ...prayerForm, mobile: e.target.value.replace(/[^0-9]/g, "") })}
                    className={styles.darkInput}
                  />
                </div>

                <div className={styles.inputRow}>
                  <input
                    type="text"
                    placeholder="Gotram &amp; Nakshatram"
                    value={prayerForm.gotram}
                    onChange={(e) => setPrayerForm({ ...prayerForm, gotram: e.target.value })}
                    className={styles.darkInput}
                  />
                  <input
                    type="text"
                    placeholder="City / Village"
                    value={prayerForm.city}
                    onChange={(e) => setPrayerForm({ ...prayerForm, city: e.target.value })}
                    className={styles.darkInput}
                  />
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <input
                    type="email"
                    placeholder="Email Address (Optional: Blessing Certificate will be emailed 📧)"
                    value={prayerForm.email}
                    onChange={(e) => setPrayerForm({ ...prayerForm, email: e.target.value })}
                    className={styles.darkInput}
                    style={{ width: "100%", fontSize: "0.8rem" }}
                  />
                </div>

                {/* Dakshina Pills */}
                <div style={{ marginTop: "4px", marginBottom: "10px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>
                    {[
                      { amount: 51, title: "నిత్య సంకల్పం" },
                      { amount: 101, title: "అష్టోత్తర పూజ" },
                      { amount: 116, title: "సహస్రనామార్చన" },
                      { amount: 2116, title: "అన్నదానం" },
                      { amount: 0, title: "ఉచితం (Free)" },
                    ].map((tier) => (
                      <div
                        key={tier.amount}
                        onClick={() => setPrayerForm({ ...prayerForm, offering_amount: tier.amount })}
                        style={{
                          background: prayerForm.offering_amount === tier.amount 
                            ? "linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(217, 119, 6, 0.4) 100%)" 
                            : "rgba(255, 255, 255, 0.04)",
                          border: prayerForm.offering_amount === tier.amount 
                            ? "2px solid #f59e0b" 
                            : "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "8px",
                          padding: "6px 4px",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div style={{ fontSize: "0.85rem", fontWeight: "900", color: prayerForm.offering_amount === tier.amount ? "#fbbf24" : "#fff" }}>
                          {tier.amount > 0 ? `₹${tier.amount}` : "FREE"}
                        </div>
                        <div style={{ fontSize: "0.65rem", color: "#fed7aa", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {tier.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <textarea
                  placeholder="Write your blessing wish or prayer intention..."
                  rows={2}
                  value={prayerForm.message}
                  onChange={(e) => setPrayerForm({ ...prayerForm, message: e.target.value })}
                  className={styles.darkInput}
                  style={{ resize: "none", marginBottom: "10px", fontSize: "0.82rem" }}
                ></textarea>

                <button
                  type="submit"
                  disabled={prayerSubmitting}
                  className={styles.btnPrimary}
                  style={{ width: "100%", justifyContent: "center", padding: "10px 16px", fontSize: "0.88rem", fontWeight: "800" }}
                >
                  {prayerSubmitting 
                    ? "Submitting..." 
                    : prayerForm.offering_amount > 0 
                      ? `🪔 Offer ₹${Number(prayerForm.offering_amount).toLocaleString("en-IN")} & Get Certificate ↗`
                      : "🙏 Submit Free Gotra Prayer & Certificate ↗"
                  }
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================
          🪔 INTERACTIVE VIRTUAL AARTI SANCTUM & RAZORPAY E-HUNDI
      ===================================================== */}
      <section className={styles.aartiSanctuarySection} id="virtual-aarti">
        <div className={styles.aartiSanctuaryCard}>
          {/* Falling Flower Particles Shower */}
          {flowerParticles.map((p) => (
            <div
              key={p.id}
              className={styles.flowerPetalParticle}
              style={{ left: p.left, "--dx": p.dx, fontSize: "1.4rem" }}
            >
              {p.icon}
            </div>
          ))}

          <div className={styles.aartiSanctuaryGrid}>
            {/* LEFT: TEMPLE GARBHAGUDI SANCTUM */}
            <div className={styles.templeSanctumWrap}>
              {/* Hanging Temple Bells with Brass Chains */}
              <div className={styles.templeBellsRow}>
                <div className={styles.bellWithChain} onClick={playTempleBell} title="ఘంటానాదం చేయండి (Ring Bell)">
                  <div className={styles.bellChain}></div>
                  <span className={`${styles.brassBell} ${isBellRinging ? styles.brassBellRinging : ""}`}>🔔</span>
                </div>

                <div className={styles.sanctumTitleBadge}>
                  ॥ జగిత్యాల మహా గణపతి దివ్య గర్భాలయం ॥
                </div>

                <div className={styles.bellWithChain} onClick={playTempleBell} title="ఘంటానాదం చేయండి (Ring Bell)">
                  <div className={styles.bellChain}></div>
                  <span className={`${styles.brassBell} ${isBellRinging ? styles.brassBellRinging : ""}`}>🔔</span>
                </div>
              </div>

              {/* Central Ganesha Murti with Sacred Rays & 3D Animated Aarti Thali */}
              <div className={styles.murtiCenterStage}>
                {/* 1. Continuous Rotating Sunbeam Halo */}
                <div className={styles.sacredRaysHalo}></div>

                {/* 2. Pulsing Divine Aura */}
                <div className={styles.murtiAuraGlow}></div>

                {/* 3. Central Ganesha Murti */}
                <img
                  src="/images/navaratri-ganesha.jpg"
                  alt="Lord Ganesha Murti"
                  className={styles.murtiImage}
                />

                {/* 4. Real 3D Animated Pancha Deepam Aarti Thali */}
                <div
                  className={`${styles.thaliContainer} ${isAartiWaving ? styles.thaliOrbitActive : ""}`}
                  onClick={triggerAartiPradakshina}
                  title="స్వామివారికి హారతి ఇవ్వడానికి క్లిక్ చేయండి (Click to wave Aarti)"
                >
                  {/* Rising Incense Smoke */}
                  <div className={styles.incenseSmokePuff}></div>

                  {/* 5 Real Dancing Fire Flames */}
                  <div className={styles.flamePanchaGroup}>
                    <div className={`${styles.flameItem} ${styles.flameLeftEdge}`}>
                      <div className={styles.flameBody}></div>
                    </div>
                    <div className={`${styles.flameItem} ${styles.flameLeftCenter}`}>
                      <div className={styles.flameBody}></div>
                    </div>
                    <div className={`${styles.flameItem} ${styles.flameCenterMain}`}>
                      <div className={styles.flameBody}></div>
                    </div>
                    <div className={`${styles.flameItem} ${styles.flameRightCenter}`}>
                      <div className={styles.flameBody}></div>
                    </div>
                    <div className={`${styles.flameItem} ${styles.flameRightEdge}`}>
                      <div className={styles.flameBody}></div>
                    </div>
                  </div>

                  {/* 3D Brass Metal Plate */}
                  <div className={styles.brassThaliPlate}>
                    <div className={styles.brassPlateRim}>
                      <span style={{ fontSize: "0.85rem", opacity: 0.85 }}>🪔</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Blessings / Coconut status */}
              {coconutState && (
                <div className={styles.coconutBreakCard}>
                  <span style={{ fontSize: "1.4rem" }}>🥥</span>
                  <div>
                    <div><strong>కొబ్బరికాయ సమర్పించబడింది!</strong></div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.9 }}>శ్రీ సిద్ధి వినాయక ప్రసన్నం — మీ సకల సంకల్పాలు నెరవేరుగాక! 🚩</div>
                  </div>
                </div>
              )}

              {/* 4 Sacred Offerings Buttons */}
              <div className={styles.offeringsButtonGroup}>
                <button
                  type="button"
                  className={styles.offeringBtn}
                  onClick={triggerAartiPradakshina}
                >
                  <span style={{ fontSize: "1.3rem" }}>🪔</span>
                  <span>హారతి ఇవ్వండి</span>
                </button>

                <button
                  type="button"
                  className={styles.offeringBtn}
                  onClick={triggerFlowerShower}
                >
                  <span style={{ fontSize: "1.3rem" }}>🌸</span>
                  <span>పుష్పాంజలి</span>
                </button>

                <button
                  type="button"
                  className={styles.offeringBtn}
                  onClick={triggerBreakCoconut}
                >
                  <span style={{ fontSize: "1.3rem" }}>🥥</span>
                  <span>కొబ్బరికాయ</span>
                </button>

                <button
                  type="button"
                  className={styles.offeringBtn}
                  onClick={triggerLightCamphor}
                >
                  <span style={{ fontSize: "1.3rem" }}>✨</span>
                  <span>కర్పూర దీపం</span>
                </button>
              </div>
            </div>

            {/* RIGHT: DEDICATED RAZORPAY E-HUNDI PANEL */}
            <div className={styles.eHundiPanel}>
              <div className={styles.eHundiHeader}>
                <div className={styles.eHundiIconBadge}>🪙</div>
                <div>
                  <h3 className={styles.eHundiTitle}>శ్రీ వినాయక దివ్య ఈ-హుండీ సమర్పణ</h3>
                  <p className={styles.eHundiSub}>
                    ఆన్‌లైన్ ద్వారా స్వామివారి సేవలకు పవిత్ర కానుకలు సమర్పించి డిజిటల్ ఆశీర్వచన రసీదు పొందండి.
                  </p>
                </div>
              </div>

              <form onSubmit={handleEHundiRazorpaySubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#fed7aa", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                      భక్తుని పేరు (Devotee Name) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ఉదా: ముకేష్ కొక్కుల"
                      value={eHundiDonorName}
                      onChange={(e) => setEHundiDonorName(e.target.value)}
                      className={styles.darkInput}
                      style={{ fontSize: "0.85rem", padding: "8px 10px" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#fed7aa", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                      మొబైల్ నంబర్ (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="9848012345"
                      value={eHundiMobile}
                      onChange={(e) => setEHundiMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className={styles.darkInput}
                      style={{ fontSize: "0.85rem", padding: "8px 10px" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "10px" }}>
                  <label style={{ fontSize: "0.75rem", color: "#fed7aa", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                    గోత్రం &amp; నక్షత్రం (Gotram)
                  </label>
                  <input
                    type="text"
                    placeholder="ఉదా: శివ గోత్రం, రోహిణి నక్షత్రం"
                    value={eHundiGotram}
                    onChange={(e) => setEHundiGotram(e.target.value)}
                    className={styles.darkInput}
                    style={{ fontSize: "0.85rem", padding: "8px 10px", width: "100%" }}
                  />
                </div>

                {/* Auspicious Denominations */}
                <div style={{ margin: "12px 0 6px" }}>
                  <label style={{ fontSize: "0.75rem", color: "#fed7aa", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                    హుండీ కానుక మొత్తం (Auspicious Offering in ₹) *
                  </label>
                  <div className={styles.hundiAmountChips}>
                    {[21, 51, 101, 516, 1116, 2116].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        className={`${styles.hundiChipBtn} ${eHundiAmount === amt && !eHundiCustom ? styles.hundiChipBtnActive : ""}`}
                        onClick={() => {
                          setEHundiAmount(amt);
                          setEHundiCustom("");
                        }}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: "10px" }}>
                  <input
                    type="number"
                    placeholder="లేదా ఇతర మొత్తం (Custom Amount in ₹)..."
                    value={eHundiCustom}
                    onChange={(e) => setEHundiCustom(e.target.value)}
                    className={styles.darkInput}
                    style={{ fontSize: "0.85rem", padding: "8px 10px", width: "100%" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={eHundiLoading}
                  className={styles.razorpaySubmitBtn}
                >
                  <span>{eHundiLoading ? "🔄 ప్రాసెస్ అవుతోంది..." : `💳 ₹${eHundiCustom ? Number(eHundiCustom).toLocaleString("en-IN") : eHundiAmount.toLocaleString("en-IN")} హుండీ కానుక సమర్పించండి (Razorpay)`}</span>
                </button>

                <div className={styles.hundiGuaranteeText}>
                  <span>🔒 100% Secure Razorpay Payment • Instant Divine Seva Certificate</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ROW 2: 11-DAY SCHEDULE (LEFT) + SEVA & ANNADANAM (RIGHT)
      ===================================================== */}
      <div className={styles.dualSectionGrid}>
        {/* LEFT COLUMN: 11-DAY PUJA SCHEDULE */}
        <section className={styles.dualColCard} id="puja-schedule">
          <div className={styles.colCardHeader}>
            <div className={styles.colCardBadge}>📅 11 Days Sacred Program</div>
            <h2 className={styles.colCardHeading}>Daily Puja &amp; Alankaram Schedule</h2>
            <p className={styles.colCardSub}>
              Sacred Vedic rituals, unique daily Alankarams, and cultural events planned for each day in Jagtial.
            </p>
          </div>

          {/* Schedule Day Tabs */}
          <div className={styles.scheduleNav}>
            {schedule.map((item) => (
              <button
                key={item.day_number}
                type="button"
                className={`${styles.scheduleTab} ${
                  selectedDay === item.day_number ? styles.active : ""
                }`}
                onClick={() => setSelectedDay(item.day_number)}
              >
                <div className={styles.tabDayNumber}>Day {item.day_number}</div>
                <div className={styles.tabDayDate}>{item.date_str ? item.date_str.split("(")[0] : `Sep ${13 + item.day_number}`}</div>
              </button>
            ))}
          </div>

          {/* Selected Schedule Card */}
          <div className={styles.scheduleDetailsCard}>
            <div className={styles.scheduleCardHeader}>
              <div>
                <h3 className={styles.scheduleDayTitle}>{currentScheduleItem.title}</h3>
                <div style={{ color: "#94a3b8", marginTop: 2, fontSize: "0.82rem" }}>
                  🗓 {currentScheduleItem.date_str} &bull; Jagtial Pandal
                </div>
              </div>
              <div className={styles.scheduleAlankaramBadge}>
                <span>✨</span>
                <span>{currentScheduleItem.alankaram}</span>
              </div>
            </div>

            <div className={styles.scheduleGrid}>
              <div className={styles.scheduleItemBox}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemIcon}>🌅</span>
                  <span className={styles.itemTitle}>Morning Vedic Puja</span>
                </div>
                <p className={styles.itemContent}>{currentScheduleItem.morning_puja}</p>
              </div>

              <div className={styles.scheduleItemBox}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemIcon}>🪔</span>
                  <span className={styles.itemTitle}>Evening Divya Aarti</span>
                </div>
                <p className={styles.itemContent}>{currentScheduleItem.evening_aarti}</p>
              </div>

              <div className={styles.scheduleItemBox}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemIcon}>🍲</span>
                  <span className={styles.itemTitle}>Maha Annadanam Seva</span>
                </div>
                <p className={styles.itemContent}>{currentScheduleItem.annadanam_info}</p>
              </div>

              <div className={styles.scheduleItemBox}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemIcon}>🎭</span>
                  <span className={styles.itemTitle}>Cultural Events &amp; Youth Seva</span>
                </div>
                <p className={styles.itemContent}>{currentScheduleItem.special_events}</p>
              </div>
            </div>

            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontSize: "0.82rem", color: "#fed7aa" }}>
                🙏 Sponsor Abhishekam for <b>Day {currentScheduleItem.day_number}</b>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSevaForm((prev) => ({
                    ...prev,
                    sevaDate: `Day ${currentScheduleItem.day_number} - ${currentScheduleItem.date_str || "Sep 2026"}`,
                  }));
                  openSevaBooking("Panchamrutha Abhishekam", 501);
                }}
                className={styles.btnPrimary}
                style={{ padding: "6px 14px", fontSize: "0.8rem", border: "none", cursor: "pointer" }}
              >
                🪔 Sponsor Day {currentScheduleItem.day_number}
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: SEVA & ANNADANAM SPONSORSHIP */}
        <section className={styles.dualColCard} id="seva-booking">
          <div className={styles.colCardHeader}>
            <div className={styles.colCardBadge}>🤝 Seva Sponsorship</div>
            <h2 className={styles.colCardHeading}>Sponsor Navaratri Seva &amp; Annadanam</h2>
            <p className={styles.colCardSub}>
              Support the 11-day Mahotsavam. Your contribution funds Maha Annadanam, Vedic rituals &amp; floral alankarams.
            </p>
          </div>

          <div className={styles.sevaBannerCompact}>
            <div className={styles.sevaOptionsGrid}>
              <div
                className={`${styles.sevaOptionCard} ${styles.sevaOptionCardInteractive}`}
                onClick={() => openSevaBooking("Modaka Seva", 251)}
              >
                <div className={styles.sevaOptionName}>Modaka Seva</div>
                <div className={styles.sevaOptionPrice}>₹ 251</div>
                <span style={{ fontSize: "0.72rem", color: "#f59e0b", marginTop: 2, display: "block" }}>👉 Tap to Sponsor</span>
              </div>
              <div
                className={`${styles.sevaOptionCard} ${styles.sevaOptionCardInteractive}`}
                onClick={() => openSevaBooking("Panchamrutha Abhishekam", 501)}
              >
                <div className={styles.sevaOptionName}>Panchamrutha Abhishekam</div>
                <div className={styles.sevaOptionPrice}>₹ 501</div>
                <span style={{ fontSize: "0.72rem", color: "#f59e0b", marginTop: 2, display: "block" }}>👉 Tap to Sponsor</span>
              </div>
              <div
                className={`${styles.sevaOptionCard} ${styles.sevaOptionCardInteractive}`}
                onClick={() => openSevaBooking("Nithya Annadanam Seva", 1116)}
              >
                <div className={styles.sevaOptionName}>Nithya Annadanam Seva</div>
                <div className={styles.sevaOptionPrice}>₹ 1,116</div>
                <span style={{ fontSize: "0.72rem", color: "#f59e0b", marginTop: 2, display: "block" }}>👉 Tap to Sponsor</span>
              </div>
              <div
                className={`${styles.sevaOptionCard} ${styles.sevaOptionCardInteractive}`}
                onClick={() => openSevaBooking("Pushpalankara Seva", 2500)}
              >
                <div className={styles.sevaOptionName}>Pushpalankara Seva</div>
                <div className={styles.sevaOptionPrice}>₹ 2,500</div>
                <span style={{ fontSize: "0.72rem", color: "#f59e0b", marginTop: 2, display: "block" }}>👉 Tap to Sponsor</span>
              </div>
            </div>

            <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => openSevaBooking("Nithya Annadanam Seva", 1116)}
                className={styles.btnPrimary}
                style={{ flex: 1, justifyContent: "center", cursor: "pointer", border: "none", padding: "10px 16px", fontSize: "0.85rem" }}
              >
                💳 Donate Online &amp; Get Instant Receipt
              </button>
            </div>

            <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", fontSize: "0.78rem", color: "#fed7aa", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.2rem" }}>📜</span>
              <span>
                <b>Official Computerized Association Receipt:</b> Instantly generated with Regd No. 784/2025 and sent to your email &amp; WhatsApp.
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================
          ROW 3: NAVARATRI DARSHAN PHOTO GALLERY (FULL WIDTH)
      ===================================================== */}
      <section className={styles.sectionBlock} id="photo-updates">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionPill}>📸 Daily Updates</span>
          <h2 className={styles.sectionHeading}>Navaratri Darshan &amp; Photo Feed</h2>
          <p className={styles.sectionDesc}>
            Stay connected with real-time photographic updates from the festival in Jagtial.
          </p>
        </div>

        <div className={styles.galleryFilterBar}>
          <div className={styles.categoryChips}>
            {["ALL", "Puja & Darshan", "Maha Aarti", "Annadanam Seva", "Volunteers"].map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`${styles.categoryChip} ${
                    activeCategory === cat ? styles.active : ""
                  }`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>

        <div className={styles.photoGrid}>
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className={styles.photoCard}
              onClick={() => setActiveLightbox(post)}
            >
              <div className={styles.photoImgWrapper}>
                <img
                  src={getMediaUrl(post.image_url, post.category === "Maha Aarti" ? "/images/navaratri-aarti.jpg" : "/images/navaratri-ganesha.jpg")}
                  alt={post.title}
                  className={styles.photoImg}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = post.category === "Maha Aarti" ? "/images/navaratri-aarti.jpg" : "/images/navaratri-ganesha.jpg";
                  }}
                />
                <span className={styles.photoDayBadge}>Day {post.day_number}</span>
                <span className={styles.photoCategoryBadge}>{post.category}</span>
              </div>
              <div className={styles.photoCardBody}>
                <div>
                  <h4 className={styles.photoCardTitle}>{post.title}</h4>
                  <p className={styles.photoCardDesc}>{post.description}</p>
                </div>
                <div className={styles.photoCardFooter}>
                  <span>📍 Jagtial Pandal</span>
                  <span>🔍 View HD</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          ROW 4: PATRONS & SHOP ADS (LEFT) + PANDAL LOCATION & HELPLINE (RIGHT)
      ===================================================== */}
      <div className={styles.dualSectionGrid}>
        {/* LEFT COLUMN: LOCAL PATRONS & SHOP ADS */}
        <section className={styles.dualColCard} id="sponsors-showcase">
          <div className={styles.colCardHeader}>
            <div className={styles.colCardBadge}>📢 Local Patrons &amp; Offers</div>
            <h2 className={styles.colCardHeading}>Festival Sponsors &amp; Local Business</h2>
            <p className={styles.colCardSub}>
              Heartfelt gratitude to our benefactors, local businesses, and community sponsors in Jagtial.
            </p>
          </div>

          {/* Rotating Commercial Card */}
          {sponsors.length > 0 && (() => {
            const currentAd = sponsors[currentCommercialIdx] || sponsors[0];
            return (
              <div className={styles.commercialCardCompact}>
                <div className={styles.commercialTopBar}>
                  <span className={styles.commercialBadge}>🛍️ Featured Store</span>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <button
                      type="button"
                      className={styles.sliderNavBtn}
                      onClick={() => setCurrentCommercialIdx((prev) => (prev === 0 ? sponsors.length - 1 : prev - 1))}
                    >
                      ◀
                    </button>
                    <span style={{ fontSize: "0.75rem", color: "#fed7aa" }}>
                      {currentCommercialIdx + 1}/{sponsors.length}
                    </span>
                    <button
                      type="button"
                      className={styles.sliderNavBtn}
                      onClick={() => setCurrentCommercialIdx((prev) => (prev + 1) % sponsors.length)}
                    >
                      ▶
                    </button>
                  </div>
                </div>

                <div className={styles.commercialBodyCompact}>
                  <img
                    src={getMediaUrl(currentAd.logo_url, "/images/navaratri-ganesha.jpg")}
                    alt={currentAd.name}
                    className={styles.commercialLogoCompact}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/images/navaratri-ganesha.jpg";
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    {currentAd.offer_badge && (
                      <span className={styles.commercialOfferTag}>{currentAd.offer_badge}</span>
                    )}
                    <h4 className={styles.commercialShopName} style={{ margin: "2px 0", fontSize: "1rem" }}>
                      {currentAd.name}
                    </h4>
                    <p className={styles.commercialTagline} style={{ fontSize: "0.8rem", margin: "2px 0" }}>{currentAd.tagline}</p>
                    {currentAd.shop_address && (
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>📍 {currentAd.shop_address}</div>
                    )}
                  </div>
                </div>

                <div className={styles.commercialActionsCompact}>
                  {currentAd.contact_phone && (
                    <a href={`tel:${currentAd.contact_phone}`} className={styles.commercialCallBtn}>
                      📞 Call ({currentAd.contact_phone})
                    </a>
                  )}
                  {(currentAd.whatsapp_number || currentAd.contact_phone) && (
                    <a
                      href={`https://wa.me/${(currentAd.whatsapp_number || currentAd.contact_phone).replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(currentAd.name)},%20I%20saw%20your%20ad%20on%20Hindu%20Swaraj%20portal.`}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.commercialWhatsAppBtn}
                    >
                      💬 WhatsApp
                    </a>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Become a sponsor prompt */}
          <div style={{ marginTop: "16px", padding: "12px", background: "rgba(255,107,0,0.06)", border: "1px dashed rgba(255,154,60,0.25)", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <span style={{ fontSize: "0.8rem", color: "#fed7aa" }}>
              🤝 Want to feature your business or family name on Live Stream?
            </span>
            <button
              type="button"
              onClick={() => openSevaBooking("Pushpalankara Seva", 2500)}
              className={styles.btnPrimary}
              style={{ padding: "6px 12px", fontSize: "0.78rem", border: "none", cursor: "pointer" }}
            >
              🌟 Sponsor Pandal Banner
            </button>
          </div>
        </section>

        {/* RIGHT COLUMN: PANDAL LOCATION & HELPLINE */}
        <section className={styles.dualColCard} id="pandal-location">
          <div className={styles.colCardHeader}>
            <div className={styles.colCardBadge}>📍 Pandal Location &amp; Helpline</div>
            <h2 className={styles.colCardHeading}>Jagtial Pandal &amp; Directions</h2>
            <p className={styles.colCardSub}>
              {settings.pandal_name || "Hindu Swaraj Youth Pandal, Jagtial"}. Join in person for Abhishekam, Annadanam &amp; Aarti.
            </p>
          </div>

          <div className={styles.pandalLocationCompact}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
              <div className={styles.liveCounterBox}>
                <span className={styles.liveCounterNum}>11 Days</span>
                <span className={styles.liveCounterLabel}>Grand Festivities</span>
              </div>
              <div className={styles.liveCounterBox}>
                <span className={styles.liveCounterNum}>
                  {settings.annadanam_count_today ? `${Number(settings.annadanam_count_today).toLocaleString("en-IN")}+` : "3,000+"}
                </span>
                <span className={styles.liveCounterLabel}>Daily Annadanam</span>
              </div>
            </div>

            <div className={styles.liveCounterBox} style={{ marginBottom: "14px", textAlign: "left", padding: "10px 14px" }}>
              <span style={{ fontSize: "0.82rem", color: "#fed7aa", fontWeight: "700" }}>
                🪔 {settings.laddu_auction_info || "Grand Maha Laddu Auction on Day 9 (22 Sep) at 6:00 PM"}
              </span>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <a
                href={settings.pandal_map_url || "https://maps.google.com/?q=Jagtial+Telangana"}
                target="_blank"
                rel="noreferrer"
                className={styles.btnPrimary}
                style={{ flex: 1, justifyContent: "center", textDecoration: "none", padding: "10px 14px", fontSize: "0.82rem" }}
              >
                🗺️ Google Maps Directions ↗
              </a>
              <a
                href={`tel:${settings.whatsapp_contact || "+918499878425"}`}
                className={styles.btnSecondary}
                style={{ textDecoration: "none", padding: "10px 14px", fontSize: "0.82rem" }}
              >
                📞 Helpline: {settings.whatsapp_contact || "+91 8499878425"}
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Seva Sponsorship Modal */}
      {showSevaModal && (
        <div className={styles.sevaModalBackdrop} onClick={() => setShowSevaModal(false)}>
          <div className={styles.sevaModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sevaModalHeader}>
              <div className={styles.sevaModalTitle}>
                🪔 Sponsor Navaratri Seva
              </div>
              <button
                type="button"
                className={styles.sevaModalClose}
                onClick={() => setShowSevaModal(false)}
              >
                ✕
              </button>
            </div>

            {sevaError && (
              <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444", color: "#fca5a5", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.88rem" }}>
                {sevaError}
              </div>
            )}

            {/* Select Seva Tier */}
            <label style={{ fontSize: "0.85rem", color: "#fed7aa", fontWeight: "700", display: "block", marginBottom: "8px" }}>
              SELECT SEVA OFFERING:
            </label>
            <div className={styles.tierButtonGroup}>
              {[
                { name: "Modaka Seva", price: 251 },
                { name: "Panchamrutha Abhishekam", price: 501 },
                { name: "Nithya Annadanam Seva", price: 1116 },
                { name: "Pushpalankara Seva", price: 2500 },
              ].map((tier) => (
                <div
                  key={tier.name}
                  className={`${styles.tierButton} ${
                    selectedSevaTier === tier.name && !customAmountInput ? styles.tierButtonActive : ""
                  }`}
                  onClick={() => {
                    setSelectedSevaTier(tier.name);
                    setSevaAmount(tier.price);
                    setCustomAmountInput("");
                  }}
                >
                  <div className={styles.tierBtnName}>{tier.name}</div>
                  <div className={styles.tierBtnPrice}>₹ {tier.price.toLocaleString("en-IN")}</div>
                </div>
              ))}
            </div>

            {/* Custom Amount */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "0.82rem", color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                Or Enter Custom Contribution Amount (₹):
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 5000"
                value={customAmountInput}
                onChange={(e) => {
                  setCustomAmountInput(e.target.value);
                  if (e.target.value) {
                    setSevaAmount(Number(e.target.value));
                    setSelectedSevaTier("Custom Seva Contribution");
                  }
                }}
                className={styles.darkInput}
                style={{ width: "100%", fontSize: "1.05rem", fontWeight: "700", color: "#f59e0b" }}
              />
            </div>

            {/* Devotee Form */}
            <form onSubmit={handleSevaPayment} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <input
                  type="text"
                  placeholder="Devotee Full Name *"
                  required
                  value={sevaForm.name}
                  onChange={(e) => setSevaForm({ ...sevaForm, name: e.target.value })}
                  className={styles.darkInput}
                />
                <input
                  type="tel"
                  placeholder="Mobile Number (WhatsApp) *"
                  required
                  value={sevaForm.mobile}
                  onChange={(e) => setSevaForm({ ...sevaForm, mobile: e.target.value })}
                  className={styles.darkInput}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "10px" }}>
                <input
                  type="email"
                  placeholder="Email Address (for Seva Receipt) *"
                  required
                  value={sevaForm.email}
                  onChange={(e) => setSevaForm({ ...sevaForm, email: e.target.value })}
                  className={styles.darkInput}
                />
                <input
                  type="text"
                  placeholder="Gotram (e.g. Shiva Gotram)"
                  value={sevaForm.gotram}
                  onChange={(e) => setSevaForm({ ...sevaForm, gotram: e.target.value })}
                  className={styles.darkInput}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <input
                  type="text"
                  placeholder="Nakshatram / Rashi (Optional)"
                  value={sevaForm.nakshatram}
                  onChange={(e) => setSevaForm({ ...sevaForm, nakshatram: e.target.value })}
                  className={styles.darkInput}
                />
                <select
                  value={sevaForm.sevaDate}
                  onChange={(e) => setSevaForm({ ...sevaForm, sevaDate: e.target.value })}
                  className={styles.darkInput}
                  style={{ background: "#1c1917" }}
                >
                  {[...Array(11)].map((_, i) => (
                    <option key={i + 1} value={`Day ${i + 1} - ${14 + i} Sep 2026`}>
                      Day {i + 1} ({14 + i} Sep 2026)
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                placeholder="City / Postal Address"
                value={sevaForm.address}
                onChange={(e) => setSevaForm({ ...sevaForm, address: e.target.value })}
                className={styles.darkInput}
              />

              <button
                type="submit"
                disabled={sevaLoading}
                className={styles.btnPrimary}
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "14px",
                  fontSize: "1rem",
                  fontWeight: "800",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {sevaLoading
                  ? "Connecting to Payment Gateway..."
                  : `Pay ₹ ${(Number(customAmountInput) || Number(sevaAmount) || 251).toLocaleString("en-IN")} & Complete Seva 🪔`}
              </button>

              <div style={{ textAlign: "center", fontSize: "0.78rem", color: "#94a3b8", marginTop: "4px" }}>
                🔒 256-Bit Encrypted via Razorpay • UPI, GPay, PhonePe, Cards, NetBanking
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seva Confirmation Modal */}
      {showDemoModal && (
        <div className={styles.sevaModalBackdrop} style={{ zIndex: 100000 }}>
          <div className={styles.sevaModalCard} style={{ maxWidth: "450px", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🪔</div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>
              పూజా సేవా ధృవీకరణ (Confirm Seva Offering)
            </h3>
            <p style={{ fontSize: "0.88rem", color: "#cbd5e1", lineHeight: 1.5, marginBottom: "20px" }}>
              శ్రీ వినాయక స్వామి వారి దివ్య పూజా సేవను ధృవీకరించి మీ అధికారిక గోత్ర నామావళి ఆశీర్వచన పత్రం మరియు రసీదును పొందండి.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setShowDemoModal(false)}
              >
                రద్దు చేయి (Cancel)
              </button>
              <button
                type="button"
                disabled={sevaLoading}
                className={styles.btnPrimary}
                onClick={handleSimulateSuccess}
              >
                {sevaLoading ? "ధృవీకరిస్తోంది..." : "🪔 Confirm Seva & Get Blessing Certificate ↗"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeLightbox && (
        <div
          className={styles.lightboxBackdrop}
          onClick={() => setActiveLightbox(null)}
        >
          <div
            className={styles.lightboxCard}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.lightboxCloseBtn}
              onClick={() => setActiveLightbox(null)}
            >
              ✕
            </button>
            <img
              src={getMediaUrl(activeLightbox.image_url, activeLightbox.category === "Maha Aarti" ? "/images/navaratri-aarti.jpg" : "/images/navaratri-ganesha.jpg")}
              alt={activeLightbox.title}
              className={styles.lightboxImage}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = activeLightbox.category === "Maha Aarti" ? "/images/navaratri-aarti.jpg" : "/images/navaratri-ganesha.jpg";
              }}
            />
            <div className={styles.lightboxBody}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span className={styles.photoCategoryBadge}>{activeLightbox.category}</span>
                <span style={{ fontSize: "0.85rem", color: "#f59e0b", fontWeight: 700 }}>
                  Day {activeLightbox.day_number}
                </span>
              </div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", marginBottom: 8 }}>
                {activeLightbox.title}
              </h3>
              <p style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: 1.6 }}>
                {activeLightbox.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          📜 DIVINE BLESSING & POOJA CERTIFICATE MODAL
      ======================================================== */}
      {showBlessingCert && blessingCertData && (
        <div className={styles.certificateModalBackdrop} onClick={() => setShowBlessingCert(false)}>
          <div className={styles.certificateModalWrapper} onClick={(e) => e.stopPropagation()}>
            {/* Action Bar */}
            <div className={styles.certificateActionsBar}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.4rem" }}>📜</span>
                <div>
                  <h4 style={{ color: "#fff", margin: 0, fontSize: "1rem", fontWeight: "800" }}>
                    శ్రీ వినాయక దివ్య పూజా ఆశీర్వచన పత్రం (Blessing Certificate)
                  </h4>
                  <span style={{ color: "#f59e0b", fontSize: "0.75rem" }}>
                    Token: {blessingCertData.token_no}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className={`${styles.certActionBtn} ${styles.certPrintBtn}`}
                >
                  🖨️ Print / Save PDF
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `🪔 *శ్రీ సిద్ధి వినాయక స్వామి వారి దివ్య పూజా ఆశీర్వచన పత్రం - 2026*\n\nభక్తుని పేరు: ${blessingCertData.devotee_name}\nగోత్రం: ${blessingCertData.gotram}\nసేవ: ${blessingCertData.seva_tier}\nతేదీ: ${blessingCertData.seva_date}\nసర్టిఫికేట్ సంఖ్య: ${blessingCertData.token_no}\n\nహిందూ స్వరాజ్ యూత్ వెల్ఫేర్ అసోసియేషన్, జగిత్యాల (Regd. No: 784/2025)\nదర్శనం & సర్టిఫికేట్ డౌన్‌లోడ్: https://hinduswaraj.org/vinayaka-navaratri`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`${styles.certActionBtn} ${styles.certWhatsAppBtn}`}
                >
                  💬 Share on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => setShowBlessingCert(false)}
                  className={`${styles.certActionBtn} ${styles.certCloseBtn}`}
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Royal Golden Certificate Frame */}
            <div className={styles.certificateFrame} id="blessing-certificate-print">
              <div className={styles.certificateInnerBorder}>
                {/* 4 Corners Sacred Ornaments */}
                <span className={`${styles.certCornerDecor} ${styles.certCornerTL}`}>卐</span>
                <span className={`${styles.certCornerDecor} ${styles.certCornerTR}`}>卐</span>
                <span className={`${styles.certCornerDecor} ${styles.certCornerBL}`}>卐</span>
                <span className={`${styles.certCornerDecor} ${styles.certCornerBR}`}>卐</span>

                {/* Header */}
                <div className={styles.certHeader}>
                  <div className={styles.certSacredMantra}>
                    {settings.cert_header_title || "॥ శ్రీ సిద్ధి వినాయక ప్రసన్నః • ఓం శ్రీ గణేశాయ నమః ॥"}
                  </div>
                  <h1 className={styles.certAssocTitle}>
                    {settings.cert_assoc_name || "HINDU SWARAJ YOUTH WELFARE ASSOCIATION"}
                  </h1>
                  <div className={styles.certAssocSub}>
                    {settings.cert_regd_no || "Regd. No: 784/2025 (Govt. of Telangana) • Head Office: H.No. 4-1-140, Vani Nagar, Jagtial - 505327"}
                  </div>
                  <div className={styles.certFestivalBadge}>
                    {settings.cert_festival_name || "🪔 VINAYAKA NAVARATRI SEVA MAHOTSAVAM - 2026 🪔"}
                  </div>
                </div>

                {/* Center Sacred Ganesha & Sanskrit Shloka */}
                <div className={styles.certCenterGanesha}>
                  <img
                    src="/images/navaratri-ganesha.jpg"
                    alt="Lord Ganesha"
                    className={styles.certGaneshaImg}
                  />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "#9a3412", fontStyle: "italic", lineHeight: 1.4 }}>
                      {settings.cert_shloka || "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषు सर्वदा॥"}
                    </div>
                  </div>
                </div>

                {/* Certificate Main Title */}
                <div className={styles.certMainTitle}>
                  <h2>{settings.cert_main_title || "దివ్య గోత్ర నామావళి & పూజా ఆశీర్వచన పత్రం"}</h2>
                  <p>{settings.cert_main_sub || "Official Sacred Seva & Divine Blessings Certificate"}</p>
                </div>

                {/* Devotee Info Grid */}
                <div className={styles.certDevoteeGrid}>
                  <div className={styles.certDevoteeField}>
                    <span className={styles.certFieldLabel}>భక్తుని / యజమాని పేరు (Devotee Name):</span>
                    <span className={styles.certFieldValue}>{blessingCertData.devotee_name}</span>
                  </div>

                  <div className={styles.certDevoteeField}>
                    <span className={styles.certFieldLabel}>గోత్ర నామావళి (Gotram &amp; Nakshatram):</span>
                    <span className={styles.certFieldValue}>
                      {blessingCertData.gotram} {blessingCertData.nakshatram ? `• ${blessingCertData.nakshatram}` : ""}
                    </span>
                  </div>

                  <div className={styles.certDevoteeField}>
                    <span className={styles.certFieldLabel}>నిర్వహించిన పవిత్ర సేవ (Performed Seva):</span>
                    <span className={styles.certFieldValue}>{blessingCertData.seva_tier}</span>
                  </div>

                  <div className={styles.certDevoteeField}>
                    <span className={styles.certFieldLabel}>సేవా మహోత్సవ తేదీ (Date):</span>
                    <span className={styles.certFieldValue}>{blessingCertData.seva_date}</span>
                  </div>

                  <div className={styles.certDevoteeField}>
                    <span className={styles.certFieldLabel}>ప్రాంతం (City / Village):</span>
                    <span className={styles.certFieldValue}>{blessingCertData.city || "Jagtial, Telangana"}</span>
                  </div>

                  <div className={styles.certDevoteeField}>
                    <span className={styles.certFieldLabel}>సర్టిఫికేట్ సంఖ్య (Token ID):</span>
                    <span className={styles.certFieldValue} style={{ color: "#b45309" }}>{blessingCertData.token_no}</span>
                  </div>
                </div>

                {/* Sacred Blessing Verse */}
                <div className={styles.certBlessingVerse}>
                  <div className={styles.certBlessingVerseTelugu}>
                    "{settings.cert_blessing_telugu || "శ్రీ సిద్ధి వినాయక స్వామి వారి దివ్య కృపా కటాక్షములచే మీ సంకల్పములన్నియు సిద్ధింపబడి, ఆయురారోగ్య ఐశ్వర్యాభివృద్ధి, సకల కార్యజయములు, సదా సుఖశాంతులు కలుగుగాక!"}"
                  </div>
                  <p className={styles.certBlessingVerseEnglish}>
                    {settings.cert_blessing_english || "May Lord Vighnaharta Ganesha shower his supreme blessings, remove all obstacles, and bestow peace, longevity, sound health, and boundless prosperity upon you and your entire family."}
                  </p>
                </div>

                {/* Footer with Priest & President Seal / Signatures */}
                <div className={styles.certFooter}>
                  <div className={styles.certSignBlock}>
                    <div style={{ fontSize: "1.5rem" }}>🪔</div>
                    <div className={styles.certSignLine}>
                      {settings.cert_priest_name || "ప్రధాన అర్చకులు (Chief Archaka)"}
                    </div>
                    <div className={styles.certSignRole}>
                      {settings.cert_priest_role || "Pandal Puja Committee"}
                    </div>
                  </div>

                  <div className={styles.certOfficialSealBlock}>
                    <div className={styles.certOfficialSealBadge}>
                      <span>{settings.cert_seal_text ? settings.cert_seal_text.split("•")[0] : "HINDU SWARAJ"}</span>
                      <span style={{ fontSize: "0.55rem" }}>REGD. 784/2025</span>
                      <span>★ JAGTIAL ★</span>
                      <span>SEAL</span>
                    </div>
                  </div>

                  <div className={styles.certSignBlock}>
                    <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#78350f" }}>
                      {settings.cert_president_name || "Mukesh Kokkula"}
                    </div>
                    <div className={styles.certSignLine}>
                      {settings.cert_president_role || "అధ్యక్షుడు (President), Hindu Swaraj Youth Association"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔔 SACRED DEVOTIONAL AUDIO & TEMPLE BELL DOCK */}
      {settings.bg_audio_active !== false && (
        <div className={styles.devotionalAudioDock}>
          <button
            type="button"
            onClick={playTempleBell}
            className={`${styles.bellBtn} ${isBellRinging ? styles.bellRinging : ""}`}
            title="Ring Sacred Temple Bell (ఘంటానాదం)"
          >
            🔔
          </button>

          <div className={styles.audioTrackInfo}>
            <span className={styles.audioTrackTitle}>
              {isPlayingMantra
                ? `🎵 ${settings.bg_audio_title || "Om Gam Ganapataye"}`
                : "🪔 Temple Bells & Devotional Song"}
            </span>
            <span className={styles.audioTrackSub}>
              {isPlayingMantra
                ? settings.bg_audio_artist || "Sacred Vedic Chants"
                : "Tap bell / Play sacred audio"}
            </span>
          </div>

          {isPlayingMantra && (
            <div className={styles.equalizerWaves}>
              <div className={styles.waveBar}></div>
              <div className={styles.waveBar}></div>
              <div className={styles.waveBar}></div>
              <div className={styles.waveBar}></div>
            </div>
          )}

          <button
            type="button"
            onClick={toggleDevotionalMusic}
            className={styles.audioControlBtn}
            title={isPlayingMantra ? "Pause Devotional Music" : "Play Continuous Devotional Songs"}
          >
            {isPlayingMantra ? "⏸" : "▶"}
          </button>
        </div>
      )}

      <audio
        ref={audioRef}
        loop
        src={getAudioUrl(settings.bg_audio_url)}
        preload="none"
      />
    </div>
  );
}
