import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { addToCart } from "@/lib/cart";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category: string;
  reviewsCount?: number;
  rating?: number;
}

const ProductCard = ({
  id,
  name,
  description,
  price,
  image_url,
  category,
  reviewsCount = 0,
  rating,
}: ProductCardProps) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ id, name, price, image_url });
    toast.success(`${name} adăugat în coș!`);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Dacă nu e rating, generăm random între 4 și 5
  const displayRating =
    rating ?? Math.round((Math.random() * (5 - 4) + 4) * 10) / 10;

  // Stele vizuale
  const fullStars = Math.floor(displayRating);
  const halfStar = displayRating - fullStars >= 0.5;

  return (
    <Link to={`/product/${id}`}>
      <Card className="card-elegant h-full overflow-hidden group cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
        <div className="aspect-square overflow-hidden relative flex items-center justify-center bg-white">
          <img
            src={image_url || "/placeholder.svg"}
            alt={name}
            className="object-contain w-full h-full p-4 transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-2 right-2 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-md">
            {category}
          </div>
        </div>

        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {description}
          </p>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-1">
              {[...Array(fullStars)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              ))}
              {halfStar && <Star className="h-4 w-4 text-yellow-500 fill-yellow-300" />}
              <span className="text-sm font-semibold">{displayRating}</span>
              <span className="text-muted-foreground text-sm">({reviewsCount})</span>
            </div>
            <span className="text-2xl font-bold text-primary transition-colors group-hover:text-yellow-600">
              {price} RON
            </span>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <Button
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-semibold rounded-xl shadow-md transition-all duration-300 flex items-center justify-center"
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
