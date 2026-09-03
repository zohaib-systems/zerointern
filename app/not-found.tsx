import Link from "next/link";

export default function NotFound() {
  return <main className="flex min-h-screen items-center justify-center bg-[#0b0b0f] px-6 text-white"><section className="max-w-md text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#65d69a]">404</p><h1 className="mt-3 text-4xl font-bold">Page not found</h1><p className="mt-4 text-zinc-400">The page you requested does not exist or is no longer available.</p><Link href="/" className="mt-7 inline-flex min-h-12 items-center rounded-lg bg-[#20A562] px-5 py-3 font-semibold text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#65d69a]">Return home</Link></section></main>;
}
