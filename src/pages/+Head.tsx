import { usePageContext } from 'vike-react/usePageContext';
import siteData from '../data';
import { SITE_ORIGIN } from '../config/site';

export function Head() {
  const pc = usePageContext();
  const pathname = pc.urlPathname ?? '/';
  const canonical = `${SITE_ORIGIN}${pathname === '/' ? '' : pathname}`;
  const isErrorPage = typeof pc.pageId === 'string' && pc.pageId.includes('/_error/');

  const themeInitScript = `(function(){try{var k='theme';var s=localStorage.getItem(k);var dark=window.matchMedia('(prefers-color-scheme: dark)').matches;var th=s==='dark'||s==='light'?s:(dark?'dark':'light');document.documentElement.setAttribute('data-theme',th);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',th==='dark'?'#121110':'#FFFEFA');}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

  return (
    <>
      <meta name="theme-color" content="#FFFEFA" />
      <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      <meta name="author" content={siteData.HEADER} />
      <meta name="application-name" content={siteData.HEADER} />
      {!isErrorPage ? (
        <>
          <link rel="canonical" href={canonical} />
          <meta property="og:url" content={canonical} />
        </>
      ) : null}
      <meta property="og:site_name" content={siteData.HEADER} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_US" />
    </>
  );
}
