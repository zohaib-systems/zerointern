import Link from "next/link";

export default function Footer() {
  return <footer className="border-t border-white/10 px-6 py-8 text-sm text-zinc-500"><div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><span>ZeroIntern</span><div className="flex gap-5"><Link href="/explore" className="transition hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-300">Explore tracks</Link><Link href="/auth/signin" className="transition hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-300">Sign in</Link></div></div></footer>;
}
