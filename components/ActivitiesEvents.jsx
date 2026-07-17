'use client';
import Image from 'next/image';
import styles from './ActivitiesEvents.module.css';

const activities = [
  {
    image: '/images/activity-blood.png',
    title: 'Blood Donation Camps',
    desc: 'Organizing regular blood donation camps to save lives and support hospitals.',
  },
  {
    image: '/images/activity-education.png',
    title: 'Education Support',
    desc: 'Helping students with study materials, scholarships and career guidance.',
  },
  {
    image: '/images/activity-trees.png',
    title: 'Tree Plantation',
    desc: 'Planting trees for a greener tomorrow and a better environment.',
  },
  {
    image: '/images/activity-leadership.png',
    title: 'Youth Leadership',
    desc: 'Conducting workshops and sessions to build leadership and soft skills.',
  },
];

const events = [
  { month: 'JUN', day: '08', title: 'Blood Donation Camp', location: 'Jagtial', color: '#FF6B00' },
  { month: 'JUN', day: '15', title: 'Tree Plantation Drive', location: 'Jagtial', color: '#28a745' },
  { month: 'JUN', day: '22', title: 'Youth Leadership Workshop', location: 'Jagtial', color: '#0066ff' },
  { month: 'JUL', day: '05', title: 'Vinayaka Navaratri Seva', location: 'Jagtial', color: '#D4A017' },
];

export default function ActivitiesEvents() {
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
              <div key={i} className={styles.activityCard}>
                <div className={styles.activityImageWrap}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={280}
                    height={180}
                    className={styles.activityImage}
                  />
                </div>
                <div className={styles.activityInfo}>
                  <h3 className={styles.activityTitle}>{item.title}</h3>
                  <p className={styles.activityDesc}>{item.desc}</p>
                  <a href="#" className={styles.learnMore}>
                    Learn More
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
                  </a>
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
            </a>
          </div>
          <div className={styles.eventsList}>
            {events.map((evt, i) => (
              <div key={i} className={styles.eventCard}>
                <div className={styles.eventDate} style={{ borderColor: evt.color }}>
                  <span className={styles.eventMonth} style={{ backgroundColor: evt.color }}>{evt.month}</span>
                  <span className={styles.eventDay}>{evt.day}</span>
                </div>
                <div className={styles.eventInfo}>
                  <h4 className={styles.eventTitle}>{evt.title}</h4>
                  <span className={styles.eventLocation}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--saffron)"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    {evt.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <a href="#" className={styles.viewAllBottom}>
            View All Events
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
          </a>
        </div>
      </div>
    </section>
  );
}
