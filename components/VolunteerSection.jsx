'use client';
import Image from 'next/image';
import styles from './VolunteerSection.module.css';

const quickLinks = [
  { icon: '📋', title: 'Membership', sub: 'Register Now' },
  { icon: '❤️', title: 'Donate', sub: 'Make Impact' },
  { icon: '📸', title: 'Gallery', sub: 'View Photos' },
  { icon: '📊', title: 'Transparency', sub: 'View Reports' },
];

export default function VolunteerSection() {
  return (
    <section className={styles.volunteer} id="volunteer">
      <div className={`container ${styles.volunteerGrid}`}>
        <div className={styles.volunteerLeft}>
          <span className={styles.tagline}>TOGETHER WE CAN</span>
          <h2 className={styles.headline}>BUILD A STRONGER NATION</h2>
          <p className={styles.subtext}>
            Join us in our journey of seva, sanskar and sangathan.
          </p>
          <a href="#" className="btn btn-saffron">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            Join Our Mission
          </a>
        </div>

        <div className={styles.volunteerRight}>
          <div className={styles.logoSection}>
            <Image
              src="/images/logo.png"
              alt="Hindu Swaraj Youth Logo"
              width={140}
              height={140}
              className={styles.logoImage}
            />
          </div>

          <div className={styles.quickLinksSection}>
            <h3 className={styles.quickLinksTitle}>QUICK LINKS</h3>
            <div className={styles.quickLinksGrid}>
              {quickLinks.map((link, i) => (
                <a key={i} href={`#${link.title.toLowerCase()}`} className={styles.quickLinkCard}>
                  <span className={styles.quickLinkIcon}>{link.icon}</span>
                  <span className={styles.quickLinkTitle}>{link.title}</span>
                  <span className={styles.quickLinkSub}>{link.sub}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
