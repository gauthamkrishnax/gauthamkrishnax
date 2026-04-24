import type { PageContext } from 'vike/types';
import { projectData, type Project } from '../../data';

export function projectSlugFromPathname(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const segment = normalized.split('/').filter(Boolean)[0];
  return segment ?? '';
}

export function getProjectByPathname(pathname: string): Project | undefined {
  const slug = projectSlugFromPathname(pathname);
  return projectData.find((p) => p.id === slug);
}

export function getProjectFromPageContext(pc: Pick<PageContext, 'urlPathname'>): Project | undefined {
  return getProjectByPathname(pc.urlPathname ?? '/');
}

export function projectDisplayTitle(project: Project): string {
  return project.displayHeading ?? `${project.firstName} ${project.lastName}`;
}

export function projectSeoDescription(project: Project): string {
  if (project.description?.trim()) return project.description.trim();
  return `${projectDisplayTitle(project)} — ${project.tag}.`;
}
