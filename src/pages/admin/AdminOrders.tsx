import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      navigate("/admin/login");
    }
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data || []);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Eroare la actualizare!");
    } else {
      toast.success("Status actualizat!");
      fetchOrders();
    }
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
        <h1 className="text-4xl font-bold mb-8">Gestionare Comenzi</h1>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nu există comenzi încă.
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-card border border-border rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-xl mb-4">
                      Comanda #{order.order_number}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Client:</strong> {order.customer_name}</p>
                      <p><strong>Email:</strong> {order.customer_email}</p>
                      <p><strong>Telefon:</strong> {order.customer_phone}</p>
                      <p><strong>Adresă:</strong> {order.address}</p>
                      {order.notes && (
                        <p><strong>Notițe:</strong> {order.notes}</p>
                      )}
                      <p><strong>Data:</strong> {new Date(order.created_at).toLocaleDateString('ro-RO')}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Produse comandate:</h4>
                    <div className="space-y-2 mb-4">
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="text-sm">
                          {item.name} x {item.quantity} - {(item.price * item.quantity).toFixed(2)} RON
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border pt-3 mb-4">
                      <p className="font-bold text-lg">
                        Total: <span className="text-primary">{order.total.toFixed(2)} RON</span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Status comandă:</label>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="în procesare">În procesare</SelectItem>
                          <SelectItem value="în curs de livrare">În curs de livrare</SelectItem>
                          <SelectItem value="livrat">Livrat</SelectItem>
                          <SelectItem value="anulat">Anulat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
