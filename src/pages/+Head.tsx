import { usePageContext } from 'vike-react/usePageContext';
import siteData from '../data';
import { SITE_ORIGIN } from '../config/site';

export function Head() {
  const pc = usePageContext();
  const pathname = pc.urlPathname ?? '/';
  const canonical = `${SITE_ORIGIN}${pathname === '/' ? '' : pathname}`;
  const isErrorPage = typeof pc.pageId === 'string' && pc.pageId.includes('/_error/');

  return (
    <>
      <meta name="author" content={siteData.HEADER} />
      <meta name="application-name" content={siteData.HEADER} />
      <meta name="theme-color" content="#FFFEFA" />
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
