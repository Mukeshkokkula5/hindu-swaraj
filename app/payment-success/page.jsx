'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get('payment_id');
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
      
      <div style={{ width: '80px', height: '80px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>

      <h1 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '16px', fontWeight: '800' }}>Thank You For Your Donation!</h1>
      <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
        Your generous contribution has been successfully processed. This will go a long way in supporting our youth development programs and community services.
      </p>

      {paymentId && (
        <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '8px', marginBottom: '32px' }}>
          <span style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Transaction ID</span>
          <span style={{ fontSize: '16px', color: '#0f172a', fontWeight: '600', fontFamily: 'monospace' }}>{paymentId}</span>
        </div>
      )}

      <a 
        href="/#donate" 
        onClick={(e) => {
          e.preventDefault();
          setIsNavigating(true);
          router.push('/#donate');
        }}
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#059669', 
          color: 'white', 
          padding: '14px 28px', 
          borderRadius: '8px', 
          textDecoration: 'none', 
          fontWeight: '600', 
          transition: 'all 0.2s', 
          boxShadow: '0 4px 6px rgba(5, 150, 105, 0.2)',
          opacity: isNavigating ? 0.8 : 1,
          pointerEvents: isNavigating ? 'none' : 'auto'
        }}
      >
        {isNavigating ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
              <path d="M12 2a10 10 0 0 1 10 10"></path>
            </svg>
            Returning...
          </span>
        ) : (
          "Return to Home"
        )}
      </a>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '20px' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .pulse-loader {
          display: flex;
          gap: 12px;
          justify-content: center;
          align-items: center;
          height: 100px;
        }
        .pulse-loader div {
          width: 14px;
          height: 14px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 1.4s infinite ease-in-out both;
        }
        .pulse-loader div:nth-child(1) { animation-delay: -0.32s; }
        .pulse-loader div:nth-child(2) { animation-delay: -0.16s; }
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      
      <Suspense fallback={
        <div className="pulse-loader">
          <div></div><div></div><div></div>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
