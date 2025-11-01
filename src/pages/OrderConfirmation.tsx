import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, Package } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const OrderConfirmation = () => {
  const { orderNumber } = useParams();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="py-20 flex-1">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="h-24 w-24 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Mulțumim pentru comandă!</h1>
            <div className="bg-muted/30 rounded-lg p-6 mb-8">
              <p className="text-muted-foreground mb-2">Numărul comenzii tale:</p>
              <p className="text-2xl font-bold text-primary">#{orderNumber}</p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-8 mb-8 text-left">
              <div className="flex items-start gap-4 mb-6">
                <Package className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Ce urmează?</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>✓ Ai primit un email de confirmare cu detaliile comenzii</li>
                    <li>✓ Te vom contacta telefonic pentru confirmarea livrării</li>
                    <li>✓ Comanda va fi livrată în 24-48 ore</li>
                    <li>✓ Plata se face ramburs, la livrare</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-primary/10 rounded-lg p-4">
                <p className="text-sm">
                  <strong>Notă importantă:</strong> Pentru orice întrebări legate de comandă, 
                  te rugăm să ne contactezi la <strong>orientalessence.shop@gmail.com</strong> 
                  menționând numărul comenzii tale.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button size="lg" className="btn-gold">
                  <Home className="mr-2 h-5 w-5" />
                  Înapoi Acasă
                </Button>
              </Link>
              <Link to="/catalog">
                <Button size="lg" variant="outline">
                  Continuă Cumpărăturile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
