import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/admin/login", { username, password });
      localStorage.setItem("ritri_admin_token", data.token);
      localStorage.setItem("ritri_admin_user", data.username);
      toast.success("Login berhasil");
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white border border-slate-200 p-8 md:p-10 shadow-xl">
        <div className="h-12 w-12 bg-navy text-gold flex items-center justify-center">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="mt-5 font-display font-bold text-navy text-2xl">Admin Ritri Auto</h1>
        <p className="text-sm text-slate-500 mt-1">Masuk untuk kelola katalog & leads.</p>

        <form onSubmit={onSubmit} className="mt-7 space-y-4" data-testid="admin-login-form">
          <div>
            <Label htmlFor="u">Username</Label>
            <Input id="u" data-testid="admin-username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="p">Password</Label>
            <Input id="p" data-testid="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading} data-testid="admin-login-submit" className="w-full bg-navy hover:bg-navy-light text-white rounded-none py-6">
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </div>
    </div>
  );
}
