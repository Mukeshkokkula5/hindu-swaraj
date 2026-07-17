'use client';
import styles from './TransparencySection.module.css';

const reports = [
  {
    icon: '📄',
    title: 'Annual Report',
    desc: 'Complete yearly overview of all activities and achievements',
    year: '2024-25',
  },
  {
    icon: '💰',
    title: 'Financial Report',
    desc: 'Detailed financial statements and audit reports',
    year: '2024-25',
  },
  {
    icon: '📋',
    title: 'Activity Report',
    desc: 'Comprehensive report of all events and programs conducted',
    year: '2024-25',
  },
  {
    icon: '📜',
    title: 'Registration Certificate',
    desc: 'Official NGO registration and compliance documents',
    year: 'Official',
  },
];

export default function TransparencySection() {
  return (
    <section className={styles.transparency} id="transparency">
      <div className="container">
        <div className={styles.header}>
          <span className="section-label">TRANSPARENCY</span>
          <h2 className="section-title">Our Reports &amp; Documents</h2>
          <p className="section-subtitle">
            We believe in complete transparency. Download our reports and documents.
          </p>
        </div>

        <div className={styles.reportsGrid}>
          {reports.map((report, i) => (
            <div key={i} className={styles.reportCard}>
              <span className={styles.reportIcon}>{report.icon}</span>
              <h3 className={styles.reportTitle}>{report.title}</h3>
              <p className={styles.reportDesc}>{report.desc}</p>
              <div className={styles.reportFooter}>
                <span className={styles.reportYear}>{report.year}</span>
                <button className={styles.downloadBtn}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
