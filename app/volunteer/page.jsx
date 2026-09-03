'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './volunteer.module.css';

const INTEREST_OPTIONS = [
  { id: 'blood_donation', label: '🩸 Blood Donation Seva', desc: 'Emergency blood donation & organizing camps' },
  { id: 'annadanam', label: '🍛 Annadanam & Food Relief', desc: 'Prasadam preparation & community food seva' },
  { id: 'festivals', label: '🚩 Festival & Navaratri Seva', desc: 'Pandal setup, crowd management & rituals' },
  { id: 'tree_plantation', label: '🌳 Green Environment & Tree Plantation', desc: 'Tree planting & environmental protection' },
  { id: 'youth_education', label: '📚 Youth Mentorship & Education', desc: 'Skill workshops & student support' },
  { id: 'digital_media', label: '📢 Social Media & Digital Seva', desc: 'Photography, graphic design & broadcasting' },
  { id: 'emergency_relief', label: '🚑 Emergency & Disaster Relief', desc: 'Rapid response team during crises' },
  { id: 'cultural_events', label: '🎭 Cultural & Heritage Programs', desc: 'Shivaji Jayanti & patriotic processions' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const AVAILABILITY_OPTIONS = [
  'Weekends & Holidays',
  'Festival & Event Days',
  'Evenings (2-3 hrs)',
  'Emergency On-Call / Anytime',
];

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000'
).replace(/\/$/, '');

export default function VolunteerPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Jagtial',
    address: '',
    occupation: '',
    blood_group: '',
    areas_of_interest: ['🩸 Blood Donation Seva', '🚩 Festival & Navaratri Seva'],
    availability: 'Weekends & Holidays',
    skills: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedVolunteer, setSubmittedVolunteer] = useState(null);

  const handleInterestToggle = (label) => {
    setFormData((prev) => {
      const exists = prev.areas_of_interest.includes(label);
      return {
        ...prev,
        areas_of_interest: exists
          ? prev.areas_of_interest.filter((i) => i !== label)
          : [...prev.areas_of_interest, label],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Please enter your mobile/WhatsApp number');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/volunteer/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSubmittedVolunteer({
        ...formData,
        id: data.volunteer?.id || Date.now(),
      });
      window.scrollTo({ top: 150, behavior: 'smooth' });
    } catch (err) {
      console.error('Submission Error:', err);
      setError(err.message || 'Something went wrong. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.bgGlow1}></div>
      <div className={styles.bgGlow2}></div>

      <Navbar />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.badge}>
          <span>🚩</span>
          <span>Be the Change • Rashtra Seva</span>
        </div>
        <h1 className={styles.title}>BECOME A VOLUNTEER</h1>
        <span className={styles.teluguTitle}>సేవా ప్రయాణంలో భాగస్వాములు కండి</span>
        <p className={styles.subtitle}>
          Join hundreds of passionate youth dedicated to nation-building, social welfare,
          blood donation drives, Annadanam, and cultural preservation in Jagtial and beyond.
        </p>

        {/* Impact Highlights */}
        <div className={styles.propsGrid}>
          <div className={styles.propCard}>
            <span className={styles.propIcon}>🩸</span>
            <div className={styles.propTitle}>Blood Donation Seva</div>
            <div className={styles.propDesc}>Saving lives 24x7 with emergency donor response</div>
          </div>
          <div className={styles.propCard}>
            <span className={styles.propIcon}>🍛</span>
            <div className={styles.propTitle}>Annadanam &amp; Relief</div>
            <div className={styles.propDesc}>Feeding thousands with sacred food distribution</div>
          </div>
          <div className={styles.propCard}>
            <span className={styles.propIcon}>🚩</span>
            <div className={styles.propTitle}>Sanatana Dharma Seva</div>
            <div className={styles.propDesc}>Preserving youth character, values and culture</div>
          </div>
          <div className={styles.propCard}>
            <span className={styles.propIcon}>🤝</span>
            <div className={styles.propTitle}>Youth Leadership</div>
            <div className={styles.propDesc}>Inspiring unity, discipline and social empowerment</div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className={styles.formSection}>
        <div className={styles.formCard}>
          {submittedVolunteer ? (
            <div className={styles.successCard}>
              <div className={styles.successIcon}>✓</div>
              <h2 className={styles.successTitle}>Application Received Successfully!</h2>
              <p className={styles.successSub}>
                Dhanyavadalu, <b>{submittedVolunteer.name}</b>! Your registration to join Hindu Swaraj Youth Welfare Association as a volunteer has been recorded.
              </p>

              {submittedVolunteer.email && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  color: '#10b981',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>📩</span>
                  <span>
                    A confirmation email has been sent to <b>{submittedVolunteer.email}</b> with your application details.
                  </span>
                </div>
              )}

              <div className={styles.summaryBox}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Application Reference:</span>
                  <span className={styles.summaryVal} style={{ fontWeight: 'bold', color: '#ea580c' }}>
                    #VOL-{submittedVolunteer.id}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Volunteer Name:</span>
                  <span className={styles.summaryVal}>{submittedVolunteer.name}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Mobile Number:</span>
                  <span className={styles.summaryVal}>{submittedVolunteer.phone}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>City / Location:</span>
                  <span className={styles.summaryVal}>{submittedVolunteer.city || 'Jagtial'}</span>
                </div>
                {submittedVolunteer.blood_group && (
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Blood Group:</span>
                    <span className={styles.summaryVal}>{submittedVolunteer.blood_group}</span>
                  </div>
                )}
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Seva Interests:</span>
                  <span className={styles.summaryVal}>
                    {submittedVolunteer.areas_of_interest?.join(', ') || 'General Seva'}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Status:</span>
                  <span className={styles.summaryVal} style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                    ⏳ Pending Review
                  </span>
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '14px',
                marginBottom: '20px',
                fontSize: '13px',
                color: '#94a3b8',
                lineHeight: '1.6',
                textAlign: 'left'
              }}>
                <b style={{ color: '#f8fafc' }}>📌 What happens next?</b><br />
                1. Our Core Committee &amp; Seva Coordinators review your application within 24-48 hours.<br />
                2. You will receive an official status update by email.<br />
                3. Our team will contact you on WhatsApp / Phone to assign you to upcoming seva initiatives.
              </div>

              <div className={styles.actionRow}>
                <a href="tel:+918499878425" className={styles.waBtn} style={{ background: '#0284c7' }}>
                  <span>📞</span>
                  <span>Helpline: +91 8499878425</span>
                </a>
                <a href="/" className={styles.homeBtn}>
                  <span>🏠</span>
                  <span>Back to Home</span>
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className={styles.formHeader}>
                <h2 className={styles.formHeaderTitle}>
                  <span>📝</span>
                  <span>Volunteer Registration Form</span>
                </h2>
                <p className={styles.formHeaderSub}>
                  Fill out the form below. Our President and Seva coordinators will contact you.
                </p>
              </div>

              {error && (
                <div className={styles.errorBox}>
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className={styles.formGrid}>
                {/* Full Name */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Full Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name (e.g. Rajesh Reddy)"
                    className={styles.input}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* Phone Number */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Mobile / WhatsApp Number <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    className={styles.input}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                {/* Email */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address (For Status Updates &amp; Confirmation)</label>
                  <input
                    type="email"
                    placeholder="e.g. yourname@gmail.com"
                    className={styles.input}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                {/* City */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>City / Town / Mandal</label>
                  <input
                    type="text"
                    placeholder="e.g. Jagtial, Karimnagar, Hyderabad"
                    className={styles.input}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                {/* Occupation */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Occupation / Education</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer / Student / Businessman"
                    className={styles.input}
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  />
                </div>

                {/* Blood Group */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Blood Group (Optional for Seva Camps)</label>
                  <div className={styles.bloodGroupGrid}>
                    {BLOOD_GROUPS.map((bg) => (
                      <button
                        type="button"
                        key={bg}
                        className={`${styles.bloodChip} ${formData.blood_group === bg ? styles.bloodChipActive : ''}`}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            blood_group: formData.blood_group === bg ? '' : bg,
                          })
                        }
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Address */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Full Address / Colony</label>
                  <input
                    type="text"
                    placeholder="e.g. H.No 4-1-140, Vani Nagar, Jagtial"
                    className={styles.input}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                {/* Areas of Interest */}
                <div className={`${styles.formGroup} ${styles.fullWidth} ${styles.interestSection}`}>
                  <label className={styles.label}>
                    Areas You Are Interested in Volunteering For
                  </label>
                  <div className={styles.interestGrid}>
                    {INTEREST_OPTIONS.map((item) => {
                      const selected = formData.areas_of_interest.includes(item.label);
                      return (
                        <label
                          key={item.id}
                          className={`${styles.interestPill} ${selected ? styles.interestPillActive : ''}`}
                        >
                          <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={selected}
                            onChange={() => handleInterestToggle(item.label)}
                          />
                          <span>{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Availability */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Your Availability</label>
                  <div className={styles.radioGroup}>
                    {AVAILABILITY_OPTIONS.map((avail) => (
                      <label
                        key={avail}
                        className={`${styles.radioCard} ${formData.availability === avail ? styles.radioCardActive : ''}`}
                      >
                        <input
                          type="radio"
                          name="availability"
                          className={styles.checkbox}
                          checked={formData.availability === avail}
                          onChange={() => setFormData({ ...formData, availability: avail })}
                        />
                        <span>{avail}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Skills / Experience */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Special Skills or Past Experience (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Photography, First-Aid, Driving, Sound Setup, Public Speaking"
                    className={styles.input}
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  />
                </div>

                {/* Personal Message / Motivation */}
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Why would you like to volunteer with Hindu Swaraj? (Optional)</label>
                  <textarea
                    placeholder="Share your thoughts, motivation, or suggestions..."
                    className={styles.textarea}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <p className={styles.privacyNote}>
                🔒 Your privacy is respected. Information is strictly used for Hindu Swaraj Youth Welfare Association community seva coordination.
              </p>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? (
                  <>
                    <span>⏳</span>
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>🚩</span>
                    <span>Submit Volunteer Registration</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
