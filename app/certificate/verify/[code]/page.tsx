import Link from "next/link";
import Image from "next/image";
import { getCertificateData, type PublicCertificateData } from "@/lib/certificateData";
import { createServiceClient } from "@/lib/supabase/service";
import CopyFingerprintButton from "@/components/certificate/CopyFingerprintButton";

function getDisplayTrackName(trackName: string) {
  return trackName.trim().toLowerCase() === "full stack javascript"
    ? "Full-Stack JavaScript Development"
    : trackName;
}

function formatDate(value: string | null) {
  if (!value) return "Not specified";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getStatusPresentation(certificate: PublicCertificateData | null) {
  if (!certificate) {
    return {
      label: "CREDENTIAL NOT FOUND",
      message: "We could not verify a Zero Intern credential with this ID.",
      tone: "border-[#9B2C2C]/25 bg-[#FFF8F7] text-[#7F1D1D]",
      icon: "!",
    };
  }

  if (!certificate.integrityValid) {
    return {
      label: "INTEGRITY CHECK FAILED",
      message: "The credential record was found, but its cryptographic fingerprint does not match the expected value.",
      tone: "border-[#9B2C2C]/25 bg-[#FFF8F7] text-[#7F1D1D]",
      icon: "!",
    };
  }

  if (certificate.status === "revoked") {
    return {
      label: "CREDENTIAL REVOKED",
      message: "This credential was issued by Zero Intern but is no longer considered valid.",
      tone: "border-[#9B2C2C]/25 bg-[#FFF8F7] text-[#7F1D1D]",
      icon: "!",
    };
  }

  if (certificate.status === "expired") {
    return {
      label: "CREDENTIAL EXPIRED",
      message: "This credential was valid when issued but has passed its validity period.",
      tone: "border-[#B7791F]/30 bg-[#FFFCF3] text-[#8A5A12]",
      icon: "!",
    };
  }

  return {
    label: "VERIFIED CREDENTIAL",
    message: "This credential has been verified as an authentic credential issued by Zero Intern.",
    tone: "border-[#0B7A53]/25 bg-[#F4FAF7] text-[#065F46]",
    icon: "✓",
  };
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[#DDE6E2] py-4 last:border-b-0">
      <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#526171]">{label}</dt>
      <dd className="mt-1 text-base text-[#07111F]">{value}</dd>
    </div>
  );
}

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const isValidCode = /^ZI-[A-Z0-9]{6,32}$/i.test(code);
  const certificate = isValidCode
    ? await getCertificateData(createServiceClient(), code.toUpperCase())
    : null;
  const presentation = getStatusPresentation(certificate);
  const displayTrack = certificate ? getDisplayTrackName(certificate.trackName) : "";
  const previewUrl = certificate
    ? `/api/certificates/download?code=${encodeURIComponent(certificate.credentialId)}&preview=true`
    : "";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FEFEFC] text-[#07111F]">
      <div className="pointer-events-none absolute right-[-4rem] top-32 hidden opacity-[0.045] md:block" aria-hidden="true">
        <Image src="/icon1.png" alt="" width={288} height={288} className="h-72 w-72 object-contain" />
      </div>

      <header className="relative border-b border-[#72B39B] bg-[#07111F]">
        <div className="mx-auto flex max-w-[1040px] items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Zero Intern home">
            <Image src="/icon1.png" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold tracking-tight text-white">
              Zero <span className="text-[#65D69A]">Intern</span>
            </span>
          </Link>
          <p className="hidden text-[10px] font-bold uppercase tracking-[0.22em] text-[#D9EDE5] sm:block">
            Official Credential Verification
          </p>
        </div>
      </header>

      <div className="relative mx-auto max-w-[1040px] px-5 pb-16 pt-10 sm:px-8 sm:pt-16">
        <section className="border-b border-[#DDE6E2] pb-12 sm:pb-16" aria-labelledby="verification-heading">
          <div className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] ${presentation.tone}`} role="status">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-sm" aria-hidden="true">{presentation.icon}</span>
            <span>{presentation.label}</span>
          </div>
          <h1 id="verification-heading" className="mt-8 max-w-3xl font-serif text-4xl leading-tight tracking-tight sm:text-6xl">
            {certificate ? certificate.studentName : "Credential verification"}
          </h1>
          {certificate && <p className="mt-5 font-serif text-2xl leading-tight text-[#065F46] sm:text-3xl">{displayTrack}</p>}
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#526171]">{presentation.message}</p>
          {certificate?.status === "revoked" && certificate.revocationReason && (
            <p className="mt-4 text-sm text-[#7F1D1D]">Reason: {certificate.revocationReason}</p>
          )}
          {!certificate && <p className="mt-6 font-mono text-sm text-[#526171]">Queried ID: {code}</p>}
        </section>

        {certificate ? (
          <>
            <section className="grid gap-10 border-b border-[#DDE6E2] py-10 sm:grid-cols-[minmax(0,1fr)_220px] sm:py-14" aria-labelledby="details-heading">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B7A53]">Credential record</p>
                <h2 id="details-heading" className="mt-3 font-serif text-3xl">Credential Details</h2>
                <dl className="mt-6 grid gap-x-10 sm:grid-cols-2">
                  <Detail label="Credential ID" value={certificate.credentialId} />
                  <Detail label="Credential Type" value="Certificate of Achievement" />
                  <Detail label="Issued To" value={certificate.studentName} />
                  <Detail label="Program" value={displayTrack} />
                  <Detail label="Date Issued" value={formatDate(certificate.issuedAt)} />
                  <Detail label="Current Status" value={certificate.status === "verified" ? "Verified" : certificate.status[0].toUpperCase() + certificate.status.slice(1)} />
                  <Detail label="Issuer" value="Zero Intern" />
                  {certificate.expiresAt && <Detail label="Expiration Date" value={formatDate(certificate.expiresAt)} />}
                  {certificate.revokedAt && <Detail label="Revoked On" value={formatDate(certificate.revokedAt)} />}
                </dl>
              </div>
              <aside className="self-start border-l border-[#DDE6E2] pl-6 sm:mt-12" aria-label="Credential summary">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#526171]">Issued by</p>
                <p className="mt-2 font-serif text-2xl text-[#065F46]">Zero Intern</p>
                <p className="mt-3 text-sm leading-6 text-[#526171]">Professional credentials with public verification and cryptographic integrity checks.</p>
              </aside>
            </section>

            <section className="border-b border-[#DDE6E2] py-10 sm:py-14" aria-labelledby="crypto-heading">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B7A53]">Security record</p>
              <h2 id="crypto-heading" className="mt-3 font-serif text-3xl">Cryptographic Verification</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#526171]">This credential includes a cryptographic fingerprint that can be used to verify its integrity.</p>
              <div className="mt-7 flex flex-col gap-4 rounded-lg border border-[#DDE6E2] bg-white p-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#526171]">SHA-256 Fingerprint</p>
                  <p className="mt-3 break-all font-mono text-xs leading-6 text-[#07111F]">{certificate.cryptoHash}</p>
                </div>
                <CopyFingerprintButton value={certificate.cryptoHash} />
              </div>
              <p className={`mt-4 text-sm font-semibold ${certificate.integrityValid ? "text-[#065F46]" : "text-[#7F1D1D]"}`}>
                {certificate.integrityValid ? "✓ Credential integrity verified" : "! Credential integrity could not be verified"}
              </p>
            </section>

            <section className="border-b border-[#DDE6E2] py-10 sm:py-14" aria-labelledby="certificate-heading">
              <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B7A53]">Official document</p>
                  <h2 id="certificate-heading" className="mt-3 font-serif text-3xl">Certificate Preview</h2>
                  <p className="mt-3 text-sm text-[#526171]">View the issued certificate in its original print format.</p>
                </div>
                <a href={previewUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#0B7A53] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#065F46]">View Certificate</a>
              </div>
            </section>
          </>
        ) : (
          <section className="border-b border-[#DDE6E2] py-12" aria-labelledby="not-found-heading">
            <h2 id="not-found-heading" className="font-serif text-3xl">Verify another credential</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#526171]">Check the credential ID printed on a Zero Intern certificate to verify its record.</p>
            <Link href="/" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md border border-[#0B7A53]/40 px-5 py-3 text-sm font-bold text-[#065F46]">Return to Zero Intern</Link>
          </section>
        )}

        <footer className="flex flex-col gap-3 pt-8 text-xs text-[#526171] sm:flex-row sm:items-center sm:justify-between">
          <span>Zero Intern Credential Verification System</span>
          {certificate && <span className="font-mono">Credential ID: {certificate.credentialId}</span>}
        </footer>
      </div>
    </main>
  );
}
