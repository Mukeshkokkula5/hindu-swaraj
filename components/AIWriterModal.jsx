'use client';

import React, { useState, useEffect } from 'react';
import styles from './AIWriterModal.module.css';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000'
).replace(/\/$/, '');

const PRESET_TOPICS = [
  { label: '🍲 50 Days Corona Food Seva', topic: 'కరోనా సమయంలో 50 రోజుల నిరంతర అన్నదానం, జగిత్యాలలో రోడ్లపై వేడి భోజన ప్యాకెట్ల పంపిణీ' },
  { label: '🚨 Aapadbandhava Hospital Aid', topic: 'ఆపద్బాంధవ అత్యవసర హాస్పిటల్ చికిత్స సాయం, నిరుపేద రోగులకు మెడికల్ ఖర్చులు' },
  { label: '🩸 Mega Blood Donation Camp', topic: 'హిందూ స్వరాజ్ యూత్ ఆధ్వర్యంలో మెగా రక్తదాన శిబిరం, తలసేమియా పిల్లల ప్రాణ రక్షణ' },
  { label: '🪔 Vinayaka Navaratri Utsav', topic: 'శ్రీ వినాయక నవరాత్రుల మహోత్సవం, ఉచిత నిత్య అన్నదానం, ఆన్‌లైన్ లైవ్ దర్శనం' },
  { label: '🚩 Shivaji Maharaj Inspiration', topic: 'ఛత్రపతి శివాజీ మహారాజ్ ఆదర్శాలతో యువజన సాధికారత, దేశభక్తి మరియు సమాజ సేవ' },
];

export default function AIWriterModal({
  isOpen,
  onClose,
  onInsert,
  initialPrompt = '',
  contentType = 'STORY',
  token = '',
}) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [tone, setTone] = useState('INSPIRING');
  const [type, setType] = useState(contentType || 'STORY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setPrompt(initialPrompt || '');
      setError('');
    }
  }, [isOpen, initialPrompt]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('దయచేసి ఏ అంశంపై మేటర్ రాయాలో 2-3 మాటల్లో లేదా చిన్న పాయింట్స్ రాయండి.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const storedToken = token || localStorage.getItem('token') || localStorage.getItem('admin_token') || '';
      const res = await fetch(`${API_BASE_URL}/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: storedToken ? `Bearer ${storedToken}` : '',
        },
        body: JSON.stringify({
          prompt,
          contentType: type,
          tone,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data.data);
      } else {
        throw new Error(data.error || 'AI Content generation failed');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = (text) => {
    if (onInsert && text) {
      onInsert(text);
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>✨</span>
            <div>
              <h3 className={styles.headerTitle}>
                AI Content Writer &amp; Assistant
                <span className={styles.headerBadge}>BILINGUAL AI</span>
              </h3>
              <p className={styles.headerSub}>
                స్వచ్ఛమైన తెలుగు మరియు స్ఫూర్తిదాయకమైన English లో మేటర్ రాయడానికి AI అసిస్టెంట్
              </p>
            </div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Presets Row */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <span>త్వరిత ఎంపికలు (Quick Seva Topics):</span>
            </label>
            <div className={styles.presetsRow}>
              {PRESET_TOPICS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={styles.presetChip}
                  onClick={() => setPrompt(preset.topic)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt / Topic */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <span>రాయవలసిన అంశం / Topic / Rough Points:</span>
              <span className={styles.hint}>చిన్న హింట్ లేదా పాయింట్స్ రాస్తే చాలు</span>
            </label>
            <textarea
              rows={3}
              className={styles.textarea}
              placeholder="ఉదాహరణ: 50 రోజుల కరోనా అన్నదానం జగిత్యాలలో విజయవంతంగా పూర్తి చేశాం, వేలాది మందికి భోజన ప్యాకెట్లు ఇచ్చాం..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            ></textarea>
          </div>

          {/* Tone & Content Type Controls */}
          <div className={styles.controlsGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>కంటెంట్ రకం (Content Type):</label>
              <select
                className={styles.select}
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="STORY">📜 సుదీర్ఘ సేవా చరిత్ర (Detailed Story)</option>
                <option value="ANNOUNCEMENT">📢 ముఖ్య ప్రకటన (Public Announcement)</option>
                <option value="EMERGENCY_APPEAL">🚨 ఎమర్జెన్సీ విజ్ఞప్తి (Urgent Relief Appeal)</option>
                <option value="PRESS_RELEASE">📰 పత్రికా ప్రకటన (Press Note / Media)</option>
                <option value="CAPTION">📸 ఫోటో క్యాప్షన్ / టైటిల్ (Short Caption)</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>శైలి / స్వరూపం (Tone of Voice):</label>
              <select
                className={styles.select}
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                <option value="INSPIRING">🌟 స్ఫూర్తిదాయకం &amp; భావోద్వేగపూరితం (Inspiring)</option>
                <option value="DEVOTIONAL">🪔 భక్తిపూర్వకం &amp; సాంస్కృతికం (Dharmic/Devotional)</option>
                <option value="URGENT">🚨 అత్యవసర ప్రాణ రక్షణ (Urgent Lifeline)</option>
                <option value="FORMAL">🏛️ గౌరవనీయ అధికారిక ప్రకటన (Official &amp; Formal)</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.15)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            type="button"
            className={styles.generateBtn}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <>⏳ AI మేటర్ రచిస్తోంది (Generating with AI...)...</>
            ) : (
              <>🚀 AI తో మేటర్ రాయండి (Generate Matter)</>
            )}
          </button>

          {/* Results Display */}
          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
              {/* Telugu Output */}
              {result.telugu && (
                <div className={styles.outputBlock}>
                  <div className={styles.outputHeader}>
                    <span className={styles.outputTitle}>
                      🇮🇳 తెలుగు మేటర్ (Telugu Script)
                    </span>
                    <button
                      type="button"
                      className={styles.insertBtn}
                      onClick={() => handleInsert(result.telugu)}
                    >
                      ✅ Insert Telugu Matter
                    </button>
                  </div>
                  <div className={styles.outputBox}>{result.telugu}</div>
                </div>
              )}

              {/* English Output */}
              {result.english && (
                <div className={styles.outputBlock}>
                  <div className={styles.outputHeader}>
                    <span className={styles.outputTitle} style={{ color: '#60a5fa' }}>
                      🌐 English Matter
                    </span>
                    <button
                      type="button"
                      className={styles.insertBtn}
                      style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
                      onClick={() => handleInsert(result.english)}
                    >
                      ✅ Insert English Matter
                    </button>
                  </div>
                  <div className={styles.outputBox}>{result.english}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Quick trigger button exportable for label rows
export function AIWriterTriggerButton({ onClick, label = '✨ AI తో రాయండి' }) {
  return (
    <button
      type="button"
      className={styles.aiTriggerBtn}
      onClick={onClick}
      title="Open AI Bilingual Content Writer"
    >
      <span>✨</span>
      <span>{label}</span>
    </button>
  );
}
