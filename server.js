import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint pentru formularul de contact
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // false dacă folosești port 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Site Contact" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // aici primești tu emailul
      subject: `Mesaj de la ${name}`,
      html: `
        <p><strong>Nume:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mesaj:</strong><br>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Mesaj de contact trimis:", email);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Eroare la trimiterea mesajului:", error);
    res.status(500).json({ error: "Nu s-a putut trimite mesajul" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server rulează pe http://localhost:${PORT}`));
