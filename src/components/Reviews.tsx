import { Star } from "lucide-react";

interface Review {
  id: string;
  product_id: string;
  rating: number; // 1-5
  comment: string;
  reviewer: string;
}

interface ReviewsProps {
  reviews: Review[];
}

const Reviews = ({ reviews }: ReviewsProps) => {
  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-1 mb-1">
        {Array.from({ length: Math.round(reviews[0].rating) }).map((_, i) => (
          <Star key={i} className="w-4 h-4 text-yellow-400" />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {reviews[0].comment} - <span className="font-semibold">{reviews[0].reviewer}</span>
      </p>
    </div>
  );
};

export default Reviews;
