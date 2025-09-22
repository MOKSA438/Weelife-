import express from "express";
import multer from "multer";
import nodemailer from "nodemailer";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());

// Ensure uploads folder exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/upload", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const attachments = req.files.map((file) => ({
      filename: file.originalname,
      path: file.path,
    }));

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.TARGET_EMAIL || "53785inc@gmail.com",
      subject: "New file upload from Weelife_Security website",
      text: "Ada file baru yang diupload melalui website Weelife_Security.",
      attachments,
    });

    // Hapus file sementara setelah terkirim
    req.files.forEach((file) => {
      try { fs.unlinkSync(file.path); } catch(e){ console.error(e); }
    });

    res.json({ success: true, message: "Email berhasil dikirim dengan lampiran!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal mengirim email." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend jalan di http://localhost:${PORT}`);
});
