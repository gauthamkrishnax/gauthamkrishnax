import type { PageContextServer } from 'vike/types';
import { getProjectFromPageContext, projectSeoDescription } from './projectFromPath';

export default function description(pageContext: PageContextServer) {
  const project = getProjectFromPageContext(pageContext);
  if (!project) return null;
  return projectSeoDescription(project);
}
