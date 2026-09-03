import Link from "next/link";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0b0f] px-6 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <Link href="/" className="text-sm text-cyan-300 hover:text-cyan-200">Back to home</Link>
        <div className="mt-10 space-y-3 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">ZeroIntern</p>
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-zinc-400">Sign in to continue your learning journey.</p>
        </div>
        <div className="mt-8 space-y-4">
          <GoogleSignInButton />
          <Link href="/explore" className="block text-center text-sm text-zinc-400 hover:text-white">Browse tracks without signing in</Link>
        </div>
      </section>
    </main>
  );
}
