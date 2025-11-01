import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCart, clearCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(getCart());
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    const currentCart = getCart();
    if (currentCart.items.length === 0) {
      navigate("/cart");
    }
    setCart(currentCart);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const { data, error } = await supabase
        .from("orders")
        .insert([{
          order_number: orderNumber,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          address: formData.address,
          items: cart.items as any,
          total: cart.total,
          notes: formData.notes || null,
          status: "în procesare",
        }])
        .select()
        .single();

      if (error) throw error;

      // Send email via Formspree
      const formspreeId = "xeopkqea";
      const itemsList = cart.items.map(item => `${item.name} x ${item.quantity} - ${(item.price * item.quantity).toFixed(2)} RON`).join('\n');
      
      await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: `Comandă nouă #${orderNumber} - Oriental Essence`,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          items: itemsList,
          total: `${cart.total.toFixed(2)} RON`,
          notes: formData.notes || 'Fără notițe',
        }),
      });

      clearCart();
      window.dispatchEvent(new Event('cartUpdated'));
      navigate(`/order-confirmation/${orderNumber}`);
      toast.success("Comandă plasată cu succes!");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("A apărut o eroare. Te rugăm să încerci din nou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="py-12 flex-1">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">Finalizează Comanda</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-6">
                <div>
                  <Label htmlFor="name">Nume Complet *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ion Popescu"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ion.popescu@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0712345678"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Adresă Completă *</Label>
                  <Textarea
                    id="address"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Strada, Număr, Bloc, Scară, Apartament, Oraș, Județ, Cod Poștal"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notițe pentru comandă (opțional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Instrucțiuni speciale pentru livrare..."
                    rows={3}
                  />
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Plată Ramburs</h3>
                  <p className="text-sm text-muted-foreground">
                    Plata se va face la livrare, în numerar sau cu cardul, direct curierului.
                  </p>
                </div>

                <Button type="submit" size="lg" className="w-full btn-gold" disabled={loading}>
                  {loading ? "Se procesează..." : "Plasează Comanda"}
                </Button>
              </form>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                <h2 className="text-2xl font-bold mb-6">Produse Comandate</h2>
                <div className="space-y-4 mb-6">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x {item.price} RON
                        </p>
                      </div>
                      <p className="font-semibold">{(item.price * item.quantity).toFixed(2)} RON</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-lg mb-2">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary">{cart.total.toFixed(2)} RON</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Livrare GRATUITĂ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Checkout;
