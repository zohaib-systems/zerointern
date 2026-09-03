"use client";

import ErrorAlert from "@/components/common/ErrorAlert";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="flex min-h-screen items-center justify-center bg-[#0b0b0f] px-6 text-white"><div className="w-full max-w-md"><ErrorAlert message="We could not load this page." onRetry={reset} /></div></main>;
}
