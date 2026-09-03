'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './LeadershipSection.module.css';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000'
).replace(/\/$/, '');

const getMediaUrl = (url) => {
  if (!url) return '/images/leader-president.png';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
};

const DEFAULT_LEADERS = [];

export default function LeadershipSection() {
  const [leaders, setLeaders] = useState(DEFAULT_LEADERS);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLeaderModal, setActiveLeaderModal] = useState(null);
  const [hoveredLeaderId, setHoveredLeaderId] = useState(null);

  useEffect(() => {
    async function fetchLeaders() {
      try {
        const res = await fetch(`${API_BASE_URL}/association-posts/public/members`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && json.data.length > 0) {
            setLeaders(json.data);
          }
        }
      } catch (err) {
        console.warn('Backend /association-posts/public/members not reachable');
      } finally {
        setLoading(false);
      }
    }
    fetchLeaders();
  }, []);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveLeaderModal(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredLeaders = leaders.filter((m) => {
    const matchesSearch =
      (m.name && m.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.role && m.role.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterRole === 'ALL') return true;
    if (filterRole === 'EXECUTIVE') {
      const r = (m.role || '').toUpperCase();
      return (
        r.includes('PRESIDENT') ||
        r.includes('SECRETARY') ||
        r.includes('TREASURER')
      );
    }
    if (filterRole === 'EC') {
      const r = (m.role || '').toUpperCase();
      return r.includes('EC') || r.includes('COMMITTEE');
    }
    if (filterRole === 'MEMBERS') {
      const r = (m.role || '').toUpperCase();
      return r.includes('MEMBER') && !r.includes('EC');
    }
    return true;
  });

  return (
    <section className={styles.section} id="leadership">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.subTitle}>LEADERSHIP &amp; TEAM</span>
          <h2 className={styles.title}>
            మా కార్యవర్గం <span>(Governing Body &amp; Members)</span>
          </h2>
          <div className={styles.divider}></div>
          <p className={styles.description}>
            హిందూ స్వరాజ్ యూత్ వెల్ఫేర్ అసోసియేషన్ (Regd. No: 784/2025) ద్వారా సమాజ సేవలో నిరంతరం శ్రమిస్తున్న నిస్వార్థ నాయకత్వం మరియు సభ్యులు.
          </p>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className={styles.filterToolbar}>
          <div className={styles.filterTabs}>
            <button
              className={`${styles.filterBtn} ${filterRole === 'ALL' ? styles.active : ''}`}
              onClick={() => setFilterRole('ALL')}
            >
              All Team ({leaders.length})
            </button>
            <button
              className={`${styles.filterBtn} ${filterRole === 'EXECUTIVE' ? styles.active : ''}`}
              onClick={() => setFilterRole('EXECUTIVE')}
            >
              Key Executives
            </button>
            <button
              className={`${styles.filterBtn} ${filterRole === 'EC' ? styles.active : ''}`}
              onClick={() => setFilterRole('EC')}
            >
              Executive Committee
            </button>
            <button
              className={`${styles.filterBtn} ${filterRole === 'MEMBERS' ? styles.active : ''}`}
              onClick={() => setFilterRole('MEMBERS')}
            >
              Members
            </button>
          </div>

          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search member by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Compact Grid of Members */}
        <div className={styles.leadersGrid}>
          {filteredLeaders.map((leader, i) => (
            <div
              key={leader.id || i}
              className={styles.leaderCard}
              onClick={() => setActiveLeaderModal(leader)}
              title="Click to view full photo and profile"
            >
              <div
                className={styles.avatarWrapper}
                onMouseEnter={() => setHoveredLeaderId(leader.id || i)}
                onMouseLeave={() => setHoveredLeaderId(null)}
              >
                <div className={styles.avatarCircle}>
                  <img
                    src={getMediaUrl(leader.photo_url || leader.image)}
                    alt={leader.name}
                    className={styles.leaderAvatar}
                    onError={(e) => {
                      e.currentTarget.src = '/images/leader-president.png';
                    }}
                  />
                  <div className={styles.zoomHintIcon}>🔍</div>
                </div>

                {leader.display_order ? (
                  <div className={styles.orderBadge}>{leader.display_order}</div>
                ) : null}

                {/* Floating Magnified HD Popout on Hover */}
                {hoveredLeaderId === (leader.id || i) && (
                  <div className={styles.hoverPopout} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.popoutImageWrap}>
                      <img
                        src={getMediaUrl(leader.photo_url || leader.image)}
                        alt={leader.name}
                        className={styles.popoutImage}
                        onError={(e) => {
                          e.currentTarget.src = '/images/leader-president.png';
                        }}
                      />
                      <div className={styles.popoutBadge}>
                        {leader.display_order ? `#${leader.display_order} ` : ''}{leader.role}
                      </div>
                    </div>
                    <div className={styles.popoutName}>{leader.name}</div>
                    <div className={styles.popoutHint}>🔍 క్లిక్ చేసి పూర్తి ఫోటో చూడండి</div>
                  </div>
                )}
              </div>

              <div className={styles.leaderInfo}>
                <h3 className={styles.leaderName} title={leader.name}>
                  {leader.name}
                </h3>
                <span className={styles.leaderRole} title={leader.role}>
                  {leader.role}
                </span>

                {/* Quick Social Icons */}
                {(leader.social_fb || leader.social_insta || leader.social_linkedin) && (
                  <div className={styles.socialIconsMini} onClick={(e) => e.stopPropagation()}>
                  {leader.social_fb && (
                    <a
                      href={leader.social_fb}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialBtn}
                      title="Facebook"
                      aria-label="Facebook"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                    </a>
                  )}
                  {leader.social_insta && (
                    <a
                      href={leader.social_insta}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialBtn}
                      title="Instagram"
                      aria-label="Instagram"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    </a>
                  )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Grand Lightbox Modal on Click */}
        {activeLeaderModal && (
          <div className={styles.modalOverlay} onClick={() => setActiveLeaderModal(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setActiveLeaderModal(null)}
                aria-label="Close"
              >
                ✕
              </button>

              <div className={styles.modalCard}>
                <div className={styles.modalImageContainer}>
                  <img
                    src={getMediaUrl(activeLeaderModal.photo_url || activeLeaderModal.image)}
                    alt={activeLeaderModal.name}
                    className={styles.modalImage}
                    onError={(e) => {
                      e.currentTarget.src = '/images/leader-president.png';
                    }}
                  />
                  {activeLeaderModal.display_order ? (
                    <div className={styles.modalOrderBadge}>
                      #{activeLeaderModal.display_order}
                    </div>
                  ) : null}
                </div>

                <div className={styles.modalDetails}>
                  <div className={styles.modalGovtBadge}>
                    🏛️ GOVT OF TELANGANA REGD. NO: 784/2025
                  </div>
                  <h2 className={styles.modalName}>{activeLeaderModal.name}</h2>
                  <div className={styles.modalRoleBadge}>
                    {activeLeaderModal.role}
                  </div>
                  <p className={styles.modalTagline}>
                    Executive Leadership &amp; Active Governing Member &bull; Jagtial
                  </p>
                  <div className={styles.modalOrgNotice}>
                    🚩 హిందూ స్వరాజ్ యూత్ వెల్ఫేర్ అసోసియేషన్
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {filteredLeaders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <p>No members found matching &quot;{searchQuery}&quot;.</p>
          </div>
        )}
      </div>
    </section>
  );
}

