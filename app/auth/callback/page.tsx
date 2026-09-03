"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

function CallbackStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  useEffect(() => {
    if (!code || error) return;
    router.replace(`/api/auth/callback?code=${encodeURIComponent(code)}`);
  }, [code, error, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0b0f] px-6 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-bold text-rose-300">Sign in failed</h1>
            <p className="mt-3 text-zinc-300">{error}</p>
            <Link href="/auth/signin" className="mt-6 inline-block rounded-lg bg-cyan-500 px-4 py-2 font-medium text-slate-950">Try again</Link>
          </>
        ) : (
          <>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-cyan-400" aria-label="Loading" />
            <h1 className="mt-5 text-xl font-semibold">Completing sign in...</h1>
            <p className="mt-2 text-zinc-400">You will be redirected shortly.</p>
          </>
        )}
      </section>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<p className="text-zinc-300">Completing sign in...</p>}>
      <CallbackStatus />
    </Suspense>
  );
}
