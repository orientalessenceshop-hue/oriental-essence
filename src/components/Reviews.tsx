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
  onReviewsChange?: (count: number, avg: number) => void; // ✅ callback
}

// Nume românești
const romanianNames = [
  "Ana", "Elena", "Ioana", "Maria", "Cristina", "Andreea",
  "Gabriel", "Mihai", "Alexandru", "Vlad", "Radu", "Bogdan",
  "George", "Florin", "Ionuț", "Adrian", "Marian", "Diana",
  "Raluca", "Bianca", "Cătălin", "Alina", "Oana", "Sorina",
  "Vasile", "Nicolae", "Larisa", "Marius"
];

// Comentarii fake naturale
const commentsSet: Record<string, string[]> = {
  "product-1": [
    "Am cumpărat acest parfum și sunt extrem de mulțumit, persistă toată ziua.",
    "Mirosul este subtil, dar elegant, perfect pentru birou sau seară.",
    "Recomand cu încredere, aroma este complexă și plăcută.",
    "Aroma persistă mult timp, primești complimente de fiecare dată.",
    "Calitate excelentă, merită fiecare leu!",
    "Notele lemnoase se simt minunat, foarte rafinat.",
    "Un parfum care te face să te simți încrezător și elegant.",
    "Aromă bogată, elegantă și persistentă.",
    "Perfect pentru serile speciale și întâlniri.",
    "Foarte plăcut, ideal și pentru cadouri.",
    "Persistență bună și notele se schimbă frumos pe parcursul zilei.",
    "Un parfum premium, aroma sa este rafinată și complexă.",
    "Se simte luxos și sofisticat, aroma rămâne întreaga zi.",
    "Recomand pentru colecția proprie sau cadou.",
    "Foarte bun, aroma echilibrată și subtilă.",
    "Ideal pentru zi și seară, elegant și persistent.",
    "Perfect pentru evenimente speciale, sofisticat."
  ],
  "product-2": [
    "Mirosul este intens și plăcut, persistă toată ziua.",
    "Calitate premium, aroma se simte sofisticată.",
    "Perfect pentru cadouri sau pentru tine.",
    "Note fine, elegante și rafinate.",
    "Recomand pentru seri speciale și întâlniri.",
    "Persistență excelentă pe tot parcursul zilei.",
    "Foarte plăcut, aroma se simte naturală.",
    "Un parfum care impresionează prin eleganță.",
    "Ideal pentru birou sau evenimente speciale.",
    "Aroma este subtilă dar persistentă.",
    "Se simte luxos, premium și sofisticat.",
    "Foarte elegant, primești complimente frecvent.",
    "Calitate superioară, aroma complexă și plăcută.",
    "Perfect pentru zi și seară, subtil și persistent.",
    "Note delicate, aromă echilibrată și persistentă.",
    "Foarte bun, elegant și persistent.",
    "Recomand cu încredere, ideal pentru orice ocazie."
  ],
  "product-3": [
    "Aroma este elegantă și persistentă.",
    "Foarte rafinat, perfect pentru seară.",
    "Notele se dezvoltă frumos pe piele.",
    "Calitate premium, aroma subtilă și plăcută.",
    "Recomand pentru cadou sau colecție personală.",
    "Persistență bună, elegant și sofisticat.",
    "Ideal pentru zi și seară, aroma subtilă.",
    "Foarte bun, aroma echilibrată și plăcută.",
    "Perfect pentru întâlniri și evenimente speciale.",
    "Aromă rafinată, premium și persistentă.",
    "Foarte elegant și sofisticat, primești complimente.",
    "Note complexe, parfum persistent și plăcut.",
    "Recomand cu drag, ideal pentru colecție.",
    "Calitate superioară, aroma bogată și persistentă.",
    "Se simte luxos, elegant și rafinat.",
    "Perfect pentru serile speciale, subtil și plăcut.",
    "Un parfum premium, persistent și rafinat.",
    "Foarte plăcut, aroma se simte naturală.",
    "Ideal pentru ocazii speciale, elegant și persistent."
  ],
  "product-4": [
    "Un parfum excepțional, aroma persistentă și elegantă.",
    "Foarte plăcut, notele se simt natural.",
    "Perfect pentru serile speciale și întâlniri.",
    "Persistență excelentă, aroma rămâne întreaga zi.",
    "Calitate premium, recomand cu drag.",
    "Ideal pentru zi și seară, aroma subtilă.",
    "Foarte elegant, primești complimente frecvent.",
    "Note fine și delicate, persistent și plăcut.",
    "Recomand pentru colecție personală sau cadou.",
    "Foarte rafinat, aroma bogată și sofisticată.",
    "Perfect pentru evenimente speciale și întâlniri.",
    "Aroma se dezvoltă frumos, persistentă și elegantă.",
    "Foarte bun, aroma echilibrată și subtilă.",
    "Se simte luxos, premium și sofisticat.",
    "Ideal pentru zi și seară, aroma plăcută și persistentă.",
    "Foarte elegant și sofisticat, aroma persistentă.",
    "Recomand cu încredere, perfect pentru orice ocazie.",
    "Note delicate și plăcute, aroma persistentă și rafinată.",
    "Calitate superioară, aroma complexă și elegantă.",
    "Persistență bună, elegant și sofisticat.",
    "Perfect pentru cadouri sau colecție personală.",
    "Foarte plăcut și echilibrat, ideal pentru zi și seară.",
    "Aroma rafinată și complexă, persistentă."
  ],
};

// Mapare ID real -> key din commentsSet
const productIdToFakeKey: Record<string, string> = {
  "02d742fd-9c9e-4032-a6ec-22ee1d0e5879": "product-1",
  "03b05485-1428-4a9b-9fcb-a58e60774bd3": "product-2",
  "345e6ebb-45f4-47be-b13e-e971b9f6121b": "product-3",
  "46a8f994-7a21-48c4-acd2-5dd97e06d544": "product-4",
};

// Generează recenzii fake unice cu date random
const makeFakeReviewsFor = (productId: string): Review[] => {
  const fakeKey = productIdToFakeKey[productId] || "product-1";
  const selectedComments = commentsSet[fakeKey] || [];
  return selectedComments.map((c, i) => {
    const name = romanianNames[i % romanianNames.length] + (i >= romanianNames.length ? ` ${i}` : "");
    const rating = +(Math.random() * (5 - 4) + 4).toFixed(1);
    const created_at = new Date(
      2023 + Math.floor(Math.random() * 3),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    ).toISOString();
    return {
      id: `fake-${productId}-${i}`,
      product_id: productId,
      name,
      rating,
      comment: c,
      created_at,
    };
  }).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
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
      const fake = makeFakeReviewsFor(productId);
      const combined = [...real, ...fake].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      setReviews(combined);

      // ✅ trimite count și avg în Product.tsx
      const totalCount = combined.length;
      const avg =
        totalCount === 0 ? 0 : Number((combined.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1));
      onReviewsChange?.(totalCount, avg);
    } catch (err) {
      console.error(err);
      const fake = makeFakeReviewsFor(productId);
      setReviews(fake);
      const totalCount = fake.length;
      const avg = Number((fake.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1));
      onReviewsChange?.(totalCount, avg);
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
      setName("");
      setComment("");
      setRating(5);
      fetchReviews();
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
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${r.rating >= star ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
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
