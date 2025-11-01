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
  const [loading, setLoading] = useState(true);

  // 🔹 Obținem produsele din Supabase
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

  // 🔹 Aplicăm filtrele
  useEffect(() => {
    let filtered = [...products];

    // Căutare
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtru categorie
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      );
    }

    // Filtru preț
    if (priceFilter !== "all") {
      if (priceFilter === "under-200") {
        filtered = filtered.filter((p) => p.price < 200);
      } else if (priceFilter === "200-300") {
        filtered = filtered.filter((p) => p.price >= 200 && p.price <= 300);
      } else if (priceFilter === "over-300") {
        filtered = filtered.filter((p) => p.price > 300);
      }
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

            {/* Filtru categorie */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48 border-gold focus:ring-gold">
                <SelectValue placeholder="Categorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate Categoriile</SelectItem>
                <SelectItem value="barbati">Bărbați</SelectItem>
                <SelectItem value="femei">Femei</SelectItem>
                <SelectItem value="unisex">Unisex</SelectItem>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
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
