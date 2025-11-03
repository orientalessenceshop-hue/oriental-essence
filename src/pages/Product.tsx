// ... importuri rămân la fel
const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [productRating, setProductRating] = useState<{ avg: number; count: number } | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  // Fake reviews (doar pentru exemplu)
  const fakeCountsById: Record<string, number> = {
    "03b05485-1428-4a9b-9fcb-a58e60774bd3": 17,
    "46a8f994-7a21-48c4-acd2-5dd97e06d544": 22,
    "345e6ebb-45f4-47be-b13e-e971b9f6121b": 19,
    "02d742fd-9c9e-4032-a6ec-22ee1d0e5879": 32,
  };
  const fakeAvgById: Record<string, number> = {
    "03b05485-1428-4a9b-9fcb-a58e60774bd3": 4.7,
    "46a8f994-7a21-48c4-acd2-5dd97e06d544": 4.6,
    "345e6ebb-45f4-47be-b13e-e971b9f6121b": 4.5,
    "02d742fd-9c9e-4032-a6ec-22ee1d0e5879": 4.6,
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("rating")
          .eq("product_id", id);

        if (error) {
          console.error(error);
          const fakeCount = fakeCountsById[id] ?? 0;
          const fakeAvg = fakeAvgById[id] ?? 4.6;
          setProductRating({ count: fakeCount, avg: Number(fakeAvg.toFixed(1)) });
          return;
        }

        const realArr = (data || []) as Array<{ rating: number }>;
        const realCount = realArr.length;
        const realSum = realArr.reduce((acc, r) => acc + Number(r.rating || 0), 0);

        const fakeCount = fakeCountsById[id] ?? 0;
        const fakeAvg = fakeAvgById[id] ?? 4.6;
        const fakeSum = fakeAvg * fakeCount;

        const totalCount = realCount + fakeCount;
        const totalAvg = totalCount === 0 ? 0 : Number(((realSum + fakeSum) / totalCount).toFixed(1));

        setProductRating({ count: totalCount, avg: totalAvg });
      } catch (err) {
        console.error(err);
        const fakeCount = fakeCountsById[id] ?? 0;
        const fakeAvg = fakeAvgById[id] ?? 4.6;
        setProductRating({ count: fakeCount, avg: Number(fakeAvg.toFixed(1)) });
      }
    };

    fetchStats();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    });
    toast.success(`${product.name} adăugat în coș!`);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  if (loading) return <div>Se încarcă...</div>;
  if (!product) return <div>Produs negăsit</div>;

  const notes = product.notes ? product.notes.split("\n") : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="py-12 flex-1">
        <div className="container mx-auto px-4">
          {/* ... restul UI rămâne la fel */}
          {productRating && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center">
                {[1,2,3,4,5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${productRating.avg >= s ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                {productRating.avg} · {productRating.count} recenzii
              </div>
            </div>
          )}
          <Reviews
            productId={product.id}
            onReviewsChange={(count, avg) => setProductRating({ count, avg })}
          />
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Product;
