import DATA, { projectData } from '../data';
import Card from './Card';
import ParallaxLayer from './ParallaxLayer';
import styles from './work.module.css';

/** Distinct scroll multipliers per card (cycle for longer lists). */
const CARD_PARALLAX_STRENGTH = [0.052, -0.038, 0.066, 0.034, -0.058, 0.044] as const;

function parallaxStrengthForCard(index: number, projectId: string): number {
    const base = CARD_PARALLAX_STRENGTH[index % CARD_PARALLAX_STRENGTH.length];
    let h = 0;
    for (let i = 0; i < projectId.length; i++) {
        h = (h + projectId.charCodeAt(i) * (i + 1)) % 251;
    }
    const jitter = 0.88 + (h / 251) * 0.24;
    return base * jitter;
}

function Works() {
    const published = projectData.filter((project) => project.publish);

    return (
        <section className="works" id="works">
            <div className={styles.content}>
                <ParallaxLayer strength={0.08}>
                    <h2 className="uppercase">{DATA.WORK_HEADING}</h2>
                </ParallaxLayer>
                <div className={styles.projects}>
                    {published.map((project, index) => (
                        <ParallaxLayer
                            key={project.id}
                            className={styles.cardParallax}
                            strength={parallaxStrengthForCard(index, project.id)}
                        >
                            <Card project={project} />
                        </ParallaxLayer>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Works;