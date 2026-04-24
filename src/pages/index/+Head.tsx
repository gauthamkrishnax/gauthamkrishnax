import siteData from '../../data';
import portrait from '../../assets/images/me.jpg';
import { SITE_ORIGIN } from '../../config/site';

function absoluteAssetUrl(href: string): string {
  if (href.startsWith('http')) return href;
  return `${SITE_ORIGIN}${href.startsWith('/') ? href : `/${href}`}`;
}

export function Head() {
  const sameAs = siteData.SOCIAL_LINKS.map((l) => l.url);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteData.HEADER,
    url: SITE_ORIGIN,
    image: absoluteAssetUrl(portrait),
    jobTitle: 'Frontend Engineer',
    description: siteData.ABOUT_TEXT,
    worksFor: {
      '@type': 'Organization',
      name: siteData.COMPANY,
      url: siteData.COMPANY_URL,
    },
    sameAs,
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
