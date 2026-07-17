'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './Navbar.module.css';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About Us', href: '#about' },
  { label: 'Activities', href: '#activities' },
  { label: 'Donate', href: '#donate' },
  { label: 'Contact', href: '#footer' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`} id="navbar">
      <div className={styles.navContainer}>
        <a href="#home" className={styles.logo}>
          <Image src="/images/logo_v2.png" alt="Hindu Swaraj Youth" width={48} height={48} className={styles.logoImg} />
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>HINDU SWARAJ YOUTH</span>
            <span className={styles.logoSubtitle}>WELFARE ASSOCIATION</span>
          </div>
        </a>

        <div className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={styles.navLink}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a href="#donate" className={`btn btn-saffron ${styles.donateBtn}`} onClick={() => setMenuOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            Donate Now
          </a>
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
