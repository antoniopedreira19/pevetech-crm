import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Terminal, Cpu, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const WEBHOOK_URL = "PLACEHOLDER";

const diagnosticSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  whatsapp: z.string().trim().min(1, "WhatsApp é obrigatório").max(20),
  company: z.string().trim().min(1, "Empresa é obrigatória").max(100),
  challenge: z.string().trim().min(1, "Descreva seu desafio").max(2000),
});

const terminalSteps = [
  { text: "> Initializing AI engine...", icon: "⚡" },
  { text: "> Reading inputs...", icon: "📡" },
  { text: "> Mapping operational flow...", icon: "🔄" },
  { text: "> Analyzing bottleneck...", icon: "🔍" },
  { text: "> Cross-referencing automation patterns...", icon: "🧠" },
  { text: "> Designing architecture...", icon: "🏗️" },
  { text: "> Generating diagnostic report...", icon: "📊" },
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
  const [focusedField, setFocusedField] = useState<string | null>(null);
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

    const stepDuration = 700;
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

    try {
      const { error } = await supabase.from("leads").insert({
        name: form.name,
        email: form.email,
        phone: form.whatsapp,
        company: form.company,
        message: form.challenge,
      });
      if (error) console.error("Error saving lead:", error);
    } catch (err) {
      console.error("Error saving lead:", err);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const inputFields = [
    { key: "name", placeholder: "Nome Completo", type: "text", icon: "👤" },
    { key: "email", placeholder: "E-mail Corporativo", type: "email", icon: "✉️" },
    { key: "whatsapp", placeholder: "WhatsApp", type: "text", icon: "📱" },
    { key: "company", placeholder: "Nome da Empresa", type: "text", icon: "🏢" },
  ];

  return (
    <motion.div
      className="relative rounded-2xl border border-neon/15 bg-card/30 backdrop-blur-2xl overflow-hidden shadow-[0_0_60px_rgba(0,255,128,0.04)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Top accent bar */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-neon/40 to-transparent" />

      {/* Corner glows */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-neon/[0.06] rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-neon/[0.04] rounded-full blur-[60px] pointer-events-none" />

      <div className="p-6 md:p-8 lg:p-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-neon/10 border border-neon/25 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,128,0.1)]">
              <Terminal className="text-neon" size={20} />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-neon border-2 border-background animate-pulse" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
              Pevetech AI Architect
              <Cpu size={14} className="text-neon/50" />
            </h3>
            <p className="text-[11px] text-muted-foreground/60 font-display tracking-wider">Motor de diagnóstico v2.0</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neon/15 bg-neon/5">
            <Activity size={12} className="text-neon animate-pulse" />
            <span className="text-[10px] text-neon font-display uppercase tracking-widest">Online</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inputFields.map((field) => (
                  <div key={field.key} className="relative group">
                    <input
                      className={`w-full bg-background/40 border rounded-lg px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground/40 outline-none transition-all duration-300 ${
                        focusedField === field.key
                          ? "border-neon/50 shadow-[0_0_15px_rgba(0,255,128,0.08)] bg-background/60"
                          : "border-border/30 hover:border-border/60"
                      }`}
                      placeholder={field.placeholder}
                      type={field.type}
                      value={form[field.key as keyof typeof form]}
                      onChange={handleChange(field.key)}
                      onFocus={() => setFocusedField(field.key)}
                      onBlur={() => setFocusedField(null)}
                    />
                    {focusedField === field.key && (
                      <motion.div
                        className="absolute inset-0 rounded-lg border border-neon/20 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        layoutId="input-highlight"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="relative group">
                <label className="text-[11px] text-neon/60 font-display mb-2.5 block uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-neon/40" />
                  Descreva seu maior gargalo operacional
                </label>
                <textarea
                  className={`w-full bg-background/40 border rounded-lg px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground/40 outline-none transition-all duration-300 min-h-[120px] resize-none ${
                    focusedField === "challenge"
                      ? "border-neon/50 shadow-[0_0_15px_rgba(0,255,128,0.08)] bg-background/60"
                      : "border-border/30 hover:border-border/60"
                  }`}
                  placeholder="Ex: Meus processos financeiros são manuais no Excel e eu perco 2 dias fechando o mês..."
                  value={form.challenge}
                  onChange={handleChange("challenge")}
                  onFocus={() => setFocusedField("challenge")}
                  onBlur={() => setFocusedField(null)}
                  rows={4}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-neon text-accent-foreground font-bold text-base py-6 hover:bg-neon/90 shadow-[0_0_30px_rgba(0,255,128,0.25)] hover:shadow-[0_0_40px_rgba(0,255,128,0.35)] transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <Sparkles size={18} className="mr-2" />
                Iniciar Diagnóstico com IA
                <ArrowRight size={18} className="ml-2" />
              </Button>

              <p className="text-[10px] text-muted-foreground/40 text-center font-display">
                Seus dados estão seguros e protegidos. Não compartilhamos com terceiros.
              </p>
            </motion.form>
          )}

          {/* LOADING PHASE */}
          {phase === "loading" && (
            <motion.div
              key="loading"
              className="space-y-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-background/60 rounded-xl border border-border/30 p-5 md:p-6 min-h-[240px] font-mono text-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/20">
                  <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-neon/60" />
                  <span className="ml-auto text-[10px] text-muted-foreground/40 font-display tracking-wider">pevetech-ai-engine</span>
                </div>

                {terminalSteps.slice(0, currentStep + 1).map((step, i) => (
                  <motion.div
                    key={i}
                    className={`py-1.5 flex items-center gap-2 ${
                      i === currentStep ? "text-neon" : "text-muted-foreground/60"
                    }`}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <span className="text-xs">{step.icon}</span>
                    <span>{step.text}</span>
                    {i === currentStep && (
                      <span className="inline-block w-1.5 h-4 bg-neon ml-1 animate-pulse rounded-sm" />
                    )}
                    {i < currentStep && (
                      <span className="ml-auto text-neon/40 text-xs">✓</span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="h-1 w-full rounded-full bg-muted/50 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-neon/60 via-neon to-neon/60 shadow-[0_0_10px_rgba(0,255,128,0.3)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground/50 font-display tracking-wider uppercase">
                    Processando diagnóstico
                  </p>
                  <p className="text-xs text-neon/70 font-display">
                    {Math.round(Math.min(progress, 100))}%
                  </p>
                </div>
              </div>
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
              <div className="bg-background/60 rounded-xl border border-neon/15 p-5 md:p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 shadow-[inset_0_0_30px_rgba(0,255,128,0.02)]">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neon/10">
                  <Cpu size={14} className="text-neon" />
                  <span className="text-[10px] text-neon font-display uppercase tracking-widest">Relatório Gerado</span>
                </div>
                {typedResult}
                {!typingDone && (
                  <span className="inline-block w-1.5 h-4 bg-neon ml-0.5 animate-pulse rounded-sm" />
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
                      className="w-full bg-neon text-accent-foreground font-bold text-base py-6 hover:bg-neon/90 shadow-[0_0_30px_rgba(0,255,128,0.25)] hover:shadow-[0_0_40px_rgba(0,255,128,0.35)] transition-all"
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
      </div>

      {/* Bottom accent bar */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-neon/20 to-transparent" />
    </motion.div>
  );
};

export default AIDiagnosticForm;
