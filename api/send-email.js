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

    const shipping = 25; // cost transport fix
    const grandTotal = total + shipping;

    const orderItemsHtml = items
      .map(
        (i) => `
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:10px; display:flex; align-items:center;">
            <img src="${i.image_url}" width="50" style="border-radius:6px; margin-right:10px;" />
            <div>
              <div style="font-weight:600; color:#333;">${i.name}</div>
              <div style="font-size:13px; color:#555;">Cantitate: ${i.quantity}</div>
              <div style="font-size:13px; color:#555;">Preț unitar: ${i.price.toFixed(2)} RON</div>
            </div>
          </td>
          <td style="padding:10px; text-align:right; font-weight:600; color:#333;">
            ${(i.price * i.quantity).toFixed(2)} RON
          </td>
        </tr>
      `
      )
      .join("");

    const htmlContent = `
      <div style="font-family:sans-serif; background:#f9f9f9; padding:25px;">
        <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; border:1px solid #e2e8f0; overflow:hidden;">
          <div style="background:#D97706; color:#fff; padding:20px; text-align:center;">
            <h1 style="margin:0;">Oriental Essence</h1>
            <p style="margin:5px 0 0 0; font-size:16px;">Comanda ta #${orderNumber}</p>
          </div>
          <div style="padding:20px; color:#333;">
            <h2 style="color:#D97706; margin-bottom:10px;">🎉 Mulțumim, ${name}!</h2>
            <p>Ne bucurăm că ai ales Oriental Essence pentru a-ți răsfăța simțurile olfactive. 🌸</p>

            <h3>Detalii comandă:</h3>
            <p><strong>Număr comandă:</strong> ${orderNumber}</p>
            <p><strong>Adresă livrare:</strong> ${address}</p>
            <p><strong>Telefon:</strong> ${phone}</p>

            <h3 style="margin-top:20px;">Produse comandate:</h3>
            <table style="width:100%; border-collapse:collapse;">
              ${orderItemsHtml}
              <tr>
                <td style="padding:10px; font-weight:600; color:#333;">Cost livrare:</td>
                <td style="padding:10px; text-align:right; font-weight:600; color:#333;">${shipping.toFixed(2)} RON</td>
              </tr>
              <tr style="background:#f4f4f4;">
                <td style="padding:10px; font-weight:700; color:#D97706;">Total de plată:</td>
                <td style="padding:10px; text-align:right; font-weight:700; color:#D97706;">${grandTotal.toFixed(2)} RON</td>
              </tr>
            </table>

            <p><strong>Observații:</strong> ${notes || "—"}</p>

            <div style="text-align:center; margin:25px 0;">
              <a href="https://www.oriental-essence.ro/comenzi/${orderNumber}" 
                 style="background:#D97706; color:#fff; padding:12px 25px; border-radius:6px; text-decoration:none; font-weight:600; display:inline-block;">
                 Vezi comanda
              </a>
            </div>

            <p style="text-align:center; font-size:14px; color:#777;">
              Ne bucurăm să te avem ca client!<br/>
              Echipa Oriental Essence
            </p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Oriental Essence" <${process.env.SMTP_USER}>`,
      to: [email, process.env.ADMIN_EMAIL],
      subject: `Comanda ta #${orderNumber} de la Oriental Essence`,
      html: htmlContent,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Eroare la trimiterea emailului:", error);
    res.status(500).json({ error: "Eroare la trimiterea emailului" });
  }
}
