import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ReviewsProps {
  productId: string;
  onReviewsChange?: (count: number, avg: number) => void;
}

const Reviews = ({ productId, onReviewsChange }: ReviewsProps) => {
  const [reviews, setReviews] = useState<Array<{ rating: number; comment: string }>>([]);

  const fetchReviews = async () => {
    const { data } = await supabase.from("reviews").select("*").eq("product_id", productId);
    const arr = data || [];
    setReviews(arr);

    // calculează rating
    const count = arr.length;
    const avg = count === 0 ? 0 : Number((arr.reduce((acc, r) => acc + Number(r.rating), 0) / count).toFixed(1));
    onReviewsChange?.(count, avg);
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const addReview = async (rating: number, comment: string) => {
    await supabase.from("reviews").insert([{ product_id: productId, rating, comment }]);
    fetchReviews();
  };

  return (
    <div>
      <h2>Recenzii ({reviews.length})</h2>
      {reviews.map((r, i) => (
        <div key={i}>
          <div>Rating: {r.rating}</div>
          <div>{r.comment}</div>
        </div>
      ))}
      {/* Exemplu adăugare recenzie */}
      {/* <button onClick={() => addReview(5, "Super!")}>Adaugă recenzie</button> */}
    </div>
  );
};

export default Reviews;
