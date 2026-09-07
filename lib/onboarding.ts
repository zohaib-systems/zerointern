import { z } from "zod";

export const quizSchema = z.object({
  experience_level: z.enum(["beginner", "intermediate", "advanced"]),
  goal: z.enum(["job", "skills", "portfolio", "current-job"]),
  timeline: z.enum(["6weeks", "12weeks", "24+weeks"]),
  technology_preference: z.enum(["javascript", "python", "php", "not-sure"]),
});
export const trackSelectionSchema = z.object({ track_id: z.uuid() });
export type QuizAnswers = z.infer<typeof quizSchema>;
export type TrackChoice = { id: string; slug: string; title: string; description: string; projects: number };
export type Recommendation = {
  recommendedTrackId: string;
  recommendedTrackName: string;
  reason: string;
  whyGood: string[];
  estimatedWeeks: number;
  estimatedHoursPerWeek: number;
  projects: number;
};
export const trackSlugs = ["full-stack-js", "python-backend", "php-laravel"] as const;

export function recommendedSlug(answers: QuizAnswers): typeof trackSlugs[number] {
  if (answers.technology_preference === "javascript") return "full-stack-js";
  if (answers.technology_preference === "python") return "python-backend";
  if (answers.technology_preference === "php") return "php-laravel";
  if (answers.timeline === "6weeks") return "full-stack-js";
  if (answers.timeline === "24+weeks" || answers.experience_level === "advanced") return "python-backend";
  if (answers.goal === "skills") return answers.experience_level === "beginner" ? "php-laravel" : "python-backend";
  if (answers.goal === "current-job" && answers.experience_level === "beginner") return "php-laravel";
  return "full-stack-js";
}

export function getRecommendation(answers: QuizAnswers, tracks: TrackChoice[]): Recommendation {
  const slug = recommendedSlug(answers);
  const track = tracks.find(track => track.slug === slug);
  if (!track) throw new Error("The recommended track is unavailable. Please try again later or choose a track manually.");
  const reasons = {
    "full-stack-js": { reason: "Build complete web apps with React and Node.js", whyGood: ["Use JavaScript across frontend and backend", "Build visual projects for your portfolio", "Practice complete web application workflows", "Develop skills for web projects and freelance work"] },
    "python-backend": { reason: "Build a deeper understanding of production backend systems", whyGood: ["Develop APIs and database-backed services", "Practice backend architecture", "Build complex systems for your portfolio", "Strengthen your Python engineering skills"] },
    "php-laravel": { reason: "Build practical web development skills with Laravel", whyGood: ["Follow a structured framework for web development", "Build a foundation through beginner projects", "Practice database-backed applications", "Develop skills for PHP and Laravel projects"] },
  }[slug];
  return {
    recommendedTrackId: track.id, recommendedTrackName: track.title, ...reasons,
    reason: answers.technology_preference !== "not-sure" ? `Matches your technology preference. ${reasons.reason}.` : answers.timeline === "6weeks" ? "A focused JavaScript path for your intensive schedule" : answers.timeline === "24+weeks" ? "Explore backend engineering at a flexible pace" : reasons.reason,
    estimatedWeeks: answers.timeline === "6weeks" ? 6 : answers.timeline === "24+weeks" ? 24 : slug === "php-laravel" ? 10 : 12,
    estimatedHoursPerWeek: answers.timeline === "6weeks" ? 40 : answers.timeline === "12weeks" ? 25 : 12,
    projects: track.projects,
  };
}
