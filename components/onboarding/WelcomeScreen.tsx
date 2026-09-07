import Image from "next/image";
import styles from "./onboarding.module.css";
export type OnboardingUser = { name: string; email: string; image: string | null };
export default function WelcomeScreen({ user, questionCount, onStart, onSkip }: { user: OnboardingUser; questionCount: number; onStart: () => void; onSkip: () => void }) {
  const firstName = user.name.trim().split(/\s+/)[0];
  return <section className={`${styles.card} ${styles.welcome}`}>
    <p className="zi-eyebrow">Your learning journey</p>
    <h1>Welcome to ZeroIntern{firstName ? `, ${firstName}` : ""}!</h1>
    {user.image && <Image className={styles.avatar} src={user.image} alt="Your profile photo" width={72} height={72} unoptimized />}
    <p className={styles.name}>{user.name}</p><p className={styles.email}>{user.email}</p>
    <p>Let&apos;s find the right learning path for your goals.</p>
    <p className={styles.muted}>Answer {questionCount} quick questions · About 45–60 seconds</p>
    <div className={styles.welcomeActions}><button className="zi-btn zi-btn-primary" onClick={onStart}>Get started →</button><button className={styles.link} onClick={onSkip}>Skip for now — choose a track manually</button></div>
  </section>;
}
