// ...restul importurilor rămân neschimbate

const Catalog = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all"); // filtru rating
  const [priceSort, setPriceSort] = useState<"none" | "asc" | "desc">("none"); // nou
  const [loading, setLoading] = useState(true);

  const [reviewStats, setReviewStats] = useState<Record<string, { avg: number; count: number }>>({});

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

  // Preluăm review stats
  useEffect(() => {
    const fetchReviewStats = async () => {
      if (!products.length) return;
      const ids = products.map((p) => p.id);
      const { data, error } = await supabase
        .from("reviews")
        .select("product_id, rating")
        .in("product_id", ids);

      if (error) return console.error(error);

      const statsMap: Record<string, { avg: number; count: number }> = {};
      (data || []).forEach((r: any) => {
        if (!statsMap[r.product_id]) statsMap[r.product_id] = { avg: 0, count: 0 };
        statsMap[r.product_id].avg += Number(r.rating);
        statsMap[r.product_id].count += 1;
      });
      Object.keys(statsMap).forEach((pid) => {
        statsMap[pid].avg = Number((statsMap[pid].avg / statsMap[pid].count).toFixed(1));
      });
      setReviewStats(statsMap);
    };
    fetchReviewStats();
  }, [products]);

  // Filtrare + sortare
  useEffect(() => {
    let filtered = [...products];

    // Căutare
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Categorie
    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    // Preț
    if (priceFilter !== "all") {
      if (priceFilter === "under-200") filtered = filtered.filter((p) => p.price < 200);
      if (priceFilter === "200-300") filtered = filtered.filter((p) => p.price >= 200 && p.price <= 300);
      if (priceFilter === "over-300") filtered = filtered.filter((p) => p.price > 300);
    }

    // Rating
    if (ratingFilter !== "all") {
      const min = Number(ratingFilter);
      filtered = filtered.filter((p) => {
        const stats = reviewStats[p.id];
        return stats ? stats.avg >= min : false;
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
          <p className="text-xl text-muted-foreground">Explorează colecția noastră exclusivă de parfumuri orientale</p>
        </div>
      </section>

      {/* Filtre */}
      <section className="py-8 border-b border-border bg-card">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input type="text" placeholder="Caută parfumuri..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
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
      </section>

      {/* Produse */}
      <section className="py-12 flex-1">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Se încarcă produsele...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Nu am găsit produse care să corespundă criteriilor tale.</p>
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
                  const stats = reviewStats[product.id] || undefined;
                  return (
                    <ProductCard
                      key={product.id}
                      {...product}
                      rating={stats ? stats.avg : undefined}
                      reviewsCount={stats ? stats.count : 0}
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
