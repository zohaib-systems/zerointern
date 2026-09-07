import type { QuizAnswers } from "@/lib/onboarding";
import styles from "./onboarding.module.css";
type Question = { id: keyof QuizAnswers; title: string; options: { value: string; label: string; desc: string }[] };
export const questions: Question[] = [
  { id: "experience_level", title: "What's your coding experience?", options: [
    { value: "beginner", label: "Beginner", desc: "No coding experience yet" },
    { value: "intermediate", label: "Intermediate", desc: "Some projects, 1-3 years experience" },
    { value: "advanced", label: "Advanced", desc: "Professional developer, 3+ years" },
  ] },
  { id: "goal", title: "What's your primary goal?", options: [
    { value: "job", label: "Job/Freelance", desc: "Get a job or start freelancing" },
    { value: "skills", label: "Learn Skills", desc: "Master new technologies" },
    { value: "portfolio", label: "Portfolio", desc: "Build impressive portfolio projects" },
    { value: "current-job", label: "Current Job", desc: "Required skills for my current job" },
  ] },
  { id: "timeline", title: "How much time can you commit?", options: [
    { value: "6weeks", label: "6 weeks", desc: "Intensive: ~40 hours/week" },
    { value: "12weeks", label: "12 weeks", desc: "Moderate: ~25 hours/week" },
    { value: "24+weeks", label: "24+ weeks", desc: "Flexible: ~12 hours/week" },
  ] },
];
export default function QuestionScreen({ question, currentNumber, selected, loading, onSelect, onNext, onBack, onSkip }: {
  question: Question; currentNumber: number; selected?: string; loading: boolean;
  onSelect: (value: string) => void; onNext: () => void; onBack: () => void; onSkip: () => void;
}) {
  return <section className={styles.question}>
    <div className={styles.progress}><progress max={3} value={currentNumber} aria-label={`Question ${currentNumber} of 3`} /><p>Question {currentNumber} of 3</p></div>
    <form className={styles.card} onSubmit={event => { event.preventDefault(); if (selected && !loading) onNext(); }}>
      <fieldset disabled={loading}><legend><h1>{question.title}</h1></legend>
        <div className={styles.options}>{question.options.map(option => <label key={option.value} className={`${styles.option} ${selected === option.value ? styles.selected : ""}`}>
          <input type="radio" name={question.id} value={option.value} checked={selected === option.value} onChange={() => onSelect(option.value)} required />
          <span><strong>{option.label}</strong><span>{option.desc}</span></span>
        </label>)}</div>
      </fieldset>
      <div className={styles.actions}><button type="button" className="zi-btn zi-btn-secondary" onClick={onBack} disabled={loading}>← Back</button><button type="submit" className="zi-btn zi-btn-primary" disabled={!selected || loading}>{currentNumber === 3 ? "See my recommendation" : "Next →"}</button><button type="button" className={styles.link} onClick={onSkip} disabled={loading}>Skip</button></div>
    </form>
  </section>;
}
