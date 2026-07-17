'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './TestimonialsSection.module.css';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Volunteer since 2021',
    image: '/images/testimonial-1.png',
    quote: 'Joining Hindu Swaraj Youth was the best decision of my life. The organization has given me a platform to serve society and develop leadership skills. Every blood donation camp and tree plantation drive fills my heart with purpose.',
  },
  {
    name: 'Ravi Teja',
    role: 'Core Committee Member',
    image: '/images/leader-committee.png',
    quote: 'Being part of this organization has transformed my understanding of seva. We are not just volunteers — we are nation builders. The youth leadership programs have shaped me into a better person and a responsible citizen.',
  },
  {
    name: 'Ananya Reddy',
    role: 'Volunteer since 2022',
    image: '/images/leader-vp.png',
    quote: 'The dedication and passion I see in every member of Hindu Swaraj Youth is truly inspiring. From organizing cultural events to disaster relief, we stand united for a stronger nation. Proud to be a part of this mission.',
  },
];

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={styles.testimonials}>
      <div className="container">
        <div className={styles.header}>
          <span className="section-label">TESTIMONIALS</span>
          <h2 className="section-title">What Our Volunteers Say</h2>
        </div>

        <div className={styles.carousel}>
          <div className={styles.carouselTrack} style={{ transform: `translateX(-${active * 100}%)` }}>
            {testimonials.map((t, i) => (
              <div key={i} className={styles.slide}>
                <div className={styles.testimonialCard}>
                  <div className={styles.quoteIcon}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--saffron)" opacity="0.2">
                      <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
                    </svg>
                  </div>
                  <p className={styles.quote}>{t.quote}</p>
                  <div className={styles.author}>
                    <Image src={t.image} alt={t.name} width={56} height={56} className={styles.authorImage} />
                    <div>
                      <h4 className={styles.authorName}>{t.name}</h4>
                      <span className={styles.authorRole}>{t.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.dots}>
          {testimonials.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
