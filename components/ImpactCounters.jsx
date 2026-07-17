'use client';
import { useEffect, useRef, useState } from 'react';
import styles from './ImpactCounters.module.css';

const counters = [
  { icon: '👥', value: 500, suffix: '+', label: 'Active Members', sub: 'Growing together' },
  { icon: '🎯', value: 150, suffix: '+', label: 'Events Organized', sub: 'Making an Impact' },
  { icon: '🩸', value: 40, suffix: '+', label: 'Blood Donation Camps', sub: 'Saving Lives' },
  { icon: '🤝', value: 2000, suffix: '+', label: 'Beneficiaries', sub: 'Lives Touched' },
];

function AnimatedCounter({ target, suffix, isVisible }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, target]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function ImpactCounters() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.impact} ref={ref}>
      <div className={styles.impactContainer}>
        {counters.map((item, i) => (
          <div key={i} className={styles.counterCard}>
            <span className={styles.counterIcon}>{item.icon}</span>
            <div className={styles.counterInfo}>
              <span className={styles.counterValue}>
                <AnimatedCounter target={item.value} suffix={item.suffix} isVisible={isVisible} />
              </span>
              <span className={styles.counterLabel}>{item.label}</span>
              <span className={styles.counterSub}>{item.sub}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
