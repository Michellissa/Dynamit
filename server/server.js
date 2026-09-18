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

app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.url}`);
  next();
});

// Serve static files from /public (one level up from /server)
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

// Serve uploaded files
const uploadDir = path.resolve(process.env.UPLOAD_DIR || "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));

// ---------------------------------------------------------------------------
// Nodemailer transport
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

// ---------------------------------------------------------------------------
// Multer – file uploads
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

function sendMail({ subject, text, html }) {
  return transporter
    .sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: process.env.NOTIFY_EMAIL,
      subject,
      text,
      html,
    })
    .catch((err) => {
      console.error("E-post kunde inte skickas:", err.message);
    });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Routes – Contact
// ---------------------------------------------------------------------------

app.post("/api/contact", (req, res) => {
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
    <h2>Ny kontaktmeddelande</h2>
    <table style="border-collapse:collapse;">
      <tr><td style="padding:4px 12px 4px 0;"><strong>Namn</strong></td><td>${escapeHtml(namn)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;"><strong>E-post</strong></td><td>${escapeHtml(epost)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;"><strong>Telefon</strong></td><td>${escapeHtml(telefon) || "Ej angivet"}</td></tr>
    </table>
    <h3>Meddelande</h3>
    <p>${escapeHtml(meddelande).replace(/\n/g, "<br/>")}</p>
  `;

  sendMail({ subject, text, html }).then(() => {
    res.json({ success: true, message: "Kontakten mottogs." });
  });
});

// ---------------------------------------------------------------------------
// Routes – Quote request
// ---------------------------------------------------------------------------

app.post("/api/quote", (req, res) => {
  const {
    namn,
    epost,
    telefon,
    tjanst,
    ort,
    adress,
    beskrivning,
    onskatDatum,
    bilder,
  } = req.body;

  if (!namn || !epost || !beskrivning) {
    return res.status(400).json({
      success: false,
      error: "Fälten namn, e-post och beskrivning krävs.",
    });
  }

  const subject = `Ny offertförfrågan från ${namn}`;
  const text = [
    `Namn: ${namn}`,
    `E-post: ${epost}`,
    `Telefon: ${telefon || "Ej angivet"}`,
    "",
    `Tjänst: ${tjanst || "Ej angivet"}`,
    `Ort: ${ort || "Ej angivet"}`,
    `Adress: ${adress || "Ej angivet"}`,
    `Önskat datum: ${onskatDatum || "Ej angivet"}`,
    "",
    "Beskrivning:",
    beskrivning,
    "",
    bilder && bilder.length > 0
      ? `Bilder: ${Array.isArray(bilder) ? bilder.length : 1} bild(er) bifogade`
      : "Inga bilder bifogade",
  ].join("\n");

  const html = `
    <h2>Ny offertförfrågan</h2>
    <table style="border-collapse:collapse;">
      <tr><td style="padding:4px 12px 4px 0;"><strong>Namn</strong></td><td>${escapeHtml(namn)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;"><strong>E-post</strong></td><td>${escapeHtml(epost)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;"><strong>Telefon</strong></td><td>${escapeHtml(telefon) || "Ej angivet"}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;"><strong>Tjänst</strong></td><td>${escapeHtml(tjanst) || "Ej angivet"}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;"><strong>Ort</strong></td><td>${escapeHtml(ort) || "Ej angivet"}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;"><strong>Adress</strong></td><td>${escapeHtml(adress) || "Ej angivet"}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;"><strong>Önskat datum</strong></td><td>${escapeHtml(onskatDatum) || "Ej angivet"}</td></tr>
    </table>
    <h3>Beskrivning</h3>
    <p>${escapeHtml(beskrivning).replace(/\n/g, "<br/>")}</p>
    ${bilder && bilder.length > 0 ? `<p><strong>Bilder:</strong> ${Array.isArray(bilder) ? bilder.length : 1} bild(er) bifogade</p>` : ""}
  `;

  sendMail({ subject, text, html }).then(() => {
    res.json({ success: true, message: "Offertförfrågan mottogs." });
  });
});

// ---------------------------------------------------------------------------
// Routes – File upload
// ---------------------------------------------------------------------------

app.post("/api/upload", (req, res) => {
  upload.array("bilder", 10)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ success: false, error: `Uppladdningsfel: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Inga filer skickades." });
    }

    const files = req.files.map((f) => ({
      filename: f.filename,
      originalname: f.originalname,
      size: f.size,
      url: `/uploads/${f.filename}`,
    }));

    res.json({
      success: true,
      message: `${files.length} fil(er) uppladdade.`,
      files,
    });
  });
});

// ---------------------------------------------------------------------------
// Fallback – serve index.html for unknown routes
// ---------------------------------------------------------------------------

app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// ---------------------------------------------------------------------------
// Error handler
// ---------------------------------------------------------------------------

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, error: "Internt serverfel." });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(PORT, HOST, () => {
  console.log(`\n  Dynamit Bygg – Servern körs på http://${HOST}:${PORT}\n`);
});
