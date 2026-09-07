import Link from "next/link";
export default function Footer() {
  return <footer className="zi-footer"><div className="zi-container"><div className="zi-footer-grid"><div><Link href="/" className="zi-brand">ZeroIntern</Link><p>Learn by building real projects. Share work that speaks for itself.</p></div><div><h2>Platform</h2><Link href="/explore">Explore tracks</Link><Link href="/dashboard">My dashboard</Link><Link href="/dashboard/certificates">Certificates</Link></div><div><h2>Get to know ZeroIntern</h2><Link href="/#how-it-works">How it works</Link><Link href="/#employers">For employers</Link><Link href="/auth/signin">Join for free</Link></div></div><p className="zi-footer-bottom">&copy; {new Date().getFullYear()} ZeroIntern. Build, learn, and ship.</p></div></footer>;
}
