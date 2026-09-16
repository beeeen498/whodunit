import styles from './Footer.module.scss';

// ========================
// Footer — bottom of the game page
// ========================

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.title}>Whodunit</span>
      <span className={styles.credit}>
        Created by{' '}
        <a
          href="https://benkedem.co"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          Ben Kedem
        </a>
      </span>
    </footer>
  );
}