'use client';
import Image from 'next/image';
import styles from './LeadershipSection.module.css';

const leaders = [
  { name: 'Rajesh Kumar', role: 'President', image: '/images/leader-president.png' },
  { name: 'Suresh Reddy', role: 'Vice President', image: '/images/leader-vp.png' },
  { name: 'Anil Sharma', role: 'Secretary', image: '/images/leader-secretary.png' },
  { name: 'Vikram Patel', role: 'Treasurer', image: '/images/leader-treasurer.png' },
  { name: 'Karthik Rao', role: 'Committee Member', image: '/images/leader-committee.png' },
];

export default function LeadershipSection() {
  return (
    <section className={styles.leadership} id="leadership">
      <div className="container">
        <div className={styles.header}>
          <span className="section-label">OUR TEAM</span>
          <h2 className="section-title">Leadership &amp; Committee</h2>
          <p className="section-subtitle">
            Meet the dedicated leaders driving our mission forward with passion and commitment.
          </p>
        </div>

        <div className={styles.leadersGrid}>
          {leaders.map((leader, i) => (
            <div key={i} className={styles.leaderCard}>
              <div className={styles.imageWrap}>
                <Image
                  src={leader.image}
                  alt={leader.name}
                  width={280}
                  height={320}
                  className={styles.leaderImage}
                />
                <div className={styles.imageOverlay}>
                  <div className={styles.socialLinks}>
                    <a href="#" className={styles.socialIcon} aria-label="Facebook">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                    </a>
                    <a href="#" className={styles.socialIcon} aria-label="Instagram">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    </a>
                  </div>
                </div>
              </div>
              <div className={styles.leaderInfo}>
                <h3 className={styles.leaderName}>{leader.name}</h3>
                <span className={styles.leaderRole}>{leader.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
