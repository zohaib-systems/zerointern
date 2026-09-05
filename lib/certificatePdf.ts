import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import type { CertificateData } from "./certificate";

export async function createCertificatePDF(
  data: CertificateData,
  verificationUrl: string
): Promise<Buffer> {
  const qrCode = await QRCode.toBuffer(verificationUrl, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 220,
    color: {
      dark: "#07111F",
      light: "#FFFFFF",
    },
  });

  const document = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margin: 0,
    info: {
      Title: `${data.studentName} — ${data.trackName}`,
      Author: "Zero Intern",
      Subject: "Certificate of Achievement",
      Keywords:
        "Zero Intern, Certificate, Credential, Professional Achievement, Verification",
    },
  });

  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    document.on("data", (chunk: Buffer) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);

    const pageWidth = document.page.width;
    const pageHeight = document.page.height;

    // =========================================================
    // COLORS
    // =========================================================

    const green = "#0B7A53";
    const darkGreen = "#065F46";

    const ink = "#07111F";
    const muted = "#526171";
    const borderSoft = "#DDE6E2";

    const white = "#FFFFFF";
    const ivory = "#FEFEFC";

    // =========================================================
    // HELPERS
    // =========================================================

    const centeredText = (
      text: string,
      y: number,
      options: {
        font?: string;
        size?: number;
        color?: string;
        width?: number;
        x?: number;
        characterSpacing?: number;
      } = {}
    ) => {
      const width = options.width ?? 700;
      const x = options.x ?? (pageWidth - width) / 2;

      document
        .font(options.font ?? "Helvetica")
        .fontSize(options.size ?? 10)
        .fillColor(options.color ?? ink)
        .text(text, x, y, {
          width,
          align: "center",
          characterSpacing: options.characterSpacing,
          lineBreak: false,
        });
    };

    const line = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      color = borderSoft,
      width = 0.7
    ) => {
      document
        .moveTo(x1, y1)
        .lineTo(x2, y2)
        .lineWidth(width)
        .strokeColor(color)
        .stroke();
    };

    // =========================================================
    // BACKGROUND
    // =========================================================

    document.rect(0, 0, pageWidth, pageHeight).fill(ivory);

    // =========================================================
    // DOUBLE BORDER
    // =========================================================

    document
      .rect(9, 9, pageWidth - 18, pageHeight - 18)
      .lineWidth(1)
      .strokeColor(green)
      .stroke();

    document
      .rect(13, 13, pageWidth - 26, pageHeight - 26)
      .lineWidth(0.45)
      .strokeColor("#6BAF94")
      .stroke();

    // =========================================================
    // CORNER DETAILS
    // =========================================================

    line(9, 20, 20, 20, green, 1);
    line(20, 9, 20, 20, green, 1);

    line(pageWidth - 20, 9, pageWidth - 20, 20, green, 1);
    line(pageWidth - 20, 20, pageWidth - 9, 20, green, 1);

    line(9, pageHeight - 20, 20, pageHeight - 20, green, 1);
    line(20, pageHeight - 20, 20, pageHeight - 9, green, 1);

    line(
      pageWidth - 20,
      pageHeight - 20,
      pageWidth - 9,
      pageHeight - 20,
      green,
      1
    );

    line(
      pageWidth - 20,
      pageHeight - 20,
      pageWidth - 20,
      pageHeight - 9,
      green,
      1
    );

    // =========================================================
    // CURVED DECORATIVE MOTIFS
    // =========================================================

    document.save();

    for (let i = 0; i < 13; i++) {
      const offset = i * 5.8;

      document
        .moveTo(9, 87 + offset)
        .bezierCurveTo(
          75,
          95 + offset,
          96,
          231 + offset * 0.55,
          195,
          245 + offset * 0.45
        )
        .lineWidth(0.35)
        .strokeColor("#D9EDE5")
        .stroke();
    }

    for (let i = 0; i < 10; i++) {
      const offset = i * 5.6;

      document
        .moveTo(pageWidth - 9, 252 + offset)
        .bezierCurveTo(
          pageWidth - 78,
          264 + offset,
          pageWidth - 115,
          384 + offset * 0.4,
          pageWidth - 207,
          393 + offset * 0.4
        )
        .lineWidth(0.35)
        .strokeColor("#D9EDE5")
        .stroke();
    }

    document.restore();

    // =========================================================
    // LARGE Z WATERMARK
    // =========================================================

    const logoPath = path.join(process.cwd(), "public", "icon1.png");

    document.save();

    if (fs.existsSync(logoPath)) {
      document.opacity(0.07).image(logoPath, 600, 148, {
        width: 180,
        height: 180,
        fit: [180, 180],
      });
    }

    document.restore();

    // =========================================================
    // BRAND HEADER
    // =========================================================

    const logoX = 56;
    const logoY = 39;
    const logoSize = 41;

    if (fs.existsSync(logoPath)) {
      document.image(logoPath, logoX, logoY, {
        width: logoSize,
        height: logoSize,
        fit: [logoSize, logoSize],
      });
    }

    document
      .font("Helvetica-Bold")
      .fontSize(22)
      .fillColor(ink)
      .text("Zero", 100, 48, {
        continued: true,
        lineBreak: false,
      })
      .fillColor(green)
      .text(" Intern");

    // =========================================================
    // TOP RIGHT MOTTO
    // =========================================================

    document
      .font("Helvetica")
      .fontSize(6.5)
      .fillColor(muted)
      .text("L  E  A  R  N", 725, 42, {
        width: 62,
        align: "left",
      })
      .text("B  U  I  L  D", 725, 55, {
        width: 62,
      })
      .text("G  R  O  W", 725, 68, {
        width: 62,
      })
      .text("B  E  L  O  N  G", 725, 81, {
        width: 75,
      });

    line(725, 98, 752, 98, green, 1.1);

    // =========================================================
    // ORGANIZATION DESCRIPTION
    // =========================================================

    centeredText(
      "P R O F E S S I O N A L   L E A R N I N G   &   C R E D E N T I A L I N G",
      93,
      {
        font: "Helvetica",
        size: 7.1,
        color: muted,
        width: 540,
      }
    );

    // =========================================================
    // CERTIFICATE TITLE
    // =========================================================

    centeredText("CERTIFICATE OF ACHIEVEMENT", 125, {
      font: "Times-Bold",
      size: 27,
      color: ink,
      width: 660,
      characterSpacing: 1.1,
    });

    // =========================================================
    // CERTIFICATION INTRO
    // =========================================================

    centeredText("T H I S   C E R T I F I E S   T H A T", 171, {
      font: "Helvetica",
      size: 7.2,
      color: muted,
      width: 500,
    });

    // =========================================================
    // STUDENT NAME
    // =========================================================

    const studentNameY = 194;

    centeredText(data.studentName, studentNameY, {
      font: "Times-Roman",
      size: 41,
      color: ink,
      width: 620,
    });

    document.font("Times-Roman").fontSize(41);

    const measuredNameWidth = document.widthOfString(data.studentName);

    const nameUnderlineWidth = Math.min(
      180,
      Math.max(112, measuredNameWidth * 0.55)
    );

    const nameUnderlineX = pageWidth / 2 - nameUnderlineWidth / 2;

    line(
      nameUnderlineX,
      247,
      nameUnderlineX + nameUnderlineWidth,
      247,
      green,
      1.4
    );

    // =========================================================
    // PROFESSIONAL WORDING
    // =========================================================

    document
      .font("Times-Roman")
      .fontSize(11.5)
      .fillColor("#243341")
      .text(
        "has successfully completed the professional program and demonstrated",
        175,
        265,
        {
          width: 492,
          align: "center",
        }
      )
      .text(
        "applied competency in designing, developing, and deploying modern full-stack web applications.",
        130,
        282,
        {
          width: 582,
          align: "center",
        }
      );

    // =========================================================
    // TRACK / PROGRAM
    // =========================================================

    const displayTrack =
      data.trackName.trim().toLowerCase() === "full stack javascript"
        ? "Full-Stack JavaScript Development"
        : data.trackName;

    centeredText(displayTrack, 314, {
      font: "Times-Bold",
      size: 23,
      color: darkGreen,
      width: 600,
    });

    // =========================================================
    // PREMIUM ZERO INTERN CREDENTIAL SEAL
    // =========================================================

    const sealPath = path.join(process.cwd(), "public", "certificate-seal.png");
    const sealSize = 86;

    if (fs.existsSync(sealPath)) {
      document.image(sealPath, 43, 309, {
        width: sealSize,
        height: sealSize,
        fit: [sealSize, sealSize],
        align: "center",
        valign: "center",
      });
    }

    // =========================================================
    // LOWER METADATA AREA
    // =========================================================

    const metaY = 424;

    // =========================================================
    // DATE
    // =========================================================

    const issuedDate = new Date(data.issuedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    document
      .font("Times-Roman")
      .fontSize(11)
      .fillColor(ink)
      .text(issuedDate, 74, metaY, {
        width: 145,
        align: "center",
      });

    line(79, metaY + 21, 214, metaY + 21, "#96A0AA", 0.5);

    document
      .font("Helvetica")
      .fontSize(5.7)
      .fillColor(muted)
      .text("D A T E   I S S U E D", 74, metaY + 29, {
        width: 145,
        align: "center",
      });

    // =========================================================
    // SIGNATURE / ISSUER
    // =========================================================

    line(267, metaY - 7, 267, metaY + 42, "#99A6AF", 0.5);
    line(570, metaY - 7, 570, metaY + 42, "#99A6AF", 0.5);

    const signaturePath = path.join(
      process.cwd(),
      "public",
      "signature.png"
    );

    if (fs.existsSync(signaturePath)) {
      document.image(signaturePath, 343, metaY - 13, {
        width: 155,
        height: 38,
        fit: [155, 38],
        align: "center",
        valign: "center",
      });
    } else {
      document
        .font("Times-Italic")
        .fontSize(21)
        .fillColor(ink)
        .text("Zero Intern", 335, metaY - 5, {
          width: 170,
          align: "center",
        });
    }

    line(335, metaY + 22, 506, metaY + 22, "#596573", 0.55);

    document
      .font("Helvetica-Bold")
      .fontSize(6.3)
      .fillColor(ink)
      .text("Z E R O   I N T E R N", 333, metaY + 27, {
        width: 175,
        align: "center",
      });

    document
      .font("Helvetica")
      .fontSize(5.1)
      .fillColor(muted)
      .text(
        "P R O F E S S I O N A L   L E A R N I N G   &   C R E D E N T I A L I N G",
        305,
        metaY + 39,
        {
          width: 230,
          align: "center",
        }
      );

    // =========================================================
    // CREDENTIAL ID
    // =========================================================

    document
      .font("Times-Roman")
      .fontSize(11)
      .fillColor(ink)
      .text(data.credentialId, 570, metaY, {
        width: 112,
        align: "center",
      });

    line(580, metaY + 21, 672, metaY + 21, "#96A0AA", 0.5);

    document
      .font("Helvetica")
      .fontSize(5.7)
      .fillColor(muted)
      .text("C R E D E N T I A L   I D", 570, metaY + 29, {
        width: 112,
        align: "center",
      });

    document.link(570, metaY - 4, 112, 48, verificationUrl);

    // =========================================================
    // CLEAN QR BLOCK
    // =========================================================

    const qrSize = 58;
    const qrX = 720;
    const qrY = 399;

    document
      .roundedRect(qrX - 7, qrY - 7, qrSize + 14, qrSize + 14, 3)
      .fillAndStroke(white, "#E5E7EB");

    document.image(qrCode, qrX, qrY, {
      width: qrSize,
      height: qrSize,
    });

    if (fs.existsSync(logoPath)) {
      const qrLogoSize = 15;
      const qrLogoX = qrX + (qrSize - qrLogoSize) / 2;
      const qrLogoY = qrY + (qrSize - qrLogoSize) / 2;

      document
        .roundedRect(qrLogoX - 2, qrLogoY - 2, qrLogoSize + 4, qrLogoSize + 4, 2)
        .fill(white);
      document.image(logoPath, qrLogoX, qrLogoY, {
        width: qrLogoSize,
        height: qrLogoSize,
        fit: [qrLogoSize, qrLogoSize],
      });
    }

    document.link(
      qrX - 7,
      qrY - 7,
      qrSize + 14,
      qrSize + 14,
      verificationUrl
    );

    document
      .font("Helvetica-Bold")
      .fontSize(5.8)
      .fillColor(ink)
      .text("SCAN TO VERIFY", qrX - 8, qrY + qrSize + 12, {
        width: qrSize + 16,
        align: "center",
        characterSpacing: 0.4,
      });

    document
      .font("Helvetica")
      .fontSize(4.9)
      .fillColor(muted)
      .text("Credential authenticity", qrX - 14, qrY + qrSize + 23, {
        width: qrSize + 28,
        align: "center",
      });

    // =========================================================
    // DIGITAL VERIFICATION BADGE
    // =========================================================

    document.save();

    document
      .moveTo(42, 507)
      .lineTo(54, 502)
      .lineTo(66, 507)
      .lineTo(64, 523)
      .quadraticCurveTo(54, 534, 44, 523)
      .closePath()
      .fill(green);

    document
      .moveTo(49, 516)
      .lineTo(53, 520)
      .lineTo(60, 512)
      .lineWidth(1.4)
      .strokeColor(white)
      .stroke();

    document.restore();

    document
      .font("Helvetica-Bold")
      .fontSize(6.5)
      .fillColor(ink)
      .text("D I G I T A L L Y   V E R I F I E D", 76, 507);

    document
      .font("Helvetica")
      .fontSize(4.8)
      .fillColor(muted)
      .text(
        "C R Y P T O G R A P H I C A L L Y   S E C U R E D",
        76,
        521
      );

    // =========================================================
    // SHA-256
    // =========================================================

    const displayHash = `SHA-256: ${data.cryptoHash.slice(
      0,
      18
    )}...${data.cryptoHash.slice(-14)}`;

    line(589, 518, 607, 518, green, 0.9);

    document
      .font("Courier")
      .fontSize(5.8)
      .fillColor(muted)
      .text(displayHash, 614, 514, {
        width: 190,
        align: "left",
      });

    // =========================================================
    // BOTTOM MOTTO
    // =========================================================

    line(10, 558, 330, 558, "#72B39B", 0.55);
    line(512, 558, pageWidth - 10, 558, "#72B39B", 0.55);

    document
      .font("Helvetica")
      .fontSize(5.5)
      .fillColor(muted)
      .text("A   M O R E   C A P A B L E   Y O U", 330, 554, {
        width: 182,
        align: "center",
        characterSpacing: 0.7,
      });

    document.end();
  });
}