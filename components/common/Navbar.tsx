import Link from "next/link";
import Image from "next/image";
import { getUser } from "@/lib/auth";

export default async function Navbar() {
  const user = await getUser();
  const links = [{ href: "/explore", label: "Tracks" }, { href: "/#how-it-works", label: "How it works" }, { href: "/#employers", label: "For employers" }];
  return <nav className="zi-navbar" aria-label="Main navigation"><div className="zi-navbar-inner">
    <Link href="/" className="zi-brand"><Image src="/icon.png" alt="" width={36} height={36} priority /><span>ZeroIntern</span></Link>
    <div className="zi-desktop-links">{links.map(link => <Link key={link.href} href={link.href}>{link.label}</Link>)}</div>
    <div className="zi-desktop-links">{user ? <><Link href="/dashboard" className="zi-btn zi-btn-primary">My dashboard</Link><form action="/api/auth/logout" method="post"><button className="zi-btn zi-btn-secondary">Sign out</button></form></> : <><Link href="/auth/signin" className="zi-btn zi-btn-secondary">Sign in</Link><Link href="/explore" className="zi-btn zi-btn-primary">Get started</Link></>}</div>
    <details className="zi-mobile-menu"><summary>Menu</summary><div>{links.map(link => <Link key={link.href} href={link.href}>{link.label}</Link>)}{user ? <><Link href="/dashboard">My tracks</Link><Link href="/dashboard/certificates">Certificates</Link><Link href="/dashboard/settings">Settings</Link><form action="/api/auth/logout" method="post"><button className="zi-btn zi-btn-secondary">Sign out</button></form></> : <Link href="/auth/signin">Sign in</Link>}</div></details>
  </div></nav>;
}
