import { useMemo } from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import styles from './error-page.module.css';
import { errorHttpStatus, resolveErrorMessage } from './errorCopy';

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
  const { headline, blurb } = resolveErrorMessage(pc);
  const status = errorHttpStatus(pc);
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
