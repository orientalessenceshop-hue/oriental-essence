import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart } from "lucide-react";
import { addToCart } from "@/lib/cart";
import { toast } from "sonner";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    stock: number;
    category: string;
    reviewCount: number; // inițial
    reviewAvg: number;   // inițial
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [reviewCount, setReviewCount] = useState(product.reviewCount);
  const [reviewAvg, setReviewAvg] = useState(product.reviewAvg);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ productId: string; count: number; avg: number }>;
      if (customEvent.detail.productId === product.id) {
        setReviewCount(customEvent.detail.count);
        setReviewAvg(customEvent.detail.avg);
      }
    };

    window.addEventListener("reviewsUpdated", handler);
    return () => window.removeEventListener("reviewsUpdated", handler);
  }, [product.id]);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    });
    toast.success(`${product.name} adăugat în coș!`);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col">
      <Link to={`/product/${product.id}`} className="mb-4">
        <img
          src={product.image_url || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-48 object-contain rounded-lg transition-transform hover:scale-105"
        />
      </Link>

      <div className="flex flex-col flex-1">
        <span className="text-sm text-accent font-semibold mb-1">{product.category}</span>
        <Link to={`/product/${product.id}`}>
          <h2 className="text-lg font-bold mb-2">{product.name}</h2>
        </Link>

        <div className="flex items-center mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`h-4 w-4 ${
                reviewAvg >= s ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2">{reviewCount} recenzii</span>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-bold text-primary">{product.price} RON</span>
          <button
            onClick={handleAddToCart}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center"
            disabled={product.stock === 0}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Adaugă
          </button>
        </div>

        {product.stock === 0 && (
          <p className="text-sm text-destructive mt-1">Stoc epuizat</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
