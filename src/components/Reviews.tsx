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

// Comentarii naturale
const commentsSet: Record<string, string[]> = {
  "product-1": [
    "Mirosul e exact ce mă așteptam, subtil dar persistent.",
    "Foarte plăcut, primesc complimente de fiecare dată când îl port.",
    "Parfum de calitate, recomand pentru serile speciale.",
    "Notele de vârf sunt delicate, iar baza e lemnoasă și elegantă.",
    "Îmi place mult cum se simte pe piele pe parcursul zilei.",
    "Ambalaj elegant și parfum rafinat, chiar merită.",
    "L-am purtat la întâlniri și am primit reacții bune.",
    "Persistență bună, aroma evoluează frumos.",
    "Perfect pentru cadou, cu siguranță îl voi recumpăra.",
    "Se simte luxos și nu deranjează pe nimeni din jur.",
    "Un parfum care te face să te simți sofisticat.",
    "Notele devin mai complexe după câteva ore.",
    "Delicat dar suficient de prezent pentru a fi remarcat.",
    "Miros fresh la început, apoi rămâne elegant.",
    "Foarte echilibrat, nu prea puternic, nu prea slab.",
    "Se simte premium și elegant, exact cum trebuie.",
    "Un parfum care merită să fie în colecția ta.",
  ],
  "product-2": [
    "Aroma e intensă, perfectă pentru evenimente speciale.",
    "Se simte sofisticat și elegant, exact ce căutam.",
    "Persistența este foarte bună, durează toată ziua.",
    "Notele lemnoase sunt echilibrate, aroma plăcută.",
    "Îl folosesc zilnic și nu m-am săturat de el.",
    "Perfect cadou pentru cineva care apreciază parfumul fin.",
    "Mirosul evoluează frumos pe piele.",
    "Primul meu parfum de la Lattafa, foarte mulțumit.",
    "Se simte de lux fără să fie prea puternic.",
    "Foarte bun pentru serile speciale, recomand cu drag.",
    "Notele de vârf sunt fresh și atrăgătoare.",
    "Miros subtil dar persistent, se simte calitativ.",
    "Primești complimente fără să ceri, aroma e minunată.",
    "Parfum premium, elegant, nu deranjează pe nimeni.",
    "Ideal pentru ocazii speciale și întâlniri elegante.",
    "Perfect echilibrat, nu prea puternic, nu prea slab.",
    "Foarte rafinat și de calitate, se simte luxos.",
    "Mirosul rămâne pe haine fără să fie agresiv.",
    "L-am recomandat prietenilor și lor le-a plăcut.",
    "Parfum care inspiră încredere și eleganță.",
    "Notele subtile fac aroma mai complexă.",
    "Ideal pentru colecția mea, cu siguranță îl recumpăr.",
  ],
  "product-3": [
    "Foarte bun, se simte elegant și rafinat.",
    "Îl port zilnic și persistă suficient de mult.",
    "Notele de început sunt fresh, apoi devin lemnoase.",
    "Super elegant, mirosul e plăcut fără să fie agresiv.",
    "Aromă bogată, parfumul se simte premium.",
    "Notele de vârf se simt plăcut, baza lemnoasă perfectă.",
    "Perfect pentru cadou sau pentru ocazii speciale.",
    "Excelent la evenimente, primesc multe complimente.",
    "Calitate superioară, merită fiecare bănuț.",
    "Elegant și persistent, nu se pierde în câteva ore.",
    "Aroma se dezvoltă frumos și rămâne elegantă.",
    "Ideal pentru propria colecție, cu siguranță îl recumpăr.",
    "Se simte luxos, miros plăcut și persistent.",
    "Note delicate, foarte echilibrate și plăcute.",
    "Miros subtil dar de efect, elegant și persistent.",
    "Recomand cu încredere pentru ocazii speciale.",
    "Foarte bun, îl recomand celor care iubesc parfumurile fine.",
    "Parfum premium cu aromă complexă și rafinată.",
    "Ideal pentru serile speciale, sofisticat și elegant.",
  ],
  "product-4": [
    "Aroma e excepțională, persistentă și plăcută.",
    "Foarte elegant și rafinat, merită încercat.",
    "Perfect pentru serile speciale, note complexe și armonioase.",
    "Calitate premium, mirosul rămâne mult timp.",
    "Primești complimente de fiecare dată când îl porți.",
    "Mirosul devine mai complex cu timpul, foarte plăcut.",
    "Notele sunt subtile dar remarcabile, elegant.",
    "Ideal pentru cadou sau propria colecție.",
    "Note delicate și plăcute, foarte rafinat.",
    "Excelent pentru evenimente speciale și întâlniri.",
    "Persistență foarte bună pe parcursul zilei.",
    "Se simte luxos și rafinat, aroma complexă.",
    "Notele de vârf sunt fresh, baza lemnoasă elegantă.",
    "Foarte rafinat, aroma persistentă și plăcută.",
    "Perfect pentru serile speciale, recomand cu drag.",
    "Aroma bogată, persistentă și sofisticată.",
    "Ideal pentru zi și seară, subtil și elegant.",
    "Foarte bun, elegant și persistent pe parcursul zilei.",
    "Parfum premium, calitate superioară.",
    "Note delicate și echilibrate, plăcute.",
    "Miros subtil dar persistent, foarte rafinat.",
    "Recomand cu drag, aroma e minunată.",
    "Perfect pentru propria colecție sau cadou.",
    "Excelent, persistent, aroma complexă și echilibrată.",
    "Foarte rafinat, primești multe complimente.",
    "Calitate premium, persistent și elegant.",
    "Note subtile, plăcute și delicate.",
    "Parfum care impresionează prin aroma sa.",
    "Ideal pentru serile speciale și ocazii elegante.",
    "Foarte elegant, aroma persistentă și rafinată.",
    "Superb, ideal pentru zi și seară.",
    "Recomand cu încredere, persistent și elegant.",
  ],
};

// Mapare ID real -> key din commentsSet
const productIdToFakeKey: Record<string, string> = {
  "02d742fd-9c9e-4032-a6ec-22ee1d0e5879": "product-1",
  "03b05485-1428-4a9b-9fcb-a58e60774bd3": "product-2",
  "345e6ebb-45f4-47be-b13e-e971b9f6121b": "product-3",
  "46a8f994-7a21-48c4-acd2-5dd97e06d544": "product-4",
};

// Generează recenzii fake unice
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
