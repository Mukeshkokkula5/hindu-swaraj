export const metadata = {
  title: '🩸 అత్యవసర రక్తదాన సేవ & రక్తదాతల నెట్‌వర్క్ | Jagtial',
  description: 'హిందూ స్వరాజ్ యూత్ వెల్ఫేర్ అసోసియేషన్ 24/7 ఎమర్జెన్సీ బ్లడ్ నెట్‌వర్క్. రక్తదాతల వివరాలు, బ్లడ్ హీరోల గుర్తింపు మరియు ఆన్‌లైన్ డోనర్ రిజిస్ట్రేషన్.',
  openGraph: {
    title: '🩸 అత్యవసర రక్తదాన సేవ | Hindu Swaraj Blood Network',
    description: '24/7 అత్యవసర రక్త సహాయం & రక్తదాతల వివరాలు • జగిత్యాల జిల్లా',
    url: 'https://hinduswarajyouth.online/blood-donation',
    siteName: 'Hindu Swaraj Youth Welfare Association',
    images: [
      {
        url: '/images/activity-blood.png',
        width: 1200,
        height: 630,
        alt: 'Hindu Swaraj Blood Donation Seva Jagtial',
      },
    ],
    locale: 'te_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🩸 అత్యవసర రక్తదాన సేవ | Hindu Swaraj Blood Network',
    description: '24/7 అత్యవసర రక్త సహాయం & రక్తదాతల వివరాలు • జగిత్యాల జిల్లా',
    images: ['/images/activity-blood.png'],
  },
};

export default function BloodDonationLayout({ children }) {
  return children;
}
