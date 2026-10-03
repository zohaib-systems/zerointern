export type EmailEvent = { id: string; kind: "approved" | "rejected" | "certificate"; title: string; feedback: string | null; path: string };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

export function emailTemplate(event: EmailEvent, recipientName = "there") {
  const origin = "https://zerointern.vercel.app";
  if (!/^\/dashboard\/(projects\/[0-9a-f-]+|certificates)$/.test(event.path)) throw new Error("Invalid email destination");
  const name = recipientName.replace(/[\r\n]+/g, " ").trim() || "there";
  const subjectName = name === "there" ? "" : `, ${name}`;
  const title = event.title;
  const subjectTitle = title.replace(/[\r\n]+/g, " ").trim();
  const copy = {
    approved: {
      subject: `Congratulations${subjectName}! Your project has been approved`,
      heading: "Your project has been approved",
      opening: `Congratulations! Your ${title} project has been reviewed and approved.`,
      openingHtml: `Congratulations! Your <strong>${escapeHtml(title)}</strong> project has been reviewed and approved.`,
      paragraphs: ["Your work marks another step forward in your learning journey. Take pride in this achievement and keep building on the skills you've developed."],
      button: "View your project",
      closing: "Best wishes for your next challenge,",
    },
    rejected: {
      subject: `Feedback on your ${subjectTitle} project`,
      heading: "Your project needs a few updates",
      opening: "Keep going - you're making progress!",
      openingHtml: "Keep going &mdash; you're making progress!",
      paragraphs: [`We've reviewed your ${title} project. It needs a few updates before we can approve it.`],
      button: "Review and resubmit",
      closing: "Best regards,",
    },
    certificate: {
      subject: `Congratulations${subjectName}! You've earned your ZeroIntern certificate`,
      heading: "You've earned your certificate",
      opening: `Congratulations on earning your ${title} Certificate of Achievement!`,
      openingHtml: `Congratulations on earning your <strong>${escapeHtml(title)} Certificate of Achievement</strong>!`,
      paragraphs: ["Your approved projects demonstrate the practical skills you've developed through dedication and consistent effort. This certificate recognizes that accomplishment.", "Download your certificate and share your achievement with your professional network."],
      button: "View your certificate",
      closing: "We wish you continued success as you put your skills into practice.\n\nBest regards,",
    },
  }[event.kind];
  const feedback = event.kind === "rejected"
    ? event.feedback?.trim() || "Please open your project to review the requested changes before resubmitting."
    : null;
  const nextSteps = event.kind === "rejected"
    ? ["Use this feedback to refine your work, then resubmit your project when you're ready. Each revision is an opportunity to strengthen your skills.", "Good luck with your next submission - we look forward to seeing your improvements."]
    : [];
  const link = origin + event.path;
  const settings = origin + "/dashboard/settings";
  const paragraph = (value: string) => `<p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#334155">${escapeHtml(value).replace(/\n/g, "<br>")}</p>`;
  return {
    subject: copy.subject,
    text: ["ZeroIntern", copy.heading, `Hi ${name},`, copy.opening, ...copy.paragraphs,
      ...(feedback ? [`Reviewer feedback\n${feedback}`] : []), ...nextSteps,
      `${copy.button}: ${link}`, copy.closing, "The ZeroIntern Team",
      `You enabled email notifications. Manage email preferences: ${settings}`].join("\n\n"),
    html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(copy.heading)}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#172033">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9"><tr><td align="center" style="padding:32px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px">
<tr><td style="padding:24px 28px;border-bottom:3px solid #20a562"><a href="${origin}" style="font-size:24px;font-weight:bold;color:#047857;text-decoration:none">ZeroIntern</a><p style="margin:6px 0 0;font-size:12px;letter-spacing:1px;color:#64748b">LEARN. BUILD. GROW.</p></td></tr>
<tr><td style="padding:28px;overflow-wrap:anywhere">
<h1 style="margin:0 0 24px;font-size:26px;line-height:1.3;color:#047857">${escapeHtml(copy.heading)}</h1>
${paragraph(`Hi ${name},`)}<p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#334155">${copy.openingHtml}</p>
${copy.paragraphs.map(paragraph).join("")}
${feedback ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:#f8fafc;border-left:3px solid #20a562"><tr><td style="padding:18px"><h2 style="margin:0 0 10px;font-size:16px;color:#172033">Reviewer feedback</h2><p style="margin:0;font-size:15px;line-height:1.7;white-space:pre-wrap;color:#334155">${escapeHtml(feedback).replace(/\r?\n/g, "<br>")}</p></td></tr></table>` : ""}
${nextSteps.map(paragraph).join("")}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 28px"><tr><td bgcolor="#047857" style="border-radius:6px"><a href="${link}" style="display:inline-block;padding:14px 22px;border:1px solid #047857;border-radius:6px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none">${copy.button}</a></td></tr></table>
${paragraph(copy.closing)}<p style="margin:0;font-size:16px;color:#172033;font-weight:bold">The ZeroIntern Team</p>
</td></tr><tr><td style="padding:20px 28px;border-top:1px solid #e2e8f0;font-size:12px;line-height:1.6;color:#64748b">You enabled email notifications.<br><a href="${settings}" style="color:#047857;text-decoration:underline">Manage email preferences</a></td></tr>
</table></td></tr></table></body></html>`,
  };
}
