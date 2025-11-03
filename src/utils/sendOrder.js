// src/utils/sendOrder.ts
export const sendOrder = async (formData: any, items: any[], orderNumber: string) => {
  try {
    await fetch("http://localhost:5000/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderNumber,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        items, // lista produselor cu imagini
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        notes: formData.notes || "Fără notițe",
      }),
    });
  } catch (error) {
    console.error("Eroare la trimiterea emailului:", error);
    throw error;
  }
};
