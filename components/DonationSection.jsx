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
  const [selected, setSelected] = useState(500);
  const [custom, setCustom] = useState('');
  
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fundTypes, setFundTypes] = useState([]);

  useEffect(() => {
    const fetchFundTypes = async () => {
      try {
        const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');
        const response = await fetch(`${baseUrl}/contributions/funds`);
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
    fetchFundTypes();
  }, []);

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
    setError('');
    setSuccess('');
    setLoading(true);

    if (currentAmount < 1) {
      setError("Please enter a valid amount greater than ₹1.");
      setLoading(false);
      return;
    }

    if (!formData.name || !formData.email || !formData.mobile || !formData.address) {
      setError("All fields are mandatory to proceed with payment.");
      setLoading(false);
      return;
    }

    try {
      // 1. Load Razorpay Script
      const res = await loadRazorpay();
      if (!res) {
        setError("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      // 2. Create Order on Backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/payment/create-order`, {
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

      // 3. Initialize Razorpay Checkout
      const options = {
        key: data.key_id, // Passed from backend
        amount: data.amount,
        currency: data.currency,
        name: "Hindu Swaraj Youth Welfare Association",
        description: "Donation for Youth & Community Welfare",
        image: "/logo.png", // Replace with your actual logo path if you have one
        order_id: data.order_id,
        handler: async function (response) {
          setLoading(true);
          setSuccess("Verifying payment... Please wait.");
          // Verify on backend
          try {
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            
            if (verifyRes.ok) {
              setSuccess(`Payment Successful! Redirecting...`);
              // Redirect to the success page with the payment ID
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

          <p className={styles.secureBadge} style={{ marginTop: '20px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
            Secured via Razorpay Payment Gateway
          </p>
        </div>
      </div>
    </section>
  );
}
