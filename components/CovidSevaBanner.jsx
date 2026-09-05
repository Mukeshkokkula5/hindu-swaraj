"use client";

import Link from "next/link";
import styles from "./CovidSevaBanner.module.css";

export default function CovidSevaBanner() {
  return (
    <section className={styles.bannerSection}>
      <div className={styles.bannerCard}>
        <div className={styles.glowDecor}></div>

        <div className={styles.bannerLeft}>
          <div className={styles.badgeEmblem} title="50 Days Corona Seva Milestone">
            🍲
          </div>

          <div className={styles.bannerContent}>
            <div className={styles.pillTag}>
              <span>🌟 Historical Seva Milestone</span>
              <span>•</span>
              <span>COVID-19 Relief</span>
            </div>

            <h3 className={styles.bannerTitle}>
              కరోనా సమయంలో 50 రోజుల నిరంతర అన్నదానం &mdash;{" "}
              <span className={styles.bannerTitleAccent}>50 Days Food Seva Mahayagnam</span>
            </h3>

            <p className={styles.bannerSubtitle}>
              లాక్‌డౌన్ వేళ జగిత్యాలలో ఆకలితో అలమటించిన నిరుపేదలు, వలస కూలీలు మరియు ఆసుపత్రి రోగులకు వరుసగా 50 రోజుల పాటు వేలాది భోజన ప్యాకెట్లను అందించిన పవిత్ర సేవా యజ్ఞం.
            </p>

            <div className={styles.statsPillRow}>
              <span className={styles.miniStatPill}>
                <span>⏳</span> 50 Consecutive Days
              </span>
              <span className={styles.miniStatPill}>
                <span>🍲</span> 50,000+ Meals
              </span>
              <span className={styles.miniStatPill}>
                <span>📰</span> News Clippings &amp; Video
              </span>
              <span className={styles.miniStatPill}>
                <span>📜</span> Govt. Certificates
              </span>
            </div>
          </div>
        </div>

        <div className={styles.bannerRight}>
          <Link href="/covid-seva" className={styles.ctaBtn}>
            <span>View Full Story &amp; Video</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
