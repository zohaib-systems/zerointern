"use client";

import { useState } from "react";

export default function NotificationPreferences({ initialEnabled, loadFailed }: { initialEnabled: boolean; loadFailed: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function save(nextEnabled: boolean) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/notification-preferences", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailEnabled: nextEnabled }),
      });
      if (!response.ok) throw new Error("save failed");
      setEnabled(nextEnabled);
      setMessage(nextEnabled ? "Email notifications enabled." : "Email notifications disabled.");
    } catch {
      setMessage("Unable to save preferences. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="zi-panel">
    <h2>Preferences</h2>
    <div className="zi-setting-row">
      <div><h3><label htmlFor="email-notifications">Email notifications</label></h3>
        <p id="email-notifications-hint">Receive project approvals, requests for changes, and certificate updates at your account email.</p></div>
      <input id="email-notifications" type="checkbox" role="switch" checked={enabled}
        disabled={busy || loadFailed} aria-describedby="email-notifications-hint" onChange={(event) => void save(event.target.checked)} />
    </div>
    <p role="status">{loadFailed ? "Unable to load preferences. Refresh the page to try again." : busy ? "Saving…" : message}</p>
    <div className="zi-setting-row"><div><h3>Marketing emails</h3><p>No marketing email subscription is currently offered.</p></div><span className="zi-badge neutral">Unavailable</span></div>
  </section>;
}
