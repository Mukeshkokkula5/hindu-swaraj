import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata = {
  title: 'Hindu Swaraj Youth Welfare Association | Empowering Youth, Building Bharat',
  description: 'Hindu Swaraj Youth Welfare Association is a registered voluntary organization dedicated to youth empowerment and social service. Dedicated to Seva, Sanskar and Sangathan for a Stronger Nation.',
  keywords: 'Hindu Swaraj, Youth Welfare, NGO, Volunteer, Blood Donation, Social Service, Youth Leadership, Bharat',
  openGraph: {
    title: 'Hindu Swaraj Youth Welfare Association',
    description: 'Dedicated to Seva, Sanskar and Sangathan for a Stronger Nation',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={outfit.variable}>
      <head>
        <link rel="icon" href="/images/logo_v2.png" type="image/png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
