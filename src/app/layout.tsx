import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { InstallPrompt } from '@/components/ui/InstallPrompt';
import { Providers } from '@/components/providers';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'NighTour - Stream Movies, TV Shows, Anime & Manga Online',
    template: '%s | NighTour',
  },
  description: 'Watch movies, TV shows, anime and manga online for free. NighTour is your ultimate streaming destination with latest releases, trending content and full episodes.',
  keywords: ['streaming', 'movies', 'tv shows', 'anime', 'manga', 'watch online', 'free streaming', 'anime streaming', 'movie streaming', 'tv series'],
  authors: [{ name: 'NighTour' }],
  creator: 'NighTour',
  publisher: 'NighTour',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nightour.vercel.app',
    siteName: 'NighTour',
    title: 'NighTour - Stream Movies, TV Shows, Anime & Manga Online',
    description: 'Watch movies, TV shows, anime and manga online for free. Your ultimate streaming destination.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'NighTour - Streaming Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NighTour - Stream Movies, TV Shows, Anime & Manga',
    description: 'Watch movies, TV shows, anime and manga online for free.',
    images: ['/og-image.svg'],
    creator: '@nightour',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  verification: {
    google: 'RyIs4GMCVT7idbOkf2CYPk6E71f4MAgwO66IcQnOx38',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://api.jikan.moe" />
        <link rel="dns-prefetch" href="https://api.jikan.moe" />
        <link rel="preconnect" href="https://graphql.anilist.co" />
        <link rel="dns-prefetch" href="https://graphql.anilist.co" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#8B5CF6" />
        <meta name="google-adsense-account" content="ca-pub-6989460755342413" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NighTour" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6989460755342413"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <script dangerouslySetInnerHTML={{ __html: `
          // Initialize Google Translate
          window.googleTranslateElementInit=function(){
            new google.translate.TranslateElement({
              pageLanguage:'en',
              includedLanguages:'en,es,fr,de,ja,ko,pt,zh-CN,hi,ta,te,ml,bn',
              layout:google.translate.TranslateElement.InlineLayout.SIMPLE
            },'google_translate_element');
          };
          
          document.addEventListener('contextmenu', e => e.preventDefault());
          
          // Hide Google Translate banner
          function hideTranslateBanner() {
            const banner = document.querySelector('.goog-te-banner');
            const skipTranslate = document.querySelector('.goog-te-gadget');
            
            if (banner) {
              banner.remove();
            }
            
            if (skipTranslate) {
              skipTranslate.style.display = 'none';
            }
            
            // Remove body styles added by Google Translate
            const body = document.querySelector('body');
            if (body) {
              body.style.marginTop = '';
              body.style.top = '';
              body.classList.remove('goog-te-banner-frame');
            }
            
            // Hide all translate-related elements
            const translateElements = document.querySelectorAll('[id*="goog"], [class*="goog-te"]');
            translateElements.forEach(el => {
              if (el.classList.contains('goog-te-banner') || 
                  el.classList.contains('goog-te-gadget') ||
                  el.classList.contains('goog-te-combo')) {
                el.style.display = 'none';
              }
            });
          }
          
          // Run after DOM is ready
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', hideTranslateBanner);
          } else {
            hideTranslateBanner();
          }
          
          // Run periodically to catch late elements
          setInterval(hideTranslateBanner, 1000);
          
          // Override style modifications
          const originalSetAttribute = Element.prototype.setAttribute;
          Element.prototype.setAttribute = function(name, value) {
            if (this.tagName === 'BODY' && name === 'style' && value.includes('margin-top')) {
              return;
            }
            return originalSetAttribute.call(this, name, value);
          };
        ` }} />
        <div className="min-h-screen bg-secondary text-accent">
          <div id="google_translate_element" style={{ display: 'none' }}></div>
          <Providers>
            <Header />
            <main className="flex-1 pt-16 pb-16 md:pb-0">{children}</main>
            <Footer />
            <MobileNav />
            <InstallPrompt />
          </Providers>
        </div>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
