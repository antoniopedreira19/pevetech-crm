import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const CTASection = () => {
  return (
    <section className="py-32 relative z-10 overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon/[0.05] rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <span className="text-xs font-display uppercase tracking-[0.3em] text-neon/60 mb-4 block">
            AI-Powered
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Diagnóstico de{" "}
            <span className="text-neon glow-neon-text">Inteligência Operacional</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg mb-10">
            Pare de adivinhar onde está o problema. Nossa IA analisa o seu cenário e desenha a arquitetura da solução imediatamente.
          </p>

          <Link to="/diagnostico">
            <Button
              size="lg"
              className="bg-neon text-accent-foreground font-bold text-base px-10 py-6 hover:bg-neon/90 shadow-[0_0_30px_rgba(0,255,128,0.3),_0_0_60px_rgba(0,255,128,0.1)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,255,128,0.4),_0_0_80px_rgba(0,255,128,0.15)]"
            >
              <Sparkles size={18} className="mr-2" />
              Gerar Diagnóstico Gratuito
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
