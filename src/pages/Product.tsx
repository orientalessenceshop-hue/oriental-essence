import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { addToCart } from "@/lib/cart";
import { toast } from "sonner";
import Reviews from "@/components/Reviews";

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [productRating, setProductRating] = useState<{ avg: number; count: number }>({ avg: 0, count: 0 });

  // ==== Fake stats pentru produse
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

  // ==== Fetch produs
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (error) console.error(error);
      else setProduct(data);
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  // ==== Fetch rating (fake + real)
  const fetchRating = async () => {
    if (!id) return;

    try {
      const { data } = await supabase.from("reviews").select("rating").eq("product_id", id);
      const realArr = (data || []) as Array<{ rating: number }>;
      const realCount = realArr.length;
      const realSum = realArr.reduce((acc, r) => acc + Number(r.rating || 0), 0);

      const fakeCount = fakeCountsById[id] ?? 0;
      const fakeAvg = fakeAvgById[id] ?? 4.6;
      const fakeSum = fakeAvg * fakeCount;

      const totalCount = realCount + fakeCount;
      const totalAvg = totalCount === 0 ? 0 : Number(((realSum + fakeSum) / totalCount).toFixed(1));

      setProductRating({ count: totalCount, avg: totalAvg });
    } catch (err) {
      console.error(err);
      const fakeCount = fakeCountsById[id] ?? 0;
      const fakeAvg = fakeAvgById[id] ?? 4.6;
      setProductRating({ count: fakeCount, avg: Number(fakeAvg.toFixed(1)) });
    }
  };

  useEffect(() => {
    fetchRating();
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

  if (loading) return <div>Se încarcă...</div>;
  if (!product) return <div>Produs negăsit</div>;

  const notes = product.notes ? product.notes.split("\n") : [];

  return (
    <div>
      <Navbar />
      <section>
        <Link to="/catalog">
          <Button variant="ghost"><ArrowLeft /> Înapoi la Catalog</Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <img src={product.image_url || "/placeholder.svg"} alt={product.name} />
          <div>
            <h1>{product.name}</h1>

            {/* ==== Afișare rating */}
            <div className="flex items-center gap-2">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={productRating.avg >= s ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} />
              ))}
              <span>{productRating.avg} · {productRating.count} recenzii</span>
            </div>

            <p>{product.description}</p>

            <Button onClick={handleAddToCart}>Adaugă în Coș</Button>
          </div>
        </div>

        {/* ==== Reviews */}
        <Reviews
          productId={product.id}
          onReviewsChange={(count, avg) => setProductRating({ count, avg })}
        />
      </section>
      <Footer />
    </div>
  );
};

export default Product;
