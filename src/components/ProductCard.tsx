import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
}

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

const ProductCard = ({ id, name, price, image_url, category }: ProductCardProps) => {
  const [rating, setRating] = useState<{ avg: number; count: number }>({ avg: 0, count: 0 });

  // Funcție de fetch recenzii
  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("product_id", id);

      if (error) throw error;

      const realArr = (data || []) as Array<{ rating: number }>;
      const realCount = realArr.length;
      const realSum = realArr.reduce((acc, r) => acc + Number(r.rating || 0), 0);

      const fakeCount = fakeCountsById[id] ?? 0;
      const fakeAvg = fakeAvgById[id] ?? 4.6;
      const fakeSum = fakeAvg * fakeCount;

      const totalCount = realCount + fakeCount;
      const totalAvg = totalCount === 0 ? 0 : Number(((realSum + fakeSum) / totalCount).toFixed(1));

      setRating({ avg: totalAvg, count: totalCount });
    } catch (err) {
      const fakeCount = fakeCountsById[id] ?? 0;
      const fakeAvg = fakeAvgById[id] ?? 4.6;
      setRating({ avg: fakeCount ? Number(fakeAvg.toFixed(1)) : 0, count: fakeCount });
    }
  };

  // Fetch inițial și la event reviewAdded
  useEffect(() => {
    fetchReviews();

    const handleReviewAdded = (e: Event) => {
      const customEvent = e as CustomEvent<{ productId: string }>;
      if (customEvent.detail.productId === id) {
        fetchReviews();
      }
    };

    window.addEventListener("reviewAdded", handleReviewAdded);
    return () => {
      window.removeEventListener("reviewAdded", handleReviewAdded);
    };
  }, [id]);

  return (
    <div className="border rounded-lg p-4 flex flex-col items-center">
      <Link to={`/product/${id}`}>
        <img src={image_url || "/placeholder.svg"} alt={name} className="h-40 w-auto object-contain mb-2" />
      </Link>
      <div className="text-sm text-muted-foreground mb-1">{category}</div>
      <Link to={`/product/${id}`} className="font-bold text-lg">{name}</Link>
      <div className="flex items-center gap-1 mt-1">
        {[1,2,3,4,5].map((s) => (
          <Star
            key={s}
            className={`h-4 w-4 ${rating.avg >= s ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">
          {rating.avg} · {rating.count} recenzii
        </span>
      </div>
      <div className="mt-2 font-bold text-lg">{price} RON</div>
    </div>
  );
};

export default ProductCard;
