import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors()); // permite cereri CORS de la frontend
app.use(express.json());

// endpoint pentru trimiterea emailului
app.post("/api/send-email", async (req, res) => {
  try {
    const { name, email, phone, address, items, total, notes, orderNumber } = req.body;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // HTML-ul pentru lista de produse cu imagini
    const orderItemsHtml = items.map(item => `
      <tr>
        <td style="padding:5px 0;"><img src="${item.image_url}" alt="${item.name}" width="60" style="border-radius:5px"/></td>
        <td style="padding:5px 10px;">${item.name}</td>
        <td style="padding:5px 10px;">${item.quantity}</td>
        <td style="padding:5px 10px;">${(item.price * item.quantity).toFixed(2)} RON</td>
      </tr>
    `).join("");

    const mailOptions = {
      from: `"Oriental Essence" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Mulțumim pentru comanda ta #${orderNumber}! 🎉`,
      html: `
        <div style="font-family:Arial,sans-serif; color:#333;">
          <h2 style="color:#C49B66;">Salut ${name},</h2>
          <p>Am primit comanda ta și suntem foarte încântați să ți-o pregătim! 🛍️</p>
          <p><strong>Număr comandă:</strong> ${orderNumber}</p>
          <p><strong>Adresă de livrare:</strong> ${address}</p>
          <p><strong>Telefon:</strong> ${phone}</p>
          <table style="width:100%; border-collapse:collapse; margin-top:10px;">
            <thead>
              <tr style="border-bottom:1px solid #ddd;">
                <th>Imagine</th>
                <th>Produs</th>
                <th>Cantitate</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHtml}
            </tbody>
          </table>
          <p style="margin-top:10px;"><strong>Total comandă:</strong> ${total.toFixed(2)} RON</p>
          <p><strong>Observații:</strong> ${notes || "—"}</p>
          <hr style="margin:20px 0; border:none; border-top:1px solid #eee;" />
          <p>Îți mulțumim că ai ales Oriental Essence! 💛</p>
          <p>Echipa Oriental Essence</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email trimis către client:", email);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Eroare la trimiterea emailului:", error);
    res.status(500).json({ error: "Eroare la trimiterea emailului" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server email rulează pe http://localhost:${PORT}`));
