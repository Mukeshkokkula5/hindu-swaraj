"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./ActivitiesEvents.module.css";

const activities = [
  {
    id: "medical-camp",
    image: "/images/medical-camp/photo-1.jpg",
    title: "Free Medical & Health Camps",
    desc: "Organizing free health checkups, diagnostics, BP/sugar screening, and free medicine distribution.",
    photos: [
      "/images/medical-camp/photo-1.jpg",
      "/images/medical-camp/photo-2.jpg",
      "/images/medical-camp/photo-3.jpg",
      "/images/medical-camp/photo-4.jpg",
      "/images/medical-camp/photo-5.jpg",
    ],
  },
  {
    id: "blood-donation",
    image: "/images/activity-blood.png",
    title: "Blood Donation Camps",
    desc: "Organizing regular blood donation camps to save lives and support local hospital blood banks.",
  },
  {
    id: "education-support",
    image: "/images/activity-education.png",
    title: "Education Support",
    desc: "Empowering underprivileged students with study kits, merit scholarships and career guidance.",
  },
  {
    id: "tree-plantation",
    image: "/images/activity-trees.png",
    title: "Tree Plantation Drives",
    desc: "Conducting mass green tree plantation drives for environmental protection and a cleaner tomorrow.",
  },
  {
    id: "youth-leadership",
    image: "/images/activity-leadership.png",
    title: "Youth Leadership & Sanskar",
    desc: "Conducting workshops and youth camps to build dynamic leadership, sanskar, and social responsibility.",
  },
  {
    id: "disaster-relief",
    image: "/images/activity-disaster.png",
    title: "Disaster & Emergency Relief",
    desc: "Providing swift emergency relief supplies, volunteer aid, and assistance during urgent community crises.",
  },
];

const events = [
  {
    month: "JUN",
    day: "08",
    title: "Blood Donation Camp",
    location: "Jagtial",
    color: "#FF6B00",
  },
  {
    month: "JUN",
    day: "15",
    title: "Tree Plantation Drive",
    location: "Jagtial",
    color: "#28a745",
  },
  {
    month: "JUN",
    day: "22",
    title: "Youth Leadership Workshop",
    location: "Jagtial",
    color: "#0066ff",
  },
  {
    month: "SEP",
    day: "14",
    title: "Vinayaka Navaratri Seva",
    location: "Jagtial (11 Days Mahotsavam)",
    color: "#D4A017",
    link: "/navaratri",
    badge: "Live Stream & Daily Updates 🪔",
  },
];

export default function ActivitiesEvents() {
  const [selectedGallery, setSelectedGallery] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedGallery) return;
      if (e.key === "Escape") {
        setSelectedGallery(null);
      } else if (e.key === "ArrowLeft") {
        setSelectedGallery((prev) => ({
          ...prev,
          activeIndex: (prev.activeIndex - 1 + prev.photos.length) % prev.photos.length,
        }));
      } else if (e.key === "ArrowRight") {
        setSelectedGallery((prev) => ({
          ...prev,
          activeIndex: (prev.activeIndex + 1) % prev.photos.length,
        }));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedGallery]);

  return (
    <section className={styles.section} id="activities">
      <div className={`container ${styles.grid}`}>
        {/* Activities */}
        <div className={styles.activitiesCol}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.title}>
              OUR <span className={styles.titleAccent}>ACTIVITIES</span>
            </h2>
          </div>
          <div className={styles.activitiesGrid}>
            {activities.map((item, i) => (
              <div
                key={i}
                className={styles.activityCard}
                style={item.photos ? { cursor: "pointer" } : {}}
                onClick={() => {
                  if (item.photos && item.photos.length > 0) {
                    setSelectedGallery({
                      title: item.title,
                      photos: item.photos,
                      activeIndex: 0,
                    });
                  }
                }}
              >
                <div className={styles.activityImageWrap}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={280}
                    height={180}
                    className={styles.activityImage}
                  />
                  {item.photos && item.photos.length > 0 && (
                    <span className={styles.photoBadge}>
                      📸 {item.photos.length} Photos
                    </span>
                  )}
                </div>
                <div className={styles.activityInfo}>
                  <h3 className={styles.activityTitle}>{item.title}</h3>
                  <p className={styles.activityDesc}>{item.desc}</p>
                  {item.photos ? (
                    <span className={styles.learnMore}>
                      View Gallery ({item.photos.length} Photos)
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                      </svg>
                    </span>
                  ) : (
                    <a href="#activities" className={styles.learnMore}>
                      Learn More
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Events */}
        <div className={styles.eventsCol} id="events">
          <div className={styles.eventsHeader}>
            <h2 className={styles.title}>UPCOMING EVENTS</h2>
            <a href="#" className={styles.viewAll}>
              View All
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
              </svg>
            </a>
          </div>
          <div className={styles.eventsList}>
            {events.map((evt, i) => {
              const cardContent = (
                <div
                  key={i}
                  className={styles.eventCard}
                  style={evt.link ? { cursor: "pointer", border: "1px solid rgba(212, 160, 23, 0.4)", background: "rgba(255, 107, 0, 0.04)" } : {}}
                >
                  <div
                    className={styles.eventDate}
                    style={{ borderColor: evt.color }}
                  >
                    <span
                      className={styles.eventMonth}
                      style={{ backgroundColor: evt.color }}
                    >
                      {evt.month}
                    </span>
                    <span className={styles.eventDay}>{evt.day}</span>
                  </div>
                  <div className={styles.eventInfo}>
                    <h4 className={styles.eventTitle}>
                      {evt.title}
                      {evt.badge && (
                        <span style={{ display: "inline-block", marginLeft: 6, fontSize: "0.72rem", background: "#ff6b00", color: "#fff", padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>
                          {evt.badge}
                        </span>
                      )}
                    </h4>
                    <span className={styles.eventLocation}>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="var(--saffron)"
                      >
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      {evt.location}
                    </span>
                  </div>
                </div>
              );

              return evt.link ? (
                <Link key={i} href={evt.link} style={{ textDecoration: "none", color: "inherit" }}>
                  {cardContent}
                </Link>
              ) : (
                cardContent
              );
            })}
          </div>
          <a href="#" className={styles.viewAllBottom}>
            View All Events
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
            </svg>
          </a>
        </div>
      </div>

      {/* 🖼️ Interactive Photo Gallery Lightbox Modal */}
      {selectedGallery && (
        <div
          className={styles.galleryBackdrop}
          onClick={() => setSelectedGallery(null)}
        >
          <div
            className={styles.galleryModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.galleryHeader}>
              <div className={styles.galleryTitle}>
                <span>📸</span>
                <span>{selectedGallery.title}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className={styles.galleryCount}>
                  Photo {selectedGallery.activeIndex + 1} of {selectedGallery.photos.length}
                </span>
                <button
                  type="button"
                  className={styles.galleryCloseBtn}
                  onClick={() => setSelectedGallery(null)}
                  aria-label="Close Gallery"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className={styles.galleryViewWrap}>
              <button
                type="button"
                className={`${styles.galleryNavBtn} ${styles.galleryNavPrev}`}
                onClick={() =>
                  setSelectedGallery((prev) => ({
                    ...prev,
                    activeIndex:
                      (prev.activeIndex - 1 + prev.photos.length) % prev.photos.length,
                  }))
                }
                aria-label="Previous photo"
              >
                ‹
              </button>

              <Image
                src={selectedGallery.photos[selectedGallery.activeIndex]}
                alt={`${selectedGallery.title} photo ${selectedGallery.activeIndex + 1}`}
                width={860}
                height={500}
                className={styles.galleryActiveImg}
                priority
              />

              <button
                type="button"
                className={`${styles.galleryNavBtn} ${styles.galleryNavNext}`}
                onClick={() =>
                  setSelectedGallery((prev) => ({
                    ...prev,
                    activeIndex: (prev.activeIndex + 1) % prev.photos.length,
                  }))
                }
                aria-label="Next photo"
              >
                ›
              </button>
            </div>

            <div className={styles.galleryThumbsStrip}>
              {selectedGallery.photos.map((p, idx) => (
                <div
                  key={idx}
                  className={`${styles.galleryThumb} ${
                    idx === selectedGallery.activeIndex ? styles.galleryThumbActive : ""
                  }`}
                  onClick={() =>
                    setSelectedGallery((prev) => ({ ...prev, activeIndex: idx }))
                  }
                >
                  <Image
                    src={p}
                    alt={`Thumbnail ${idx + 1}`}
                    width={80}
                    height={55}
                    className={styles.galleryThumbImg}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
