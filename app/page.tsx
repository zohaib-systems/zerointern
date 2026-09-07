import Link from "next/link";
import { Code2, Database, LayoutDashboard, ArrowRight, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { mapTrack } from "@/lib/data";
import TrackCard from "@/components/track/TrackCard";
import styles from "./page.module.css";

const examples = [
  { Icon: Code2, track: "Full Stack JavaScript", title: "Launch an e-commerce platform", tags: "React / Node.js / PostgreSQL" },
  { Icon: Database, track: "Python Backend", title: "Build reliable payment systems", tags: "FastAPI / Transactions / APIs" },
  { Icon: LayoutDashboard, track: "PHP & Laravel", title: "Create powerful admin dashboards", tags: "Laravel / Queues / Analytics" },
];
const steps = [
  ["Choose a track", "Find your path in JavaScript, Python, or Laravel."],
  ["Build real projects", "Start with four beginner projects, then unlock four advanced builds."],
  ["Submit your work", "Share your repository and live application for review."],
  ["Earn your credential", "Get a verifiable certificate when every project in your track is approved."],
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tracks").select("*, projects(id, title, difficulty_level, project_order)").order("title");
  const tracks = data ?? [];
  const totalProjects = tracks.reduce((sum, track) => sum + (track.projects?.length ?? 0), 0);

  return <main className={styles.landing}>
    <section className={`zi-container ${styles.hero}`} aria-labelledby="hero-title">
      <div>
        <p className="zi-eyebrow">Free, project-based learning</p>
        <h1 id="hero-title">Build real projects.<span className="zi-gradient-text">Show what you can do.</span></h1>
        <p className={styles.lead}>Turn your development skills into working products. Follow a guided track, get your work reviewed, and earn a verifiable credential.</p>
        <div className={styles.actions}>
          <Link href="/explore" className="zi-btn zi-btn-primary">Explore tracks <ArrowRight size={18} aria-hidden="true" /></Link>
          <Link href="#how-it-works" className={styles.textLink}>How it works <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        <dl className={styles.stats}>
          {!error && <><div><dt>Guided projects</dt><dd>{totalProjects}</dd></div><div><dt>Learning tracks</dt><dd>{tracks.length}</dd></div></>}
          <div><dt>Free to learn</dt><dd>100%</dd></div>
        </dl>
      </div>
      <div className={styles.showcase}>
        <p className="zi-eyebrow">From learning to building</p>
        <h2>Your next project starts here.</h2>
        <p className={styles.showcaseIntro}>Practical builds. Skills you can put to work.</p>
        <div className={styles.examples}>{examples.map(({ Icon, track, title, tags }) =>
          <article className={styles.example} key={track}>
            <div className={styles.exampleIcon}><Icon size={22} aria-hidden="true" /></div>
            <div><p className={styles.exampleTrack}>{track}</p><h3>{title}</h3><p className={styles.tags}>{tags}</p></div>
          </article>
        )}</div>
        <div className={styles.showcaseNote}><ShieldCheck size={18} aria-hidden="true" /><span>Build toward a verifiable credential</span></div>
      </div>
    </section>

    <section id="tracks" className={styles.section} aria-labelledby="tracks-title">
      <div className="zi-container">
        <div className={styles.sectionHeading}><div><p className="zi-eyebrow">Find your focus</p><h2 id="tracks-title">Choose your learning path</h2><p>Build a foundation, then take on ambitious platform projects.</p></div><Link href="/explore" className={styles.textLink}>View all tracks <ArrowRight size={16} aria-hidden="true" /></Link></div>
        {error || !tracks.length ? <p className={styles.emptyState} role="status">{error ? "Tracks are temporarily unavailable. Please try again shortly." : "New learning tracks are on the way. Check back soon."}</p> :
          <div className={styles.trackGrid}>{tracks.map(row => <TrackCard key={row.id} track={mapTrack(row)} projectCount={row.projects.length} previewProjects={[...row.projects].sort((a, b) => a.project_order - b.project_order).filter(p => [1, 2, 5, 7].includes(p.project_order))} />)}</div>}
      </div>
    </section>

    <section id="how-it-works" className={`${styles.section} ${styles.processSection}`} aria-labelledby="process-title">
      <div className="zi-container">
        <div className={styles.sectionHeading}><div><p className="zi-eyebrow">A clear way forward</p><h2 id="process-title">From your first build to verified work</h2><p>Make progress one project at a time, with a clear next step.</p></div></div>
        <ol className={styles.steps}>{steps.map(([title, description], index) => <li key={title}><span className={styles.stepNumber} aria-hidden="true">0{index + 1}</span><h3>{title}</h3><p>{description}</p></li>)}</ol>
      </div>
    </section>

    <section id="employers" className={`zi-container ${styles.employerSection}`} aria-labelledby="employers-title">
      <div className={styles.employerPanel}>
        <div><p className="zi-eyebrow">For employers</p><h2 id="employers-title">Real work.<br />Proof you can inspect.</h2><Link href="/explore" className="zi-btn zi-btn-secondary">Explore the curriculum <ArrowRight size={16} aria-hidden="true" /></Link></div>
        <div className={styles.verification}><ShieldCheck size={32} aria-hidden="true" /><h3>Credentials backed by approved projects</h3><p>Every issued credential has a public verification page with its status and links to the learner&apos;s approved work.</p><p>Ask a candidate for their verification link to see what they&apos;ve built.</p></div>
      </div>
    </section>
  </main>;
}
