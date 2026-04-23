import { ClientOnly } from 'vike-react/ClientOnly';
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
                        <p className="text-secondary"><a href="#about">About</a> | <a href="#works">My Works</a></p>
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
                <ClientOnly fallback={<div>Loading...</div>}>
                    <Three />
                </ClientOnly>
            </div>
        </section>
    )
}

export default Hero;