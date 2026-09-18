require("dotenv").config();

const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.url}`);
  // No cache in dev
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.set('Pragma', 'no-cache');
  next();
});

// Static files
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

// Uploaded files
const uploadDir = path.resolve(process.env.UPLOAD_DIR || "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));

// ---------------------------------------------------------------------------
// Nodemailer Transport
// ---------------------------------------------------------------------------

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP connection at startup
transporter.verify()
  .then(() => {
    console.log("✓ SMTP-anslutning verifierad – e-post fungerar.");
  })
  .catch((err) => {
    console.error("✗ SMTP-fel – e-post kommer INTE att fungera:");
    console.error("  ", err.message);
    console.error("  Kontrollera SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS i .env");
  });

// ---------------------------------------------------------------------------
// Multer – File Uploads
// ---------------------------------------------------------------------------

const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpe?g|png|gif|webp)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error("Endast bildfiler tillåtna (jpg, jpeg, png, gif, webp)."));
    }
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Send email. Returns a promise.
 * On failure, logs the error and throws so the caller can handle it.
 */
async function sendMail({ to, subject, text, html }) {
  const recipient = to || process.env.NOTIFY_EMAIL;
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: recipient,
      subject,
      text,
      html,
    });
    console.log(`✓ E-post skickad till ${recipient}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`✗ E-post misslyckades till ${recipient}:`, err.message);
    throw err;
  }
}

const COMPANY = {
  name: process.env.COMPANY_NAME || "Dynamit Bygg AB",
  phone: process.env.COMPANY_PHONE || "",
  email: process.env.COMPANY_EMAIL || "",
  address: process.env.COMPANY_ADDRESS || "",
  orgNr: process.env.COMPANY_ORG_NR || "",
  area: process.env.COMPANY_AREA || "",
};

// ---------------------------------------------------------------------------
// POST /api/contact
// ---------------------------------------------------------------------------

app.post("/api/contact", async (req, res) => {
  const { namn, epost, telefon, meddelande } = req.body;

  if (!namn || !epost || !meddelande) {
    return res.status(400).json({
      success: false,
      error: "Fälten namn, e-post och meddelande krävs.",
    });
  }

  const subject = `Ny kontaktmeddelande från ${namn}`;

  const text = [
    `Namn: ${namn}`,
    `E-post: ${epost}`,
    `Telefon: ${telefon || "Ej angivet"}`,
    "",
    "Meddelande:",
    meddelande,
  ].join("\n");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#1e2d3d;border-bottom:2px solid #c8913a;padding-bottom:8px;">Ny kontaktmeddelande</h2>
      <table style="border-collapse:collapse;width:100%;margin:16px 0;">
        <tr><td style="padding:8px 12px;font-weight:600;color:#1a1a2e;">Namn</td><td style="padding:8px 12px;">${escapeHtml(namn)}</td></tr>
        <tr><td style="padding:8px 12px;font-weight:600;color:#1a1a2e;">E-post</td><td style="padding:8px 12px;">${escapeHtml(epost)}</td></tr>
        <tr><td style="padding:8px 12px;font-weight:600;color:#1a1a2e;">Telefon</td><td style="padding:8px 12px;">${escapeHtml(telefon) || "Ej angivet"}</td></tr>
      </table>
      <h3 style="color:#1e2d3d;">Meddelande</h3>
      <div style="background:#f7f8fa;padding:16px;border-radius:8px;border-left:3px solid #c8913a;">
        ${escapeHtml(meddelande).replace(/\n/g, "<br/>")}
      </div>
    </div>
  `;

  try {
    await sendMail({ subject, text, html });
    res.json({ success: true, message: "Kontakten mottogs." });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Kunde inte skicka e-post. Försök igen senare eller kontakta oss direkt.",
    });
  }
});

// ---------------------------------------------------------------------------
// POST /api/quote
// ---------------------------------------------------------------------------

app.post("/api/quote", async (req, res) => {
  const {
    namn, epost, telefon, tjanst, underkategori, ort, adress,
    beskrivning, onskatDatum, bilder,
  } = req.body;

  if (!namn || !epost || !beskrivning) {
    return res.status(400).json({
      success: false,
      error: "Fälten namn, e-post och beskrivning krävs.",
    });
  }

  const subject = `Ny offertförfrågan från ${namn}`;

  const text = [
    `Ny offertförfrågan`,
    ``,
    `Kund: ${namn}`,
    `E-post: ${epost}`,
    `Telefon: ${telefon || "Ej angivet"}`,
    ``,
    `Tjänst: ${tjanst || "Ej angivet"}`,
    underkategori ? `Underkategori: ${underkategori}` : '',
    `Ort: ${ort || "Ej angivet"}`,
    `Adress: ${adress || "Ej angivet"}`,
    `Önskat datum: ${onskatDatum || "Ej angivet"}`,
    ``,
    `Beskrivning:`,
    beskrivning,
    ``,
    bilder && bilder.length > 0
      ? `Bilder: ${Array.isArray(bilder) ? bilder.length : 1} bild(er) bifogade`
      : "",
  ].filter(Boolean).join("\n");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#1e2d3d;border-bottom:2px solid #c8913a;padding-bottom:8px;">Ny offertförfrågan</h2>
      <table style="border-collapse:collapse;width:100%;margin:16px 0;">
        <tr><td style="padding:8px 12px;font-weight:600;color:#1a1a2e;">Kund</td><td style="padding:8px 12px;">${escapeHtml(namn)}</td></tr>
        <tr><td style="padding:8px 12px;font-weight:600;color:#1a1a2e;">E-post</td><td style="padding:8px 12px;">${escapeHtml(epost)}</td></tr>
        <tr><td style="padding:8px 12px;font-weight:600;color:#1a1a2e;">Telefon</td><td style="padding:8px 12px;">${escapeHtml(telefon) || "Ej angivet"}</td></tr>
        <tr><td style="padding:8px 12px;font-weight:600;color:#1a1a2e;">Tjänst</td><td style="padding:8px 12px;">${escapeHtml(tjanst) || "Ej angivet"}</td></tr>
        ${underkategori ? `<tr><td style="padding:8px 12px;font-weight:600;color:#1a1a2e;">Underkategori</td><td style="padding:8px 12px;">${escapeHtml(underkategori)}</td></tr>` : ''}
        <tr><td style="padding:8px 12px;font-weight:600;color:#1a1a2e;">Ort</td><td style="padding:8px 12px;">${escapeHtml(ort) || "Ej angivet"}</td></tr>
        <tr><td style="padding:8px 12px;font-weight:600;color:#1a1a2e;">Adress</td><td style="padding:8px 12px;">${escapeHtml(adress) || "Ej angivet"}</td></tr>
        <tr><td style="padding:8px 12px;font-weight:600;color:#1a1a2e;">Önskat datum</td><td style="padding:8px 12px;">${escapeHtml(onskatDatum) || "Ej angivet"}</td></tr>
      </table>
      <h3 style="color:#1e2d3d;">Beskrivning</h3>
      <div style="background:#f7f8fa;padding:16px;border-radius:8px;border-left:3px solid #c8913a;margin-bottom:16px;">
        ${escapeHtml(beskrivning).replace(/\n/g, "<br/>")}
      </div>
      ${bilder && bilder.length > 0 ? `<p style="color:#5a6070;"><strong>Bilder:</strong> ${Array.isArray(bilder) ? bilder.length : 1} bild(er) bifogade</p>` : ""}
      <hr style="border:none;border-top:1px solid #e2e5ea;margin:24px 0;"/>
      <p style="color:#8a90a0;font-size:0.85rem;">Logga in på adminpanelen för att svara på denna förfrågan.</p>
    </div>
  `;

  // 1) Send notification to company
  try {
    await sendMail({ subject, text, html });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Kunde inte skicka förfrågan. Försök igen senare.",
    });
  }

  // 2) Send confirmation to customer
  const confirmSubject = `Vi har mottagit din offertförfrågan – ${COMPANY.name}`;
  const confirmText = [
    `Hej ${namn},`,
    ``,
    `Tack för din offertförfrågan till ${COMPANY.name}.`,
    ``,
    `Vi har mottagit din förfrågan om ${tjanst || "arbete"}${underkategori ? ` – ${underkategori}` : ''} och återkommer`,
    `så snart vi har granskat beskrivningen.`,
    ``,
    `Med vänlig hälsning,`,
    `${COMPANY.name}`,
    `${COMPANY.phone}`,
  ].join("\n");

  const confirmHtml = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#1e2d3d;">Tack för din förfrågan!</h2>
      <p style="color:#5a6070;line-height:1.7;">
        Hej <strong>${escapeHtml(namn)}</strong>,
      </p>
      <p style="color:#5a6070;line-height:1.7;">
        Vi har mottagit din offertförfrågan om <strong>${escapeHtml(tjanst || "arbete")}</strong>
        och återkommer så snart vi har granskat beskrivningen.
      </p>
      <div style="background:#f7f8fa;padding:16px;border-radius:8px;border-left:3px solid #c8913a;margin:20px 0;">
        <p style="margin:0;color:#1a1a2e;font-weight:600;">Din förfrågan:</p>
        <p style="margin:8px 0 0;color:#5a6070;">${escapeHtml(tjanst || "Ej angivet")}${underkategori ? ` – ${escapeHtml(underkategori)}` : ''} – ${escapeHtml(ort || "")}</p>
      </div>
      <p style="color:#5a6070;line-height:1.7;">
        Med vänlig hälsning,<br/>
        <strong>${escapeHtml(COMPANY.name)}</strong><br/>
        ${escapeHtml(COMPANY.phone)}
      </p>
    </div>
  `;

  try {
    await sendMail({ to: epost, subject: confirmSubject, text: confirmText, html: confirmHtml });
  } catch (err) {
    // Customer email failing is not critical — log but don't block
    console.error("Kundbekräffelse kunde inte skickas:", err.message);
  }

  res.json({ success: true, message: "Offertförfrågan mottogs." });
});

// ---------------------------------------------------------------------------
// POST /api/upload
// ---------------------------------------------------------------------------

app.post("/api/upload", (req, res) => {
  upload.array("bilder", 10)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, error: `Uppladdningsfel: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: "Inga filer skickades." });
    }

    const files = req.files.map((f) => ({
      filename: f.filename,
      originalname: f.originalname,
      size: f.size,
      url: `/uploads/${f.filename}`,
    }));

    res.json({ success: true, message: `${files.length} fil(er) uppladdade.`, files });
  });
});

// ---------------------------------------------------------------------------
// Fallback
// ---------------------------------------------------------------------------

app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// ---------------------------------------------------------------------------
// Error Handler
// ---------------------------------------------------------------------------

app.use((err, _req, res, _next) => {
  console.error("Server error:", err);
  res.status(500).json({ success: false, error: "Internt serverfel." });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(PORT, HOST, () => {
  console.log(`\n  ${COMPANY.name}`);
  console.log(`  Server: http://${HOST}:${PORT}`);
  console.log(`  SMTP:   ${process.env.SMTP_HOST || "ej konfigurerat"}\n`);
});
