import siteData from '../data';

/** Primary meta description; kept within a typical search-snippet length. */
export function defaultSiteDescription(): string {
  const line = `${siteData.TITLE} ${siteData.SUBTITLE} ${siteData.ABOUT_TAG} at ${siteData.COMPANY}.`;
  const withAbout = `${line} ${siteData.ABOUT_TEXT}`;
  if (withAbout.length <= 158) return withAbout;
  return `${withAbout.slice(0, 155).trimEnd()}…`;
}

export function defaultSiteTitle(): string {
  return `${siteData.HEADER} — ${siteData.ABOUT_TAG}`;
}
