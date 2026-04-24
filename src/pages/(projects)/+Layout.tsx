import { useMemo } from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import siteData from '../../data';
import styles from './projectsLayout.module.css';
import { getProjectFromPageContext, projectDisplayTitle } from './projectFromPath';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pc = usePageContext();
  const project = useMemo(() => getProjectFromPageContext(pc), [pc.urlPathname]);

  return (
    <div className={styles.root}>
      <header className={styles.siteHeader + ' uppercase'}>
        <a href="/" className="no-hover">
          {siteData.HEADER}
        </a>
      </header>
      {project ? (
        <div className={styles.meta}>
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
      <main className={styles.main + ' project-content'}>
      {children}
      </main>
      <div className={styles.backToTop}>
        <a href="#top">Back to top</a> | <a href="/#works">Other Projects →</a>
      </div>
    </div>
  );
}
