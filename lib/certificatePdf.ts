import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import path from "path";
import type { CertificateData } from "./certificate";

export async function createCertificatePDF(
  data: CertificateData,
  verificationUrl: string
): Promise<Buffer> {
  const qrCode = await QRCode.toBuffer(verificationUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 100,
  });
  
  const document = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margin: 0,
  });
  
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    document.on("data", (chunk: Buffer) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);

    // ============ BORDER & FRAME ============
    document.rect(22, 22, 798, 551).lineWidth(1.6).strokeColor("#020617").stroke();
    document.rect(30, 30, 782, 535).lineWidth(0.8).strokeColor("#e2e8f0").stroke();

    const green = "#10b981";
    const darkGreen = "#047857";
    const ink = "#020617";
    const muted = "#475569";
    const lightGray = "#94a3b8";

    // ============ HEADER: LOGO & BRANDING ============
    const logoPath = path.join(process.cwd(), "public", "icon.png");
    document.image(logoPath, 366, 49, { width: 34, height: 34, fit: [34, 34] });
    
    document.fillColor(ink).font("Helvetica-Bold").fontSize(18).text("Zero", 405, 57);
    document.fillColor(green).text("Intern", 449, 57);

    // ============ CREDENTIAL ID (TOP RIGHT) ============
    document.roundedRect(662, 30, 112, 34, 2).fillAndStroke("#ffffff", "#e2e8f0");
    document
      .fillColor(lightGray)
      .font("Helvetica-Bold")
      .fontSize(6.5)
      .text("CREDENTIAL ID", 692, 39, { width: 72, align: "right" });
    
    document
      .fillColor(darkGreen)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(data.credentialId, 692, 50, { width: 72, align: "right" });

    // ============ HORIZONTAL DIVIDER ============
    document.moveTo(76, 93).lineTo(766, 93).lineWidth(0.7).strokeColor("#e2e8f0").stroke();

    // ============ CERTIFICATE TYPE ============
    document
      .fillColor(darkGreen)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("VERIFIED PROFESSIONAL ACHIEVEMENT CREDENTIAL", 76, 143, {
        width: 690,
        align: "center",
      });

    // ============ VERIFICATION STATEMENT ============
    document
      .fillColor(muted)
      .font("Helvetica")
      .fontSize(8.5)
      .text("THIS VERIFIES THAT", 76, 184, { width: 690, align: "center" });

    // ============ STUDENT NAME (LARGE, WITH UNDERLINE) ============
    document.fillColor(ink).font("Helvetica-Bold").fontSize(36);
    
    const nameX = 421; // Center point
    const nameY = 233;
    
    document.text(data.studentName, 76, nameY, {
      width: 690,
      align: "center",
    });

    // Calculate underline width based on actual text width
    const nameTextWidth = document.widthOfString(data.studentName);
    const underlineWidth = Math.min(350, Math.max(140, nameTextWidth + 30));
    const underlineStartX = nameX - underlineWidth / 2;
    const underlineEndX = nameX + underlineWidth / 2;
    const underlineY = nameY + 40; // Below the name

    // Draw underline (improved)
    document
      .moveTo(underlineStartX, underlineY)
      .lineTo(underlineEndX, underlineY)
      .lineWidth(2.2)
      .strokeColor(green)
      .stroke();

    // ============ ACHIEVEMENT TEXT (PROFESSIONAL) ============
    document
      .fillColor(muted)
      .font("Helvetica")
      .fontSize(12)
      .text("has demonstrated professional mastery by architecting and deploying", 76, 293, {
        width: 690,
        align: "center",
        lineGap: 4,
      });

    // ============ TRACK NAME ============
    document
      .fillColor(darkGreen)
      .font("Helvetica-Bold")
      .fontSize(24)
      .text(data.trackName, 76, 348, { width: 690, align: "center" });

    // Divider under track name
    document
      .moveTo(180, 378)
      .lineTo(662, 378)
      .lineWidth(1.5)
      .strokeColor(green)
      .stroke();

    // ============ VERIFICATION CARD (WITH CLICKABLE BUTTON) ============
    document.roundedRect(186, 387, 470, 82, 2).fillAndStroke("#ffffff", "#e2e8f0");
    
    // Top green bar
    document.rect(186, 387, 470, 3).fill(green);

    // Checkmark circle
    document.circle(353, 412, 7).fill(green);
    document
      .moveTo(350, 412)
      .lineTo(352, 409.5)
      .lineTo(356.5, 414.5)
      .lineWidth(1.4)
      .strokeColor("#ffffff")
      .stroke();

    // "CRYPTOGRAPHICALLY VERIFIED" text
    document
      .fillColor(muted)
      .font("Helvetica-Bold")
      .fontSize(8.5)
      .text("CRYPTOGRAPHICALLY VERIFIED", 365, 408);

    // ============ CLICKABLE "VERIFY CREDENTIAL" BUTTON ============
    const buttonX = 350;
    const buttonY = 438;
    const buttonWidth = 141;
    const buttonHeight = 27;

    // Draw button background
    document.roundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 2).fill(green);

    // Add clickable annotation (link)
    document.link(
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight,
      verificationUrl,
      {}
    );

    // Button text
    document
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("VERIFY CREDENTIAL", buttonX, buttonY + 6, {
        width: buttonWidth,
        align: "center",
      });

    // ============ QR CODE ============
    document.image(qrCode, 700, 380, { width: 90, height: 90 });
    
    // Small text under QR
    document
      .fillColor(lightGray)
      .font("Helvetica")
      .fontSize(7)
      .text("Scan to verify", 700, 478, { width: 90, align: "center" });

    // ============ FOOTER DIVIDER ============
    document.moveTo(74, 502).lineTo(768, 502).lineWidth(0.7).strokeColor("#e2e8f0").stroke();

    // ============ FOOTER: LEFT (Issue Date) ============
    document
      .fillColor(muted)
      .font("Helvetica")
      .fontSize(9)
      .text(
        `Date Issued: ${new Date(data.issuedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        74,
        524
      );

    // ============ FOOTER: CENTER (Verification Engine) ============
    document
      .fillColor(lightGray)
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .text("ZEROINTERN VERIFICATION SYSTEM", 358, 524);

    // ============ FOOTER: RIGHT (Verified Badge) ============
    document.circle(674, 529, 3.5).fill(green);
    document
      .fillColor(darkGreen)
      .font("Helvetica-Bold")
      .fontSize(8.5)
      .text("DIGITALLY VERIFIED", 684, 524);

    // ============ SHA-256 HASH (Bottom) ============
    document
      .fillColor(muted)
      .font("Courier")
      .fontSize(8)
      .text(
        `SHA-256: ${data.cryptoHash.slice(0, 20)}...${data.cryptoHash.slice(-14)}`,
        331,
        548,
        { width: 440, align: "right" }
      );

    document.end();
  });
}