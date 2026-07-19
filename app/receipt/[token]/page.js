"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const numberToWords = (num) => {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if ((num = num.toString()).length > 9) return "overflow";
  let n = ("000000000" + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return "";
  let str = "";
  str += Number(n[1]) != 0 ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + " Crore " : "";
  str += Number(n[2]) != 0 ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + " Lakh " : "";
  str += Number(n[3]) != 0 ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + " Thousand " : "";
  str += Number(n[4]) != 0 ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + " Hundred " : "";
  str += Number(n[5]) != 0 ? (str != "" ? "and " : "") + (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) : "";
  return str.trim();
};

export default function PublicReceiptPage() {
  const { token } = useParams();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

  useEffect(() => {
    if (!token) return;
    const fetchDonation = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/public/contribution/${token}`);
        const data = await response.json();
        if (data.success && data.data) {
          setDonation(data.data);
        } else {
          setError(data.error || "Receipt not found");
        }
      } catch (err) {
        setError("Failed to load receipt details");
      } finally {
        setLoading(false);
      }
    };
    fetchDonation();
  }, [token]);

  if (loading) {
    return (
      <div className="loading-container">
        <style>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #1a0a0a 0%, #2d0e0e 50%, #1a0505 100%);
            color: #fff;
            font-family: sans-serif;
          }
          .spinner {
            border: 4px solid rgba(255, 255, 255, 0.1);
            width: 45px;
            height: 45px;
            border-radius: 50%;
            border-left-color: #c29d53;
            animation: spin 1s linear infinite;
            margin-bottom: 15px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div className="spinner"></div>
        <p>Loading Official Receipt...</p>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="error-container">
        <style>{`
          .error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #1a0a0a 0%, #2d0e0e 50%, #1a0505 100%);
            color: #fff;
            font-family: sans-serif;
            padding: 20px;
            text-align: center;
          }
          .error-box {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid #7a1515;
            padding: 30px;
            border-radius: 12px;
            max-width: 400px;
          }
          h2 { color: #f43f5e; margin-bottom: 10px; }
          p { color: #94a3b8; margin-bottom: 20px; }
          a {
            display: inline-block;
            background: #c29d53;
            color: #1a0a0a;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
          }
        `}</style>
        <div className="error-box">
          <h2>Access Error</h2>
          <p>{error || "The receipt you are looking for does not exist or has not been approved."}</p>
          <a href="/">Go to Homepage</a>
        </div>
      </div>
    );
  }

  const logoUrl = "/images/logo_v2.png";
  const sigUrl = "/images/signature.jpg";

  const dateStr = donation.date
    ? new Date(donation.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const receiptNo = `HSY/784/25/${String(donation.id || Date.now()).slice(-4)}`;
  const amountWords = numberToWords(Number(donation.amount));

  return (
    <div className="page-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&family=Noto+Serif+Telugu:wght@400;700;900&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        .page-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a0a0a 0%, #2d0e0e 50%, #1a0505 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        .actions-bar {
          width: 100%;
          max-width: 680px;
          display: flex;
          justify-content: flex-end;
          margin-bottom: 20px;
          gap: 15px;
        }

        .print-btn {
          background: #c29d53;
          color: #1a0a0a;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(194, 157, 83, 0.3);
          transition: transform 0.2s, background 0.2s;
        }

        .print-btn:hover {
          background: #e8c87a;
          transform: translateY(-2px);
        }

        .receipt-wrapper {
          width: 100%;
          max-width: 680px;
          background: linear-gradient(180deg, #fffef8 0%, #fff9ee 40%, #fffdf6 100%);
          position: relative;
          overflow: hidden;
          box-shadow: 
            0 0 0 3px #c29d53,
            0 0 0 6px #580505,
            0 0 0 8px #c29d53,
            0 25px 60px rgba(0,0,0,0.4);
        }

        .top-bar {
          height: 8px;
          background: linear-gradient(90deg, #580505 0%, #8b1a1a 25%, #c29d53 50%, #8b1a1a 75%, #580505 100%);
        }

        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 280px;
          color: rgba(88, 5, 5, 0.03);
          font-family: 'Playfair Display', serif;
          font-weight: 900;
          pointer-events: none;
          z-index: 0;
          line-height: 1;
        }

        .corner-fl {
          position: absolute;
          width: 60px;
          height: 60px;
          z-index: 2;
        }
        .corner-fl.tl { top: 16px; left: 16px; border-top: 3px solid #c29d53; border-left: 3px solid #c29d53; }
        .corner-fl.tr { top: 16px; right: 16px; border-top: 3px solid #c29d53; border-right: 3px solid #c29d53; }
        .corner-fl.bl { bottom: 16px; left: 16px; border-bottom: 3px solid #c29d53; border-left: 3px solid #c29d53; }
        .corner-fl.br { bottom: 16px; right: 16px; border-bottom: 3px solid #c29d53; border-right: 3px solid #c29d53; }
        
        .corner-fl::after {
          content: '';
          position: absolute;
          width: 8px;
          height: 8px;
          background: #c29d53;
          border-radius: 50%;
        }
        .corner-fl.tl::after { top: -5px; left: -5px; }
        .corner-fl.tr::after { top: -5px; right: -5px; }
        .corner-fl.bl::after { bottom: -5px; left: -5px; }
        .corner-fl.br::after { bottom: -5px; right: -5px; }

        .content {
          position: relative;
          z-index: 1;
          padding: 45px 50px 0 50px;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
        }

        .logo-ring {
          width: 140px;
          height: 140px;
          margin: 0 auto 18px;
          border-radius: 50%;
          padding: 4px;
          background: linear-gradient(135deg, #c29d53 0%, #e8c87a 50%, #c29d53 100%);
          box-shadow: 0 8px 25px rgba(194,157,83,0.3);
        }

        .logo-ring img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          background: #fffdf6;
          padding: 3px;
        }

        .org-name {
          font-family: 'Noto Serif Telugu', serif;
          font-size: 30px;
          font-weight: 900;
          color: #580505;
          letter-spacing: 1px;
          text-shadow: 0 2px 4px rgba(88,5,5,0.1);
        }

        .org-subtitle {
          font-family: 'Noto Serif Telugu', serif;
          font-size: 14px;
          font-weight: 700;
          color: #c29d53;
          margin-top: 4px;
          letter-spacing: 2px;
        }

        .ornament-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 20px 0;
        }
        .ornament-divider .line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, #c29d53, transparent);
        }
        .ornament-divider .diamond {
          width: 10px;
          height: 10px;
          background: #580505;
          transform: rotate(45deg);
          border: 1.5px solid #c29d53;
        }
        .ornament-divider .dot {
          width: 5px;
          height: 5px;
          background: #c29d53;
          border-radius: 50%;
        }

        .title-banner {
          background: linear-gradient(135deg, #580505 0%, #7a1515 50%, #580505 100%);
          margin: 0 -50px;
          padding: 14px 50px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .title-banner::before, .title-banner::after {
          content: '';
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, #c29d53 30%, #e8c87a 50%, #c29d53 70%, transparent 100%);
        }
        .title-banner::before { top: 0; }
        .title-banner::after { bottom: 0; }
        
        .title-banner h2 {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 6px;
          text-transform: uppercase;
        }

        .info-row {
          display: flex;
          gap: 20px;
          margin: 28px 0;
        }
        
        .info-card {
          flex: 1;
          background: linear-gradient(135deg, #580505, #7a1818);
          border-radius: 14px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 6px 20px rgba(88,5,5,0.2);
          position: relative;
          overflow: hidden;
        }
        .info-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #c29d53, transparent);
        }
        .info-card .ic-icon {
          width: 38px;
          height: 38px;
          background: rgba(255,255,255,0.12);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c29d53;
          flex-shrink: 0;
        }
        .info-card .ic-content {
          display: flex;
          flex-direction: column;
        }
        .info-card .ic-label {
          font-size: 9px;
          font-weight: 700;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 3px;
        }
        .info-card .ic-value {
          font-size: 14px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 0.5px;
        }

        .details-table {
          border: 2px solid #c29d53;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 28px;
          background: #fff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
        }

        .dt-row {
          display: flex;
          border-bottom: 1px solid #f0e8d8;
        }
        .dt-row:last-child { border-bottom: none; }
        .dt-row:nth-child(odd) { background: #fffdf8; }
        .dt-row:nth-child(even) { background: #fff; }

        .dt-label {
          width: 200px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          background: linear-gradient(135deg, rgba(88,5,5,0.04), rgba(88,5,5,0.02));
          border-right: 2px solid #c29d53;
          flex-shrink: 0;
        }
        
        .dt-label .icon-box {
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #580505, #7a1818);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c29d53;
          flex-shrink: 0;
        }
        
        .dt-label span {
          font-size: 11px;
          font-weight: 800;
          color: #580505;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .dt-value {
          flex: 1;
          padding: 16px 22px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        .status-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
          color: #15803d;
          padding: 6px 16px;
          border-radius: 24px;
          font-size: 12px;
          font-weight: 700;
          width: fit-content;
          box-shadow: 0 2px 8px rgba(21,128,61,0.1);
        }

        .amt-main {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 800;
          color: #580505;
          letter-spacing: 0.5px;
        }
        
        .amt-words {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 4px;
          font-style: italic;
          font-weight: 500;
        }
        
        .desc-text {
          font-size: 13px;
          color: #475569;
          line-height: 1.6;
          font-weight: 500;
        }

        .bottom-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 10px 0 30px 0;
        }
        
        .thank-col {
          text-align: center;
          width: 180px;
        }
        
        .thank-title {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 700;
          font-style: italic;
          color: #580505;
          margin-bottom: 2px;
        }
        
        .thank-heart {
          font-size: 16px;
          margin-bottom: 6px;
        }
        
        .thank-text {
          font-size: 9.5px;
          color: #94a3b8;
          line-height: 1.5;
          font-weight: 500;
        }

        .center-emblem {
          text-align: center;
        }

        .sig-col {
          text-align: center;
          width: 180px;
        }
        
        .sig-img-container {
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 5px;
        }
        
        .sig-img {
          max-height: 100%;
          max-width: 140px;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        .sig-bar {
          width: 140px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #580505, transparent);
          margin: 0 auto 6px;
        }
        
        .sig-title {
          font-size: 9px;
          font-weight: 800;
          color: #580505;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 3px;
        }
        
        .sig-org {
          font-size: 9px;
          color: #94a3b8;
          font-weight: 600;
        }

        .footer {
          background: linear-gradient(135deg, #580505 0%, #3a0303 100%);
          padding: 14px 50px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .ft-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255,255,255,0.8);
          font-size: 10px;
          font-weight: 600;
        }
        
        .ft-item svg { color: #c29d53; flex-shrink: 0; }

        .bottom-bar {
          height: 6px;
          background: linear-gradient(90deg, #580505, #c29d53, #580505);
        }

        @media print {
          body { background: #fff; padding: 0; }
          .page-wrapper { background: #fff; padding: 0; }
          .actions-bar { display: none; }
          .receipt-wrapper { box-shadow: none; max-width: 100%; }
        }
      `}</style>

      {/* Top Actions Bar */}
      <div className="actions-bar">
        <button onClick={() => window.print()} className="print-btn">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Receipt
        </button>
      </div>

      {/* Premium Receipt Card */}
      <div className="receipt-wrapper">
        <div className="top-bar"></div>

        {/* Corner flourishes */}
        <div className="corner-fl tl"></div>
        <div className="corner-fl tr"></div>
        <div className="corner-fl bl"></div>
        <div className="corner-fl br"></div>

        {/* Watermark */}
        <div className="watermark">ॐ</div>

        <div className="content">
          {/* Header */}
          <div className="header">
            <div className="logo-ring">
              <img src={logoUrl} alt="Hindu Swaraj Youth Logo" />
            </div>
            <div className="org-name">హిందూ స్వరాజ్ యూత్</div>
            <div className="org-subtitle">HINDU SWARAJ YOUTH</div>
          </div>

          {/* Divider */}
          <div className="ornament-divider">
            <div className="line"></div>
            <div className="dot"></div>
            <div className="diamond"></div>
            <div className="dot"></div>
            <div className="line"></div>
          </div>

          {/* Title Banner */}
          <div className="title-banner">
            <h2>Donation Receipt</h2>
          </div>

          {/* Info Row */}
          <div className="info-row">
            <div className="info-card">
              <div className="ic-icon">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div className="ic-content">
                <div className="ic-label">Receipt No.</div>
                <div className="ic-value">{receiptNo}</div>
              </div>
            </div>
            <div className="info-card">
              <div className="ic-icon">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <div className="ic-content">
                <div className="ic-label">Date</div>
                <div className="ic-value">{dateStr}</div>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="details-table">
            <div className="dt-row">
              <div className="dt-label">
                <div className="icon-box">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <span>Donor Name</span>
              </div>
              <div className="dt-value">{donation.title}</div>
            </div>

            <div className="dt-row">
              <div className="dt-label">
                <div className="icon-box">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <span>Date</span>
              </div>
              <div className="dt-value">{dateStr}</div>
            </div>

            <div className="dt-row">
              <div className="dt-label">
                <div className="icon-box">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <span>Payment Status</span>
              </div>
              <div className="dt-value">
                <div className="status-chip">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  Payment Successful
                </div>
              </div>
            </div>

            <div className="dt-row">
              <div className="dt-label">
                <div className="icon-box">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <span>Amount</span>
              </div>
              <div className="dt-value">
                <span className="amt-main">₹ {Number(donation.amount).toLocaleString("en-IN")}.00</span>
                <span className="amt-words">( {amountWords} Rupees Only )</span>
              </div>
            </div>

            <div className="dt-row">
              <div className="dt-label">
                <div className="icon-box">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7"/>
                  </svg>
                </div>
                <span>Description</span>
              </div>
              <div className="dt-value">
                <span className="desc-text">{donation.desc || donation.payment_note || "Donation towards social service activities and community development initiatives."}</span>
              </div>
            </div>
          </div>

          {/* Bottom section */}
          <div className="bottom-section">
            <div className="thank-col">
              <div className="thank-title">Thank You!</div>
              <div className="thank-heart">🙏</div>
              <div className="thank-text">Your generosity helps us<br/>build a stronger society.</div>
            </div>

            <div className="center-emblem">
              <svg width="60" height="70" viewBox="0 0 100 110" fill="none">
                <path d="M50 10 C80 15, 90 30, 90 60 C90 90, 70 100, 50 110 C30 100, 10 90, 10 60 C10 30, 20 15, 50 10 Z" stroke="#c29d53" strokeWidth="2"/>
                <path d="M50 18 C73 22, 82 34, 82 58 C82 82, 66 92, 50 100 C34 92, 18 82, 18 58 C18 34, 27 22, 50 18 Z" stroke="#c29d53" strokeWidth="1" strokeDasharray="4 3"/>
                <text x="50" y="68" textAnchor="middle" fontSize="36" fill="#580505" fontFamily="serif" opacity="0.8">ॐ</text>
              </svg>
            </div>

            <div className="sig-col">
              <div className="sig-img-container">
                <img src={sigUrl} alt="Signature" className="sig-img" />
              </div>
              <div className="sig-bar"></div>
              <div className="sig-title">Authorized Signatory</div>
              <div className="sig-org">Hindu Swaraj Youth</div>
              <div className="sig-org">Aravind Nagar, Jagtial</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <div className="ft-item">
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79a15.15 15.15 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            <span>+91 8499878425</span>
          </div>
          <div className="ft-item">
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
            </svg>
            <span>Aravind Nagar, Jagtial</span>
          </div>
          <div className="ft-item">
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <span>hinduswarajyouth.online</span>
          </div>
        </div>
        <div className="bottom-bar"></div>
      </div>
    </div>
  );
}
