"use client";
import Link from "next/link";
export default function OnboardingError({ reset }: { reset: () => void }) {
  return <main className="zi-container zi-page"><section className="zi-panel"><h1 className="zi-subheading">We couldn&apos;t load your learning setup</h1><p>Please try again. Your saved work is safe.</p><div className="zi-actions"><button className="zi-btn zi-btn-primary" onClick={reset}>Try again</button><Link href="/" className="zi-btn zi-btn-secondary">Back to home</Link></div></section></main>;
}
