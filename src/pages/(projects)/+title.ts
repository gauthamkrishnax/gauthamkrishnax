import type { PageContext } from 'vike/types';
import siteData from '../../data';
import { getProjectFromPageContext, projectDisplayTitle } from './projectFromPath';

export default function title(pageContext: PageContext) {
  const project = getProjectFromPageContext(pageContext);
  if (!project) return null;
  return `${projectDisplayTitle(project)} | ${siteData.HEADER}`;
}
