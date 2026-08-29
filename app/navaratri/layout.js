export const metadata = {
  title: '🪔 వినాయక నవరాత్రి మహోత్సవాలు 2026 | Live Darshan & Seva Booking',
  description: 'జగిత్యాల హిందూ స్వరాజ్ యూత్ వినాయక నవరాత్రి మహోత్సవాల ప్రత్యక్ష ప్రసారం, నిత్య మహా అన్నదానం, డైలీ పూజా షెడ్యూల్ & గోత్ర నామావళి సేవ ఆన్‌లైన్ బుకింగ్.',
  openGraph: {
    title: '🪔 వినాయక నవరాత్రి మహోత్సవాలు 2026 | Live Darshan & Seva',
    description: 'ప్రత్యక్ష దర్శనం, నిత్య మహా అన్నదానం, 11 రోజుల పూజా షెడ్యూల్ & గోత్ర నామావళి సేవ బుకింగ్ • జగిత్యాల',
    url: 'https://hinduswarajyouth.online/vinayaka-navaratri',
    siteName: 'Hindu Swaraj Youth Welfare Association',
    images: [
      {
        url: '/images/navaratri-ganesha.jpg',
        width: 1200,
        height: 630,
        alt: 'Vinayaka Navaratri Mahotsavam Jagtial',
      },
    ],
    locale: 'te_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🪔 వినాయక నవరాత్రి మహోత్సవాలు 2026 | Live Darshan',
    description: 'ప్రత్యక్ష దర్శనం, నిత్య మహా అన్నదానం & గోత్ర నామావళి సేవ • జగిత్యాల',
    images: ['/images/navaratri-ganesha.jpg'],
  },
};

export default function NavaratriLayout({ children }) {
  return children;
}
