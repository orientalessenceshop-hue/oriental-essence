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

// Nume românești
const romanianNames = [
  "Ana", "Elena", "Ioana", "Maria", "Cristina", "Andreea",
  "Gabriel", "Mihai", "Alexandru", "Vlad", "Radu", "Bogdan",
  "George", "Florin", "Ionuț", "Adrian", "Marian", "Diana",
  "Raluca", "Bianca", "Cătălin", "Alina", "Oana", "Sorina",
  "Vasile", "Nicolae", "Larisa", "Marius"
];

// Comentarii variate
const commentsSet: Record<string, string[]> = {
  "product-1": [
    "Excelent! Aroma rămâne toată ziua. 🌸",
    "Foarte elegant și rafinat, primești multe complimente! 👌",
    "Perfect pentru seară, aroma subtilă dar persistentă.",
    "Un parfum care merită fiecare leu! 😍",
    "Calitate premium, recomand cu drag!",
    "Note delicate și plăcute, persistent timp îndelungat.",
    "Mi-a plăcut mult, aroma devine mai complexă cu timpul.",
    "Superb! Nu mă așteptam la persistență atât de bună.",
    "Recomand pentru serile speciale, elegant și rafinat.",
    "Miros plăcut, persistent, cadou ideal 🎁",
    "Note complexe și echilibrate, foarte mulțumit.",
    "Se simte luxos, persistent și elegant, ideal pentru întâlniri.",
    "Perfect pentru zi și seară, delicat și persistent.",
    "Foarte plăcut și echilibrat, îl voi recumpăra.",
    "Notele de vârf sunt fresh, baza e lemnoasă.",
    "Un parfum premium cu adevărat, elegant.",
    "Perfect pentru propria colecție. 🌟",
  ],
  "product-2": [
    "Aromă intensă și sofisticată. 😍",
    "Un parfum minunat, recomand cu drag!",
    "Persistență excelentă pe parcursul zilei.",
    "Note fine, delicate și foarte plăcute.",
    "Foarte bun pentru evenimente speciale!",
    "Îl folosesc zilnic, aroma rămâne fresh.",
    "Mi-a depășit așteptările, calitate premium.",
    "Super elegant, primești multe complimente.",
    "Perfect pentru cadou sau pentru tine.",
    "Miros delicat dar persistent, foarte plăcut.",
    "Notele lemnoase se simt minunat. 🌿",
    "Calitate superioară, l-am recomandat prietenilor.",
    "Excelent pentru întâlniri și ocazii speciale.",
    "Aroma se schimbă frumos pe parcursul zilei.",
    "Foarte rafinat și elegant, persistent.",
    "Se simte de lux, aroma bogată și persistentă.",
    "Recomand cu încredere, ideal pentru orice ocazie.",
    "Note de vârf fresh, baza lemnoasă, perfect.",
    "Foarte bun, l-am cumpărat deja a doua oară.",
    "Parfum premium, elegant și persistent.",
    "Ideal pentru serile speciale și evenimente.",
    "Aromă echilibrată, nu deranjantă, plăcută.",
  ],
  "product-3": [
    "Foarte bun, persistent și elegant.",
    "Îl folosesc zilnic, aroma rămâne fresh.",
    "Perfect pentru zi și seară, subtil și persistent.",
    "Super elegant, aroma plăcută și delicată.",
    "Un parfum premium, aroma bogată și persistentă.",
    "Note de vârf fresh, baza lemnoasă, minunat.",
    "Recomand pentru cadou sau pentru tine. 🎁",
    "Excelent pentru evenimente speciale și întâlniri.",
    "Calitate superioară, mi-a depășit așteptările.",
    "Foarte rafinat și elegant, persistent toată ziua.",
    "Aroma se dezvoltă frumos pe piele, persistentă.",
    "Perfect pentru propria colecție sau cadou.",
    "Se simte de lux, foarte plăcut și persistent.",
    "Note delicate, plăcute, echilibrate.",
    "Miros subtil dar persistent, aroma minunată.",
    "Recomand cu drag, ideal pentru ocazii speciale.",
    "Foarte bun, elegant și persistent.",
    "Parfum premium, aroma rafinată și complexă.",
    "Ideal pentru serile speciale și ocazii elegante.",
  ],
  "product-4": [
    "Un parfum excepțional, aroma persistentă.",
    "Foarte elegant și rafinat, recomand cu drag!",
    "Perfect pentru seară, notele sunt complexe.",
    "Calitate premium, persistent timp îndelungat.",
    "Superb, primești multe complimente! 🌸",
    "Mi-a plăcut mult, aroma devine mai complexă.",
    "Foarte plăcut, subtile și elegante note.",
    "Perfect pentru cadou sau pentru colecție. 🎁",
    "Note fine, delicate și plăcute.",
    "Excelent pentru evenimente speciale.",
    "Persistență extraordinară pe parcursul zilei.",
    "Se simte luxos, elegant și rafinat.",
    "Notele de vârf sunt fresh, baza lemnoasă.",
    "Foarte rafinat, aroma persistentă și plăcută.",
    "Recomand pentru serile speciale și întâlniri.",
    "Aromă bogată și persistentă, perfectă.",
    "Ideal pentru zi și seară, subtil și elegant.",
    "Foarte bun, elegant și rafinat, persistent.",
    "Parfum premium, calitate superioară.",
    "Note delicate și echilibrate, plăcute.",
    "Miros subtil, persistent, foarte plăcut.",
    "Recomand cu drag, aroma minunată.",
    "Perfect pentru propria colecție sau cadou. 🌟",
    "Excelent, persistent, aroma complexă.",
    "Foarte rafinat, primești multe complimente.",
    "Calitate premium, persistent și elegant.",
    "Note subtile, plăcute, delicate.",
    "Un parfum care impresionează prin aroma sa.",
    "Perfect pentru serile speciale și ocazii.",
    "Foarte elegant, aroma persistentă și rafinată.",
    "Superb, ideal pentru zi și seară.",
    "Recomand cu încredere, persistent și elegant.",
  ],
};

// Generează recenzii fake unice cu date random
const makeFakeReviewsFor = (productId: string): Review[] => {
  const selectedComments = commentsSet[productId] || [];
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

const Reviews = ({ productId }: ReviewsProps) => {
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
    } catch (err) {
      console.error(err);
      setReviews(makeFakeReviewsFor(productId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();

    // 🔹 Listen for global reviewAdded events to refresh reviews
    const handleReviewAdded = () => fetchReviews();
    window.addEventListener("reviewAdded", handleReviewAdded);
    return () => window.removeEventListener("reviewAdded", handleReviewAdded);
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

      // 🔹 Trigger global event so ProductCard updates count
      window.dispatchEvent(new Event("reviewAdded"));
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
