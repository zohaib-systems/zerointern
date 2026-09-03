import Link from "next/link";
import Navbar from "@/components/common/Navbar";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white">
      <Navbar />
      <section className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
              ZeroIntern
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Build real projects. Learn by shipping.
              </h1>
              <p className="text-lg text-zinc-300">
                Join beginner-friendly technical tracks, submit projects, and earn certificates with a polished learning experience.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/auth/signin" className="rounded-full bg-cyan-500 px-6 py-3 font-medium text-slate-950 transition hover:bg-cyan-400">
                Sign In
              </Link>
              <Link
                href="#tracks"
                className="rounded-full border border-white/15 bg-white/5 px-6 py-3 font-medium text-white transition hover:bg-white/10"
              >
                Explore Tracks
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl border border-white/10 bg-[#111827] p-6 md:grid-cols-2 lg:w-[420px]">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-zinc-400">Tracks</p>
              <p className="mt-2 text-3xl font-bold">12</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-zinc-400">Projects</p>
              <p className="mt-2 text-3xl font-bold">48</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 md:col-span-2">
              <p className="text-sm text-zinc-400">Current focus</p>
              <p className="mt-2 text-xl font-semibold">Full-stack product building</p>
            </div>
          </div>
        </div>
      </div>
      </section>
    </main>
  );
}
