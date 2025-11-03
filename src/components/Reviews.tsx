import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  product_id: string;
  author: string;
  rating: number;
  comment: string;
}

interface ReviewsProps {
  productId: string;
}

const Reviews = ({ productId }: ReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [author, setAuthor] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);

  // 🔹 Preluăm recenziile din Supabase
  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      else setReviews(data || []);

      setLoading(false);
    };

    fetchReviews();
  }, [productId]);

  // 🔹 Adaugă recenzie nouă
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !comment) {
      toast.error("Completează toate câmpurile!");
      return;
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert([{ product_id: productId, author, comment, rating }]);

    if (error) {
      toast.error("Nu s-a putut adăuga recenzia.");
      console.error(error);
    } else {
      toast.success("Recenzia a fost adăugată!");
      setReviews([...(reviews || []), data[0]]);
      setAuthor("");
      setComment("");
      setRating(5);
    }
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold mb-6">Recenzii</h3>

      {loading ? (
        <p className="text-muted-foreground">Se încarcă recenziile...</p>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground mb-6">Nu există recenzii pentru acest produs.</p>
      ) : (
        <div className="space-y-4 mb-6">
          {reviews.map((r) => (
            <div key={r.id} className="border border-border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{r.author}</span>
                <span className="text-yellow-500 font-bold">{r.rating}★</span>
              </div>
              <p>{r.comment}</p>
            </div>
          ))}
        </div>
      )}

      {/* Formular recenzie */}
      <form onSubmit={handleSubmit} className="space-y-4 border-t border-border pt-6">
        <h4 className="font-semibold text-lg">Adaugă o recenzie</h4>
        <Input
          placeholder="Numele tău"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
        <Textarea
          placeholder="Scrie recenzia ta aici..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
        <Input
          type="number"
          min={1}
          max={5}
          placeholder="Rating (1-5)"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          required
        />
        <Button type="submit" className="btn-gold">
          Trimite recenzia
        </Button>
      </form>
    </div>
  );
};

export default Reviews;
