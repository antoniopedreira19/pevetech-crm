import { motion } from "framer-motion";
import AIDiagnosticForm from "@/components/AIDiagnosticForm";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const DiagnosticSection = () => {
  return (
    <section id="diagnostico" className="py-32 relative z-10 overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-16"
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
          <p className="text-muted-foreground max-w-lg mx-auto text-lg">
            Pare de adivinhar onde está o problema. Nossa IA analisa o seu cenário e desenha a arquitetura da solução imediatamente.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={1}
        >
          <AIDiagnosticForm />
        </motion.div>
      </div>
    </section>
  );
};

export default DiagnosticSection;
