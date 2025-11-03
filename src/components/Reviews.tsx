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
  onReviewsChange?: (count: number, avg: number) => void; // callback pentru Product.tsx
}

// Nume românești
const romanianNames = [
  "Ana", "Elena", "Ioana", "Maria", "Cristina", "Andreea",
  "Gabriel", "Mihai", "Alexandru", "Vlad", "Radu", "Bogdan",
  "George", "Florin", "Ionuț", "Adrian", "Marian", "Diana",
  "Raluca", "Bianca", "Cătălin", "Alina", "Oana", "Sorina",
  "Vasile", "Nicolae", "Larisa", "Marius"
];

// Comentarii naturale (revizuite pentru a părea mai reale)
const commentsSet: Record<string, string[]> = {
  "product-1": [
    "Aroma se simte minunat pe tot parcursul zilei, îmi place foarte mult.",
    "Foarte elegant și persistent, l-am primit cadou și mi-a plăcut.",
    "Miros plăcut, dar nu deranjează pe nimeni, îl recomand.",
    "Notele se schimbă subtil pe parcursul zilei, foarte rafinat.",
    "Calitate premium, se simte luxos și persistent.",
    "Un parfum plăcut, îl port zilnic fără probleme.",
    "Mi-a depășit așteptările, aroma rămâne mult timp.",
    "Foarte bun pentru serile speciale, recomand.",
    "Aromă discretă, dar elegantă și persistentă.",
    "Un parfum pe care l-aș recumpăra oricând.",
    "Notele sunt bine echilibrate și plăcute.",
    "Se simte luxos, aroma persistentă și rafinată.",
    "Perfect pentru zi și seară, nu deranjează pe nimeni.",
    "Mi-a plăcut foarte mult, aroma se dezvoltă frumos pe piele.",
    "Un parfum premium pentru colecția mea.",
    "Notele de vârf sunt fresh, baza lemnoasă se simte elegant.",
    "Este elegant, persistent și se simte de calitate."
  ],
  "product-2": [
    "Aroma se simte sofisticată și elegantă.",
    "Persistență foarte bună, se simte fresh tot timpul.",
    "Foarte plăcut și rafinat, l-am primit complimente.",
    "Perfect pentru cadou, aroma nu deranjează.",
    "Notele sunt delicate și echilibrate, îl recomand.",
    "Îl folosesc zilnic, aroma rămâne constantă.",
    "Super elegant, se simte de lux și rafinat.",
    "Foarte bun pentru evenimente speciale, recomand.",
    "Parfum premium, persistent și rafinat.",
    "Ideal pentru serile speciale, aroma discretă.",
    "Notele lemnoase se simt plăcut, persistent.",
    "Foarte elegant, perfect pentru întâlniri.",
    "Recomand cu încredere, aroma este echilibrată.",
    "Un parfum rafinat, persistent și plăcut.",
    "Se simte premium și elegant, îl voi recumpăra.",
    "Note de vârf fresh, baza lemnoasă se simte bine.",
    "Foarte bun, aroma subtilă dar persistentă.",
    "Ideal pentru cadou sau pentru propria colecție.",
    "Aromă plăcută și persistentă, recomand cu drag.",
    "Perfect pentru ocazii speciale, elegant și rafinat.",
    "Miros subtil, dar persistent și plăcut.",
    "Un parfum care merită fiecare leu."
  ],
  "product-3": [
    "Persistență excelentă, aroma elegantă și rafinată.",
    "Îl port zilnic, aroma rămâne fresh toată ziua.",
    "Perfect pentru zi și seară, nu deranjează.",
    "Notele sunt delicate, foarte plăcute și rafinate.",
    "Un parfum premium, aroma bogată și persistentă.",
    "Recomand pentru cadou sau pentru tine.",
    "Foarte bun pentru evenimente speciale și întâlniri.",
    "Calitate superioară, l-am primit cadou și mi-a plăcut.",
    "Foarte elegant și persistent, îl voi recumpăra.",
    "Aroma se dezvoltă frumos pe piele, persistentă.",
    "Perfect pentru propria colecție sau cadou.",
    "Se simte luxos și persistent, recomand.",
    "Note delicate și echilibrate, aroma plăcută.",
    "Miros subtil, dar persistent și rafinat.",
    "Foarte elegant și rafinat, recomand cu drag.",
    "Ideal pentru serile speciale și ocazii elegante.",
    "Parfum premium, persistent și elegant.",
    "Foarte bun, aroma rafinată și complexă.",
    "Se simte de lux, foarte plăcut și persistent."
  ],
  "product-4": [
    "Aromă persistentă și rafinată, foarte plăcută.",
    "Foarte elegant, primești multe complimente.",
    "Perfect pentru seară, notele sunt bine echilibrate.",
    "Calitate premium, persistent timp îndelungat.",
    "Mi-a plăcut mult, aroma se dezvoltă frumos.",
    "Foarte plăcut și elegant, recomand cu drag.",
    "Perfect pentru cadou sau colecție.",
    "Note delicate și plăcute, persistentă pe tot parcursul zilei.",
    "Excelent pentru evenimente speciale și întâlniri.",
    "Persistență extraordinară, se simte premium.",
    "Se simte luxos, elegant și rafinat.",
    "Note de vârf fresh, baza lemnoasă persistentă.",
    "Foarte rafinat, aroma plăcută și elegantă.",
    "Recomand pentru serile speciale și ocazii.",
    "Aromă bogată și persistentă, ideală.",
    "Ideal pentru zi și seară, subtil și elegant.",
    "Foarte bun, elegant și rafinat, persistent.",
    "Parfum premium, calitate superioară și persistent.",
    "Note subtile, delicate și plăcute.",
    "Miros subtil, persistent și rafinat.",
    "Recomand cu drag, aroma persistentă și plăcută.",
    "Perfect pentru propria colecție sau cadou.",
    "Excelent, persistent și rafinat.",
    "Foarte elegant, primești multe complimente.",
    "Calitate premium, persistent și elegant.",
    "Un parfum care impresionează prin aroma sa.",
    "Perfect pentru serile speciale și evenimente.",
    "Foarte elegant, aroma persistentă și rafinată.",
    "Ideal pentru zi și seară, elegant și persistent.",
    "Recomand cu încredere, persistent și elegant.",
    "Un parfum rafinat și persistent, îl recomand."
  ]
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

      // actualizează Product.tsx cu număr și medie
      if (onReviewsChange) {
        const totalCount = combined.length;
        const avgRating = +(combined.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1);
        onReviewsChange(totalCount, avgRating);
      }
    } catch (err) {
      console.error(err);
      const fake = makeFakeReviewsFor(productId);
      setReviews(fake);
      if (onReviewsChange) {
        const totalCount = fake.length;
        const avgRating = +(fake.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1);
        onReviewsChange(totalCount, avgRating);
      }
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
      fetchReviews(); // refresh recenzii după adăugare
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
          {[1,2,3,4,5].map((star) => (
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
                {[1,2,3,4,5].map((star) => (
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
