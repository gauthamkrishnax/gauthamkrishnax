import DATA from '../data';
import Three from './Three';
import styles from './hero.module.css';

function Hero() {
    return (
        <section className={styles.hero} id="hero">
            <div className={styles.content}>
                <div><span className="text-secondary uppercase">{DATA.HEADER}</span></div>
                <div className={styles.contentTop}>
                    <h1>{DATA.TITLE}</h1>
                    <p>{DATA.SUBTITLE}</p>
                </div>
                <div className={styles.contentBottom}>
                    <div>
                        <p className="text-secondary">About | My Works</p>
                    </div>
                    <div>
                        <p className="text-secondary">{DATA.COMPANY}</p>
                    </div>
                    <div>
                        <p className="text-secondary">{DATA.LOCATION}</p>
                    </div>
                </div>
            </div>
            <div className={styles.canvas}>
                <Three />
            </div>
        </section>
    )
}

export default Hero;