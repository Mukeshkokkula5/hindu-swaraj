"use client";
import { useEffect, useRef } from "react";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const scrollY = window.scrollY;
      const bg = heroRef.current.querySelector(`.${styles.heroBgImage}`);
      if (bg) {
        bg.style.transform = `translateY(${scrollY * 0.15}px) scale(1.05)`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className={styles.hero} id="home" ref={heroRef}>
      {/* Full background image */}
      <div className={styles.heroBg}>
        <div className={styles.heroBgImage}></div>
        <div className={styles.gradientOverlay}></div>
      </div>

      {/* Sanskrit Quote Banner */}
      <div className={styles.quoteBanner}>
        <span className={styles.quoteText}>
          || स्वराज्य हा माझा जन्मसिद्ध हक्क आहे आणि तो मी मिळवणारच ||
        </span>
        <span className={styles.quoteAttribution}>- छत्रपती शिवाजी महाराज</span>
      </div>

      <div className={styles.heroContent}>
        <div className={styles.heroLeft}>
          <h5 className={styles.heroHeadline}>
            <span className={styles.heroLine1}>EMPOWERING YOUTH</span>
            <span className={styles.heroLine2}>BUILDING BHARAT</span>
          </h5>
          <p className={styles.heroSubtext}>
            We are a group of young, passionate and dedicated volunteers working
            for the betterment of society and the nation.
          </p>
          <div className={styles.heroCtas}>
            <a href="#volunteer" className="btn btn-saffron">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
              Become a Volunteer
            </a>
            <a href="#donate" className="btn btn-outline">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              Donate Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
