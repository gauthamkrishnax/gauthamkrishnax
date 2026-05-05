import DATA from '../data';
import image from '../assets/images/me.jpg';
import styles from './about.module.css';

function About() {
    return (
        <section id="about">
            <div className={styles.content}>
                <div className={styles.contentLeft}>
                    <img src={image} alt="My potrait" />
                </div>
                <div className={styles.contentRight}>
                    <p className="text-secondary">{DATA.ABOUT_TAG}</p>
                    <p>{DATA.ABOUT_TEXT}</p>
                </div>
            </div>
        </section>
    )
}

export default About;