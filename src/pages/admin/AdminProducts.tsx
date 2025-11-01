import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Edit, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image_url: "",
    notes: "",
    featured: false,
  });

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      navigate("/admin/login");
    }
    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock),
      image_url: formData.image_url || null,
      notes: formData.notes || null,
      featured: formData.featured,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id);

      if (error) {
        toast.error("Eroare la actualizare!");
      } else {
        toast.success("Produs actualizat!");
      }
    } else {
      const { error } = await supabase
        .from("products")
        .insert(productData);

      if (error) {
        toast.error("Eroare la adăugare!");
      } else {
        toast.success("Produs adăugat!");
      }
    }

    setIsOpen(false);
    setEditingProduct(null);
    resetForm();
    fetchProducts();
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      image_url: product.image_url || "",
      notes: product.notes || "",
      featured: product.featured,
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Ești sigur că vrei să ștergi acest produs?")) {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) {
        toast.error("Eroare la ștergere!");
      } else {
        toast.success("Produs șters!");
        fetchProducts();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      image_url: "",
      notes: "",
      featured: false,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border p-4">
        <div className="container mx-auto">
          <Link to="/admin/dashboard">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Înapoi la Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Gestionare Produse</h1>
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setEditingProduct(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="btn-gold">
                <Plus className="mr-2 h-4 w-4" />
                Adaugă Produs
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Editează Produs" : "Adaugă Produs Nou"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nume Produs</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descriere</Label>
                  <Textarea
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Preț (RON)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stoc</Label>
                    <Input
                      id="stock"
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Categorie</Label>
                  <Input
                    id="category"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="image_url">URL Imagine</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Note Parfum (opțional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Note de vârf: ...\nNote de inimă: ...\nNote de bază: ..."
                    rows={4}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="featured">Produs recomandat</Label>
                </div>
                <Button type="submit" className="w-full btn-gold">
                  {editingProduct ? "Actualizează" : "Adaugă"} Produs
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-card border border-border rounded-lg p-6">
              <img
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="font-bold text-lg mb-2">{product.name}</h3>
              <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                {product.description}
              </p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-primary font-bold">{product.price} RON</span>
                <span className="text-sm text-muted-foreground">Stoc: {product.stock}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(product)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editează
                </Button>
                <Button
                  onClick={() => handleDelete(product.id)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
