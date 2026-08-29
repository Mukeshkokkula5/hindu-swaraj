'use client';

import React, { useState, useEffect } from 'react';
import styles from './MemberVotingBooth.module.css';

export default function MemberVotingBooth({ token, currentUser }) {
  const [loading, setLoading] = useState(true);
  const [electionData, setElectionData] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState({}); // { [postId]: nominationId }
  const [submittingNomination, setSubmittingNomination] = useState(false);
  const [editingNomination, setEditingNomination] = useState(false);
  const [nominationForm, setNominationForm] = useState({
    post_id: '',
    candidate_name: currentUser?.name || '',
    candidate_phone: currentUser?.phone || '',
    candidate_email: currentUser?.personal_email || currentUser?.username || '',
    candidate_photo_url: currentUser?.profile_photo || '/images/activity-leadership.png',
    manifesto: '',
    proposer_name: '',
    seconder_name: '',
  });

  // OTP Verification Modal State
  const [otpModal, setOtpModal] = useState({
    show: false,
    otpValue: '',
    sendingOtp: false,
    castingVote: false,
    error: '',
    success: '',
  });

  const [notification, setNotification] = useState(null);

  const API_BASE = (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000'
  ).replace(/\/$/, '');

  const getAuthHeader = () => {
    const activeToken =
      token ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('admin_token') || localStorage.getItem('token') || ''
        : '');
    return activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
  };

  useEffect(() => {
    loadElectionData();
  }, []);

  const loadElectionData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/elections/active`, {
        headers: { ...getAuthHeader() },
      });
      const data = await res.json();
      if (data.success && data.hasActiveElection) {
        setElectionData(data);
        if (data.posts && data.posts.length > 0 && !nominationForm.post_id) {
          setNominationForm((prev) => ({ ...prev, post_id: data.posts[0].id }));
        }
      } else {
        setElectionData(null);
      }
    } catch (err) {
      console.warn('Failed to load election booth:', err);
    } finally {
      setLoading(false);
    }
  };

  // 1. File / Re-submit Candidate Nomination
  const handleFileNomination = async (e) => {
    e.preventDefault();
    setSubmittingNomination(true);
    try {
      const res = await fetch(`${API_BASE}/elections/nominate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          election_id: electionData.cycle.id,
          ...nominationForm,
          candidate_name: nominationForm.candidate_name || currentUser?.name,
          is_resubmit: Boolean(editingNomination || myNomination),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', text: data.message });
        setEditingNomination(false);
        loadElectionData();
      } else {
        setNotification({ type: 'error', text: data.error });
      }
    } catch (err) {
      setNotification({ type: 'error', text: err.message });
    } finally {
      setSubmittingNomination(false);
    }
  };

  const handleStartResubmit = () => {
    if (myNomination) {
      setNominationForm({
        post_id: myNomination.post_id || (posts?.[0]?.id || ''),
        candidate_name: myNomination.candidate_name || currentUser?.name || '',
        manifesto: myNomination.manifesto || '',
        proposer_name: myNomination.proposer_name || '',
        seconder_name: myNomination.seconder_name || '',
      });
      setEditingNomination(true);
    }
  };

  // 2. Select Candidate on Digital Ballot
  const handleSelectCandidate = (postId, nominationId) => {
    setSelectedCandidates((prev) => ({
      ...prev,
      [postId]: nominationId,
    }));
  };

  // 3. Request 2-Step Voting OTP
  const handleRequestVotingOtp = async () => {
    if (!electionData?.cycle?.id) return;
    setOtpModal((prev) => ({ ...prev, show: true, sendingOtp: true, error: '', success: '' }));
    try {
      const res = await fetch(`${API_BASE}/elections/voting/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ election_id: electionData.cycle.id }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpModal((prev) => ({
          ...prev,
          sendingOtp: false,
          success: data.message,
          error: '',
        }));
      } else {
        setOtpModal((prev) => ({
          ...prev,
          sendingOtp: false,
          error: data.error,
        }));
      }
    } catch (err) {
      setOtpModal((prev) => ({
        ...prev,
        sendingOtp: false,
        error: err.message,
      }));
    }
  };

  // 4. Cast Final Secret Ballot
  const handleCastBallot = async () => {
    if (!otpModal.otpValue || otpModal.otpValue.length < 4) {
      setOtpModal((prev) => ({ ...prev, error: 'Please enter the valid OTP sent to your email.' }));
      return;
    }

    const selections = Object.entries(selectedCandidates).map(([postId, nominationId]) => ({
      post_id: parseInt(postId, 10),
      candidate_nomination_id: parseInt(nominationId, 10),
    }));

    if (selections.length === 0) {
      setOtpModal((prev) => ({ ...prev, error: 'Please select candidates on your ballot paper before casting vote.' }));
      return;
    }

    setOtpModal((prev) => ({ ...prev, castingVote: true, error: '' }));
    try {
      const res = await fetch(`${API_BASE}/elections/voting/cast-ballot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          election_id: electionData.cycle.id,
          selections,
          otp: otpModal.otpValue,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpModal({ show: false, otpValue: '', sendingOtp: false, castingVote: false, error: '', success: '' });
        setNotification({ type: 'success', text: data.message });
        loadElectionData();
      } else {
        setOtpModal((prev) => ({ ...prev, castingVote: false, error: data.error }));
      }
    } catch (err) {
      setOtpModal((prev) => ({ ...prev, castingVote: false, error: err.message }));
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <div className={styles.spinner} />
        <div>Entering Democratic Member Voting Booth...</div>
      </div>
    );
  }

  if (!electionData || !electionData.cycle) {
    return null;
  }

  const { cycle, posts, nominations, userVoterRecord, results, stats } = electionData;
  if (cycle.status === 'AUDIT_PHASE' || cycle.status === 'AUDIT_CLEARED') {
    return null;
  }

  const isPollingOpen = cycle.status === 'POLLING_ACTIVE';
  const hasVoted = userVoterRecord?.has_voted;
  const isResultsDeclared = cycle.status === 'RESULTS_DECLARED' || cycle.status === 'COMPLETED';

  // Check if current user already nominated
  const myNomination = nominations?.find((n) => n.candidate_user_id === currentUser?.id);

  return (
    <div className={styles.container}>
      {/* Voter Profile Banner */}
      <div className={styles.voterBanner}>
        <div>
          <div className={styles.voterNameTag}>
            <span>Namaste, <b>{currentUser?.name}</b></span>
            <span className={styles.voterChip}>
              {userVoterRecord?.is_eligible ? '✅ Audited Eligible Voter' : '⚠️ Non-Voting Observer'}
            </span>
          </div>
          <div className={styles.electionTitleText}>
            🗳️ {cycle.title} (Telangana Societies Act Regd No: 784/2025)
          </div>
        </div>

        <div>
          {hasVoted ? (
            <span className={styles.votedBadge}>✓ BALLOT CAST &amp; SEALED</span>
          ) : isPollingOpen ? (
            <span className={styles.pollingLiveBadge}>🟢 LIVE POLLING ACTIVE</span>
          ) : (
            <span className={styles.scheduledBadge}>📅 {cycle.status.replace('_', ' ')}</span>
          )}
        </div>
      </div>

      {notification && (
        <div className={notification.type === 'success' ? styles.alertSuccess : styles.alertError}>
          <span>{notification.text}</span>
          <button type="button" onClick={() => setNotification(null)} className={styles.closeAlertBtn}>✕</button>
        </div>
      )}

      {/* =========================================================================
          WINNER PROCLAMATION BANNER (IF RESULTS DECLARED)
      ========================================================================= */}
      {isResultsDeclared && (
        <div className={styles.resultsBanner}>
          <div className={styles.resultsBannerHead}>
            <span style={{ fontSize: '2rem' }}>🏆</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#9a3412' }}>Official General Election Results &amp; Proclamation</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                Declared and certified by the Statutory Returning Officer on {new Date(cycle.results_date || Date.now()).toLocaleDateString('en-IN')}.
              </p>
            </div>
          </div>

          <div className={styles.winnersGrid}>
            {results?.map((res) => (
              <div key={res.id} className={styles.winnerCard}>
                <div className={styles.winnerPostLabel}>{res.post_name}</div>
                <div className={styles.winnerPersonName}>{res.winner_name}</div>
                <div className={styles.winnerDetails}>
                  {res.is_uncontested ? '⭐ Elected Unopposed (ఏకగ్రీవం)' : `Secured ${res.votes_secured} Votes (Margin: +${res.margin})`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          1. LIVE SECRET DIGITAL BALLOT (IF POLLING ACTIVE & NOT VOTED)
      ========================================================================= */}
      {isPollingOpen && !hasVoted && (
        <div className={styles.ballotSection}>
          <div className={styles.ballotHead}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.35rem', color: '#0f172a' }}>
                🗳️ Official Secret Digital Ballot Paper
              </h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                Select your preferred candidate for each executive committee post. Your ballot is 100% secret and encrypted.
              </p>
            </div>
            <div className={styles.turnoutPill}>
              Live Turnout: {stats?.turnoutPct || 0}%
            </div>
          </div>

          <div className={styles.postsList}>
            {posts?.map((p) => {
              const postCandidates = nominations?.filter((n) => n.post_id === p.id && n.status === 'ACCEPTED') || [];
              const selectedNomId = selectedCandidates[p.id];

              return (
                <div key={p.id} className={styles.ballotPostBox}>
                  <div className={styles.ballotPostHeader}>
                    <div>
                      <span className={styles.ballotPostName}>{p.post_name}</span>
                      <span className={styles.vacanciesTag}>{p.vacancies} Post</span>
                    </div>
                    {selectedNomId ? (
                      <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#16a34a' }}>✓ Choice Selected</span>
                    ) : (
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ea580c' }}>Select 1 Candidate</span>
                    )}
                  </div>

                  {postCandidates.length === 0 ? (
                    <div style={{ padding: '16px', color: '#94a3b8', fontSize: '0.88rem' }}>
                      No contested candidates for this post.
                    </div>
                  ) : (
                    <div className={styles.ballotCandidatesGrid}>
                      {postCandidates.map((cand) => {
                        const isSelected = selectedNomId === cand.id;
                        return (
                          <div
                            key={cand.id}
                            className={`${styles.ballotCandCard} ${isSelected ? styles.ballotCandCardSelected : ''}`}
                            onClick={() => handleSelectCandidate(p.id, cand.id)}
                          >
                            <div className={styles.candSelectCircle}>
                              {isSelected ? '✓' : ''}
                            </div>
                            <img
                              src={cand.candidate_photo_url || '/images/activity-leadership.png'}
                              alt={cand.candidate_name}
                              className={styles.candPhoto}
                            />
                            <div style={{ flex: 1 }}>
                              <div className={styles.candNameText}>{cand.candidate_name}</div>
                              <div className={styles.candManifestoText}>&ldquo;{cand.manifesto}&rdquo;</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Cast Ballot Trigger Button */}
          <div className={styles.castBallotBox}>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#0f172a' }}>Ready to Cast Your Secret Ballot?</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                You will receive a 6-digit confidential OTP on your registered email to authorize your vote.
              </div>
            </div>

            <button
              type="button"
              onClick={handleRequestVotingOtp}
              className={styles.castVotePrimaryBtn}
            >
              🔐 Authenticate &amp; Cast Secret Ballot
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. ALREADY VOTED SEALED ACKNOWLEDGMENT
      ========================================================================= */}
      {hasVoted && (
        <div className={styles.alreadyVotedCard}>
          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🗳️</div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '1.3rem', color: '#15803d' }}>
            Your Secret Digital Ballot is Sealed!
          </h3>
          <p style={{ margin: 0, fontSize: '0.92rem', color: '#475569', maxWidth: '520px', lineHeight: '1.5' }}>
            Thank you for exercising your democratic right in the Hindu Swaraj Youth Association General Elections. 
            Your vote has been cryptographically recorded. Official results will be proclaimed when counting concludes.
          </p>
        </div>
      )}

      {/* =========================================================================
          3. CANDIDATE NOMINATION FILING SECTION (IF NOMINATIONS ACTIVE)
      ========================================================================= */}
      {cycle.status === 'NOTIFIED' && (
        <div className={styles.nominationSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: '#0f172a' }}>
                📝 File Candidate Nomination
              </h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                Eligible dues-cleared members can submit candidature for executive posts.
              </p>
            </div>
            {myNomination && (
              <span className={styles.myNomTag} data-status={myNomination.status}>
                Nomination Status: <b>{myNomination.status}</b> ({myNomination.post_name})
              </span>
            )}
          </div>

          {!myNomination || editingNomination ? (
            <form onSubmit={handleFileNomination} className={styles.nomForm}>
              {editingNomination && (
                <div style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.86rem' }}>
                  ⚠️ <b>Rectification / Resubmission Mode:</b> Correct any discrepancies and resubmit your candidature for Returning Officer re-scrutiny.
                </div>
              )}

              <div className={styles.formGrid2}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Select Post Contested</label>
                  <select
                    className={styles.inputControl}
                    value={nominationForm.post_id}
                    onChange={(e) => setNominationForm({ ...nominationForm, post_id: e.target.value })}
                    required
                  >
                    {posts?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.post_name} ({p.vacancies} Vacancy)
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Candidate Full Name</label>
                  <input
                    type="text"
                    className={styles.inputControl}
                    value={nominationForm.candidate_name}
                    onChange={(e) => setNominationForm({ ...nominationForm, candidate_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Candidate Vision &amp; Manifesto Statement</label>
                <textarea
                  rows={2}
                  className={styles.inputControl}
                  placeholder="Share your goals and vision for youth seva and association leadership..."
                  value={nominationForm.manifesto}
                  onChange={(e) => setNominationForm({ ...nominationForm, manifesto: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Proposer Member Name (ప్రతిపాదించిన సభ్యుడు)</label>
                  <input
                    type="text"
                    className={styles.inputControl}
                    placeholder="e.g. Senior Member Rajesh"
                    value={nominationForm.proposer_name}
                    onChange={(e) => setNominationForm({ ...nominationForm, proposer_name: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Seconder Member Name (సమర్థించిన సభ్యుడు)</label>
                  <input
                    type="text"
                    className={styles.inputControl}
                    placeholder="e.g. Active Member Suresh"
                    value={nominationForm.seconder_name}
                    onChange={(e) => setNominationForm({ ...nominationForm, seconder_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {editingNomination && (
                  <button
                    type="button"
                    onClick={() => setEditingNomination(false)}
                    className={styles.modalCancelBtn}
                    style={{ padding: '10px 18px', fontSize: '0.88rem' }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submittingNomination}
                  className={styles.submitNomBtn}
                >
                  {submittingNomination
                    ? 'Submitting...'
                    : editingNomination
                    ? '💾 Re-Submit Rectified Nomination'
                    : '📝 Submit Nomination for Scrutiny'}
                </button>
              </div>
            </form>
          ) : myNomination.status === 'REJECTED' ? (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '18px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontWeight: '900', color: '#991b1b', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>❌ Nomination Rejected by Returning Officer</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#b91c1c', marginTop: '4px' }}>
                    <b>Scrutiny Remarks:</b> {myNomination.scrutiny_remarks || 'Statutory ineligibility / discrepancy identified during scrutiny.'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                    Contested Post: <b>{myNomination.post_name}</b> &bull; Proposed by {myNomination.proposer_name}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStartResubmit}
                  className={styles.submitNomBtn}
                  style={{ background: '#ea580c', color: '#fff', padding: '10px 22px', fontSize: '0.9rem', width: 'auto' }}
                >
                  ✏️ Rectify &amp; Resubmit Nomination ➔
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.nomSummaryBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontWeight: '800', color: '#0f172a' }}>
                    Your nomination for <b>{myNomination.post_name}</b> has been filed.
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                    Manifesto: &ldquo;{myNomination.manifesto}&rdquo; &bull; Proposed by {myNomination.proposer_name}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleStartResubmit}
                  className={styles.modalCancelBtn}
                  style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                >
                  ✏️ Edit Details
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2-Step Email OTP Security Modal */}
      {otpModal.show && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '6px' }}>🔐</div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>2-Step Secret Ballot Authorization</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#64748b' }}>
                Enter the 6-digit confidential OTP sent to your registered email to cast your vote.
              </p>
            </div>

            {otpModal.error && (
              <div className={styles.modalError}>{otpModal.error}</div>
            )}
            {otpModal.success && (
              <div className={styles.modalSuccess}>{otpModal.success}</div>
            )}

            <div className={styles.otpInputWrap}>
              <input
                type="text"
                maxLength={6}
                placeholder="• • • • • •"
                className={styles.otpInputBox}
                value={otpModal.otpValue}
                onChange={(e) => setOtpModal({ ...otpModal, otpValue: e.target.value })}
                autoFocus
              />
            </div>

            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <button
                type="button"
                onClick={handleRequestVotingOtp}
                disabled={otpModal.sendingOtp}
                style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {otpModal.sendingOtp ? 'Sending fresh OTP...' : '🔄 Resend Voting OTP to Email'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setOtpModal({ show: false, otpValue: '', sendingOtp: false, castingVote: false, error: '', success: '' })}
                className={styles.modalCancelBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCastBallot}
                disabled={otpModal.castingVote || !otpModal.otpValue}
                className={styles.modalConfirmVoteBtn}
              >
                {otpModal.castingVote ? 'Casting Secret Ballot...' : '🗳️ Confirm & Cast Secret Ballot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
