import DATA from '../data';
import image from '../assets/images/me.jpg';
import styles from './about.module.css';

function About() {
    return (
        <section id="about">
            <div className={styles.content}>
                <div className={styles.contentLeft} data-reveal data-reveal-delay="40">
                    <img src={image} alt="My potrait" />
                </div>
                <div className={styles.contentRight} data-reveal data-reveal-delay="140">
                    <p className="text-secondary">{DATA.ABOUT_TAG}</p>
                    <p>{DATA.ABOUT_TEXT}</p>
                </div>
            </div>
        </section>
    )
}

export default About;