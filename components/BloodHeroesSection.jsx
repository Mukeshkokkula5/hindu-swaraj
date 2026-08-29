'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './BloodHeroesSection.module.css';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000'
).replace(/\/$/, '');

export default function BloodHeroesSection() {
  const [stats, setStats] = useState({
    total_donations: 4,
    total_units: 4,
    unique_donors: 4,
    lives_impacted: 12,
  });
  const [featuredHeroes, setFeaturedHeroes] = useState([]);

  useEffect(() => {
    async function loadQuickData() {
      try {
        const res = await fetch(`${API_BASE_URL}/blood-donations/public`);
        const data = await res.json();
        if (data.success) {
          if (data.stats) setStats(data.stats);
          if (data.heroes) setFeaturedHeroes(data.heroes.slice(0, 3));
        }
      } catch (e) {
        // Fallback to initial state
      }
    }
    loadQuickData();
  }, []);

  return (
    <section id="blood-heroes" style={{ padding: '60px 20px', background: 'linear-gradient(180deg, #fffafa 0%, #fff 100%)', borderTop: '1px solid #fee2e2', borderBottom: '1px solid #fee2e2' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
          borderRadius: '24px',
          padding: '40px 32px',
          color: '#ffffff',
          boxShadow: '0 15px 35px rgba(127, 29, 29, 0.15)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
          alignItems: 'center',
        }}>
          {/* Left Column: Heading, Info, Stats */}
          <div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(254, 240, 138, 0.2)',
              color: '#fef08a',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '800',
              marginBottom: '14px',
              border: '1px solid rgba(254, 240, 138, 0.3)',
            }}>
              🩸 24/7 జగిత్యాల అత్యవసర రక్తదాన సేవ
            </span>

            <h2 style={{ fontSize: '2.1rem', fontWeight: '900', color: '#ffffff', margin: '0 0 12px 0', lineHeight: 1.25 }}>
              రక్తదానమే ప్రాణదానం • <span style={{ color: '#fca5a5' }}>యువత సేవా వేదిక</span>
            </h2>

            <p style={{ fontSize: '0.98rem', color: '#fee2e2', lineHeight: 1.6, margin: '0 0 24px 0' }}>
              జగిత్యాల మరియు పరిసర ఆసుపత్రులలో రక్త అత్యవసర సమయాల్లో ప్రాణాలు కాపాడే మా రక్తదాతల ప్రత్యేక పోర్టల్. దాతల అసలైన ఫోటో రికార్డ్స్, డిజిటల్ ప్రశంసా పత్రాలు &amp; 24/7 ఎమర్జెన్సీ SOS హెల్ప్‌లైన్.
            </p>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px', background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '14px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fef08a' }}>{stats.total_units || 4}+</div>
                <div style={{ fontSize: '0.72rem', color: '#fee2e2', fontWeight: '700' }}>Units Donated</div>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.15)', borderRight: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#86efac' }}>{stats.lives_impacted || 12}+</div>
                <div style={{ fontSize: '0.72rem', color: '#fee2e2', fontWeight: '700' }}>Lives Saved</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#93c5fd' }}>{stats.unique_donors || 4}+</div>
                <div style={{ fontSize: '0.72rem', color: '#fee2e2', fontWeight: '700' }}>Youth Donors</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                href="/blood-donation"
                style={{
                  background: '#ffffff',
                  color: '#991b1b',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s',
                }}
              >
                <span>🩸</span> ఓపెన్ రక్తదాన పోర్టల్ (Full Portal) ➔
              </Link>

              <a
                href="https://wa.me/918499878425?text=🚨%20URGENT%20BLOOD%20REQUEST%20IN%20JAGTIAL"
                target="_blank"
                rel="noreferrer"
                style={{
                  background: '#22c55e',
                  color: '#ffffff',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>💬</span> 24/7 Emergency SOS
              </a>
            </div>
          </div>

          {/* Right Column: Mini Donor Showcase Preview Cards */}
          <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '18px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#fef08a' }}>🌟 రక్తదాన వీరుల గ్యాలరీ (Preview)</span>
              <Link href="/blood-donation" style={{ fontSize: '0.78rem', color: '#ffffff', fontWeight: '700', textDecoration: 'underline' }}>
                View All Donors &amp; Certs ➔
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {featuredHeroes.length > 0 ? (
                featuredHeroes.map((hero) => {
                  const rawP = hero.photo_url || '/images/activity-blood.png';
                  const pSrc = rawP.startsWith('http')
                    ? rawP
                    : rawP.startsWith('/uploads')
                    ? `${API_BASE_URL}${rawP}`
                    : rawP;

                  return (
                    <div key={hero.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '8px 12px' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pSrc}
                        alt={hero.donor_name}
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fef08a' }}
                        onError={(e) => {
                          e.currentTarget.src = '/images/activity-blood.png';
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {hero.donor_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#fee2e2' }}>
                          📍 {hero.hospital_or_camp}
                        </div>
                      </div>
                      <div style={{ background: '#dc2626', color: '#ffffff', fontWeight: '900', fontSize: '0.8rem', padding: '3px 8px', borderRadius: '12px', border: '1px solid #fca5a5' }}>
                        {hero.blood_group}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#fee2e2', fontSize: '0.85rem' }}>
                  Loading youth donors...
                </div>
              )}
            </div>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <Link
                href="/blood-donation#sos-section"
                style={{
                  display: 'block',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px dashed rgba(255,255,255,0.4)',
                  color: '#ffffff',
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  textDecoration: 'none',
                }}
              >
                ➕ Register as a Voluntary Blood Donor in Jagtial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
