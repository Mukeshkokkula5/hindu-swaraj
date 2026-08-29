'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000'
).replace(/\/$/, '');

export default function EmergencyBloodTicker() {
  const [activeSos, setActiveSos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchActiveSos() {
      try {
        const res = await fetch(`${API_BASE_URL}/blood-donations/active-sos`);
        const data = await res.json();
        if (data.success && Array.isArray(data.active_requests) && data.active_requests.length > 0) {
          setActiveSos(data.active_requests);
        } else {
          setActiveSos([]);
        }
      } catch (err) {
        // Ignore network errors on ticker
      }
    }

    fetchActiveSos();
    const interval = setInterval(fetchActiveSos, 20000); // Check for new emergency requests every 20s
    return () => clearInterval(interval);
  }, []);

  // Rotate between multiple active SOS requests
  useEffect(() => {
    if (activeSos.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSos.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSos]);

  if (activeSos.length === 0) return null;

  const current = activeSos[currentIndex] || activeSos[0];

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #991b1b 0%, #dc2626 50%, #7f1d1d 100%)',
        color: '#ffffff',
        padding: '10px 16px',
        position: 'relative',
        zIndex: 9999,
        boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)',
        borderBottom: '2px solid #fef08a',
        animation: 'pulseGlow 2s infinite ease-in-out',
      }}
    >
      <style jsx>{`
        @keyframes pulseGlow {
          0%, 100% { background-color: #991b1b; }
          50% { background-color: #b91c1c; }
        }
      `}</style>
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '0.88rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
          <span
            style={{
              background: '#fef08a',
              color: '#7f1d1d',
              fontWeight: '900',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              animation: 'blink 1s infinite alternate',
            }}
          >
            🚨 LIVE EMERGENCY SOS
          </span>

          <div style={{ fontWeight: '600' }}>
            <b style={{ color: '#fef08a', fontSize: '0.98rem' }}>[{current.blood_group}]</b> blood{' '}
            <strong style={{ color: '#fff' }}>({current.units} Unit)</strong> needed urgently for{' '}
            <strong style={{ textDecoration: 'underline' }}>{current.patient_name}</strong> at{' '}
            <b>{current.hospital}</b>!
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <a
            href={`tel:${current.contact_phone}`}
            style={{
              background: '#ffffff',
              color: '#991b1b',
              padding: '5px 12px',
              borderRadius: '6px',
              fontWeight: '800',
              fontSize: '0.8rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          >
            📞 Call Attender: {current.contact_phone}
          </a>

          <a
            href={`https://wa.me/918499878425?text=${encodeURIComponent(`🚨 I can donate or arrange ${current.blood_group} blood for patient ${current.patient_name} at ${current.hospital}!`)}`}
            target="_blank"
            rel="noreferrer"
            style={{
              background: '#22c55e',
              color: '#ffffff',
              padding: '5px 12px',
              borderRadius: '6px',
              fontWeight: '800',
              fontSize: '0.8rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            💬 I Can Donate
          </a>

          <Link
            href="/blood-donation"
            style={{
              background: 'rgba(0,0,0,0.25)',
              color: '#fee2e2',
              border: '1px solid rgba(254,226,226,0.4)',
              padding: '5px 10px',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '0.78rem',
              textDecoration: 'none',
            }}
          >
            Details ➔
          </Link>
        </div>
      </div>
    </div>
  );
}
