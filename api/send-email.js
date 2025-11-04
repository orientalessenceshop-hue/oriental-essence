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

    const orderItemsHtml = items
      .map(
        (i) => `
        <tr>
          <td style="padding:5px 0;">
            <img src="${i.image_url}" width="50" style="vertical-align:middle; margin-right:10px;" />
            ${i.name} x${i.quantity}
          </td>
          <td style="padding:5px 0; text-align:right;">${(i.price * i.quantity).toFixed(2)} RON</td>
        </tr>
      `
      )
      .join("");

    const htmlContent = `
      <div style="font-family:sans-serif; background:#f9f9f9; padding:30px;">
        <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; border:1px solid #e2e8f0;">
          <div style="background:#D97706; color:#fff; padding:20px; text-align:center;">
            <h1>Oriental Essence</h1>
            <p style="margin:0;">Comanda ta #${orderNumber}</p>
          </div>
          <div style="padding:20px; color:#333;">
            <h2 style="color:#D97706;">🎉 Mulțumim pentru comanda ta, ${name}!</h2>
            <p>Suntem încântați că ai ales Oriental Essence pentru a-ți răsfăța simțurile olfactive.</p>
            
            <h3>Detalii comandă:</h3>
            <p><strong>Număr comandă:</strong> ${orderNumber}</p>
            <p><strong>Adresă livrare:</strong> ${address}</p>
            <p><strong>Telefon:</strong> ${phone}</p>

            <h3 style="margin-top:20px;">Produse comandate:</h3>
            <table style="width:100%; border-collapse:collapse;">
              ${orderItemsHtml}
              <tr>
                <td style="padding-top:10px; border-top:1px solid #ccc;"><strong>Total:</strong></td>
                <td style="padding-top:10px; border-top:1px solid #ccc; text-align:right;"><strong>${total.toFixed(2)} RON</strong></td>
              </tr>
            </table>

            <p><strong>Observații:</strong> ${notes || "—"}</p>

            <div style="text-align:center; margin-top:30px;">
              <a href="https://www.oriental-essence.ro/comenzi/${orderNumber}" 
                 style="background:#D97706; color:#fff; padding:12px 25px; border-radius:6px; text-decoration:none; display:inline-block;">
                 Vezi comanda
              </a>
            </div>

            <p style="margin-top:30px;">Ne bucurăm să te avem ca client! 🌸<br/>Echipa Oriental Essence</p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Oriental Essence" <${process.env.SMTP_USER}>`,
      to: [email, process.env.ADMIN_EMAIL], // trimite și către admin
      subject: `Comanda ta #${orderNumber} de la Oriental Essence`,
      html: htmlContent,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Eroare la trimiterea emailului:", error);
    res.status(500).json({ error: "Eroare la trimiterea emailului" });
  }
}
