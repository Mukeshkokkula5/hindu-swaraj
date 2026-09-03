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
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setServicesDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setServicesDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setServicesDropdownOpen(false);
    }, 220);
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`} id="navbar">
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logo}>
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
          <Link href="/#home" className={styles.navLink} onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link href="/#about" className={styles.navLink} onClick={() => setMenuOpen(false)}>
            About Us
          </Link>

          {/* ================= 🚩 SERVICES & SEVA MEGA DROPDOWN ================= */}
          <div
            className={styles.dropdownContainer}
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              className={`${styles.navLink} ${styles.navLinkHighlight}`}
              onClick={(e) => {
                e.stopPropagation();
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                setServicesDropdownOpen((prev) => !prev);
              }}
            >
              <span>🚩</span>
              <span>సేవా విభాగాలు (Services)</span>
              <span style={{ fontSize: '0.65rem', transition: 'transform 0.2s', transform: servicesDropdownOpen ? 'rotate(180deg)' : 'none' }}>
                ▼
              </span>
            </button>

            {servicesDropdownOpen && (
              <div className={styles.dropdownMenu}>
                {SEVA_SERVICES.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className={styles.dropdownItemCard}
                    onClick={() => {
                      setServicesDropdownOpen(false);
                      setMenuOpen(false);
                    }}
                  >
                    <div className={styles.dropdownIconWrap}>{item.icon}</div>
                    <div className={styles.dropdownItemContent}>
                      <div className={styles.dropdownItemTitleRow}>
                        <span className={styles.dropdownItemTitle}>{item.title}</span>
                        <span className={`${styles.dropdownItemBadge} ${item.badgeClass}`}>
                          {item.badge}
                        </span>
                      </div>
                      <span className={styles.dropdownItemDesc}>{item.desc}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/#activities" className={styles.navLink} onClick={() => setMenuOpen(false)}>
            Activities
          </Link>
          <Link href="/#leadership" className={styles.navLink} onClick={() => setMenuOpen(false)}>
            Team
          </Link>
          <Link href="/#gallery" className={styles.navLink} onClick={() => setMenuOpen(false)}>
            Gallery
          </Link>
          <Link href="/#footer" className={styles.navLink} onClick={() => setMenuOpen(false)}>
            Contact
          </Link>

          <Link href="/admin" className={styles.loginBtn} onClick={() => setMenuOpen(false)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            Login
          </Link>

          <Link href="/#donate" className={`btn btn-saffron ${styles.donateBtn}`} onClick={() => setMenuOpen(false)}>
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
    </nav>
  );
}
