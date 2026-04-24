import DATA from '../data';
import image from '../assets/images/me.jpg';
import ParallaxLayer from './ParallaxLayer';
import styles from './about.module.css';

function About() {
    return (
        <section id="about">
            <div className={styles.content}>
                <ParallaxLayer className={styles.contentLeft} strength={0.12}>
                    <img src={image} alt="My potrait" />
                </ParallaxLayer>
                <ParallaxLayer className={styles.contentRight} strength={-0.06}>
                    <p className="text-secondary">{DATA.ABOUT_TAG}</p>
                    <p>{DATA.ABOUT_TEXT}</p>
                </ParallaxLayer>
            </div>
        </section>
    )
}

export default About;