import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, ArrowRight, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const WEBHOOK_URL = "PLACEHOLDER";

const diagnosticSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  whatsapp: z.string().trim().min(1, "WhatsApp é obrigatório").max(20),
  company: z.string().trim().min(1, "Empresa é obrigatória").max(100),
  challenge: z.string().trim().min(1, "Descreva seu desafio").max(2000),
});

const terminalSteps = [
  "> Reading inputs...",
  "> Mapping operational flow...",
  "> Analyzing bottleneck...",
  "> Cross-referencing automation patterns...",
  "> Designing architecture...",
  "> Generating diagnostic report...",
];

const SIMULATED_RESPONSE = `## Diagnóstico Operacional

**Gargalo identificado:** Processos manuais com alto custo de tempo e risco de erro humano.

**Arquitetura recomendada:**

1. **Automação de Workflow** — Implementar fluxos automatizados via n8n/Make conectando suas ferramentas atuais, eliminando entrada manual de dados.

2. **Agente de IA** — Implantar um assistente inteligente que processa e categoriza informações automaticamente, reduzindo o tempo de operação em até 70%.

3. **Dashboard em Tempo Real** — Painel de BI conectado ao seu banco de dados para acompanhamento de KPIs sem depender de planilhas.

**Impacto estimado:** Redução de 60-80% no tempo operacional e eliminação de erros manuais.

**Próximo passo:** Agendar uma sessão de 30 min para validar a arquitetura e iniciar a execução.`;

const useTypewriter = (text: string, speed = 15, enabled = false) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return { displayed, done };
};

const AIDiagnosticForm = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    company: "",
    challenge: "",
  });
  const [phase, setPhase] = useState<"form" | "loading" | "result">("form");
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  const { displayed: typedResult, done: typingDone } = useTypewriter(
    SIMULATED_RESPONSE,
    8,
    phase === "result"
  );

  // Terminal loading animation
  useEffect(() => {
    if (phase !== "loading") return;
    setCurrentStep(0);
    setProgress(0);

    const stepDuration = 800;
    const totalSteps = terminalSteps.length;

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next >= totalSteps) {
          clearInterval(stepInterval);
          setTimeout(() => setPhase("result"), 400);
        }
        return next;
      });
    }, stepDuration);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 100 / ((totalSteps * stepDuration) / 50);
      });
    }, 50);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [phase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = diagnosticSchema.safeParse(form);
    if (!result.success) {
      toast({
        title: "Erro",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }
    setPhase("loading");

    // Future: send to webhook
    // try { await fetch(WEBHOOK_URL, { method: "POST", body: JSON.stringify(result.data) }); } catch {}
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const inputClass =
    "w-full bg-transparent border-b border-muted-foreground/30 focus:border-neon px-0 py-3 text-base text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors";

  return (
    <motion.div
      className="max-w-2xl mx-auto rounded-xl border border-neon/20 bg-card/40 backdrop-blur-xl p-8 md:p-10 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Subtle corner glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-neon/10 border border-neon/30 flex items-center justify-center">
          <Terminal className="text-neon" size={20} />
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            Pevetech AI Architect
          </h3>
          <p className="text-xs text-muted-foreground">Motor de diagnóstico v2.0</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
          <span className="text-[10px] text-neon font-mono">ONLINE</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* FORM PHASE */}
        {phase === "form" && (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input
                className={inputClass}
                placeholder="Nome Completo"
                value={form.name}
                onChange={handleChange("name")}
              />
              <input
                className={inputClass}
                placeholder="E-mail Corporativo"
                type="email"
                value={form.email}
                onChange={handleChange("email")}
              />
              <input
                className={inputClass}
                placeholder="WhatsApp"
                value={form.whatsapp}
                onChange={handleChange("whatsapp")}
              />
              <input
                className={inputClass}
                placeholder="Nome da Empresa"
                value={form.company}
                onChange={handleChange("company")}
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-mono mb-2 block">
                {">"} Qual o maior gargalo da sua operação hoje?
              </label>
              <textarea
                className={`${inputClass} min-h-[100px] resize-none border rounded-md border-muted-foreground/20 focus:border-neon px-3 py-3`}
                placeholder="Ex: Meus processos financeiros são manuais no Excel e eu perco 2 dias fechando o mês..."
                value={form.challenge}
                onChange={handleChange("challenge")}
                rows={4}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full gradient-neon text-accent-foreground font-semibold text-base hover:opacity-90 mt-2"
            >
              <Sparkles size={18} className="mr-2" />
              Gerar Diagnóstico Operacional
            </Button>
          </motion.form>
        )}

        {/* LOADING PHASE */}
        {phase === "loading" && (
          <motion.div
            key="loading"
            className="space-y-4 font-mono text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-background/80 rounded-lg border border-border p-5 min-h-[200px]">
              {terminalSteps.slice(0, currentStep + 1).map((step, i) => (
                <motion.div
                  key={i}
                  className={`py-1 ${i === currentStep ? "text-neon" : "text-muted-foreground"}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {step}
                  {i === currentStep && (
                    <span className="inline-block w-2 h-4 bg-neon ml-1 animate-pulse" />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full gradient-neon rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Processando diagnóstico... {Math.round(Math.min(progress, 100))}%
            </p>
          </motion.div>
        )}

        {/* RESULT PHASE */}
        {phase === "result" && (
          <motion.div
            key="result"
            ref={resultRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-background/80 rounded-lg border border-neon/20 p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
              {typedResult}
              {!typingDone && (
                <span className="inline-block w-2 h-4 bg-neon ml-0.5 animate-pulse" />
              )}
            </div>

            {typingDone && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <a
                  href="https://wa.me/5500000000000?text=Ol%C3%A1%2C%20quero%20agendar%20a%20execu%C3%A7%C3%A3o%20do%20meu%20plano%20de%20diagn%C3%B3stico."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className="w-full gradient-neon text-accent-foreground font-semibold text-base hover:opacity-90"
                  >
                    Agendar Execução deste Plano
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </a>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AIDiagnosticForm;
