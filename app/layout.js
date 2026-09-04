import { Outfit } from 'next/font/google';
import './globals.css';
// WhatsAppWidget temporarily disabled per user directive

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://hinduswarajyouth.online'),
  title: {
    default: 'Hindu Swaraj Youth Welfare Association | జగిత్యాల (Regd. 784/2025)',
    template: '%s | Hindu Swaraj Youth Association',
  },
  description: 'Hindu Swaraj Youth Welfare Association is a registered non-profit voluntary organization in Jagtial dedicated to youth empowerment, 24/7 blood donation seva, Vinayaka Navaratri celebrations, and community development.',
  keywords: [
    'Hindu Swaraj Youth Welfare Association',
    'Hindu Swaraj Jagtial',
    'Blood Donation Jagtial',
    'Vinayaka Navaratri Jagtial',
    'Youth Welfare Association Telangana',
    'NGO Jagtial',
    'Community Service Jagtial',
  ],
  authors: [{ name: 'Hindu Swaraj Youth Welfare Association' }],
  creator: 'Hindu Swaraj Youth Welfare Association',
  publisher: 'Hindu Swaraj Youth Welfare Association',
  openGraph: {
    title: '🚩 Hindu Swaraj Youth Welfare Association • జగిత్యాల',
    description: 'సేవే మన లక్ష్యం • 24/7 అత్యవసర రక్తదాన సేవ, వినాయక నవరాత్రి మహోత్సవాలు & యువజన సంక్షేమం | Regd. No. 784/2025',
    url: 'https://hinduswarajyouth.online',
    siteName: 'Hindu Swaraj Youth Welfare Association',
    images: [
      {
        url: '/images/hero-shivaji.png',
        width: 1200,
        height: 630,
        alt: 'Hindu Swaraj Youth Welfare Association Jagtial',
      },
    ],
    locale: 'te_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🚩 Hindu Swaraj Youth Welfare Association • జగిత్యాల',
    description: 'సేవే మన లక్ష్యం • 24/7 అత్యవసర రక్తదాన సేవ, వినాయక నవరాత్రి మహోత్సవాలు & యువజన సంక్షేమం',
    images: ['/images/hero-shivaji.png'],
  },
};

import InstallAppBanner from '../components/InstallAppBanner';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#800A0D',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={outfit.variable}>
      <head>
        <link rel="icon" href="/images/logo_v2.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Hindu Swaraj" />
      </head>
      <body>
        {children}
        <InstallAppBanner />
      </body>
    </html>
  );
}

