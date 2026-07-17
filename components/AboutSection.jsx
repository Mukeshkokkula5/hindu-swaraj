'use client';
import Image from 'next/image';
import styles from './AboutSection.module.css';

export default function AboutSection() {
  return (
    <section className={styles.about} id="about">
      <div className={`container ${styles.aboutContainer}`}>
        <div className={styles.aboutLeft}>
          <span className="section-label">ABOUT</span>
          <h2 className="section-title">HINDU SWARAJ YOUTH</h2>
          <p className={styles.aboutText}>
            Hindu Swaraj Youth Welfare Association is a registered voluntary
            organization dedicated to youth empowerment and social service.
            Our mission is to build a strong, responsible and cultured society
            through seva, sanskar and sangathan.
          </p>
          <p className={styles.aboutText}>
            Founded with the vision of Chhatrapati Shivaji Maharaj&apos;s ideals of
            self-governance and social justice, we strive to create a network of
            dedicated young leaders who serve the nation through various social
            welfare activities.
          </p>
          <a href="#activities" className={`btn btn-outline-saffron ${styles.aboutBtn}`}>
            Know More About Us
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
          </a>
        </div>
        <div className={styles.aboutRight}>
          <div className={styles.imageWrapper}>
            <Image
              src="/images/about-volunteers.png"
              alt="Hindu Swaraj Youth Volunteers"
              width={560}
              height={380}
              className={styles.aboutImage}
            />
            <div className={styles.floatingBadge}>
              <span className={styles.badgeNumber}>5+</span>
              <span className={styles.badgeText}>Years of Service<br/>to Society</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
