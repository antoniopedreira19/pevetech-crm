import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ParticleField from "./ParticleField";
import grifoLogo from "@/assets/clients/grifo.jpg";
import californiaLogo from "@/assets/clients/california.jpg";
import vvBeneficiosLogo from "@/assets/clients/vv-beneficios.png";
import mtwelveLogo from "@/assets/clients/mtwelve.png";
import senseSportsLogo from "@/assets/clients/sense-sports.jpg";

const clients = [
  { src: grifoLogo, alt: "Grifo Engenharia" },
  { src: californiaLogo, alt: "California" },
  { src: vvBeneficiosLogo, alt: "VV Benefícios" },
  { src: mtwelveLogo, alt: "MTwelve" },
  { src: senseSportsLogo, alt: "Sense Sports" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-28 pb-20 overflow-hidden">
      <ParticleField />

      {/* Multi-layer aurora */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,_hsl(120_100%_50%_/_0.15)_0%,_hsl(120_100%_30%_/_0.06)_40%,_transparent_70%)]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,_hsl(120_100%_50%_/_0.1)_0%,_transparent_70%)] blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[radial-gradient(circle,_hsl(120_100%_50%_/_0.04)_0%,_transparent_70%)] blur-2xl pointer-events-none animate-pulse-neon" />

      <div className="container mx-auto px-6 text-center relative z-10 flex flex-col items-center">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-neon/20 bg-neon/5 text-neon text-xs font-display tracking-[0.25em] uppercase shadow-[0_0_20px_rgba(0,255,128,0.08)]">
            <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
            Intelligence Systems
          </span>
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-6xl md:text-8xl font-bold text-foreground mt-10 mb-8 leading-[1.05] max-w-5xl mx-auto tracking-tight"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
        >
          Sua equipe opera.
          <br />
          <span className="relative inline-block">
            <span className="text-neon glow-neon-text">Nossa IA escala.</span>
            <motion.span
              className="absolute -bottom-2 left-0 h-[2px] bg-gradient-to-r from-transparent via-neon to-transparent"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
            />
          </span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
        >
          Não vendemos horas de desenvolvimento. Vendemos eficiência operacional.
          Transformamos o caos manual em uma máquina de lucro previsível e autônoma.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
        >
          <Link to="/diagnostico">
            <Button
              size="lg"
              className="bg-neon text-accent-foreground font-bold text-base px-10 py-6 hover:bg-neon/90 shadow-[0_0_30px_rgba(0,255,128,0.3),_0_0_60px_rgba(0,255,128,0.1)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,255,128,0.4),_0_0_80px_rgba(0,255,128,0.15)]"
            >
              Gerar Diagnóstico Gratuito <ArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
          <a href="#diferenciais">
            <Button
              size="lg"
              variant="outline"
              className="border-border/40 text-foreground font-semibold text-base px-10 py-6 bg-background/10 hover:bg-muted/50 hover:border-neon/20 transition-all backdrop-blur-sm"
            >
              Ver Tecnologia
            </Button>
          </a>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="mt-20 grid grid-cols-3 gap-8 md:gap-16 max-w-xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={4}
        >
          {[
            { value: "70%", label: "Redução de tempo" },
            { value: "24/7", label: "Operação autônoma" },
            { value: "10x", label: "Capacidade de escala" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-neon glow-neon-text font-display">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Social Proof - Marquee */}
        <motion.div className="mt-20 w-full overflow-hidden" initial="hidden" animate="visible" variants={fadeUp} custom={5}>
          <p className="text-[10px] font-display uppercase tracking-[0.35em] text-muted-foreground/60 mb-8">
            Operações otimizadas pela Pevetech
          </p>
          <div className="relative w-full">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            <div className="flex animate-marquee gap-12 w-max">
              {[...clients, ...clients, ...clients, ...clients].map((client, i) => (
                <div
                  key={`${client.alt}-${i}`}
                  className="w-16 h-16 md:w-[80px] md:h-[80px] rounded-full border border-border/20 bg-card/20 flex items-center justify-center shrink-0 overflow-hidden backdrop-blur-sm grayscale hover:grayscale-0 hover:border-neon/30 hover:shadow-[0_0_20px_rgba(0,255,128,0.08)] transition-all duration-500 cursor-default"
                >
                  <img src={client.src} alt={client.alt} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
