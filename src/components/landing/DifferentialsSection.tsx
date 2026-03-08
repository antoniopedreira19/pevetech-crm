import { motion, useInView } from "framer-motion";
import { TrendingUp, LineChart, BarChart3 } from "lucide-react";
import { useRef, useEffect, useState } from "react";
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

const differentials = [
  {
    icon: TrendingUp,
    title: "Escalabilidade Infinita",
    desc: "Desacople seu crescimento do aumento de headcount. Nossa tecnologia absorve o impacto do volume, permitindo que você dobre de tamanho mantendo a equipe enxuta.",
    metric: "10x",
    metricLabel: "mais capacidade",
  },
  {
    icon: LineChart,
    title: "ROI Imediato",
    desc: "Trocamos OPEX (custo fixo de pessoal) por eficiência tecnológica. Cada processo automatizado se traduz instantaneamente em margem de lucro líquida.",
    metric: "80%",
    metricLabel: "redução de custo",
  },
  {
    icon: BarChart3,
    title: "Soberania de Dados",
    desc: "Fim das planilhas descentralizadas. Centralizamos sua inteligência em um Data Warehouse proprietário, garantindo controle total sobre a verdade dos seus números.",
    metric: "100%",
    metricLabel: "controle total",
  },
];

const AnimatedCounter = ({ value, suffix = "" }: { value: string; suffix?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayed, setDisplayed] = useState("0");

  useEffect(() => {
    if (!isInView) return;
    const numericPart = parseInt(value.replace(/\D/g, ""));
    if (isNaN(numericPart)) {
      setDisplayed(value);
      return;
    }
    let current = 0;
    const step = Math.ceil(numericPart / 40);
    const interval = setInterval(() => {
      current += step;
      if (current >= numericPart) {
        current = numericPart;
        clearInterval(interval);
      }
      setDisplayed(current + suffix);
    }, 30);
    return () => clearInterval(interval);
  }, [isInView, value, suffix]);

  return <span ref={ref}>{displayed}</span>;
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const DifferentialsSection = () => {
  return (
    <section id="diferenciais" className="py-32 relative z-10 overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <span className="text-xs font-display uppercase tracking-[0.3em] text-neon/60 mb-4 block">
            Diferenciais
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Por que a <span className="text-neon glow-neon-text">Pevetech?</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg mb-8">
            Não aplicamos "hacks". Construímos ativos tecnológicos perenes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {differentials.map((d, i) => (
            <motion.div
              key={d.title}
              className="group relative p-8 rounded-2xl border border-border/30 bg-card/10 backdrop-blur-md overflow-hidden hover:border-neon/20 transition-all duration-500"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i + 1}
              whileHover={{ y: -6 }}
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Hover glow */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-32 h-32 bg-neon/10 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative z-10">
                {/* Metric */}
                <div className="mb-6">
                  <p className="text-4xl md:text-5xl font-bold text-neon glow-neon-text font-display leading-none">
                    <AnimatedCounter value={d.metric} suffix={d.metric.includes("%") ? "%" : d.metric.includes("x") ? "x" : ""} />
                  </p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-widest mt-2">{d.metricLabel}</p>
                </div>

                <div className="h-10 w-10 rounded-lg bg-neon/10 border border-neon/20 flex items-center justify-center mb-5 group-hover:bg-neon/20 transition-all duration-300">
                  <d.icon className="text-neon" size={20} />
                </div>

                <h3 className="text-lg font-bold mb-3 text-foreground group-hover:text-neon transition-colors duration-300">
                  {d.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Client Marquee */}
        <div className="w-full overflow-hidden relative mt-16">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <div className="flex animate-marquee gap-8 w-max items-center">
            {[0, 1, 2, 3].map((group) => (
              <div key={group} className="flex gap-8 items-center">
                {clients.map((client) => (
                  <div
                    key={`${client.alt}-${group}`}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-border/20 bg-card/20 flex items-center justify-center shrink-0 overflow-hidden backdrop-blur-sm hover:border-neon/30 hover:shadow-[0_0_15px_rgba(0,255,128,0.08)] transition-all duration-500 cursor-default"
                  >
                    <img src={client.src} alt={client.alt} className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-24 md:w-40 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DifferentialsSection;
