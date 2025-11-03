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

/** Mapare productId -> numar fake cerut */
const FAKE_COUNTS: Record<string, number> = {
  "03b05485-1428-4a9b-9fcb-a58e60774bd3": 17,
  "46a8f994-7a21-48c4-acd2-5dd97e06d544": 22,
  "345e6ebb-45f4-47be-b13e-e971b9f6121b": 19,
  "02d742fd-9c9e-4032-a6ec-22ee1d0e5879": 32,
};

const romanianNames = [
  "Ana", "Elena", "Ioana", "Maria", "Cristina", "Andreea",
  "Gabriel", "Mihai", "Alexandru", "Vlad", "Radu", "Bogdan",
  "George", "Florin", "Ionuț", "Adrian", "Marian", "Diana",
  "Raluca", "Bianca", "Cătălin", "Alina", "Oana", "Sorina",
  "Vasile", "Nicolae", "Larisa", "Marius"
];

const shortComments = [
  "Excelent! ⭐️",
  "Foarte bun, persistă mult.",
  "Îmi place aroma 😊",
  "Perfect pentru seară.",
  "Calitate super.",
  "Merge foarte bine ca și cadou 🎁",
  "Arome complexe, foarte plăcut.",
  "Am primit multe complimente.",
];

const longComments = [
  "Am folosit acest parfum de câteva săptămâni și pot spune că persistența este excepțională. Notele de bază sunt calde și rămân mult timp pe piele. Recomand cu încredere! 🌟",
  "Mirosul evoluează frumos în timp — la început e ușor condimentat, apoi se transformă într-o bază lemnoasă care persistă ore. Ambalajul este și el foarte elegant.",
  "Am cumpărat pentru cadou, destinatarul a fost foarte încântat. Raport calitate-preț foarte bun, o recomand celor care vor ceva special.",
  "Arată premium, se simte premium. Notele de început sunt surprinzătoare, apoi devine cald–ambrat. L-am purtat la o seară specială și am primit foarte multe complimente.",
  "Este parfumul meu preferat din această colecție. Persistență foarte bună, proiecție echilibrată. Recomand pentru serile reci.",
];

const randomDateBetween = (startYear = 2023, endYear = 2025) => {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  const ts = Math.floor(Math.random() * (end - start)) + start;
  return new Date(ts).toISOString();
};

const makeFakeReviewsFor = (productId: string): Review[] => {
  const count = FAKE_COUNTS[productId] ?? 8;
  const res: Review[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    // alege un nume romanesc unic (daca se termina, permite repetitii)
    let name = romanianNames[Math.floor(Math.random() * romanianNames.length)];
    // dacă același nume s-a folosit deja prea des, adaugăm un prenume scurt
    if (usedNames.has(name)) {
      const extra = romanianNames[(i + 7) % romanianNames.length];
      name = `${name} ${extra.charAt(0)}.`;
    }
    usedNames.add(name);

    // comentariu variat: uneori scurt, uneori lung, uneori combinat + emoji
    const useLong = Math.random() < 0.4;
    const comment = useLong
      ? longComments[Math.floor(Math.random() * longComments.length)]
      : shortComments[Math.floor(Math.random() * shortComments.length)];

    const rating = +(Math.random() * (5 - 4) + 4).toFixed(1); // 4.0 - 5.0

    res.push({
      id: `fake-${productId}-${i + 1}`,
      product_id: productId,
      name,
      rating,
      comment,
      created_at: randomDateBetween(2023, 2025),
    });
  }

  // sortăm descendent (cele mai noi primele)
  res.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  return res;
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
      // recenziile reale din DB
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Eroare preluare recenzii reale:", error);
      }

      const real = (data || []) as Review[];
      // generăm recenziile fake pentru acest produs
      const fakes = makeFakeReviewsFor(productId);

      // combinăm: fake (ca exemplu) + reale (cele reale la final, astfel reale apar primele la afișare dacă au date mai noi)
      // dar vrem ca reale să fie vizibile totuși — punem reale înainte (ca să apară cele recente reale în top)
      const combined = [...real, ...fakes];

      // sortăm după created_at descendent (cele mai noi primele)
      combined.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

      setReviews(combined);
    } catch (err) {
      console.error(err);
      // fallback: doar fake
      setReviews(makeFakeReviewsFor(productId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleSubmit = async () => {
    if (!name.trim() || !comment.trim()) {
      toast.error("Completează toate câmpurile!");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("reviews")
        .insert([{ product_id: productId, name: name.trim(), rating, comment: comment.trim() }]);

      if (error) {
        console.error("Eroare inserare review:", error);
        toast.error("A apărut o eroare. Încearcă din nou.");
        return;
      }

      toast.success("Mulțumim! Recenzia ta a fost adăugată.");
      setName("");
      setComment("");
      setRating(5);

      // reîmprospătăm lista (acum include recenzia reală)
      fetchReviews();
    } catch (err) {
      console.error(err);
      toast.error("Eroare la trimitere.");
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
              className={`h-5 w-5 cursor-pointer ${rating >= star ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
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
