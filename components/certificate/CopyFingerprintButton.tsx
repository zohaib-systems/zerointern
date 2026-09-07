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
      className="zi-btn zi-btn-secondary"
      aria-label="Copy SHA-256 fingerprint"
    >
      {copied ? "Copied" : "Copy fingerprint"}
    </button>
  );
}
