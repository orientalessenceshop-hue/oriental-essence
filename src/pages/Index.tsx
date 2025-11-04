import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Award, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Recenzii simulate
  const simulatedReviews: { [key: string]: { count: number; rating: number } } = {
    "03b05485-1428-4a9b-9fcb-a58e60774bd3": { count: 17, rating: 4.8 },
    "46a8f994-7a21-48c4-acd2-5dd97e06d544": { count: 22, rating: 4.9 },
    "345e6ebb-45f4-47be-b13e-e971b9f6121b": { count: 19, rating: 4.7 },
    "02d742fd-9c9e-4032-a6ec-22ee1d0e5879": { count: 32, rating: 4.85 },
  };

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("featured", true)
        .limit(4); // afișăm 4 produse

      if (error) {
        console.error("Error fetching featured products:", error);
      } else {
        setFeaturedProducts(data || []);
      }
      setLoading(false);
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-[#f4f1ee] via-[#ede3d9] to-[#f8f4f0]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=1600')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-[#3c3c3c]">
              Descoperiți Esența Orientului
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-[#555555]/90">
              Parfumuri arabești autentice, create pentru momente de neuitat
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/catalog">
                <Button size="lg" className="btn-gold text-lg px-8 py-6">
                  Explorează Colecția
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Parfumuri Recomandate</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Descoperiți cele mai apreciate parfumuri din colecția noastră
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Se încarcă produsele...</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-6">
              {featuredProducts.map((product) => {
                const rev = simulatedReviews[product.id] || { count: 0, rating: 4.7 };
                return (
                  <div key={product.id} className="transition-transform transform hover:scale-105 duration-300">
                    <ProductCard {...product} reviewsCount={rev.count} rating={rev.rating} />
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/catalog">
              <Button size="lg" className="btn-bronze text-lg px-8 py-6">
                Vezi Toate Produsele
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section moved under products */}
      <section className="py-16 bg-[#f5f5f5]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#d9cba3]/20 mb-4">
                <Sparkles className="h-8 w-8 text-[#b87e2d]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Calitate Premium</h3>
              <p className="text-muted-foreground">
                Parfumuri selectate din cele mai rafinate case de parfumuri orientale
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#d9cba3]/20 mb-4">
                <Award className="h-8 w-8 text-[#b87e2d]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Autenticitate</h3>
              <p className="text-muted-foreground">
                100% produse originale, cu certificate de autenticitate
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#d9cba3]/20 mb-4">
                <Shield className="h-8 w-8 text-[#b87e2d]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Livrare Sigură</h3>
              <p className="text-muted-foreground">
                Plată ramburs și ambalare premium pentru fiecare comandă
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#d9cba3] to-[#b87e2d]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-white">
              Începeți Călătoria Dvs. Olfactivă
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Descoperiți aromele care vă definesc personalitatea
            </p>
            <Link to="/catalog">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Explorează Catalog
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
