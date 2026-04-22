import type { Project } from '../data';
import styles from './card.module.css';

function Card({ project }: { project: Project }) {
    return (
        <div className={`${styles.card} ${styles[project.cardSize]}`}>
            <a className="no-hover" href={project.url} target='_blank'>
                <div className={styles.cardImage}>
                    <img src={project.thumbnail} alt={project.firstName + ' ' + project.lastName} />
                </div>
                <div className={styles.cardContent}>
                    <span className={styles.cardTag}>{project.tag}</span>
                    <h3>{project.displayHeading}</h3>
                    <p>{project.description}</p>
                    <div className={styles.cardBadges}>
                        {project.badges?.map((badge) => (
                            <span key={badge}>{badge}</span>
                        ))}
                    </div>
                </div>
            </a>
        </div>
    )
}

export default Card;