import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formspreeId = "PUT_YOUR_FORMSPREE_ID_HERE";
      
      await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: `Mesaj contact de la ${formData.name}`,
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      toast.success("Mesaj trimis cu succes! Te vom contacta în curând.");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      toast.error("A apărut o eroare. Te rugăm să încerci din nou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="py-12 bg-gradient-to-br from-secondary/20 to-accent/20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-center mb-4">Contact</h1>
          <p className="text-xl text-center text-muted-foreground">
            Suntem aici pentru tine. Scrie-ne orice întrebare!
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold mb-6">Trimite-ne un mesaj</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Nume</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Numele tău"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="adresa@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Mesaj</Label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Scrie mesajul tău aici..."
                    rows={6}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full btn-gold" disabled={loading}>
                  {loading ? "Se trimite..." : "Trimite Mesajul"}
                </Button>
              </form>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6">Informații Contact</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-muted-foreground">orientalessence.shop@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Program</h3>
                      <p className="text-muted-foreground">
                        Luni - Vineri: 10:00 - 18:00<br />
                        Sâmbătă: 10:00 - 14:00<br />
                        Duminică: Închis
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Timp de răspuns</h3>
                <p className="text-muted-foreground">
                  De obicei răspundem în maxim 24 de ore în zilele lucrătoare. 
                  Pentru urgențe, te rugăm să ne contactezi telefonic.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
