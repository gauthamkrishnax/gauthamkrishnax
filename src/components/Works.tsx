import DATA, { projectData } from '../data';
import styles from './work.module.css';
import Card from './Card';

function Works() {
    return (
        <section className="works" id="works">
            <div className={styles.content}>
                <h2 className="uppercase">{DATA.WORK_HEADING}</h2>
                <div className={styles.projects}>
                        {projectData.filter((project) => project.publish).map((project) => (
                            <Card key={project.id} project={project} />
                        ))}
                </div>
            </div>
        </section>
    )
}

export default Works;