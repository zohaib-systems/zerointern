"use client";

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return <div role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-5 text-rose-100"><p className="font-medium">Something went wrong</p><p className="mt-1 text-sm text-rose-200/80">{message}</p>{onRetry && <button type="button" onClick={onRetry} className="mt-4 min-h-12 rounded-lg border border-rose-300/40 px-4 py-2 text-sm font-medium transition hover:bg-rose-300/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300">Try again</button>}</div>;
}
