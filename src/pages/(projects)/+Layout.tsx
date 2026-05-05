import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import siteData from '../../data';
import styles from './projectsLayout.module.css';
import { getProjectFromPageContext, projectDisplayTitle } from './projectFromPath';

const reveal = (delay: number) => ({ '--reveal-delay': `${delay}ms` } as CSSProperties);

export default function Layout({ children }: { children: React.ReactNode }) {
  const pc = usePageContext();
  const project = useMemo(() => getProjectFromPageContext(pc), [pc.urlPathname]);

  return (
    <div className={styles.root}>
      <header className={`${styles.siteHeader} ${styles.initialReveal} uppercase`} style={reveal(0)}>
        <a href="/" className="no-hover">
          {siteData.HEADER}
        </a>
      </header>
      {project ? (
        <div className={`${styles.meta} ${styles.initialReveal}`} style={reveal(80)}>
          <h1 className={styles.title}>{projectDisplayTitle(project)}</h1>
          {project.description ? <p className={styles.description}>{project.description}</p> : null}
          <div className={styles.ctas}>
            {project.url ? (
              <a className="no-hover" href={project.url} rel="noopener noreferrer" target="_blank">
                Visit site
              </a>
            ) : null}
            {project.github ? (
              <a className="no-hover secondary" href={project.github} rel="noopener noreferrer" target="_blank">
                Source
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
      <main className={`${styles.main} ${styles.initialReveal} project-content`} style={reveal(160)}>
      {children}
      </main>
      <div className={`${styles.backToTop} ${styles.initialReveal}`} style={reveal(240)}>
        <a href="#top">Back to top</a> | <a href="/#works">Other Projects →</a>
      </div>
    </div>
  );
}
