"use client";

import { useState } from "react";

export default function CopyFingerprintButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copyFingerprint() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copyFingerprint}
      className="min-h-11 rounded-md border border-[#0B7A53]/35 bg-white px-4 py-2 text-sm font-semibold text-[#065F46] transition hover:border-[#0B7A53] hover:bg-[#F4FAF7]"
      aria-label="Copy SHA-256 fingerprint"
    >
      {copied ? "Copied" : "Copy fingerprint"}
    </button>
  );
}
