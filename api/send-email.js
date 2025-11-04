import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, phone, address, items, total, notes, orderNumber } = req.body;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const orderItems = items
      .map(
        (i) =>
          `<div style="margin-bottom:10px;">
            <img src="${i.image_url}" width="50" style="vertical-align:middle;margin-right:10px;" />
            <span>${i.name} x${i.quantity} - ${(i.price * i.quantity).toFixed(2)} RON</span>
          </div>`
      )
      .join("");

    // === 📦 Trimite email către client ===
    await transporter.sendMail({
      from: `"Oriental Essence" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Comanda ta #${orderNumber}`,
      html: `
        <h2>Mulțumim pentru comanda ta, ${name}!</h2>
        <p><strong>Număr comandă:</strong> ${orderNumber}</p>
        <p><strong>Adresă:</strong> ${address}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <h3>Produse comandate:</h3>
        ${orderItems}
        <p><strong>Total:</strong> ${total.toFixed(2)} RON</p>
        <p><strong>Observații:</strong> ${notes || "—"}</p>
        <br>
        <p>Echipa Oriental Essence</p>
      `,
    });

    // === 💌 Trimite o copie către tine (adminul magazinului) ===
    await transporter.sendMail({
      from: `"Oriental Essence - Comenzi" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL, // adresa ta unde vrei să primești comenzile
      subject: `📦 Comandă nouă #${orderNumber} de la ${name}`,
      html: `
        <h2>Comandă nouă primită!</h2>
        <p><strong>Nume client:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <p><strong>Adresă:</strong> ${address}</p>
        <p><strong>Număr comandă:</strong> ${orderNumber}</p>
        <h3>Produse comandate:</h3>
        ${orderItems}
        <p><strong>Total:</strong> ${total.toFixed(2)} RON</p>
        <p><strong>Observații client:</strong> ${notes || "—"}</p>
        <hr />
        <p>📩 Email primit automat de la website-ul Oriental Essence</p>
        <p><i>${new Date().toLocaleString("ro-RO")}</i></p>
      `,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Eroare la trimiterea emailului:", error);
    res.status(500).json({ error: "Eroare la trimiterea emailului" });
  }
}
