import DATA, { projectData } from '../data';
import Card from './Card';
import styles from './work.module.css';

function Works() {
    const published = projectData.filter((project) => project.publish);

    return (
        <section className="works" id="works">
            <div className={styles.content}>
                <div data-reveal data-reveal-delay="0">
                    <h2 className="uppercase">{DATA.WORK_HEADING}</h2>
                </div>
                <div className={styles.projects}>
                    {published.map((project, index) => (
                        <div
                            key={project.id}
                            className={styles.cardParallax}
                            data-reveal
                            data-reveal-delay={`${80 + index * 70}`}
                        >
                            <Card project={project} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Works;