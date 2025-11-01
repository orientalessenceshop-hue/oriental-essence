import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In production, this would validate against the SECRET_ADMIN_PASSWORD environment variable
    // For now, we use a simple check
    const adminPassword = "OrientalAdminTemp123!";
    
    if (password === adminPassword) {
      localStorage.setItem("isAdmin", "true");
      toast.success("Autentificare reușită!");
      navigate("/admin/dashboard");
    } else {
      toast.error("Parolă incorectă!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary to-accent">
      <div className="bg-card p-8 rounded-lg shadow-[var(--shadow-elegant)] w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label htmlFor="password">Parolă Admin</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Introdu parola de admin"
              required
            />
          </div>
          <Button type="submit" className="w-full btn-gold">
            Autentifică-te
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
