import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";

const Catalog = () => {
  // 🔹 Forțăm pagina să înceapă de sus de fiecare dată când se încarcă
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all"); // filtru rating
  const [priceSort, setPriceSort] = useState<"none" | "asc" | "desc">("none"); // sortare preț
  const [loading, setLoading] = useState(true);

  // Conversie pentru filtrare cu diacritice (UI arată Bărbați/Femei/Unisex, DB are "barbati"/"femei"/"unisex")
  const dbCategoryMap: { [key: string]: string } = {
    "Bărbați": "barbati",
    "Femei": "femei",
    "Unisex": "unisex",
  };

  // stat: review medii si count reale (din Supabase)
  const [reviewStats, setReviewStats] = useState<Record<string, { avg: number; count: number }>>({});

  // --- Fake stats (pentru ca pe ProductCard să afișeze 17 / 22 / 19 / 32 etc)
  // Mapează productId -> numărul de recenzii fake pe care vrei să le afișezi inițial
  const fakeCounts: Record<string, number> = {
    // pune aici ID-urile reale ale produselor tale și numărul cerut
    "03b05485-1428-4a9b-9fcb-a58e60774bd3": 17, // produs 1
    "46a8f994-7a21-48c4-acd2-5dd97e06d544": 22, // produs 2
    "345e6ebb-45f4-47be-b13e-e971b9f6121b": 19, // produs 3
    "02d742fd-9c9e-4032-a6ec-22ee1d0e5879": 32, // produs 4
  };
  // valori medii fake (poți ajusta dacă vrei)
  const fakeAvgs: Record<string, number> = {
    "03b05485-1428-4a9b-9fcb-a58e60774bd3": 4.7,
    "46a8f994-7a21-48c4-acd2-5dd97e06d544": 4.8,
    "345e6ebb-45f4-47be-b13e-e971b9f6121b": 4.6,
    "02d742fd-9c9e-4032-a6ec-22ee1d0e5879": 4.9,
  };

  // Preluăm produsele din Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Eroare la preluarea produselor:", error);
      } else {
        setProducts(data || []);
        setFilteredProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  // După ce produsele se încarcă, preluăm review-urile reale pentru ele și calculăm avg + count
  useEffect(() => {
    const fetchReviewStats = async () => {
      if (!products || products.length === 0) return;

      try {
        const ids = products.map((p) => p.id);
        const { data, error } = await supabase
          .from("reviews")
          .select("product_id, rating")
          .in("product_id", ids);

        if (error) {
          console.error("Error fetching review stats:", error);
          return;
        }

        const statsMap: Record<string, { avg: number; count: number }> = {};
        (data || []).forEach((r: any) => {
          const pid = r.product_id;
          if (!statsMap[pid]) statsMap[pid] = { avg: 0, count: 0 };
          statsMap[pid].avg += Number(r.rating || 0);
          statsMap[pid].count += 1;
        });

        Object.keys(statsMap).forEach((pid) => {
          statsMap[pid].avg = Number((statsMap[pid].avg / statsMap[pid].count).toFixed(1));
        });

        setReviewStats(statsMap);
      } catch (err) {
        console.error(err);
      }
    };

    fetchReviewStats();
  }, [products]);

  // Helper: combină stat real + fake pentru afișare
  const getCombinedStats = (productId: string) => {
    const real = reviewStats[productId] ?? { avg: 0, count: 0 };
    const fakeCount = fakeCounts[productId] ?? 0;
    const fakeAvg = fakeAvgs[productId] ?? 0;
    const totalCount = real.count + fakeCount;
    // dacă nu există recenzii reale, folosim doar fakeAvg; altfel combinăm ponderat
    const combinedAvg =
      totalCount === 0
        ? 0
        : Number(((real.avg * real.count + (fakeAvg * fakeCount)) / totalCount).toFixed(1));
    return { avg: combinedAvg || (fakeCount ? fakeAvg : undefined), count: totalCount };
  };

  // Aplicăm filtrele (search, categorie, pret, rating, sortare)
  useEffect(() => {
    let filtered = [...products];

    // Căutare
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          (product.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtru categorie (UI folosește diacritice, DB folosește fără)
    if (categoryFilter !== "all") {
      const mapped = dbCategoryMap[categoryFilter] ?? categoryFilter;
      filtered = filtered.filter((product) => product.category === mapped);
    }

    // Filtru preț
    if (priceFilter !== "all") {
      if (priceFilter === "under-200") filtered = filtered.filter((p) => p.price < 200);
      else if (priceFilter === "200-300") filtered = filtered.filter((p) => p.price >= 200 && p.price <= 300);
      else if (priceFilter === "over-300") filtered = filtered.filter((p) => p.price > 300);
    }

    // Filtru rating (folosim getCombinedStats)
    if (ratingFilter !== "all") {
      const min = Number(ratingFilter);
      filtered = filtered.filter((p) => {
        const stats = getCombinedStats(p.id);
        if (!stats.count) return false;
        return (stats.avg ?? 0) >= min;
      });
    }

    // Sortare după preț
    if (priceSort === "asc") filtered.sort((a, b) => a.price - b.price);
    if (priceSort === "desc") filtered.sort((a, b) => b.price - a.price);

    setFilteredProducts(filtered);
  }, [searchTerm, categoryFilter, priceFilter, ratingFilter, priceSort, products, reviewStats]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="py-12 bg-gradient-to-br from-secondary/20 to-accent/20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Catalog Parfumuri</h1>
          <p className="text-xl text-muted-foreground">
            Explorează colecția noastră exclusivă de parfumuri orientale
          </p>
        </div>
      </section>

      {/* 🔹 Filtre */}
      <section className="py-8 border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Căutare */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Caută parfumuri..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtru categorie (UI cu diacritice) */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48 border-gold focus:ring-gold">
                <SelectValue placeholder="Categorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate Categoriile</SelectItem>
                <SelectItem value="Bărbați">Bărbați</SelectItem>
                <SelectItem value="Femei">Femei</SelectItem>
                <SelectItem value="Unisex">Unisex</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtru preț */}
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-full md:w-48 border-gold focus:ring-gold">
                <SelectValue placeholder="Preț" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate Prețurile</SelectItem>
                <SelectItem value="under-200">Sub 200 RON</SelectItem>
                <SelectItem value="200-300">200 - 300 RON</SelectItem>
                <SelectItem value="over-300">Peste 300 RON</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtru rating */}
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full md:w-48 border-gold focus:ring-gold">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate rating-urile</SelectItem>
                <SelectItem value="4">4.0+ stele</SelectItem>
                <SelectItem value="4.5">4.5+ stele</SelectItem>
                <SelectItem value="5">5.0 stele</SelectItem>
              </SelectContent>
            </Select>

            {/* Sortare preț */}
            <Select value={priceSort} onValueChange={setPriceSort}>
              <SelectTrigger className="w-full md:w-48 border-gold focus:ring-gold">
                <SelectValue placeholder="Sortare preț" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Fără sortare</SelectItem>
                <SelectItem value="asc">Preț crescător</SelectItem>
                <SelectItem value="desc">Preț descrescător</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* 🔹 Lista de produse */}
      <section className="py-12 flex-1">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Se încarcă produsele...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Nu am găsit produse care să corespundă criteriilor tale.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-muted-foreground">
                  Afișăm {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "produs" : "produse"}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const combined = getCombinedStats(product.id);
                  return (
                    <ProductCard
                      key={product.id}
                      {...product}
                      rating={combined.avg ? combined.avg : undefined}
                      reviewsCount={combined.count ?? 0}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Catalog;
