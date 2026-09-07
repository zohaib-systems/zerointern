import type { Recommendation, TrackChoice } from "@/lib/onboarding";
import styles from "./onboarding.module.css";
export default function ResultsScreen({ recommendation, tracks, loading, switching, activeTrackId, onSelectTrack, onRetake }: {
  recommendation: Recommendation | null; tracks: TrackChoice[]; loading: boolean; switching: boolean; activeTrackId: string | null;
  onSelectTrack: (id: string) => void; onRetake: () => void;
}) {
  const others = tracks.filter(track => track.id !== recommendation?.recommendedTrackId);
  return <section className={styles.results}>
    <div className={styles.intro}><p className="zi-eyebrow">{switching ? "Your next focus" : "Your learning path"}</p><h1>{recommendation ? "A track for your goals" : "Choose your track"}</h1><p>{switching ? "Your previous projects, progress, and certificates are kept when you switch." : "Start with one track. You can switch from your dashboard anytime."}</p></div>
    {recommendation && <div className={`${styles.card} ${styles.recommendation}`}>
      <span className={styles.badge}>Recommended for you</span><h2>{recommendation.recommendedTrackName}</h2><p>{recommendation.reason}</p>
      <h3>Why this track?</h3><ul>{recommendation.whyGood.map(reason => <li key={reason}>{reason}</li>)}</ul>
      <dl className={styles.stats}><div><dt>Weeks</dt><dd>{recommendation.estimatedWeeks}{recommendation.estimatedWeeks >= 24 ? "+" : ""}</dd></div><div><dt>Hours/week</dt><dd>~{recommendation.estimatedHoursPerWeek}</dd></div><div><dt>Projects</dt><dd>{recommendation.projects}</dd></div></dl>
      <p className={styles.muted}>A suggested pace, not a deadline. Completion depends on your experience and project reviews.</p>
      <button className={`zi-btn zi-btn-primary ${styles.fullWidth}`} disabled={loading} onClick={() => onSelectTrack(recommendation.recommendedTrackId)}>Start {recommendation.recommendedTrackName} →</button>
    </div>}
    {!!others.length && <div><h2 className={styles.otherHeading}>{recommendation ? "Other options" : "Available tracks"}</h2><div className={styles.trackGrid}>{others.map(track => <button className={styles.track} key={track.id} disabled={loading} onClick={() => onSelectTrack(track.id)}>
      <span className={styles.trackTitle}>{track.title}</span><span>{track.description}</span><span className={styles.muted}>{track.projects} guided projects</span><strong>{track.id === activeTrackId ? "Continue current track →" : "Select track →"}</strong>
    </button>)}</div></div>}
    {!tracks.length && <p role="status">Tracks are temporarily unavailable. Please reload to try again.</p>}
    <button className={styles.link} disabled={loading} onClick={onRetake}>{recommendation ? "Retake the quiz" : "Help me choose — take the quiz"}</button>
  </section>;
}
