"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { quizSchema, type QuizAnswers, type Recommendation, type TrackChoice } from "@/lib/onboarding";
import WelcomeScreen, { type OnboardingUser } from "./WelcomeScreen";
import QuestionScreen, { questions } from "./QuestionScreen";
import ResultsScreen from "./ResultsScreen";
import styles from "./onboarding.module.css";

export default function OnboardingQuiz({ user, tracks, initialAnswers, initialRecommendation, switching, activeTrackId }: {
  user: OnboardingUser; tracks: TrackChoice[]; initialAnswers: QuizAnswers | null;
  initialRecommendation: Recommendation | null; switching: boolean; activeTrackId: string | null;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<"welcome" | "question" | "results">(switching || initialRecommendation ? "results" : "welcome");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>(initialAnswers ?? {});
  const [recommendation, setRecommendation] = useState(switching ? null : initialRecommendation);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const screen = useRef<HTMLDivElement>(null);
  useEffect(() => { screen.current?.focus(); }, [stage, questionIndex]);

  function start() { setError(""); setQuestionIndex(0); setStage("question"); }
  function skip() { setError(""); setRecommendation(null); setStage("results"); }
  async function submit() {
    if (pending.current) return;
    const parsed = quizSchema.safeParse(answers);
    if (!parsed.success) { setError("Please answer all three questions."); return; }
    pending.current = true; setLoading(true); setError("");
    try {
      const response = await fetch("/api/onboarding/quiz-answers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to save your answers.");
      setRecommendation(data.recommendation); setStage("results");
    } catch (error) { setError(error instanceof Error ? error.message : "Connection lost. Please try again."); }
    finally { pending.current = false; setLoading(false); }
  }
  async function selectTrack(trackId: string) {
    if (pending.current) return;
    pending.current = true; setLoading(true); setError("");
    try {
      const response = await fetch("/api/onboarding/select-track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ track_id: trackId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to select your track.");
      router.replace("/dashboard"); router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Connection lost. Please try again."); pending.current = false; setLoading(false); }
  }
  const question = questions[questionIndex];
  return <main className={styles.page}>
    <header className={styles.header}><Link href="/" className="zi-brand"><Image src="/icon.png" alt="" width={32} height={32} /><span>ZeroIntern</span></Link>{switching && <Link href="/dashboard" className={styles.link}>Back to dashboard</Link>}</header>
    <div ref={screen} tabIndex={-1} className={styles.screen} aria-busy={loading}>
      {stage === "welcome" && <WelcomeScreen user={user} onStart={start} onSkip={skip} />}
      {stage === "question" && <QuestionScreen key={question.id} question={question} currentNumber={questionIndex + 1} selected={answers[question.id]} loading={loading} onSelect={value => setAnswers({ ...answers, [question.id]: value })} onNext={() => { setError(""); if (questionIndex < 2) setQuestionIndex(questionIndex + 1); else void submit(); }} onBack={() => { setError(""); if (questionIndex) setQuestionIndex(questionIndex - 1); else setStage("welcome"); }} onSkip={skip} />}
      {stage === "results" && <ResultsScreen recommendation={recommendation} tracks={tracks} loading={loading} switching={switching} activeTrackId={activeTrackId} onSelectTrack={selectTrack} onRetake={start} />}
      {error && <div className={styles.error} role="alert">{error} <Link href="/auth/signin">Sign in again</Link></div>}
      <p className={styles.status} role="status">{loading ? stage === "results" ? "Saving your track…" : "Preparing your recommendation…" : ""}</p>
    </div>
  </main>;
}
