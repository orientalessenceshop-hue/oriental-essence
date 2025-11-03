import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { orderNumber, name, email, phone, address, items, total, notes } = req.body;

    // Configurare transporter SMTP Gmail
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true doar dacă folosești port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Formatăm produsele
    const itemsList = items
      .map((item) => `${item.name} x ${item.quantity} - ${(item.price * item.quantity).toFixed(2)} RON`)
      .join("<br>");

    // Email către client
    const clientMailOptions = {
      from: `"Oriental Essence" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Confirmare comandă #${orderNumber}`,
      html: `
        <h2>Mulțumim pentru comandă, ${name}!</h2>
        <p>Comanda ta a fost primită și este în procesare.</p>
        <h3>Detalii comandă:</h3>
        <p><b>Număr comandă:</b> ${orderNumber}</p>
        <p><b>Adresă livrare:</b> ${address}</p>
        <p><b>Produse:</b><br>${itemsList}</p>
        <p><b>Total:</b> ${total.toFixed(2)} RON</p>
        <p><b>Notițe:</b> ${notes || "Fără notițe"}</p>
        <br>
        <p>Echipa Oriental Essence 🌸</p>
      `,
    };

    // Email intern către tine
    const adminMailOptions = {
      from: `"Oriental Essence" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: `Comandă nouă #${orderNumber} - ${name}`,
      html: `
        <h2>Comandă nouă primită</h2>
        <p><b>Nume:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Telefon:</b> ${phone}</p>
        <p><b>Adresă:</b> ${address}</p>
        <p><b>Produse:</b><br>${itemsList}</p>
        <p><b>Total:</b> ${total.toFixed(2)} RON</p>
        <p><b>Notițe:</b> ${notes || "Fără notițe"}</p>
      `,
    };

    await transporter.sendMail(clientMailOptions);
    await transporter.sendMail(adminMailOptions);

    return res.status(200).json({ success: true, message: "Email trimis cu succes!" });
  } catch (err) {
    console.error("Eroare la trimiterea emailului:", err);
    return res.status(500).json({ error: "Eroare la trimiterea emailului", details: err.message });
  }
}
