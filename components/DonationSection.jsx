'use client';
import { useState } from 'react';
import styles from './DonationSection.module.css';

const amounts = [100, 500, 1000, 5000];

export default function DonationSection() {
  const [selected, setSelected] = useState(500);
  const [custom, setCustom] = useState('');
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' or 'bank'
  const [copiedField, setCopiedField] = useState(null);

  const getAmount = () => {
    if (custom) return parseFloat(custom) || 0;
    return selected;
  };

  const currentAmount = getAmount();

  // SBI Current Account Details
  const bankDetails = {
    name: 'HINDUSWARAJ YOUTH WELFARE ASSOCIATION J AGTIAL',
    accountNumber: '45378236294',
    ifsc: 'SBIN0020135',
    bank: 'State Bank of India (SBI)',
    branch: 'Ashok Nagar Branch, Jagtial',
    upiId: '45378236294@sbi'
  };

  // Generate UPI URI (Omit preset amount and use simplified payee name to ensure compatibility with all scanners)
  const upiUri = `upi://pay?pa=${bankDetails.upiId}&pn=Hindu%20Swaraj&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUri)}`;

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <section className={styles.donation} id="donate">
      <div className="container">
        <div className={styles.header}>
          <span className="section-label">CONTRIBUTION PORTAL</span>
          <h2 className="section-title">Support Our Cause</h2>
          <p className={`section-subtitle ${styles.subtitle}`}>
            Your contributions directly fund youth development programs, blood donation camps, and local community service.
          </p>
        </div>

        <div className={styles.donationBox}>
          {/* Tab Switcher */}
          <div className={styles.tabContainer}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'upi' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('upi')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Scan &amp; Pay (UPI)
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'bank' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('bank')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>
              Bank Transfer (NEFT/IMPS)
            </button>
          </div>

          {/* Amount Selector */}
          <div className={styles.amountSection}>
            <label className={styles.fieldLabel}>Select Contribution Amount (INR)</label>
            <div className={styles.amountsGrid}>
              {amounts.map((amt) => (
                <button
                  key={amt}
                  className={`${styles.amountCard} ${selected === amt && !custom ? styles.amountCardActive : ''}`}
                  onClick={() => { setSelected(amt); setCustom(''); }}
                >
                  <span className={styles.currency}>₹</span>
                  <span className={styles.amount}>{amt.toLocaleString()}</span>
                </button>
              ))}
            </div>

            <div className={styles.customInput}>
              <span className={styles.customCurrency}>₹</span>
              <input
                type="number"
                placeholder="Enter Custom Amount"
                value={custom}
                onChange={(e) => { setCustom(e.target.value); setSelected(0); }}
                className={styles.input}
                min="1"
              />
            </div>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === 'upi' ? (
              <div className={styles.upiContent}>
                <div className={styles.qrWrapper}>
                  {currentAmount > 0 ? (
                    <img
                      src={qrCodeUrl}
                      alt="UPI QR Code for Donation"
                      className={styles.qrImage}
                    />
                  ) : (
                    <div className={styles.qrPlaceholder}>
                      Please choose or enter a valid amount.
                    </div>
                  )}
                </div>
                <div className={styles.upiDetails}>
                  <p className={styles.qrInstructions}>
                    Scan this QR code using any UPI app (PhonePe, Google Pay, BHIM, Paytm) to pay <strong>₹{currentAmount.toLocaleString()}</strong> instantly.
                  </p>
                  <div className={styles.copyableField}>
                    <div className={styles.fieldValueInfo}>
                      <span className={styles.detailLabel}>UPI ID</span>
                      <span className={styles.detailValue}>{bankDetails.upiId}</span>
                    </div>
                    <button
                      className={styles.copyBtn}
                      onClick={() => copyToClipboard(bankDetails.upiId, 'upi')}
                      aria-label="Copy UPI ID"
                    >
                      {copiedField === 'upi' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.bankContent}>
                <p className={styles.bankInstructions}>
                  Transfer directly to the organization&apos;s bank account via Net Banking or Mobile Banking app.
                </p>

                <div className={styles.bankGrid}>
                  <div className={styles.bankDetailItem}>
                    <span className={styles.bankLabel}>ACCOUNT NAME</span>
                    <span className={styles.bankVal}>{bankDetails.name}</span>
                  </div>

                  <div className={styles.bankDetailItem}>
                    <span className={styles.bankLabel}>BANK NAME</span>
                    <span className={styles.bankVal}>{bankDetails.bank}</span>
                  </div>

                  <div className={styles.bankDetailItem}>
                    <span className={styles.bankLabel}>ACCOUNT NUMBER</span>
                    <div className={styles.copyRow}>
                      <span className={styles.bankValHighlight}>{bankDetails.accountNumber}</span>
                      <button
                        className={styles.copyTextBtn}
                        onClick={() => copyToClipboard(bankDetails.accountNumber, 'account')}
                      >
                        {copiedField === 'account' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className={styles.bankDetailItem}>
                    <span className={styles.bankLabel}>IFSC CODE</span>
                    <div className={styles.copyRow}>
                      <span className={styles.bankValHighlight}>{bankDetails.ifsc}</span>
                      <button
                        className={styles.copyTextBtn}
                        onClick={() => copyToClipboard(bankDetails.ifsc, 'ifsc')}
                      >
                        {copiedField === 'ifsc' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className={styles.bankDetailItem}>
                    <span className={styles.bankLabel}>BRANCH NAME</span>
                    <span className={styles.bankVal}>{bankDetails.branch}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className={styles.secureBadge}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
            Official welfare account registered under SBI Jagtial
          </p>
        </div>
      </div>
    </section>
  );
}
