import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { addToCart } from "@/lib/cart";
import { toast } from "sonner";
import Reviews from "@/components/Reviews"; // ✅ importăm componenta de recenzii

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [productRating, setProductRating] = useState<{ avg: number; count: number } | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  // ==== Calcul rating & count (combinează recenziile reale din Supabase cu recenziile fake)
  const fakeCountsById: Record<string, number> = {
    "03b05485-1428-4a9b-9fcb-a58e60774bd3": 17,
    "46a8f994-7a21-48c4-acd2-5dd97e06d544": 22,
    "345e6ebb-45f4-47be-b13e-e971b9f6121b": 19,
    "02d742fd-9c9e-4032-a6ec-22ee1d0e5879": 32,
  };

  const fakeAvgById: Record<string, number> = {
    "03b05485-1428-4a9b-9fcb-a58e60774bd3": 4.7,
    "46a8f994-7a21-48c4-acd2-5dd97e06d544": 4.6,
    "345e6ebb-45f4-47be-b13e-e971b9f6121b": 4.5,
    "02d742fd-9c9e-4032-a6ec-22ee1d0e5879": 4.6,
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("rating")
          .eq("product_id", id);

        if (error) {
          console.error("Error fetching product ratings:", error);
          const fakeCount = fakeCountsById[id] ?? 0;
          const fakeAvg = fakeAvgById[id] ?? 4.6;
          setProductRating({ avg: fakeCount ? Number(fakeAvg.toFixed(1)) : 0, count: fakeCount });
          return;
        }

        const realArr = (data || []) as Array<{ rating: number }>;
        const realCount = realArr.length;
        const realSum = realArr.reduce((acc, r) => acc + Number(r.rating || 0), 0);

        const fakeCount = fakeCountsById[id] ?? 0;
        const fakeAvg = fakeAvgById[id] ?? 4.6;
        const fakeSum = fakeAvg * fakeCount;

        const totalCount = realCount + fakeCount;
        const totalAvg = totalCount === 0 ? 0 : Number(((realSum + fakeSum) / totalCount).toFixed(1));

        setProductRating({ avg: totalAvg, count: totalCount });
      } catch (err) {
        console.error("Error calculating product rating:", err);
        const fakeCount = fakeCountsById[id] ?? 0;
        const fakeAvg = fakeAvgById[id] ?? 4.6;
        setProductRating({ avg: fakeCount ? Number(fakeAvg.toFixed(1)) : 0, count: fakeCount });
      }
    };

    fetchStats();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    });
    toast.success(`${product.name} adăugat în coș!`);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Se încarcă...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Produs negăsit</h2>
            <Link to="/catalog">
              <Button>Înapoi la Catalog</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const notes = product.notes ? product.notes.split("\n") : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="py-12 flex-1">
        <div className="container mx-auto px-4">
          <Link to="/catalog">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Înapoi la Catalog
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="flex items-center justify-center bg-white rounded-2xl shadow-[var(--shadow-elegant)] p-6">
              <img
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                className="max-h-[450px] w-auto object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>

            <div className="space-y-6">
              <div>
                <div className="inline-block bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  {product.category}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{product.name}</h1>

                {productRating && productRating.count > 0 ? (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center">
                      {[1,2,3,4,5].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${productRating.avg >= s ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {productRating.avg} · {productRating.count} recenzii
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground mb-4">Fără recenzii încă</div>
                )}
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed">{product.description}</p>

              {notes.length > 0 && (
                <div className="border border-border rounded-lg p-6 bg-muted/30">
                  <h3 className="font-semibold text-lg mb-3">Piramida Olfactivă</h3>
                  <div className="space-y-2">
                    {notes.map((note: string, index: number) => (
                      <p key={index} className="text-muted-foreground">{note}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-b border-border py-6">
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold text-primary">{product.price} RON</span>
                </div>
                {product.stock > 0 ? (
                  <p className="text-sm text-muted-foreground mt-2">În stoc: {product.stock} bucăți</p>
                ) : (
                  <p className="text-sm text-destructive mt-2">Stoc epuizat</p>
                )}
              </div>

              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full btn-gold text-lg py-6"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-6 w-6" />
                Adaugă în Coș
              </Button>

              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm font-semibold">Livrare</p>
                  <p className="text-xs text-muted-foreground mt-1">Livrare în 5-7 zile</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm font-semibold">Plată</p>
                  <p className="text-xs text-muted-foreground mt-1">Ramburs</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm font-semibold">Original</p>
                  <p className="text-xs text-muted-foreground mt-1">100%</p>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Secțiunea de recenzii */}
          <div className="mt-12">
            <Reviews
              productId={product.id}
              // 🔹 callback pentru actualizarea rating-ului și count-ului în Product.tsx
              onReviewsChange={(count, avg) => setProductRating({ count, avg })}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Product;
