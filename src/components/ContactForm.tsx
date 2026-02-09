import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  company: z.string().trim().max(100).optional(),
  message: z.string().trim().min(1, "Mensagem é obrigatória").max(2000),
});

const ContactForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      toast({ title: "Erro", description: result.error.errors[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      name: result.data.name,
      email: result.data.email,
      company: result.data.company || null,
      message: result.data.message,
      status: "new",
    });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao enviar", description: "Tente novamente mais tarde.", variant: "destructive" });
    } else {
      toast({ title: "Mensagem enviada!", description: "Entraremos em contato em breve." });
      setForm({ name: "", email: "", company: "", message: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
      <Input
        placeholder="Seu nome"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="bg-secondary border-border focus:border-neon"
      />
      <Input
        placeholder="Seu email"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="bg-secondary border-border focus:border-neon"
      />
      <Input
        placeholder="Empresa (opcional)"
        value={form.company}
        onChange={(e) => setForm({ ...form, company: e.target.value })}
        className="bg-secondary border-border focus:border-neon"
      />
      <Textarea
        placeholder="Sua mensagem"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        rows={4}
        className="bg-secondary border-border focus:border-neon"
      />
      <Button type="submit" disabled={loading} className="w-full gradient-neon text-accent-foreground font-semibold hover:opacity-90">
        {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Send className="mr-2" size={18} />}
        Enviar Mensagem
      </Button>
    </form>
  );
};

export default ContactForm;
