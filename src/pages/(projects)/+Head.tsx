import { usePageContext } from 'vike-react/usePageContext';
import { SITE_ORIGIN } from '../../config/site';
import { getProjectFromPageContext, projectDisplayTitle, projectSeoDescription } from './projectFromPath';

function absoluteAssetUrl(href: string): string {
  if (href.startsWith('http')) return href;
  return `${SITE_ORIGIN}${href.startsWith('/') ? href : `/${href}`}`;
}

export function Head() {
  const pc = usePageContext();
  const project = getProjectFromPageContext(pc);
  if (!project) return null;

  const pageUrl = `${SITE_ORIGIN}/${project.id}`;
  const sameAs = [project.url, project.github].filter((x): x is string => Boolean(x));
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: projectDisplayTitle(project),
    description: projectSeoDescription(project),
    url: pageUrl,
    image: absoluteAssetUrl(project.thumbnail),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
