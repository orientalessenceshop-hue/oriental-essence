import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ReviewsProps {
  productId: string;
}

const Reviews = ({ productId }: ReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [name, setName] = useState("");

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (!error && data) setReviews(data as Review[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleAddReview = async () => {
    if (!newComment || !name) return;

    const { data, error } = await supabase
      .from("reviews")
      .insert([{ product_id: productId, user_name: name, rating: newRating, comment: newComment }])
      .select();

    if (!error && data) {
      setReviews((prev) => [data[0] as Review, ...prev]);
      setNewComment("");
      setNewRating(5);
      setName("");
      // Emit custom event pentru live update ProductCard
      window.dispatchEvent(new CustomEvent("reviewAdded", { detail: { productId } }));
    }
  };

  if (loading) return <p>Se încarcă recenziile...</p>;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Recenzii clienți</h2>

      {/* Formular adaugare review */}
      <div className="border border-border rounded-lg p-6 mb-8 bg-muted/30">
        <h3 className="font-semibold mb-4">Adaugă recenzia ta</h3>
        <input
          type="text"
          placeholder="Numele tău"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-2 p-2 border border-border rounded"
        />
        <div className="flex items-center mb-2">
          {[1,2,3,4,5].map((s) => (
            <Star
              key={s}
              className={`h-6 w-6 cursor-pointer ${newRating >= s ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
              onClick={() => setNewRating(s)}
            />
          ))}
        </div>
        <textarea
          placeholder="Scrie recenzia ta..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-2 border border-border rounded mb-2"
          rows={3}
        />
        <Button onClick={handleAddReview}>Trimite recenzia</Button>
      </div>

      {/* Lista recenziilor */}
      <div className="space-y-4">
        {reviews.length === 0 && <p>Nu există recenzii încă.</p>}
        {reviews.map((r) => (
          <div key={r.id} className="border border-border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{r.user_name}</span>
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${r.rating >= s ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{new Date(r.created_at).toLocaleDateString()}</p>
            <p>{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
