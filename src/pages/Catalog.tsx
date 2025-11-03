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
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const dbCategoryMap: { [key: string]: string } = {
    "Bărbați": "barbati",
    "Femei": "femei",
    "Unisex": "unisex",
  };

  // Recenzii simulate pentru fiecare produs după ID
  const simulatedReviews: { [key: string]: { count: number; rating: number } } = {
    "03b05485-1428-4a9b-9fcb-a58e60774bd3": { count: 17, rating: 4.8 },
    "46a8f994-7a21-48c4-acd2-5dd97e06d544": { count: 22, rating: 4.9 },
    "345e6ebb-45f4-47be-b13e-e971b9f6121b": { count: 19, rating: 4.7 },
    "02d742fd-9c9e-4032-a6ec-22ee1d0e5879": { count: 32, rating: 4.85 },
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      else {
        setProducts(data || []);
        setFilteredProducts(data || []);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];
    if (searchTerm)
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    if (categoryFilter !== "all")
      filtered = filtered.filter((p) => p.category === dbCategoryMap[categoryFilter]);
    if (priceFilter !== "all") {
      if (priceFilter === "under-200") filtered = filtered.filter((p) => p.price < 200);
      else if (priceFilter === "200-300")
        filtered = filtered.filter((p) => p.price >= 200 && p.price <= 300);
      else if (priceFilter === "over-300") filtered = filtered.filter((p) => p.price > 300);
    }
    setFilteredProducts(filtered);
  }, [searchTerm, categoryFilter, priceFilter, products]);

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

      {/* Filtre */}
      <section className="py-8 border-b border-border bg-card">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-4">
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
        </div>
      </section>

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
                  Afișăm {filteredProducts.length} {filteredProducts.length === 1 ? "produs" : "produse"}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const rev = simulatedReviews[product.id] || { count: 0, rating: 4.7 };
                  return <ProductCard key={product.id} {...product} reviewsCount={rev.count} rating={rev.rating} />;
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
