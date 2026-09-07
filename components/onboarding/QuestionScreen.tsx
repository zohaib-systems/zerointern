import type { QuizAnswers } from "@/lib/onboarding";
import styles from "./onboarding.module.css";
type Question = { id: keyof QuizAnswers; title: string; options: { value: string; label: string; desc: string }[] };
export const questions: Question[] = [
  { id: "experience_level", title: "What's your coding experience?", options: [
    { value: "beginner", label: "Beginner", desc: "I'm new to coding or still learning the basics" },
    { value: "intermediate", label: "Intermediate", desc: "I've built a few projects and know the fundamentals" },
    { value: "advanced", label: "Advanced", desc: "I build and maintain applications independently" },
  ] },
  { id: "goal", title: "What's your primary goal?", options: [
    { value: "job", label: "Job/Freelance", desc: "Get a job or start freelancing" },
    { value: "skills", label: "Learn Skills", desc: "Master new technologies" },
    { value: "portfolio", label: "Portfolio", desc: "Build impressive portfolio projects" },
    { value: "current-job", label: "Current Job", desc: "Required skills for my current job" },
  ] },
  { id: "technology_preference", title: "Which technology would you like to learn?", options: [
    { value: "javascript", label: "JavaScript", desc: "React and Node.js — build complete web applications" },
    { value: "python", label: "Python", desc: "Backend development, APIs, and databases" },
    { value: "php", label: "PHP & Laravel", desc: "Web development with the Laravel framework" },
    { value: "not-sure", label: "Not sure", desc: "Recommend a track based on my answers" },
  ] },
  { id: "timeline", title: "What learning pace works for you?", options: [
    { value: "6weeks", label: "Intensive", desc: "Around 40 hours/week — aim for 6 weeks" },
    { value: "12weeks", label: "Moderate", desc: "Around 25 hours/week — aim for 12 weeks" },
    { value: "24+weeks", label: "Flexible", desc: "Around 12 hours/week — plan for 24+ weeks" },
  ] },
];
export default function QuestionScreen({ question, currentNumber, totalQuestions, selected, loading, onSelect, onNext, onBack, onSkip }: {
  question: Question; currentNumber: number; totalQuestions: number; selected?: string; loading: boolean;
  onSelect: (value: string) => void; onNext: () => void; onBack: () => void; onSkip: () => void;
}) {
  return <section className={styles.question}>
    <div className={styles.progress}><progress max={totalQuestions} value={currentNumber} aria-label={`Question ${currentNumber} of ${totalQuestions}`} /><p>Question {currentNumber} of {totalQuestions}</p></div>
    <form className={styles.card} onSubmit={event => { event.preventDefault(); if (selected && !loading) onNext(); }}>
      <fieldset disabled={loading}><legend><h1>{question.title}</h1></legend>
        <div className={styles.options}>{question.options.map(option => <label key={option.value} className={`${styles.option} ${selected === option.value ? styles.selected : ""}`}>
          <input type="radio" name={question.id} value={option.value} checked={selected === option.value} onChange={() => onSelect(option.value)} required />
          <span><strong>{option.label}</strong><span>{option.desc}</span></span>
        </label>)}</div>
      </fieldset>
      <div className={styles.actions}><button type="button" className="zi-btn zi-btn-secondary" onClick={onBack} disabled={loading}>← Back</button><button type="submit" className="zi-btn zi-btn-primary" disabled={!selected || loading}>{currentNumber === totalQuestions ? "See my recommendation" : "Next →"}</button><button type="button" className={styles.link} onClick={onSkip} disabled={loading}>Skip</button></div>
    </form>
  </section>;
}
