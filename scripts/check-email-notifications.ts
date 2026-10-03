import assert from "node:assert/strict";
import { emailTemplate, type EmailEvent } from "../lib/email-template";
import { deliveryFailure } from "../lib/email-delivery";
import { POST } from "../app/api/notifications/process/route";

const base: EmailEvent = {
  id: "test", kind: "approved", title: '<script>alert("x")</script>',
  feedback: "<img src=x onerror=alert(1)>\nTry again & resubmit.",
  path: "/dashboard/projects/11111111-1111-1111-1111-111111111111",
};
for (const kind of ["approved", "rejected", "certificate"] as const) {
  const mail = emailTemplate({ ...base, kind, path: kind === "certificate" ? "/dashboard/certificates" : base.path });
  assert.ok(mail.subject.startsWith(kind === 'rejected' ? 'Feedback on your' : 'Congratulations'));
  assert.ok(mail.text.includes('Hi there,'));
  assert.equal(mail.html.includes('Reviewer feedback'), kind === 'rejected');
  assert.ok(!mail.html.includes("<script>"));
  assert.ok(!mail.html.includes("<img"));
  assert.ok(mail.html.includes("&lt;script&gt;"));
  assert.equal(mail.text.includes(base.feedback!), kind === 'rejected');
  if (kind === 'rejected') assert.ok(mail.text.includes('Good luck with your next submission'));
  assert.ok(mail.text.includes("https://zerointern.vercel.app/dashboard/settings"));
}
const personalized = emailTemplate(base, 'Alex <img src=x>');
assert.ok(personalized.text.includes('Hi Alex <img src=x>,'));
assert.ok(personalized.html.includes('Hi Alex &lt;img src=x&gt;,'));
assert.ok(!personalized.html.includes('<img'));
assert.ok(emailTemplate(base, '  ').text.includes('Hi there,'));
assert.ok(!emailTemplate(base, 'Alex\r\nBcc: someone').subject.includes('\n'));
assert.ok(emailTemplate({ ...base, kind: 'rejected', feedback: null }).text.includes('review the requested changes'));
assert.ok(emailTemplate({ ...base, kind: 'rejected' }).html.includes('&lt;img src=x onerror=alert(1)&gt;<br>Try again &amp; resubmit.'));
for (const path of ["//evil.example", "https://evil.example", '/dashboard/projects/abc" onclick="alert(1)', "/dashboard/certificates?redirect=evil"]) {
  assert.throws(() => emailTemplate({ ...base, path }));
}
assert.equal(deliveryFailure({ responseCode: 421 }, 1).status, "pending");
assert.equal(deliveryFailure({ responseCode: 421 }, 5).status, "failed");
assert.equal(deliveryFailure({ responseCode: 550 }, 1).status, "failed");
assert.equal(deliveryFailure({ code: "EAUTH" }, 1).status, "failed");
assert.equal(deliveryFailure({ code: "ETIMEDOUT", command: "CONN" }, 1).status, "pending");
assert.equal(deliveryFailure({ code: "ETIMEDOUT", command: "DATA" }, 1).status, "failed");
assert.equal(deliveryFailure({ code: "ESOCKET", command: "DATA" }, 1).status, "failed");
assert.ok(!JSON.stringify(deliveryFailure({ message: "secret SMTP response" }, 1)).includes("secret"));
console.log("Email template escaping, destination validation, and safe retry checks passed.");

async function checkWorkerAuthorization() {
  const originalSecret = process.env.EMAIL_WORKER_SECRET;
  const originalUser = process.env.GMAIL_USER;
  try {
    process.env.EMAIL_WORKER_SECRET = "test-secret";
    delete process.env.GMAIL_USER;
    for (const authorization of ["", "Bearer wrong-secret", "Bearer tést-secret"]) {
      const response = await POST(new Request("https://zerointern.vercel.app/api/notifications/process", {
        method: "POST", headers: { authorization },
      }));
      assert.equal(response.status, 401);
    }
    const response = await POST(new Request("https://zerointern.vercel.app/api/notifications/process", {
      method: "POST", headers: { authorization: "Bearer test-secret" },
    }));
    assert.equal(response.status, 503, "missing Gmail configuration must not claim a notification");
  } finally {
    if (originalSecret === undefined) delete process.env.EMAIL_WORKER_SECRET;
    else process.env.EMAIL_WORKER_SECRET = originalSecret;
    if (originalUser === undefined) delete process.env.GMAIL_USER;
    else process.env.GMAIL_USER = originalUser;
  }
  console.log("Worker authorization and missing-configuration checks passed.");
}
checkWorkerAuthorization().catch((error) => { console.error(error); process.exitCode = 1; });
