import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Terminal, Loader2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Erro no login", description: error.message, variant: "destructive" });
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(120_100%_15%_/_0.1)_0%,_transparent_70%)]" />
      <div className="w-full max-w-sm mx-auto p-8 rounded-lg bg-card border border-border relative z-10">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Terminal className="text-neon" size={28} />
          <span className="font-display text-xl font-bold text-foreground">PEVETECH</span>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-secondary border-border focus:border-neon"
            required
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-secondary border-border focus:border-neon"
            required
          />
          <Button type="submit" disabled={loading} className="w-full gradient-neon text-accent-foreground font-semibold hover:opacity-90">
            {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
