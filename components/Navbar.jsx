'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Navbar.module.css';

const SEVA_SERVICES = [
  {
    title: 'ఆపద్బాంధవ ఎమర్జెన్సీ సేవా',
    desc: '100% Direct Emergency Medical Aid & Relief',
    href: '/aapadbandhava',
    icon: '🚨',
    badge: 'EMERGENCY',
    badgeClass: styles.badgeEmergency,
  },
  {
    title: 'రక్తదాన సేవా డెస్క్',
    desc: '24/7 Rare Donor Network & Blood Camps',
    href: '/blood-donation',
    icon: '🩸',
    badge: '24/7 HELPLINE',
    badgeClass: styles.badgeBlood,
  },
  {
    title: 'శ్రీ వినాయక నవరాత్రుల మహోత్సవం',
    desc: 'Virtual Aarti, E-Hundi & Live Darshan',
    href: '/navaratri',
    icon: '🪔',
    badge: 'LIVE UTSAV',
    badgeClass: styles.badgeNavaratri,
  },
  {
    title: 'HSY కమ్యూనిటీ సోషల్ ఫీడ్',
    desc: 'Youth Photos, Stories, Chat & Video Calls',
    href: '/community',
    icon: '📸',
    badge: 'NEW FEED',
    badgeClass: styles.badgeCommunity,
  },
  {
    title: 'హిందూ స్వరాజ్ ప్రజా వేదిక',
    desc: '100% Transparency, Audit & Certificate Validator',
    href: '/public',
    icon: '🏛️',
    badge: 'PUBLIC AUDIT',
    badgeClass: styles.badgeNavaratri,
  },
  {
    title: 'వాలంటీర్ రిజిస్ట్రేషన్',
    desc: 'Join as an Active Hindu Swaraj Warrior',
    href: '/volunteer',
    icon: '🤝',
    badge: 'ENROLL',
    badgeClass: styles.badgeVolunteer,
  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesHubOpen, setServicesHubOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock scroll and listen for ESC key when Hub or Mobile Menu is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setServicesHubOpen(false);
        setMenuOpen(false);
      }
    };
    if (servicesHubOpen || menuOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [servicesHubOpen, menuOpen]);

  // Clean up duplicate hashes on load if any exist
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("#home")) {
      history.replaceState(null, "", window.location.pathname || "/");
    }
  }, []);

  const handleNavClick = (e, targetHash) => {
    setMenuOpen(false);
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      e.preventDefault();
      if (!targetHash) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        history.replaceState(null, "", "/");
        return;
      }
      const el = document.querySelector(targetHash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        history.replaceState(null, "", targetHash);
      }
    }
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`} id="navbar">
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logo} onClick={(e) => handleNavClick(e, "")}>
          <Image
            src="/images/logo_v2.png"
            alt="Hindu Swaraj Youth"
            width={44}
            height={44}
            className={styles.logoImg}
          />
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>HINDU SWARAJ YOUTH</span>
            <span className={styles.logoSubtitle}>WELFARE ASSOCIATION</span>
          </div>
        </Link>

        <div className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}>
          <Link href="/" className={styles.navLink} onClick={(e) => handleNavClick(e, "")}>
            Home
          </Link>
          <Link href="/#about" className={styles.navLink} onClick={(e) => handleNavClick(e, "#about")}>
            About Us
          </Link>

          {/* ================= 🚩 GRAND ROYAL SEVA HUB BUTTON ================= */}
          <button
            type="button"
            className={`${styles.navLink} ${styles.navLinkHighlight}`}
            onClick={(e) => {
              e.stopPropagation();
              setServicesHubOpen(true);
              setMenuOpen(false);
            }}
            title="Explore all Hindu Swaraj Welfare Services"
          >
            <span>🚩</span>
            <span>సేవా విభాగాలు (Services)</span>
            <span style={{ fontSize: "0.65rem", marginLeft: "2px" }}>
              ✦
            </span>
          </button>

          <Link href="/#activities" className={styles.navLink} onClick={(e) => handleNavClick(e, "#activities")}>
            Activities
          </Link>
          <Link href="/#leadership" className={styles.navLink} onClick={(e) => handleNavClick(e, "#leadership")}>
            Team
          </Link>
          <Link href="/#gallery" className={styles.navLink} onClick={(e) => handleNavClick(e, "#gallery")}>
            Gallery
          </Link>
          <Link href="/#footer" className={styles.navLink} onClick={(e) => handleNavClick(e, "#footer")}>
            Contact
          </Link>

          <Link href="/admin" className={styles.loginBtn} onClick={() => setMenuOpen(false)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            Login
          </Link>

          <Link href="/#donate" className={`btn btn-saffron ${styles.donateBtn}`} onClick={(e) => handleNavClick(e, "#donate")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            Donate Now
          </Link>
        </div>

        <button
          className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Drawer Backdrop Overlay */}
      {menuOpen && (
        <div
          className={styles.navOverlay}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ================= 👑 GRAND ROYAL SEVA HUB MODAL ================= */}
      {servicesHubOpen && (
        <div
          className={styles.hubOverlay}
          onClick={() => setServicesHubOpen(false)}
        >
          <div
            className={styles.hubModal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* HEADER */}
            <div className={styles.hubHeader}>
              <div className={styles.hubBrandBlock}>
                <Image
                  src="/images/logo_v2.png"
                  alt="HSYWA Emblem"
                  width={54}
                  height={54}
                  className={styles.hubLogoImg}
                />
                <div>
                  <h3 className={styles.hubTitleMain}>
                    <span>🚩</span>
                    <span>హిందూ స్వరాజ్ అధికారిక సేవా విభాగాలు</span>
                  </h3>
                  <div className={styles.hubTitleSub}>
                    HSYWA Official Welfare, Spiritual & Emergency Initiatives
                  </div>
                  <span className={styles.hubBadgeRegd}>
                    Govt. Regd. Society No: 784/2025 • Jagtial, Telangana
                  </span>
                </div>
              </div>
              <button
                type="button"
                className={styles.hubCloseBtn}
                onClick={() => setServicesHubOpen(false)}
                aria-label="Close Seva Hub"
              >
                ✕
              </button>
            </div>

            {/* 6 GRAND SERVICE CARDS GRID */}
            <div className={styles.hubGrid}>
              {SEVA_SERVICES.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className={styles.hubCard}
                  onClick={() => setServicesHubOpen(false)}
                >
                  <div className={styles.hubCardIcon}>{item.icon}</div>
                  <div className={styles.hubCardInfo}>
                    <div className={styles.hubCardTitleRow}>
                      <span className={styles.hubCardTitle}>{item.title}</span>
                      <span className={`${styles.dropdownItemBadge} ${item.badgeClass}`}>
                        {item.badge}
                      </span>
                    </div>
                    <span className={styles.hubCardDesc}>{item.desc}</span>
                  </div>
                  <div className={styles.hubCardArrow}>→</div>
                </Link>
              ))}
            </div>

            {/* FOOTER */}
            <div className={styles.hubFooter}>
              <div>
                📞 <b>24/7 Helpline:</b> +91 84998 78425 &nbsp;|&nbsp; 📍 <b>Regd. Office:</b> H.No. 4-1-140, Vani Nagar, Jagtial
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                Press <b>ESC</b> or click outside to close
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
