import type { PageContext } from 'vike/types';

export function resolveErrorMessage(pc: {
  is404?: boolean | null;
  abortStatusCode?: number;
  abortReason?: unknown;
}): { headline: string; blurb: string } {
  const { abortReason, abortStatusCode, is404 } = pc;

  if (abortReason && typeof abortReason === 'object' && abortReason !== null && 'notAdmin' in abortReason) {
    return {
      headline: 'Admin only',
      blurb: "This corner of the site is for people with extra keys. You don't have them. Yet.",
    };
  }
  if (typeof abortReason === 'string' && abortReason.trim()) {
    return { headline: 'Plot twist', blurb: abortReason };
  }
  if (abortStatusCode === 403) {
    return {
      headline: 'Access denied',
      blurb: "The server peeked at your credentials and politely looked away. Nothing personal.",
    };
  }
  if (abortStatusCode === 401) {
    return {
      headline: 'Who goes there?',
      blurb: 'Log in first, then try that URL again. The hallway is dark without a session cookie.',
    };
  }
  if (is404 === true) {
    return {
      headline: 'This page took a sabbatical',
      blurb: "We combed the codebase. We shook the router. That path isn't on the map—maybe a typo, maybe a link from the future.",
    };
  }
  return {
    headline: 'Something unraveled',
    blurb: 'The bits were going fine, then they weren’t. Refresh, try again later, or flee to the homepage before the stack trace notices you.',
  };
}

export function errorHttpStatus(pc: PageContext): number {
  return pc.abortStatusCode ?? (pc.is404 === true ? 404 : 500);
}

export function errorSeoTitle(pc: PageContext): string {
  const status = errorHttpStatus(pc);
  const { headline } = resolveErrorMessage(pc);
  return `${status} · ${headline} | Gautham Krishna`;
}

export function errorSeoDescription(pc: PageContext): string {
  const { blurb } = resolveErrorMessage(pc);
  return blurb;
}
