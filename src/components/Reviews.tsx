import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Review {
  id: string;
  product_id: string;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ReviewsProps {
  productId: string;
  onReviewsChange?: (count: number, avg: number) => void; // callback
}

// Fake review counts și media
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

const Reviews = ({ productId, onReviewsChange }: ReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      const real: Review[] = data || [];

      setReviews(real);

      // Actualizăm product card
      const realCount = real.length;
      const realSum = real.reduce((acc, r) => acc + r.rating, 0);
      const fakeCount = fakeCountsById[productId] ?? 0;
      const fakeAvg = fakeAvgById[productId] ?? 4.6;
      const fakeSum = fakeAvg * fakeCount;

      const totalCount = realCount + fakeCount;
      const totalAvg = totalCount === 0 ? 0 : Number(((realSum + fakeSum) / totalCount).toFixed(1));

      if (onReviewsChange) onReviewsChange(totalCount, totalAvg);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async () => {
    if (!name.trim() || !comment.trim()) {
      toast.error("Completează toate câmpurile!");
      return;
    }

    try {
      await supabase.from("reviews").insert([{
        product_id: productId,
        name: name.trim(),
        rating,
        comment: comment.trim()
      }]);
      toast.success("Recenzia ta a fost adăugată!");
      setName(""); setComment(""); setRating(5);
      fetchReviews(); // re-fetch după adăugare
    } catch (err) {
      console.error(err);
      toast.error("Eroare la trimitere.");
    }
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold mb-4">Recenzii</h3>

      <div className="mb-6 p-4 border rounded-lg bg-muted/20">
        <Input placeholder="Nume" value={name} onChange={(e) => setName(e.target.value)} className="mb-2" />
        <Textarea placeholder="Comentariu" value={comment} onChange={(e) => setComment(e.target.value)} className="mb-2" />
        <div className="flex items-center space-x-2 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 cursor-pointer ${rating >= star ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
        <Button onClick={handleSubmit}>Adaugă Recenzie</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Se încarcă recenziile...</p>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground">Nu există recenzii pentru acest produs.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="p-4 border rounded-lg bg-white">
              <div className="flex items-center mb-2">
                {[1,2,3,4,5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${r.rating >= s ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                  />
                ))}
                <span className="ml-2 text-sm font-semibold">{r.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm whitespace-pre-line">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
