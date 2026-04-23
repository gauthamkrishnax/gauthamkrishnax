import type { PageContextServer } from 'vike/types';
import { SITE_ORIGIN } from '../../config/site';
import { getProjectFromPageContext } from './projectFromPath';

function absoluteImageUrl(href: string): string {
  if (href.startsWith('http')) return href;
  return `${SITE_ORIGIN}${href.startsWith('/') ? href : `/${href}`}`;
}

export default function image(pageContext: PageContextServer) {
  const project = getProjectFromPageContext(pageContext);
  if (!project?.thumbnail) return null;
  return absoluteImageUrl(project.thumbnail);
}
