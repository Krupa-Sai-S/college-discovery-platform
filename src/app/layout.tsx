import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import CompareDrawer from '@/components/CompareDrawer';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'EduFind — College Discovery Platform',
  description: 'Discover, compare, and choose the best colleges in India. Search by location, fees, ratings, and exam scores.',
  keywords: 'college search, JEE colleges, NIT, IIT, engineering colleges India, college predictor',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <CompareDrawer />
        </Providers>
      </body>
    </html>
  );
}
