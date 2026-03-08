import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Zap, Clock } from "lucide-react";
import pevetechLogo from "@/assets/pevetech-logo.png";
import AIDiagnosticForm from "@/components/AIDiagnosticForm";
import ParticleField from "@/components/landing/ParticleField";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const trustBadges = [
  { icon: Zap, text: "Resultado em 30s" },
  { icon: Shield, text: "100% Gratuito" },
  { icon: Clock, text: "Sem compromisso" },
];

const DiagnosticPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Particle background */}
      <ParticleField />

      {/* Multi-layer ambient glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon/[0.06] rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-neon/[0.08] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-neon/[0.04] rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,100,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,100,0.012)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      {/* Scanline effect */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)] pointer-events-none z-[1]" />

      {/* Header */}
      <header className="py-5 px-6 flex items-center justify-between relative z-10">
        <Link
          to="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-display uppercase tracking-widest hidden sm:inline">Voltar</span>
        </Link>
        <motion.img
          src={pevetechLogo}
          alt="Pevetech"
          className="h-12 md:h-14"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        />
        <div className="w-16" /> {/* spacer */}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-6 md:py-10 relative z-10">
        <div className="w-full max-w-2xl">
          {/* Hero text */}
          <motion.div
            className="text-center mb-8 md:mb-10"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon/20 bg-neon/5 text-neon text-[10px] font-display tracking-[0.3em] uppercase mb-6 shadow-[0_0_15px_rgba(0,255,128,0.08)]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
              AI Engine Online
            </motion.span>

            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
            >
              Diagnóstico de{" "}
              <span className="text-neon glow-neon-text relative">
                Inteligência Operacional
                <motion.span
                  className="absolute -bottom-1 left-0 h-[2px] bg-gradient-to-r from-transparent via-neon to-transparent"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
                />
              </span>
            </motion.h1>

            <motion.p
              className="text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
            >
              Nossa IA analisa seu cenário operacional e desenha a arquitetura da solução técnica em tempo real.
            </motion.p>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="flex items-center justify-center gap-6 md:gap-8 mb-8"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
          >
            {trustBadges.map((badge) => (
              <div key={badge.text} className="flex items-center gap-1.5 text-muted-foreground/70">
                <badge.icon size={13} className="text-neon/60" />
                <span className="text-[11px] font-display uppercase tracking-wider">{badge.text}</span>
              </div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
          >
            <AIDiagnosticForm />
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center relative z-10">
        <p className="text-[10px] text-muted-foreground/30 font-display uppercase tracking-widest">
          © {new Date().getFullYear()} Pevetech · Intelligence Systems
        </p>
      </footer>
    </div>
  );
};

export default DiagnosticPage;
