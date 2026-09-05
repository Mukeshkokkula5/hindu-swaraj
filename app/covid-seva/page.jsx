"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000"
).replace(/\/$/, "");

// Helper to resolve media URLs
const getMediaUrl = (url, fallback = "/images/activity-disaster.png") => {
  if (!url || !String(url).trim()) return fallback;
  const trimmed = String(url).trim();
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/uploads/")) return `${API_BASE_URL}${trimmed}`;
  if (trimmed.startsWith("uploads/")) return `${API_BASE_URL}/${trimmed}`;
  return trimmed;
};

// Universal YouTube embed URL parser
const getYouTubeEmbedUrl = (urlOrId) => {
  if (!urlOrId) return "";
  const trimmed = urlOrId.trim();
  if (trimmed.includes("youtube.com/embed/") || trimmed.includes("youtube-nocookie.com/embed/")) {
    return trimmed;
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return `https://www.youtube.com/embed/${trimmed}?autoplay=0&rel=0`;
  }
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=0&rel=0`;
  }
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=0&rel=0`;
  }
  const liveMatch = trimmed.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
  if (liveMatch && liveMatch[1]) {
    return `https://www.youtube.com/embed/${liveMatch[1]}?autoplay=0&rel=0`;
  }
  return "";
};

// Default initial data if backend not populated yet
const DEFAULT_DATA = {
  hero_title: "50 DAYS NON-STOP CORONA FOOD SEVA MAHAYAGNAM",
  hero_subtitle: "Standing strong for Jagtial during the COVID-19 lockdown — 50 consecutive days of hot meals, groceries, and medical relief.",
  story_telugu: "కరోనా విపత్కర లాక్‌డౌన్ సమయంలో ఆకలితో అలమటించిన వేలాది మంది పేదలకు, వలస కూలీలకు, పారిశుద్ధ్య కార్మికులకు మరియు ఆసుపత్రి రోగులకు హిందూ స్వరాజ్ యూత్ ఆధ్వర్యంలో వరుసగా 50 రోజుల పాటు నిరంతరాయంగా పౌష్టికాహార భోజన ప్యాకెట్లను ఉచితంగా పంపిణీ చేసిన పవిత్ర సేవా యజ్ఞం.",
  story_english: "When the entire nation stood still in lockdown, our dedicated youth stepped onto the streets risking their lives to ensure no soul in Jagtial went to sleep hungry. For 50 unbroken days, fresh nutritious food was cooked, packed, and delivered to doorsteps, quarantine centres, hospitals, and highways.",
  youtube_url: "",
  video_title: "50 Days Corona Annadanam Documentary - Hindu Swaraj Youth, Jagtial",
  stat_days: 50,
  stat_meals: "50,000+",
  stat_volunteers: "100+",
  stat_families: "5,000+",
  photos: [
    { id: 1, title: "Mass Annadanam Preparation", caption: "Volunteers preparing fresh hot meals daily at 5:00 AM", image_url: "/images/medical-camp/photo-1.jpg" },
    { id: 2, title: "Hygienic Food Packaging", caption: "Packing nutritious food packets with sanitization & safety protocols", image_url: "/images/medical-camp/photo-2.jpg" },
    { id: 3, title: "Frontline Street Distribution", caption: "Reaching migrant workers, homeless persons, and daily wagers across Jagtial", image_url: "/images/medical-camp/photo-4.jpg" },
    { id: 4, title: "Hospital & Quarantine Aid", caption: "Supplying meals and drinking water to medical staff & patient attendants", image_url: "/images/medical-camp/photo-5.jpg" },
  ],
  newspaper_clippings: [
    { id: 1, paper_name: "Eenadu Daily", date_str: "April 2020", headline: "జగిత్యాలలో ఆకలి తీరుస్తున్న హిందూ స్వరాజ్ యూత్ అన్నదానం", snippet: "లాక్‌డౌన్ నిబంధనలు పాటిస్తూ నిరుపేదలకు రోజూ భోజన ప్యాకెట్లు పంపిణీ చేస్తున్న యువకులు...", image_url: "/images/activity-disaster.png" },
    { id: 2, paper_name: "Sakshi Daily", date_str: "May 2020", headline: "కరోనా వేళ నిరంతర అన్నదాతలు: 50 రోజులు పూర్తి", snippet: "వలస కూలీలు, పారిశుద్ధ్య కార్మికులు ఆకలితో ఉండకూడదనే సంకల్పంతో సేవలందించిన అసోసియేషన్...", image_url: "/images/activity-disaster.png" },
    { id: 3, paper_name: "Namasthe Telangana", date_str: "May 2020", headline: "యువత సమాజ సేవకు నిదర్శనం హిందూ స్వరాజ్ యూత్", snippet: "కరోనా వారియర్స్‌గా నిలిచిన జగిత్యాల యువతకు అధికారుల ప్రశంసలు...", image_url: "/images/activity-disaster.png" },
  ],
  certificates: [
    { id: 1, title: "District Administration Appreciation", issuer: "District Collectorate & Magistrate, Jagtial", year: "2020", description: "Letter of Commendation for outstanding community relief during COVID-19 lockdown" },
    { id: 2, title: "Corona Warrior Award", issuer: "Municipal Council & Commissioner, Jagtial", year: "2020", description: "Special recognition for 50 Days unbroken Food Donation and sanitation drive" },
    { id: 3, title: "Police Department Honor Letter", issuer: "Superintendent of Police, Jagtial District", year: "2020", description: "Certificate of Appreciation for maintaining discipline & helping frontline emergency services" },
  ],
};

export default function CovidSevaPage() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [lightbox, setLightbox] = useState(null); // { title, image_url, caption }

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`${API_BASE_URL}/covid-seva/public`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setData((prev) => ({
              ...prev,
              ...json.data,
              photos: json.data.photos && json.data.photos.length > 0 ? json.data.photos : prev.photos,
              newspaper_clippings: json.data.newspaper_clippings && json.data.newspaper_clippings.length > 0 ? json.data.newspaper_clippings : prev.newspaper_clippings,
              certificates: json.data.certificates && json.data.certificates.length > 0 ? json.data.certificates : prev.certificates,
            }));
          }
        }
      } catch (err) {
        console.warn("Using default covid-seva fallback data");
      }
    }
    loadData();
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const embedUrl = getYouTubeEmbedUrl(data.youtube_url);

  return (
    <div className={styles.pageContainer}>
      <Navbar />

      {/* =====================================================
          1. HERO SECTION
      ===================================================== */}
      <section className={styles.heroSection}>
        <div className={styles.heroGlow}></div>
        <div className="container">
          <div className={styles.heroBadge}>
            <span>🚩</span>
            <span>Historical Seva Milestone • COVID-19 Relief</span>
          </div>

          <h1 className={styles.heroTitle}>
            50 DAYS NON-STOP <br />
            <span className={styles.heroTitleAccent}>CORONA FOOD SEVA MAHAYAGNAM</span>
          </h1>

          <p className={styles.heroSubtitleTelugu}>
            &ldquo;కరోనా విపత్కర సమయంలో జగిత్యాలలో వరుసగా 50 రోజుల పాటు నిరంతరాయంగా వేలాది మందికి ఆకలి తీర్చిన పవిత్ర అన్నదాన యజ్ఞం&rdquo;
          </p>

          <p className={styles.heroSubtitleEnglish}>
            {data.hero_subtitle}
          </p>

          <div className={styles.heroActionRow}>
            {embedUrl && (
              <a href="#video-documentary" className={styles.btnPrimary}>
                <span>▶ Watch Video Documentary</span>
              </a>
            )}
            <a href="#press-clippings" className={styles.btnOutline}>
              <span>📰 View Newspaper Clippings</span>
            </a>
            <a href="#photo-archive" className={styles.btnOutline}>
              <span>📸 Service Photos Archive</span>
            </a>
          </div>
        </div>
      </section>

      {/* =====================================================
          2. IMPACT STATS ROW
      ===================================================== */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⏳</div>
            <div className={styles.statValue}>{data.stat_days}</div>
            <div className={styles.statLabel}>Consecutive Days</div>
            <div className={styles.statSub}>Without a single day break</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>🍲</div>
            <div className={styles.statValue}>{data.stat_meals}</div>
            <div className={styles.statLabel}>Meals Distributed</div>
            <div className={styles.statSub}>Hygienic fresh hot food</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statValue}>{data.stat_volunteers}</div>
            <div className={styles.statLabel}>Youth Warriors</div>
            <div className={styles.statSub}>Serving on frontlines</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>🏡</div>
            <div className={styles.statValue}>{data.stat_families}</div>
            <div className={styles.statLabel}>Families Supported</div>
            <div className={styles.statSub}>With food &amp; ration kits</div>
          </div>
        </div>
      </section>

      {/* =====================================================
          3. VIDEO DOCUMENTARY SECTION (IF YOUTUBE URL PROVIDED)
      ===================================================== */}
      {embedUrl && (
        <section className={styles.sectionWrap} id="video-documentary">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionPill}>🎥 Video Documentary</span>
            <h2 className={styles.sectionTitle}>Corona Seva Live Footage &amp; Documentary</h2>
            <p className={styles.sectionDesc}>
              Witness the frontline courage of Hindu Swaraj Youth volunteers who prepared and distributed hot meals across Jagtial during peak lockdown.
            </p>
          </div>

          <div className={styles.videoCard}>
            <div className={styles.videoResponsiveWrap}>
              <iframe
                src={embedUrl}
                title={data.video_title || "Covid Seva Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className={styles.videoFooter}>
              <div className={styles.videoTitle}>{data.video_title}</div>
              <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
                📍 Jagtial, Telangana • Official Hindu Swaraj Youth Footage
              </span>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          4. THE SACRED STORY & JOURNEY
      ===================================================== */}
      <section className={styles.sectionWrap}>
        <div className={styles.storyGrid}>
          <div className={styles.storyCard}>
            <span className={styles.sectionPill}>📖 The Historic Journey</span>
            <h3 style={{ fontSize: "1.6rem", fontWeight: "900", color: "#0f172a", marginBottom: "16px" }}>
              How 50 Days of Compassion Saved Lives in Jagtial
            </h3>
            <p className={styles.storyQuote}>
              &ldquo;{data.story_telugu}&rdquo;
            </p>
            <p className={styles.storyPara}>
              {data.story_english}
            </p>
            <p className={styles.storyPara}>
              Every morning started before dawn with massive kitchen fires, sanitised packing lines, and safety measures. Our volunteer bikers and auto convoys navigated strict barricades with official permission passes, bringing warm food to isolation wards, daily wagers stranded at bus stops, and thousands walking on highways.
            </p>
          </div>

          <div className={styles.timelineList}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineBadge}>Phase 1</div>
              <div className={styles.timelineContent}>
                <h4>Day 1 - 15: Emergency Response</h4>
                <p>Immediate setup of central community kitchen. Reaching migrant workers, homeless individuals, and sanitation staff.</p>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineBadge}>Phase 2</div>
              <div className={styles.timelineContent}>
                <h4>Day 16 - 35: Scaling Up &amp; Hospital Relief</h4>
                <p>Delivering 1,200+ food packets twice daily to District Govt Hospital, COVID isolation centers, and police checkpoints.</p>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineBadge}>Phase 3</div>
              <div className={styles.timelineContent}>
                <h4>Day 36 - 50: Ration Kits &amp; Milestone</h4>
                <p>Supplying essential grocery kits to 5,000+ vulnerable households and completing the glorious 50-day non-stop milestone.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          5. SERVICE PHOTOS ARCHIVE
      ===================================================== */}
      <section className={styles.sectionWrap} id="photo-archive">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionPill}>📸 Photographic Archive</span>
          <h2 className={styles.sectionTitle}>Moments from the 50-Day Frontline Seva</h2>
          <p className={styles.sectionDesc}>
            Real photographs documenting the cooking, packaging, hygiene protocols, and street distribution by our youth volunteers.
          </p>
        </div>

        <div className={styles.photoGrid}>
          {data.photos.map((photo, idx) => (
            <div
              key={photo.id || idx}
              className={styles.galleryCard}
              onClick={() =>
                setLightbox({
                  title: photo.title || `Photo ${idx + 1}`,
                  image_url: getMediaUrl(photo.image_url),
                  caption: photo.caption || photo.title,
                })
              }
            >
              <div className={styles.galleryImgWrap}>
                <img
                  src={getMediaUrl(photo.image_url)}
                  alt={photo.title || "Covid Seva"}
                  className={styles.galleryImg}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/medical-camp/photo-1.jpg";
                  }}
                />
                <div className={styles.galleryOverlay}>
                  <span className={styles.galleryCaption}>{photo.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          6. NEWSPAPER CLIPPINGS & PRESS COVERAGE
      ===================================================== */}
      <section className={styles.sectionWrap} id="press-clippings">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionPill}>📰 Press &amp; Media</span>
          <h2 className={styles.sectionTitle}>Newspaper Clippings &amp; Public Acclaim</h2>
          <p className={styles.sectionDesc}>
            State and district Telugu newspapers featured the 50-day Annadanam movement prominently as an inspiring model of youth social service.
          </p>
        </div>

        <div className={styles.clippingsGrid}>
          {data.newspaper_clippings.map((clip, idx) => (
            <div
              key={clip.id || idx}
              className={styles.clippingCard}
              onClick={() =>
                setLightbox({
                  title: `${clip.paper_name} - ${clip.headline}`,
                  image_url: getMediaUrl(clip.image_url),
                  caption: `${clip.paper_name} (${clip.date_str}) • ${clip.headline}: ${clip.snippet}`,
                })
              }
            >
              <div className={styles.clippingImgWrap}>
                <img
                  src={getMediaUrl(clip.image_url)}
                  alt={clip.headline}
                  className={styles.clippingImg}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/activity-disaster.png";
                  }}
                />
              </div>
              <div className={styles.clippingBody}>
                <div className={styles.clippingSourceRow}>
                  <span>{clip.paper_name}</span>
                  <span>{clip.date_str}</span>
                </div>
                <h4 className={styles.clippingHeadline}>{clip.headline}</h4>
                <p className={styles.clippingSnippet}>{clip.snippet}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          7. APPRECIATION CERTIFICATES & OFFICIAL HONORS
      ===================================================== */}
      <section className={styles.sectionWrap} id="certificates">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionPill}>🎖️ Official Honors</span>
          <h2 className={styles.sectionTitle}>Appreciation Certificates &amp; Recognitions</h2>
          <p className={styles.sectionDesc}>
            Letters of commendation from the District Administration, Police Department, and Municipal authorities acknowledging Hindu Swaraj Youth.
          </p>
        </div>

        <div className={styles.certificatesGrid}>
          {data.certificates.map((cert, idx) => (
            <div
              key={cert.id || idx}
              className={styles.certCard}
              onClick={() => {
                if (cert.image_url) {
                  setLightbox({
                    title: cert.title,
                    image_url: getMediaUrl(cert.image_url),
                    caption: `${cert.title} • Issued by ${cert.issuer} (${cert.year})`,
                  });
                }
              }}
            >
              <div className={styles.certIconWrap}>📜</div>
              <div className={styles.certInfo}>
                <h4>{cert.title}</h4>
                <p>{cert.description}</p>
                <span className={styles.certIssuer}>🏛️ {cert.issuer} ({cert.year})</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          8. CALL TO ACTION: JOIN OR SUPPORT SEVA
      ===================================================== */}
      <section className="container">
        <div className={styles.ctaSection}>
          <h3 className={styles.ctaTitle}>
            Inspired by 14+ Years of Selfless Social Service?
          </h3>
          <p className={styles.ctaDesc}>
            Join Hindu Swaraj Youth Welfare Association as a dedicated volunteer or contribute to our ongoing emergency medical, blood donation, and community relief initiatives.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/volunteer" className={styles.btnPrimary}>
              🤝 Become a Seva Volunteer
            </Link>
            <Link href="/#donate" className={styles.btnOutline}>
              💳 Support Ongoing Seva
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          9. INTERACTIVE LIGHTBOX MODAL
      ===================================================== */}
      {lightbox && (
        <div
          className={styles.lightboxBackdrop}
          onClick={() => setLightbox(null)}
        >
          <div
            className={styles.lightboxModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.lightboxHeader}>
              <div className={styles.lightboxTitle}>
                <span>🔍</span>
                <span>{lightbox.title}</span>
              </div>
              <button
                type="button"
                className={styles.lightboxCloseBtn}
                onClick={() => setLightbox(null)}
                aria-label="Close Preview"
              >
                ✕
              </button>
            </div>

            <div className={styles.lightboxImgWrap}>
              <img
                src={lightbox.image_url}
                alt={lightbox.title}
                className={styles.lightboxImg}
              />
            </div>

            {lightbox.caption && (
              <div className={styles.lightboxCaption}>
                {lightbox.caption}
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
