import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, ShoppingBag, LogOut } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gradient-gold">Oriental Essence Admin</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold mb-8">Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/admin/products">
            <div className="bg-card border border-border rounded-lg p-8 hover:shadow-[var(--shadow-elegant)] transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Produse</h3>
                  <p className="text-muted-foreground">Gestionează produsele</p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/admin/orders">
            <div className="bg-card border border-border rounded-lg p-8 hover:shadow-[var(--shadow-elegant)] transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <ShoppingBag className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Comenzi</h3>
                  <p className="text-muted-foreground">Vezi și gestionează comenzile</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
