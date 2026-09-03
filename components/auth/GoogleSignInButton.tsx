"use client";

import { useState } from "react";

export default function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false);

  function handleSignIn() {
    setIsLoading(true);
  }

  return (
    <a
      href="/api/auth/signin"
      onClick={handleSignIn}
      aria-disabled={isLoading}
      className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-100 aria-disabled:pointer-events-none aria-disabled:opacity-70"
    >
      <span aria-hidden="true" className="text-lg font-bold text-cyan-600">G</span>
      {isLoading ? "Connecting to Google..." : "Continue with Google"}
    </a>
  );
}
