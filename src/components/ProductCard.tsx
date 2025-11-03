import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { addToCart } from "@/lib/cart";
import { toast } from "sonner";
import Reviews from "./Reviews"; // importă componenta Reviews

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category: string;
  reviews?: { rating: number; comment: string; author: string }[]; // recenzii
}

const ProductCard = ({
  id,
  name,
  description,
  price,
  image_url,
  category,
  reviews = [],
}: ProductCardProps) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ id, name, price, image_url });
    toast.success(`${name} adăugat în coș!`);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Calculăm rating mediu dacă există recenzii
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <Link to={`/product/${id}`}>
      <Card className="card-elegant h-full overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg">
        {/* Imaginea produsului */}
        <div className="aspect-square overflow-hidden relative flex items-center justify-center bg-white">
          <img
            src={image_url || "/placeholder.svg"}
            alt={name}
            className="object-contain w-full h-full p-4 transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-2 right-2 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-md">
            {category}
          </div>
        </div>

        {/* Detalii produs */}
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {description}
          </p>

          {/* Rating vizual */}
          {reviews.length > 0 && (
            <div className="flex items-center mb-2">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="text-sm font-medium text-muted-foreground">
                {averageRating.toFixed(1)} ({reviews.length})
              </span>
            </div>
          )}

          {/* Lista recenziilor */}
          {reviews.length > 0 && <Reviews reviews={reviews} />}
          
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold text-primary">{price} RON</span>
          </div>
        </CardContent>

        {/* Buton de adăugat în coș */}
        <CardFooter className="p-6 pt-0">
          <Button
            onClick={handleAddToCart}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl shadow-md transition-all duration-300"
            size="lg"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Adaugă în coș
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProductCard;
