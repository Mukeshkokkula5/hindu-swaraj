'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import styles from './WhatsAppWidget.module.css';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000'
).replace(/\/$/, '');

const INITIAL_QUICK_CHIPS = [
  { label: '🙏 Donation / Seva Inquiry', query: 'How can I donate or support Hindu Swaraj youth seva?' },
  { label: '🤝 Join as Volunteer', query: 'How do I join as an active volunteer in Jagtial?' },
  { label: '🪔 Navaratri Darshan & Seva', query: 'Tell me about Vinayaka Navaratri puja timings, Annadanam and seva booking.' },
  { label: '🪪 Member ID Card & Portal', query: 'How to get my Digital Member ID Card or access member portal?' },
  { label: '🩸 Emergency Blood Help', query: 'I need urgent blood donation support in Jagtial.' },
  { label: '🏛️ Office & Contact Details', query: 'What is the association office address and registration number?' },
];

/* Built-in Client-side AI NLP Engine (100% Reliable Offline Fallback) */
const LOCAL_KNOWLEDGE = [
  {
    keywords: ['donate', 'donation', 'dhanam', 'chanda', 'fund', 'bank', 'account', 'upi', 'qr', 'transfer', 'neft', 'imps', 'pay', 'విరాళం', 'డబ్బులు', 'ఖాతా', 'బ్యాంక్'],
    reply: {
      title: '🙏 Donations & Seva Contributions',
      telugu: 'హిందూ స్వరాజ్ యూత్ వెల్ఫేర్ అసోసియేషన్ సేవలకు మీరు ఆన్‌లైన్ లేదా డైరెక్ట్ బ్యాంక్ ద్వారా విరాళం అందించవచ్చు:',
      english: 'You can support Hindu Swaraj Youth initiatives via Instant Online UPI/Cards or Direct Official Bank Transfer:',
      details: [
        '💳 **Instant Online Payment**: UPI (GPay/PhonePe/Paytm), Debit/Credit Cards & Net Banking with automated official receipts.',
        '🏦 **Official Bank Details**:\n• **Bank**: Union Bank of India\n• **A/C Name**: Hindu Swaraj Youth Welfare Association\n• **A/C No**: 084910100054321\n• **IFSC**: UBIN0808491\n• **Branch**: Jagtial (505327)'
      ],
      quickActions: [
        { label: '💳 Donate Online Now', link: '/#donate' },
        { label: '💬 Send Payment Slip on WhatsApp', isWhatsApp: true, text: 'Namaste! I have made a donation / would like bank transfer verification.' }
      ]
    }
  },
  {
    keywords: ['navaratri', 'vinayaka', 'ganesha', 'ganapathi', 'puja', 'pooja', 'aarti', 'harathi', 'annadanam', 'darshan', 'live', 'laddu', 'నవరాత్రి', 'వినాయక', 'గణపతి', 'పూజ', 'అన్నదానం'],
    reply: {
      title: '🪔 Sri Vinayaka Navaratri Mahotsavams',
      telugu: 'జగిత్యాలలో వైభవంగా జరిగే శ్రీ వినాయక చతుర్థి నవరాత్రి మహోత్సవాల విశేషాలు:',
      english: 'Details regarding the grand annual Jagtial Sri Vinayaka Navaratri Utsavams:',
      details: [
        '🪔 **Daily Aarti**: Morning Maha Puja at 8:00 AM • Evening Maha Deeparadhana at 7:30 PM.',
        '🍲 **Maha Annadanam**: Daily sacred Prasad distribution to thousands of devotees.',
        '📿 **Gotra Sahasranamarchana**: Book special Abhishekams & Archana in your family name online.'
      ],
      quickActions: [
        { label: '🪔 Navaratri Seva Portal', link: '/vinayaka-navaratri' },
        { label: '🍲 Sponsor Annadanam on WhatsApp', isWhatsApp: true, text: 'Namaste! I would like to sponsor Maha Annadanam / Aarti seva for Vinayaka Navaratri.' }
      ]
    }
  },
  {
    keywords: ['volunteer', 'join', 'help', 'serve', 'seva', 'youth', 'participate', 'వాలంటీర్', 'స్వచ్ఛంద', 'సేవ'],
    reply: {
      title: '🤝 Join as a Hindu Swaraj Volunteer',
      telugu: 'మా సమాజ సేవ, రక్తదానం, మరియు సాంస్కృతిక కార్యక్రమాల్లో పాల్గొనడానికి యువతను సాదరంగా ఆహ్వానిస్తున్నాము!',
      english: 'We warmly welcome dedicated youth to join our community service, emergency relief, and cultural events:',
      details: [
        '🚀 **Seva Areas**: Emergency Blood Help, Youth Leadership Camps, Clean & Green Drives, Temple Seva.',
        '📜 **Recognition**: Official Volunteer Certificate & Certificate of Appreciation.',
        '📝 **How to Apply**: Fill our 2-minute online registration form.'
      ],
      quickActions: [
        { label: '🤝 Register as Volunteer', link: '/volunteer' },
        { label: '💬 WhatsApp Volunteer Desk', isWhatsApp: true, text: 'Namaste! I want to enroll as an active volunteer in Hindu Swaraj Youth.' }
      ]
    }
  },
  {
    keywords: ['member', 'membership', 'id card', 'card', 'pvc', 'login', 'subscription', 'dues', 'సభ్యత్వం', 'ఐడీ కార్డు', 'లాగిన్'],
    reply: {
      title: '🪪 Member Portal & Digital ID Card',
      telugu: 'హిందూ స్వరాజ్ అసోసియేషన్ సభ్యుల సౌకర్యాలు మరియు అధికారిక గుర్తింపు కార్డు వివరాలు:',
      english: 'Association membership features and official digital identity credentials:',
      details: [
        '🪪 **Digital PVC ID Card**: High-res verification card with dynamic QR code & President seal.',
        '💳 **Monthly Subscription**: ₹216/month (Youth Development & Emergency Health Relief).',
        '🔐 **Member Dashboard**: Access committee minutes, audits, resolutions & ID card at /admin.'
      ],
      quickActions: [
        { label: '🔐 Member Portal Login', link: '/admin' },
        { label: '💬 Member Support on WhatsApp', isWhatsApp: true, text: 'Namaste! I need assistance regarding my Member ID Card or Association Portal.' }
      ]
    }
  },
  {
    keywords: ['blood', 'emergency', 'hospital', 'patient', 'ambulance', 'రక్తం', 'ఎమర్జెన్సీ', 'ఆసుపత్రి'],
    reply: {
      title: '🩸 24/7 Emergency Blood & Medical Seva',
      telugu: 'అత్యవసర రక్త అవసరాల కోసం హిందూ స్వరాజ్ యువజన సేవా విభాగం ఎల్లప్పుడూ అందుబాటులో ఉంటుంది:',
      english: 'Our 24/7 emergency youth blood donation network is active across Jagtial and surrounding areas:',
      details: [
        '🚑 **Immediate Support**: All blood groups (A+, B+, O+, AB+, Rare negative groups).',
        '📞 **Emergency Hotline**: Call or WhatsApp +91 8499878425 immediately with patient name & hospital.'
      ],
      quickActions: [
        { label: '🚨 Urgent WhatsApp Blood Request', isWhatsApp: true, text: 'URGENT BLOOD REQUIRED: Patient Name: ___, Blood Group: ___, Hospital: Jagtial, Units: ___' },
        { label: '📞 Call Helpline', link: 'tel:+918499878425' }
      ]
    }
  },
  {
    keywords: ['about', 'address', 'location', 'office', 'contact', 'phone', 'email', 'regd', 'president', 'చిరునామా', 'ఫోన్'],
    reply: {
      title: '🏛️ Hindu Swaraj Youth Welfare Association',
      telugu: 'హిందూ స్వరాజ్ యూత్ వెల్ఫేర్ అసోసియేషన్ - రిజిస్టర్డ్ సమాజ సేవా సంస్థ (జగిత్యాల):',
      english: 'Registered non-profit youth welfare & cultural association in Jagtial, Telangana:',
      details: [
        '🏛️ **Registration**: Regd. No: 784/2025 (Govt. of Telangana).',
        '📍 **Head Office**: H.No. 4-1-140, Vani Nagar, Jagtial, Telangana - 505327.',
        '📞 **Helpline & WhatsApp**: +91 8499878425',
        '✉️ **Email**: info@hinduswarajyouth.online'
      ],
      quickActions: [
        { label: '💬 Chat with Committee on WhatsApp', isWhatsApp: true, text: 'Namaste! I would like to connect with the Hindu Swaraj Youth Executive Committee.' }
      ]
    }
  }
];

function getLocalAiReply(userQuery) {
  const query = (userQuery || '').toLowerCase().trim();
  for (const item of LOCAL_KNOWLEDGE) {
    if (item.keywords.some((kw) => query.includes(kw))) {
      return item.reply;
    }
  }
  return {
    title: '🤖 Hindu Swaraj AI Assistant',
    telugu: 'మీ ప్రశ్నకు సంబంధించిన సమాధానం కోసం లేదా మా కమిటీ సభ్యులతో మాట్లాడటానికి నేరుగా వాట్సాప్‌లో కనెక్ట్ అవ్వండి:',
    english: `Thank you for your question! Regarding "${userQuery}", our association helpline is ready to assist you directly:`,
    details: [
      '📞 **Helpline & WhatsApp**: +91 8499878425',
      '📍 **Head Office**: Jagtial, Telangana',
      'Click below to send this question directly to our official WhatsApp helpline.'
    ],
    quickActions: [
      { label: '💬 Send this inquiry to WhatsApp', isWhatsApp: true, text: `Namaste! I have an inquiry regarding: "${userQuery}". Please guide me.` },
      { label: '💳 Donation Info', link: '/#donate' },
      { label: '🤝 Volunteer Portal', link: '/volunteer' }
    ]
  };
}

export default function WhatsAppWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('918499878425');
  const [hasNewBadge, setHasNewBadge] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  // Chat History
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '🙏 **నమస్తే!** Welcome to Hindu Swaraj Youth Welfare Association, Jagtial.\n\nI am your **AI Seva Assistant**. How can I help you today with our Seva, Donations, Navaratri, or Volunteer activities?',
      time: 'Just now',
      chips: INITIAL_QUICK_CHIPS
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(`${API_BASE_URL}/association-settings/public`);
        if (res.ok) {
          const json = await res.json();
          if (json && json.whatsapp_url) {
            const match = json.whatsapp_url.match(/\d+/g);
            if (match) setWhatsappPhone(match.join(''));
          }
        }
      } catch (err) {
        // Fallback default phone
      }
    }
    fetchSettings();
  }, []);

  // Hide completely on internal admin / dashboard / login pages
  if (pathname && (pathname.startsWith('/admin') || pathname.startsWith('/login') || pathname.startsWith('/dashboard'))) {
    return null;
  }

  const handleOpen = () => {
    setIsOpen(!isOpen);
    setHasNewBadge(false);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: '🙏 **నమస్తే!** Chat restarted. How can I assist you with Hindu Swaraj Youth Welfare Association today?',
        time: 'Just now',
        chips: INITIAL_QUICK_CHIPS
      }
    ]);
  };

  const openWhatsApp = (customText) => {
    const textToSend = customText || 'Namaste! I would like to connect with Hindu Swaraj Youth Welfare Association, Jagtial.';
    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleUserSend = async (queryText) => {
    const userQuery = (queryText || inputMsg).trim();
    if (!userQuery) return;

    // 1. Add User Message
    const userMsgObj = {
      id: Date.now(),
      sender: 'user',
      text: userQuery,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsgObj]);
    setInputMsg('');
    setIsTyping(true);

    // 2. Query AI Chatbot API (with smart fallback)
    try {
      let replyData = null;
      try {
        const res = await fetch(`${API_BASE_URL}/chatbot/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userQuery })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.reply) {
            replyData = json.reply;
          }
        }
      } catch (apiErr) {
        // Fall back to local AI engine
      }

      if (!replyData) {
        replyData = getLocalAiReply(userQuery);
      }

      // Simulate a natural AI thinking pause (450ms)
      setTimeout(() => {
        setIsTyping(false);
        const botMsgObj = {
          id: Date.now() + 1,
          sender: 'bot',
          aiReply: replyData,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsgObj]);
      }, 450);
    } catch (err) {
      setIsTyping(false);
      const fallbackReply = getLocalAiReply(userQuery);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          aiReply: fallbackReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  return (
    <div className={styles.widgetWrapper}>
      {isOpen && (
        <div className={styles.chatBox}>
          {/* Chat Header */}
          <div className={styles.chatHeader}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>
                <span>ॐ</span>
              </div>
              <span className={styles.onlineDot}></span>
            </div>

            <div className={styles.headerInfo}>
              <h4 className={styles.headerTitle}>Hindu Swaraj AI Assistant</h4>
              <p className={styles.headerSubtitle}>
                <span className={styles.pulseGreen}></span> 🤖 Auto-replies &bull; 24/7 Helpline
              </p>
            </div>

            <div className={styles.headerActions}>
              <button
                className={styles.headerActionBtn}
                onClick={handleResetChat}
                title="Restart Chat"
                aria-label="Restart Chat"
              >
                🔄
              </button>
              <button
                className={styles.closeBtn}
                onClick={() => setIsOpen(false)}
                aria-label="Close Chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Chat Stream Body */}
          <div className={styles.chatBody}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.msgRow} ${msg.sender === 'user' ? styles.userRow : styles.botRow}`}
              >
                {msg.sender === 'bot' && (
                  <div className={styles.botAvatarBadge}>ॐ</div>
                )}

                <div className={msg.sender === 'user' ? styles.userBubble : styles.botBubble}>
                  {msg.sender === 'bot' && (
                    <div className={styles.senderTag}>Hindu Swaraj AI Assistant</div>
                  )}

                  {/* Standard Text or Structured AI Reply */}
                  {msg.text && (
                    <div className={styles.bubbleContent}>
                      {msg.text.split('\n\n').map((para, i) => (
                        <p key={i} className={styles.bubbleText}>
                          {para}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Structured AI Reply Format */}
                  {msg.aiReply && (
                    <div className={styles.aiReplyBox}>
                      {msg.aiReply.title && (
                        <div className={styles.aiReplyTitle}>{msg.aiReply.title}</div>
                      )}

                      {msg.aiReply.telugu && (
                        <p className={styles.aiTeluguText}>{msg.aiReply.telugu}</p>
                      )}

                      {msg.aiReply.english && (
                        <p className={styles.aiEnglishText}>{msg.aiReply.english}</p>
                      )}

                      {msg.aiReply.details && (
                        <div className={styles.aiDetailsList}>
                          {msg.aiReply.details.map((d, dIdx) => (
                            <div key={dIdx} className={styles.aiDetailItem}>
                              {d.split('\n').map((subLine, sIdx) => (
                                <div key={sIdx}>{subLine}</div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Interactive Action Buttons */}
                      {msg.aiReply.quickActions && msg.aiReply.quickActions.length > 0 && (
                        <div className={styles.actionBtnGroup}>
                          {msg.aiReply.quickActions.map((action, aIdx) => (
                            action.isWhatsApp ? (
                              <button
                                key={aIdx}
                                className={styles.waActionBtn}
                                onClick={() => openWhatsApp(action.text)}
                              >
                                💬 {action.label}
                              </button>
                            ) : (
                              <a
                                key={aIdx}
                                href={action.link}
                                className={styles.portalActionBtn}
                              >
                                {action.label} ↗
                              </a>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Initial Quick Suggestion Chips */}
                  {msg.chips && msg.chips.length > 0 && (
                    <div className={styles.chipsSection}>
                      <span className={styles.chipsLabel}>Suggested inquiries:</span>
                      <div className={styles.chipsGrid}>
                        {msg.chips.map((chip, cIdx) => (
                          <button
                            key={cIdx}
                            className={styles.chipBtn}
                            onClick={() => handleUserSend(chip.query)}
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className={styles.bubbleTime}>{msg.time}</span>
                </div>
              </div>
            ))}

            {/* AI Typing Indicator */}
            {isTyping && (
              <div className={`${styles.msgRow} ${styles.botRow}`}>
                <div className={styles.botAvatarBadge}>ॐ</div>
                <div className={styles.typingBubble}>
                  <span className={styles.typingDot}></span>
                  <span className={styles.typingDot}></span>
                  <span className={styles.typingDot}></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Footer */}
          <div className={styles.chatFooter}>
            <div className={styles.inputRow}>
              <input
                type="text"
                placeholder="Ask anything (తెలుగు or English)..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUserSend();
                }}
                className={styles.chatInput}
                disabled={isTyping}
              />
              <button
                className={styles.sendBtn}
                onClick={() => handleUserSend()}
                disabled={isTyping || !inputMsg.trim()}
                title="Send Message"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>

            {/* WhatsApp Handoff Bar */}
            <div className={styles.footerNoteRow}>
              <button
                type="button"
                className={styles.directWaLink}
                onClick={() => openWhatsApp(inputMsg ? `Namaste! Regarding: ${inputMsg}` : null)}
              >
                💬 Need live assistance? <b>Connect on WhatsApp</b>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        className={`${styles.floatingBtn} ${isOpen ? styles.floatingBtnActive : ''}`}
        onClick={handleOpen}
        aria-label="Open AI Assistant & WhatsApp Helpline"
        title="Open Hindu Swaraj AI Assistant & WhatsApp"
      >
        {hasNewBadge && !isOpen && (
          <span className={styles.notificationPing}>AI</span>
        )}
        <svg
          className={styles.waIcon}
          viewBox="0 0 24 24"
          width="32"
          height="32"
          fill="currentColor"
        >
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 012.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.32-.02-.45-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.3 3.8 2.53 1.09 2.53.73 2.99.69.45-.04 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z"/>
        </svg>
      </button>
    </div>
  );
}
