'use client';
import { useState } from 'react';
import Image from 'next/image';
import styles from './GallerySection.module.css';

const galleryImages = [
  { src: '/images/activity-blood.png', alt: 'Blood Donation Camp', category: 'Camps' },
  { src: '/images/about-volunteers.png', alt: 'Volunteer Team', category: 'Team' },
  { src: '/images/activity-trees.png', alt: 'Tree Plantation', category: 'Environment' },
  { src: '/images/activity-education.png', alt: 'Education Program', category: 'Education' },
  { src: '/images/activity-cultural.png', alt: 'Cultural Event', category: 'Culture' },
  { src: '/images/activity-leadership.png', alt: 'Youth Leadership', category: 'Leadership' },
  { src: '/images/activity-disaster.png', alt: 'Disaster Relief', category: 'Relief' },
  { src: '/images/hero-shivaji.png', alt: 'Shivaji Maharaj Tribute', category: 'Heritage' },
];

export default function GallerySection() {
  const [lightbox, setLightbox] = useState(null);

  return (
    <section className={styles.gallery} id="gallery">
      <div className="container">
        <div className={styles.header}>
          <div>
            <span className="section-label">GALLERY</span>
            <h2 className="section-title">Our Moments of Impact</h2>
          </div>
          <a href="#" className={styles.viewAll}>
            View All Photos
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
          </a>
        </div>

        <div className={styles.masonryGrid}>
          {galleryImages.map((img, i) => (
            <div
              key={i}
              className={`${styles.gridItem} ${i === 0 || i === 4 ? styles.gridItemTall : ''} ${i === 1 ? styles.gridItemWide : ''}`}
              onClick={() => setLightbox(img)}
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={400}
                height={300}
                className={styles.gridImage}
              />
              <div className={styles.gridOverlay}>
                <span className={styles.gridCategory}>{img.category}</span>
                <span className={styles.gridAlt}>{img.alt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <button className={styles.lightboxClose} onClick={() => setLightbox(null)}>✕</button>
          <Image
            src={lightbox.src}
            alt={lightbox.alt}
            width={900}
            height={600}
            className={styles.lightboxImage}
          />
          <p className={styles.lightboxCaption}>{lightbox.alt}</p>
        </div>
      )}
    </section>
  );
}
