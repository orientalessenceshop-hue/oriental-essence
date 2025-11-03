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
}

const Reviews = ({ productId }: ReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);

  const generateFakeReviews = (count: number, productId: string) => {
    const names = ["Ana M.", "George P.", "Ioana S.", "Mihai L.", "Elena R.", "Andrei T."];
    const comments = [
      "Un parfum minunat, aroma persistă toată ziua!",
      "Foarte elegant și rafinat, recomand!",
      "Un parfum perfect pentru seară.",
      "Miros plăcut și persistent.",
      "Calitate excelentă, foarte mulțumit!",
      "Se simte scump și rafinat."
    ];

    const reviews: Review[] = [];
    for (let i = 0; i < count; i++) {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomComment = comments[Math.floor(Math.random() * comments.length)];
      const randomRating = +(Math.random() * (5 - 4) + 4).toFixed(1);
      const randomDate = new Date(
        2023 + Math.floor(Math.random() * 3), // 2023-2025
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      ).toISOString();

      reviews.push({
        id: `r${i}-${productId}`,
        product_id: productId,
        name: randomName,
        rating: randomRating,
        comment: randomComment,
        created_at: randomDate,
      });
    }

    return reviews;
  };

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } else {
      // Setăm numărul de recenzii fake pentru fiecare produs
      let fakeCount = 17; // primul produs
      if (productId === "prod2") fakeCount = 22;
      else if (productId === "prod3") fakeCount = 19;
      else if (productId === "prod4") fakeCount = 32;

      const fakes = generateFakeReviews(fakeCount, productId);
      setReviews([...fakes, ...(data || [])]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async () => {
    if (!name || !comment) {
      toast.error("Completează toate câmpurile!");
      return;
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert([{ product_id: productId, name, rating, comment }]);

    if (error) {
      console.error(error);
      toast.error("Eroare la adăugarea recenziei!");
    } else {
      toast.success("Recenzie adăugată cu succes!");
      setName("");
      setComment("");
      setRating(5);
      fetchReviews(); // reîmprospătăm lista
    }
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold mb-4">Recenzii</h3>

      {/* Form adăugare recenzie */}
      <div className="mb-6 p-4 border rounded-lg bg-muted/20">
        <Input
          placeholder="Nume"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-2"
        />
        <Textarea
          placeholder="Comentariu"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mb-2"
        />
        <div className="flex items-center space-x-2 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 cursor-pointer ${
                rating >= star ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
              }`}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
        <Button onClick={handleSubmit}>Adaugă Recenzie</Button>
      </div>

      {/* Lista recenziilor */}
      {loading ? (
        <p className="text-muted-foreground">Se încarcă recenziile...</p>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground">Nu există recenzii pentru acest produs.</p>
      ) : (
        <div className="space-y-4">
          {reviews
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((r) => (
              <div key={r.id} className="p-4 border rounded-lg bg-white">
                <div className="flex items-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        r.rating >= star ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-semibold">{r.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm">{r.comment}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
