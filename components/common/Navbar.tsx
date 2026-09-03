import Link from "next/link";
import Image from "next/image";
import { getUser } from "@/lib/auth";

export default async function Navbar() {
  const user = await getUser();
  const displayName = user?.user_metadata.full_name ?? user?.user_metadata.name ?? user?.email;

  return (
    <nav className="flex items-center justify-between border-b border-white/10 px-6 py-4 text-white">
      <Link href="/" aria-label="ZeroIntern home" className="flex shrink-0 items-center">
        <Image src="/zerointern-logo.png.png" alt="ZeroIntern" width={150} height={36} priority className="h-8 w-auto object-contain sm:h-9" />
      </Link>
      <details className="relative md:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center rounded-lg border border-white/15 px-4 text-sm text-zinc-200">Menu</summary>
        <div className="absolute right-0 top-14 z-20 min-w-44 rounded-xl border border-white/10 bg-[#15151d] p-2 shadow-xl">
          <Link href="/explore" className="block min-h-12 rounded-lg px-3 py-3 text-zinc-200 hover:bg-white/10">Explore</Link>
          {user && <Link href="/dashboard/certificates" className="block min-h-12 rounded-lg px-3 py-3 text-zinc-200 hover:bg-white/10">Certificates</Link>}
        </div>
      </details>
      <div className="hidden items-center gap-4 text-sm md:flex">
        <Link href="/explore" className="min-h-12 py-3 text-zinc-300 transition hover:text-white">Explore</Link>
        {user && <Link href="/dashboard/certificates" className="min-h-12 py-3 text-zinc-300 transition hover:text-white">Certificates</Link>}
        {user ? (
          <>
            <span className="hidden text-zinc-400 sm:inline">{displayName}</span>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="rounded-lg border border-white/15 px-3 py-2 transition hover:bg-white/10">
                Sign out
              </button>
            </form>
          </>
        ) : (
          <Link href="/auth/signin" className="rounded-lg bg-cyan-500 px-3 py-2 font-medium text-slate-950 transition hover:bg-cyan-400">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
