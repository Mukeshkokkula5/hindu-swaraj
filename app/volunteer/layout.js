export const metadata = {
  title: '🤝 యువసేవలో భాగస్వామ్యం అవ్వండి | Volunteer Registration',
  description: 'హిందూ స్వరాజ్ యూత్ అసోసియేషన్ తో కలిసి సమాజ సేవ, రక్తదాన శిబిరాలు మరియు సాంస్కృతిక కార్యక్రమాల్లో పాల్గొనడానికి వాలంటీర్‌గా చేరండి.',
  openGraph: {
    title: '🤝 హిందూ స్వరాజ్ యూత్ వాలంటీర్ రిజిస్ట్రేషన్',
    description: 'యువత సేవ, సంస్కృతి మరియు సమైక్యత కోసం మాతో చేరండి • జగిత్యాల',
    url: 'https://hinduswarajyouth.online/volunteer',
    siteName: 'Hindu Swaraj Youth Welfare Association',
    images: [
      {
        url: '/images/about-volunteers.png',
        width: 1200,
        height: 630,
        alt: 'Join as Volunteer - Hindu Swaraj Youth Association',
      },
    ],
    locale: 'te_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🤝 హిందూ స్వరాజ్ యూత్ వాలంటీర్ రిజిస్ట్రేషన్',
    description: 'యువత సేవ, సంస్కృతి మరియు సమైక్యత కోసం మాతో చేరండి • జగిత్యాల',
    images: ['/images/about-volunteers.png'],
  },
};

export default function VolunteerLayout({ children }) {
  return children;
}
