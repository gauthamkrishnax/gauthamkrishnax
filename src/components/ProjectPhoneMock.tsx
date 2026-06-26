import styles from './projectPhoneMock.module.css';

type ProjectPhoneMockProps = {
  src: string;
  alt: string;
};

export default function ProjectPhoneMock({ src, alt }: ProjectPhoneMockProps) {
  return (
    <div className={styles.frame}>
      <div className={styles.notch} />
      <img className={styles.screen} src={src} alt={alt} loading="lazy" decoding="async" />
    </div>
  );
}
