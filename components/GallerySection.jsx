'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './GallerySection.module.css';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000'
).replace(/\/$/, '');

const getMediaUrl = (url) => {
  if (!url) return '/images/activity-blood.png';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
};

const DEFAULT_POSTS = [
  { id: 1, title: 'Mega Blood Donation Camp at Jagtial', description: 'Successfully organized our 14th Mega Blood Donation Camp collecting 120+ units of blood for local hospitals and patients.', image_url: '/images/activity-blood.png', category: 'Blood Donation', author_name: 'Rajesh Kumar', author_role: 'President', event_date: '12 Aug 2026', likes_count: 42 },
  { id: 2, title: 'Green Jagtial Tree Plantation Drive', description: 'Youth volunteers planted over 250 saplings across schools and community parks in Jagtial to promote environmental awareness.', image_url: '/images/activity-trees.png', category: 'Environment', author_name: 'Suresh Reddy', author_role: 'Vice President', event_date: '05 Aug 2026', likes_count: 38 },
  { id: 3, title: 'Free Educational Kit Distribution', description: 'Distributed notebooks, school bags, and academic supplies to 150+ underprivileged students in Jagtial district.', image_url: '/images/activity-education.png', category: 'Education', author_name: 'Anil Sharma', author_role: 'General Secretary', event_date: '28 Jul 2026', likes_count: 29 },
  { id: 4, title: 'Youth Leadership Workshop', description: 'Interactive workshop empowering 80+ youth with leadership principles, team building, and community service skills.', image_url: '/images/activity-leadership.png', category: 'Youth Leadership', author_name: 'Karthik Rao', author_role: 'Executive Member', event_date: '15 Jul 2026', likes_count: 35 },
  { id: 5, title: 'Chhatrapati Shivaji Maharaj Jayanti', description: 'Grand cultural procession and patriotic program celebrating the legacy and values of Chhatrapati Shivaji Maharaj in Jagtial.', image_url: '/images/hero-shivaji.png', category: 'Cultural & Heritage', author_name: 'Hindu Swaraj Team', author_role: 'Executive Committee', event_date: '19 Feb 2026', likes_count: 56 },
  { id: 6, title: 'Volunteer Disaster & Relief Seva', description: 'Emergency relief, food packet distribution and shelter assistance provided during seasonal heavy rains.', image_url: '/images/activity-disaster.png', category: 'Community Seva', author_name: 'Youth Volunteer Wing', author_role: 'Volunteers', event_date: '10 Jun 2026', likes_count: 31 },
];

const CATEGORIES = [
  'ALL',
  'Blood Donation',
  'Environment',
  'Education',
  'Youth Leadership',
  'Cultural & Heritage',
  'Community Seva',
];

export default function GallerySection() {
  const [posts, setPosts] = useState(DEFAULT_POSTS);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [lightbox, setLightbox] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});

  useEffect(() => {
    async function fetchPosts() {
      try {
        const query = activeCategory !== 'ALL' ? `?category=${encodeURIComponent(activeCategory)}` : '';
        const res = await fetch(`${API_BASE_URL}/association-posts/public/posts${query}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && json.data.length > 0) {
            setPosts(json.data);
          } else if (activeCategory === 'ALL') {
            setPosts(DEFAULT_POSTS);
          }
        }
      } catch (err) {
        console.warn('Backend /association-posts/public/posts not reachable, using defaults');
      }
    }
    fetchPosts();
  }, [activeCategory]);

  const handleLikePost = async (e, postId) => {
    e.stopPropagation();
    if (likedPosts[postId]) return;

    setLikedPosts((prev) => ({ ...prev, [postId]: true }));
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p))
    );

    try {
      await fetch(`${API_BASE_URL}/association-posts/public/posts/${postId}/like`, {
        method: 'POST',
      });
    } catch (err) {
      console.warn('Like request failed');
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (activeCategory === 'ALL') return true;
    return p.category === activeCategory;
  });

  return (
    <section className={styles.gallery} id="gallery">
      <div className="container">
        <div className={styles.header}>
          <div>
            <span className="section-label">COMMUNITY FEED &amp; GALLERY</span>
            <h2 className="section-title">Association Member Posts &amp; Activities</h2>
            <p style={{ color: 'var(--text-secondary, #64748b)', marginTop: 6, fontSize: '0.95rem' }}>
              Explore recent grassroots seva, photo updates, and community impact drives led by our members in Jagtial.
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '24px' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              style={{
                background: activeCategory === cat ? '#ff6b00' : 'rgba(15, 23, 42, 0.06)',
                color: activeCategory === cat ? '#fff' : '#1e293b',
                border: activeCategory === cat ? '1px solid #ff6b00' : '1px solid #cbd5e1',
                padding: '7px 16px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts & Photo Grid */}
        <div className={styles.masonryGrid}>
          {filteredPosts.map((post, i) => (
            <div
              key={post.id || i}
              className={`${styles.gridItem} ${i === 0 || i === 4 ? styles.gridItemTall : ''} ${i === 1 ? styles.gridItemWide : ''}`}
              onClick={() => setLightbox(post)}
            >
              <img
                src={getMediaUrl(post.image_url)}
                alt={post.title}
                className={styles.gridImage}
                onError={(e) => {
                  e.currentTarget.src = '/images/activity-blood.png';
                }}
              />
              <div className={styles.gridOverlay}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span className={styles.gridCategory}>{post.category}</span>
                  <button
                    type="button"
                    onClick={(e) => handleLikePost(e, post.id)}
                    style={{
                      background: likedPosts[post.id] ? 'rgba(239, 68, 68, 0.9)' : 'rgba(0, 0, 0, 0.5)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '3px 10px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    ❤️ {post.likes_count || 0}
                  </button>
                </div>
                <span className={styles.gridAlt}>{post.title}</span>
                <div style={{ fontSize: '0.78rem', color: '#fed7aa', marginTop: 4 }}>
                  👤 {post.author_name || 'Member'} • {post.event_date || 'Recent Seva'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <button className={styles.lightboxClose} onClick={() => setLightbox(null)}>✕</button>
          <div style={{ maxWidth: '850px', width: '100%', background: '#0f172a', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <img
              src={getMediaUrl(lightbox.image_url)}
              alt={lightbox.title}
              style={{ width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block' }}
            />
            <div style={{ padding: '20px 24px', color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', background: 'rgba(255,107,0,0.2)', color: '#ff8c38', padding: '3px 10px', borderRadius: '12px' }}>
                  {lightbox.category}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  🗓 {lightbox.event_date || 'Recent Seva'}
                </span>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: 8, color: '#fff' }}>
                {lightbox.title}
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 12 }}>
                {lightbox.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12, fontSize: '0.82rem', color: '#94a3b8' }}>
                <span>Posted by: <b style={{ color: '#fff' }}>{lightbox.author_name}</b> ({lightbox.author_role || 'Executive Member'})</span>
                <span style={{ color: '#ef4444', fontWeight: '700' }}>❤️ {lightbox.likes_count || 0} Devotees Applauded</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
