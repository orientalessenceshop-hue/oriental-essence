import { useEffect, useState } from "react";
import { supabase } from "../../supabase/client";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from("products").select("*");
      if (error) console.error("Eroare:", error);
      else setProducts(data);
    }
    fetchProducts();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Produse disponibile</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="border p-4 rounded-xl shadow-md hover:shadow-lg transition"
          >
            <img
              src={p.image_url}
              alt={p.name}
              className="w-full h-40 object-cover rounded-md mb-2"
            />
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <p className="text-sm text-gray-600">{p.description}</p>
            <span className="text-green-600 font-bold block mt-2">
              {p.price} RON
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
