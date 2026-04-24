import DATA from '../data';
import styles from './footer.module.css';

function Footer() {
    return (
        <footer>
            <div className={styles.content}>
                {DATA.SOCIAL_LINKS.map((link) => (
                    <a href={link.url} key={link.text}>{link.text}</a>
                ))}
            </div>
            <div className={styles.copyright}>
                <p>{DATA.FOOTER_TEXT}</p>
            </div>
        </footer>
    )
}

export default Footer;