export type EmailEvent = { id: string; kind: "approved" | "rejected" | "certificate"; title: string; feedback: string | null; path: string };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

export function emailTemplate(event: EmailEvent) {
  const origin = "https://zerointern.vercel.app";
  if (!/^\/dashboard\/(projects\/[0-9a-f-]+|certificates)$/.test(event.path)) throw new Error("Invalid email destination");
  const heading = { approved: "Your project was approved", rejected: "Changes requested for your project", certificate: "You earned a certificate" }[event.kind];
  const link = origin + event.path;
  const settings = origin + "/dashboard/settings";
  const feedback = event.feedback ? `Reviewer feedback:\n${event.feedback}` : "";
  return {
    subject: `ZeroIntern: ${heading}`,
    text: `${heading}\n\n${event.title}\n\n${feedback}\n\nView in ZeroIntern: ${link}\n\nYou enabled email notifications. Manage preferences: ${settings}`,
    html: `<main style="font-family:Arial,sans-serif;max-width:600px;margin:auto;line-height:1.6;color:#172033"><p>ZeroIntern</p><h1>${heading}</h1><p>${escapeHtml(event.title)}</p>${feedback ? `<p style="white-space:pre-wrap">${escapeHtml(feedback)}</p>` : ""}<p><a href="${link}">View in ZeroIntern</a></p><hr><p>You enabled email notifications. <a href="${settings}">Manage preferences</a></p></main>`,
  };
}
