'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './DonationSection.module.css';

const amounts = [100, 500, 1000, 5000];

export default function DonationSection({ 
  compact = false, 
  defaultEmail = '', 
  defaultName = '', 
  defaultMobile = '',
  memberId = null
}) {
  const router = useRouter();
  const [paymentMode, setPaymentMode] = useState('online'); // 'online' | 'bank'
  const [copiedField, setCopiedField] = useState('');
  const [bankInfo, setBankInfo] = useState({
    account_name: 'HINDU SWARAJ YOUTH WELFARE ASSOCIATION',
    bank_name: 'Union Bank of India',
    account_no: '084910100054321',
    ifsc_code: 'UBIN0808491',
    branch_name: 'Jagtial Main Branch',
    account_type: 'Current Account',
    regd_no: 'Regd. No: 784/2025 (Govt. of Telangana)',
  });

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2500);
  };
  
  // Donor Form State
  const [formData, setFormData] = useState({
    name: defaultName || '',
    email: defaultEmail || '',
    mobile: defaultMobile || '',
    address: '',
    fundType: 'Youth Development Programs'
  });

  useEffect(() => {
    if (defaultEmail || defaultName || defaultMobile) {
      setFormData(prev => ({
        ...prev,
        name: defaultName || prev.name,
        email: defaultEmail || prev.email,
        mobile: defaultMobile || prev.mobile
      }));
    }
  }, [defaultEmail, defaultName, defaultMobile]);

  const [selected, setSelected] = useState(500);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fundTypes, setFundTypes] = useState([]);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoOrderData, setDemoOrderData] = useState(null);

  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');

  const completeDemoPayment = async () => {
    if (!demoOrderData) return;
    setLoading(true);
    setSuccess("Verifying test payment... Please wait.");
    setShowDemoModal(false);
    try {
      const testPayId = `pay_test_${Date.now()}`;
      const verifyRes = await fetch(`${API_BASE_URL}/payment/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: demoOrderData.order_id,
          razorpay_payment_id: testPayId,
          razorpay_signature: 'test_signature'
        })
      });

      if (verifyRes.ok) {
        setSuccess(`Payment Successful! Redirecting...`);
        router.push(`/payment-success?payment_id=${testPayId}`);
      } else {
        throw new Error('Test payment verification failed');
      }
    } catch (e) {
      console.error(e);
      setError("Payment verification failed. Please contact support.");
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchFundTypes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/contributions/funds`);
        if (response.ok) {
          const data = await response.json();
          setFundTypes(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, fundType: data[0] }));
          }
        } else {
          console.error(`API Error: ${response.status} - ${await response.text()}`);
        }
      } catch (err) {
        console.error('Failed to fetch fund types. Is the backend running? Error:', err);
      }
    };

    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/association-settings/public`);
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setBankInfo({
              account_name: data.account_name || 'HINDU SWARAJ YOUTH WELFARE ASSOCIATION',
              bank_name: data.bank_name || 'Union Bank of India',
              account_no: data.account_no || '084910100054321',
              ifsc_code: data.ifsc_code || 'UBIN0808491',
              branch_name: data.branch_name || 'Jagtial Main Branch',
              account_type: data.account_type || 'Current Account',
              regd_no: data.regd_no || 'Regd. No: 784/2025 (Govt. of Telangana)',
            });
          }
        }
      } catch (err) {
        console.warn('Using default bank details');
      }
    };

    fetchFundTypes();
    fetchSettings();
  }, [API_BASE_URL]);

  const getAmount = () => {
    if (custom) return parseFloat(custom) || 0;
    return selected;
  };

  const currentAmount = getAmount();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.email || !currentAmount || !formData.fundType || !formData.address) {
      setError("Please fill all required fields and select an amount.");
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    if (currentAmount < 1) {
      setError("Please enter a valid amount greater than ₹1.");
      setLoading(false);
      return;
    }

    try {
      // 1. Create Order on Backend
      const response = await fetch(`${API_BASE_URL}/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payer_name: formData.name,
          email: formData.email,
          mobile_number: formData.mobile,
          address: formData.address,
          amount: currentAmount,
          fund_type: formData.fundType,
          member_id: memberId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      // If test fallback order is generated due to unauthenticated Razorpay keys
      if (data.order_id && data.order_id.startsWith("order_test_")) {
        setDemoOrderData(data);
        setShowDemoModal(true);
        setLoading(false);
        return;
      }

      // 2. Load Razorpay Script
      const res = await loadRazorpay();
      if (!res) {
        setError("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      // 3. Initialize Razorpay Checkout
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency || 'INR',
        name: "Hindu Swaraj Youth Welfare Association",
        description: `Donation for ${formData.fundType || 'Youth & Community Welfare'}`,
        image: "/logo.png",
        order_id: data.order_id,
        handler: async function (response) {
          setLoading(true);
          setSuccess("Verifying payment... Please wait.");
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || data.order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature || 'test_signature'
              })
            });
            
            if (verifyRes.ok) {
              setSuccess(`Payment Successful! Redirecting...`);
              router.push(`/payment-success?payment_id=${response.razorpay_payment_id}`);
            } else {
              throw new Error('Verification failed');
            }
          } catch (e) {
            console.error(e);
            setError("Payment verification failed. Please contact support.");
            setLoading(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.mobile
        },
        theme: {
          color: "#059669"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.donation} id="donate" style={compact ? { padding: "20px 0", background: "transparent" } : {}}>
      <div className="container">
        <div className={styles.header}>
          <span className="section-label">CONTRIBUTION PORTAL</span>
          <h2 className="section-title">Support Our Cause</h2>
          <p className={`section-subtitle ${styles.subtitle}`}>
            Your contributions directly fund youth development programs, blood donation camps, and local community service.
          </p>
        </div>

        <div className={styles.donationBox}>
          
          {/* Mode Switcher Tabs */}
          <div className={styles.tabContainer}>
            <button
              type="button"
              className={`${styles.tabBtn} ${paymentMode === 'online' ? styles.tabBtnActive : ''}`}
              onClick={() => setPaymentMode('online')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
              </svg>
              Instant Online Payment
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${paymentMode === 'bank' ? styles.tabBtnActive : ''}`}
              onClick={() => setPaymentMode('bank')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"/>
              </svg>
              Direct Bank Transfer (NEFT / IMPS)
            </button>
          </div>

          {paymentMode === 'bank' ? (
            /* --- OFFICIAL BANK TRANSFER BOX --- */
            <div style={{
              background: 'linear-gradient(135deg, #fffdf8 0%, #fff9ee 100%)',
              border: '2px solid #e8c87a',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 8px 24px rgba(194, 157, 83, 0.12)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Saffron Watermark */}
              <div style={{
                position: 'absolute',
                right: '-10px',
                bottom: '-20px',
                fontSize: '120px',
                color: 'rgba(88, 5, 5, 0.04)',
                fontFamily: 'serif',
                pointerEvents: 'none'
              }}>
                ॐ
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #580505, #7a1818)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#c29d53',
                    fontSize: '20px'
                  }}>
                    🏛️
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#580505' }}>
                      Official Association Bank Account
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#854d0e', fontWeight: '600' }}>
                      Direct IMPS / NEFT / RTGS Transfer
                    </p>
                  </div>
                </div>

                <span style={{
                  background: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #fde68a',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  letterSpacing: '0.5px'
                }}>
                  📜 {bankInfo.regd_no || 'Regd. No: 784/2025 (Govt. of Telangana)'}
                </span>
              </div>

              {/* Bank Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '14px',
                marginBottom: '22px'
              }}>
                {/* Account Name */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', gridColumn: '1 / -1' }}>
                  <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>
                    Beneficiary / Account Name
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    <strong style={{ fontSize: '1rem', color: '#0f172a', letterSpacing: '0.5px' }}>
                      {bankInfo.account_name}
                    </strong>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bankInfo.account_name, 'name')}
                      style={{
                        background: copiedField === 'name' ? '#dcfce7' : '#f1f5f9',
                        color: copiedField === 'name' ? '#15803d' : '#334155',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {copiedField === 'name' ? '✓ Copied' : '📋 Copy'}
                    </button>
                  </div>
                </div>

                {/* Bank Name */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                  <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>
                    Bank Name
                  </span>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: '#0f172a', marginTop: '4px' }}>
                    {bankInfo.bank_name}
                  </strong>
                </div>

                {/* Account Number */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                  <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>
                    Account Number
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    <strong style={{ fontSize: '1.05rem', color: '#580505', letterSpacing: '1px', fontFamily: 'monospace' }}>
                      {bankInfo.account_no}
                    </strong>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bankInfo.account_no, 'ac')}
                      style={{
                        background: copiedField === 'ac' ? '#dcfce7' : '#f1f5f9',
                        color: copiedField === 'ac' ? '#15803d' : '#334155',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {copiedField === 'ac' ? '✓ Copied' : '📋 Copy'}
                    </button>
                  </div>
                </div>

                {/* IFSC Code */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                  <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>
                    IFSC Code
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    <strong style={{ fontSize: '1.05rem', color: '#580505', letterSpacing: '1px', fontFamily: 'monospace' }}>
                      {bankInfo.ifsc_code}
                    </strong>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bankInfo.ifsc_code, 'ifsc')}
                      style={{
                        background: copiedField === 'ifsc' ? '#dcfce7' : '#f1f5f9',
                        color: copiedField === 'ifsc' ? '#15803d' : '#334155',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {copiedField === 'ifsc' ? '✓ Copied' : '📋 Copy'}
                    </button>
                  </div>
                </div>

                {/* Branch & Location */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                  <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' }}>
                    Branch &amp; Type
                  </span>
                  <strong style={{ display: 'block', fontSize: '0.92rem', color: '#0f172a', marginTop: '4px' }}>
                    {bankInfo.branch_name} • {bankInfo.account_type}
                  </strong>
                </div>
              </div>

              {/* Instructions & WhatsApp Confirmation */}
              <div style={{
                background: '#f8fafc',
                border: '1px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: '1.4' }}>
                    💡 <strong>Receipt Note:</strong> After completing the direct bank transfer, please share the transaction UTR/Screenshot on WhatsApp to receive your official signed digital donation receipt.
                  </p>
                </div>
                <a
                  href="https://wa.me/918499878425?text=Namaste!%20I%20have%20completed%20a%20direct%20bank%20transfer%20donation%20to%20Hindu%20Swaraj%20Youth%20account.%20Please%20find%20my%20details%20attached."
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#25D366',
                    color: '#ffffff',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 6px rgba(37,211,102,0.3)',
                    flexShrink: 0
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/>
                  </svg>
                  Confirm on WhatsApp
                </a>
              </div>
            </div>
          ) : (
          <form onSubmit={handlePayment}>

            {/* Amount Selector */}
            <div className={styles.amountSection}>
              <label className={styles.fieldLabel}>Select Contribution Amount (INR)</label>
              <div className={styles.amountsGrid}>
                {amounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
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

            <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

            {/* Donor Details Form */}
            <div className={styles.donorDetailsSection}>
              <label className={styles.fieldLabel} style={{ marginBottom: '15px', display: 'block' }}>Donor Details</label>
              
              <div style={{ marginBottom: '15px' }}>
                <select
                  name="fundType"
                  value={formData.fundType}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  required
                >
                  {fundTypes.length > 0 ? (
                    fundTypes.map((type, idx) => (
                      <option key={idx} value={type}>{type}</option>
                    ))
                  ) : (
                    <option value="General Donation">General Donation</option>
                  )}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <input 
                  type="text" 
                  name="name"
                  placeholder="Full Name *" 
                  value={formData.name}
                  onChange={handleInputChange}
                  className={styles.formInput} 
                  required
                />
                <input 
                  type="text" 
                  name="mobile"
                  placeholder="Mobile Number *" 
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className={styles.formInput} 
                  required
                />
              </div>
              
              <input 
                type="email" 
                name="email"
                placeholder="Email Address *" 
                value={formData.email}
                onChange={handleInputChange}
                className={styles.formInput} 
                style={{ marginBottom: '15px' }}
                required
              />

              <textarea 
                name="address"
                placeholder="Full Address *" 
                value={formData.address}
                onChange={handleInputChange}
                className={styles.formInput} 
                style={{ resize: 'vertical', minHeight: '80px', marginBottom: '20px' }}
                required
              ></textarea>

              {error && <p style={{ color: '#ef4444', marginBottom: '15px', fontSize: '14px' }}>{error}</p>}
              {success && <p style={{ color: '#10b981', marginBottom: '15px', fontSize: '14px', fontWeight: 'bold' }}>{success}</p>}

              <button
                type="submit"
                disabled={loading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#ffffff",
                  padding: "16px 24px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  textDecoration: "none",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  width: "100%",
                  fontSize: "16px",
                  boxShadow: "0 4px 6px rgba(16, 185, 129, 0.2)",
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                      <line x1="12" y1="2" x2="12" y2="6"></line>
                      <line x1="12" y1="18" x2="12" y2="22"></line>
                      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                      <line x1="2" y1="12" x2="6" y2="12"></line>
                      <line x1="18" y1="12" x2="22" y2="12"></line>
                      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                    </svg>
                    Processing...
                  </span>
                ) : `Proceed to Pay ₹${currentAmount.toLocaleString()}`}
              </button>
            </div>
          </form>
          )}

          <p className={styles.secureBadge} style={{ marginTop: '20px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
            Secured via Official HSY Association Payment Channels
          </p>
        </div>
      </div>

      {/* --- SIMULATED PAYMENT MODAL FOR LOCAL TESTING --- */}
      {showDemoModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', padding: '30px', maxWidth: '420px', width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', textAlign: 'center', border: '1px solid #e2e8f0'
          }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px' }}>
              💳
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
              Simulated Payment Gateway
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
              Local Testing Mode (HSY Association Portal)
            </p>

            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', marginBottom: '24px', textAlign: 'left', fontSize: '0.88rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Donor:</span>
                <span style={{ fontWeight: '700', color: '#1e293b' }}>{formData.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Fund:</span>
                <span style={{ fontWeight: '700', color: '#1e293b' }}>{formData.fundType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Amount:</span>
                <span style={{ fontWeight: '900', color: '#10b981', fontSize: '1.1rem' }}>₹{currentAmount.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff',
                  color: '#64748b', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={completeDemoPayment}
                style={{
                  flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 6px rgba(16,185,129,0.2)'
                }}
              >
                Pay ₹{currentAmount.toLocaleString()} ✅
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
