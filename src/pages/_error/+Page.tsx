import { useMemo } from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import styles from './error-page.module.css';

function resolveMessage(pc: {
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

const EXCUSES_404 = [
  'Consulted the tea leaves',
  'Asked the 404 sprite',
  'Checked under the couch',
  'Pinged localhost emotionally',
] as const;

const EXCUSES_500 = [
  'Sacrificed a semicolon',
  'Rebooted optimism',
  'Blamed cache politely',
  'Fed the hamsters extra oats',
] as const;

export function Page() {
  const pc = usePageContext();
  const { headline, blurb } = resolveMessage(pc);
  const status = pc.abortStatusCode ?? (pc.is404 === true ? 404 : 500);
  const urlDisplay = pc.urlOriginal ?? '';

  const checklist = useMemo(() => {
    const pool = pc.is404 === true ? EXCUSES_404 : EXCUSES_500;
    const seed = (urlDisplay.length + status) % pool.length;
    return [...pool.slice(seed), ...pool.slice(0, seed)];
  }, [pc.is404, status, urlDisplay.length]);

  return (
    <main className={styles.wrap}>
      <p className={styles.badge}>
        HTTP <span className={styles.wiggle}>{status}</span> · incident report
      </p>
      <p className={styles.code} aria-hidden="true">
        {status === 404 ? '¯\\_(ツ)_/¯' : '(×﹏×)'}
      </p>
      <h1 className={styles.title}>{headline}</h1>
      <p className={styles.blurb}>{blurb}</p>
      {urlDisplay ? (
        <p className={styles.url} title="Requested URL">
          {urlDisplay}
        </p>
      ) : null}
      <ul className={styles.checklist} aria-label="Things we definitely tried">
        {checklist.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <nav className={styles.actions} aria-label="Next steps">
        <a href="/" className="no-hover">
          Home
        </a>
        <a href="/#works" className="no-hover">
          Works
        </a>
      </nav>
    </main>
  );
}
