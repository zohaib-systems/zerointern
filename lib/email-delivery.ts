import nodemailer from "nodemailer";

export function createEmailTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error("Email delivery is not configured");
  return nodemailer.createTransport({
    host: "smtp.gmail.com", port: 465, secure: true,
    auth: { user, pass: pass.replace(/\s/g, "") },
    connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 15_000,
    disableFileAccess: true, disableUrlAccess: true,
  });
}

export function deliveryFailure(error: unknown, attempts: number) {
  const failure = (error ?? {}) as { code?: string; responseCode?: number; command?: string };
  // Only retry an explicit temporary refusal or a failure before SMTP DATA.
  // A timeout during DATA may mean Gmail already accepted the message.
  const retryable = (failure.responseCode !== undefined && failure.responseCode >= 400 && failure.responseCode < 500)
    || (["ECONNECTION", "EDNS"].includes(failure.code ?? ""))
    || (failure.code === "ETIMEDOUT" && failure.command === "CONN");
  return {
    status: retryable && attempts < 5 ? "pending" : "failed",
    last_error: retryable ? "Temporary delivery failure" : "Delivery failed or acceptance uncertain; inspect before retry",
    available_at: new Date(Date.now() + Math.min(360, 5 * 2 ** (attempts - 1)) * 60_000).toISOString(),
  };
}
