import { Playfair_Display, Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { getSettings } from '@/lib/data';
import { SITE_URL } from '@/lib/utils';
import JsonLd from '@/components/JsonLd';

const serif = Playfair_Display({ subsets: ['latin'], variable: '--serif', display: 'swap' });
const sans = Inter({ subsets: ['latin'], variable: '--sans', display: 'swap' });

export async function generateMetadata() {
  const s = await getSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${s.siteTitle}: ${s.tagline || s.description}`, template: `%s | ${s.siteTitle}` },
    description: s.description,
    icons: s.favicon ? { icon: s.favicon } : undefined,
    verification: s.gscVerification ? { google: s.gscVerification } : undefined,
    openGraph: { siteName: s.siteTitle, type: 'website', images: s.defaultOgImage ? [s.defaultOgImage] : undefined },
  };
}
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#F8F5EF' };

export default async function RootLayout({ children }) {
  const s = await getSettings();
  const same = Object.values(s.social || {}).filter(Boolean);
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <a href="#main" className="skip">Skip to content</a>
        {children}
        <JsonLd data={[
          { '@context': 'https://schema.org', '@type': 'Organization', name: s.siteTitle, url: SITE_URL, ...(s.logo ? { logo: s.logo } : {}), ...(same.length ? { sameAs: same } : {}) },
          { '@context': 'https://schema.org', '@type': 'WebSite', name: s.siteTitle, url: SITE_URL,
            potentialAction: { '@type': 'SearchAction', target: `${SITE_URL}/search?q={search_term_string}`, 'query-input': 'required name=search_term_string' } },
        ]} />
        {s.gaId && (<>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${s.gaId}`} strategy="afterInteractive" />
          <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${String(s.gaId).replace(/[^A-Za-z0-9-]/g, '')}');`}</Script>
        </>)}
      </body>
    </html>
  );
}
