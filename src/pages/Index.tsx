import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Workflow, Bot, BarChart3, Compass, ArrowRight, TrendingUp, LineChart } from "lucide-react";
import pevetechLogo from "@/assets/pevetech-logo.png";
import grifoLogo from "@/assets/clients/grifo.jpg";
import californiaLogo from "@/assets/clients/california.jpg";
import vvBeneficiosLogo from "@/assets/clients/vv-beneficios.png";
import mtwelveLogo from "@/assets/clients/mtwelve.png";
import senseSportsLogo from "@/assets/clients/sense-sports.jpg";
import { Button } from "@/components/ui/button";
import AIDiagnosticForm from "@/components/AIDiagnosticForm";

const pillars = [
  {
    icon: Workflow,
    title: "Automação (Workflow)",
    desc: "Elimine o trabalho manual repetitivo. Conectamos suas ferramentas para criar fluxos de trabalho que rodam sozinhos.",
  },
  {
    icon: Bot,
    title: "Inteligência (IA)",
    desc: "Implementação de Agentes Autônomos e LLMs que entendem o contexto do seu negócio para vender e atender.",
  },
  {
    icon: BarChart3,
    title: "Visão (Dashboards)",
    desc: "Transforme dados dispersos em decisão. Painéis de Business Intelligence integrados ao seu banco de dados.",
  },
  {
    icon: Compass,
    title: "Estratégia (CTO)",
    desc: "Governança, escolha de stack e arquitetura de sistemas. A liderança técnica necessária para escalar.",
  },
];

const differentials = [
  {
    icon: TrendingUp,
    title: "Escala sem Atrito",
    desc: "Preparamos a sua empresa para crescer 10x sem precisar multiplicar o tamanho da equipe. A tecnologia e a automação absorvem o impacto do aumento de volume, protegendo a sua margem de lucro.",
  },
  {
    icon: LineChart,
    title: "Eficiência Operacional (ROI)",
    desc: "Transformamos custo de horas manuais em processamento em nuvem. Cada gargalo resolvido ou processo automatizado se traduz imediatamente em redução de despesas e mais lucro no final do mês.",
  },
  {
    icon: BarChart3,
    title: "Cultura Data-Driven",
    desc: "Fim do achismo na diretoria. Consolidamos dados dispersos de diversas planilhas e sistemas em um único painel de comando em tempo real. Você passa a pilotar sua empresa com dados exatos.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/10">
        <div className="container mx-auto flex items-center justify-between py-2 px-6">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img src={pevetechLogo} alt="Pevetech" className="h-20" />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a
              href="#servicos"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Serviços
            </a>
            <a
              href="#diferenciais"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Diferenciais
            </a>
            <a href="#diagnostico" className="text-sm font-medium text-neon hover:text-neon/80 transition-colors">
              Diagnóstico (IA)
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-40 pb-20 overflow-hidden">
        {/* Aurora glow from bottom center */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,_hsl(120_100%_50%_/_0.12)_0%,_hsl(120_100%_30%_/_0.05)_40%,_transparent_70%)]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,_hsl(120_100%_50%_/_0.08)_0%,_transparent_70%)] blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 text-center relative z-10 flex flex-col items-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="inline-block px-4 py-1.5 rounded-full border border-neon/30 bg-neon/5 text-neon text-xs font-display mb-8 tracking-wider shadow-[0_0_15px_rgba(0,255,128,0.1)]">
              CTO AS A SERVICE
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
          >
            Pare de Operar.
            <br />
            <span className="text-neon glow-neon-text relative">
              Comece a Escalar.
              <span className="absolute -right-4 top-2 md:top-4 w-[3px] h-[0.75em] bg-neon animate-pulse-neon" />
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
          >
            Transforme rotinas manuais em automação inteligente. A estratégia de um CTO experiente para organizar sua
            casa e liberar seu tempo.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
          >
            <a href="#diagnostico" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-neon text-neon-foreground font-semibold text-base px-8 hover:bg-neon/90 shadow-lg shadow-neon/20 transition-all hover:scale-105"
              >
                Iniciar Diagnóstico com IA <ArrowRight className="ml-2" size={18} />
              </Button>
            </a>
            <a href="#diferenciais" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-border text-foreground font-semibold text-base px-8 hover:border-neon hover:text-neon transition-colors bg-background/50 backdrop-blur-sm"
              >
                Por que a Pevetech?
              </Button>
            </a>
          </motion.div>

          {/* Social Proof */}
          <motion.div className="mt-24 w-full" initial="hidden" animate="visible" variants={fadeUp} custom={4}>
            <p className="text-[11px] font-display uppercase tracking-[0.2em] text-muted-foreground mb-8">
              Tecnologia por trás de:
            </p>
            <div className="flex items-center justify-center gap-8 md:gap-14 flex-wrap">
              {[
                { src: grifoLogo, alt: "Grifo Engenharia" },
                { src: californiaLogo, alt: "California" },
                { src: vvBeneficiosLogo, alt: "VV Benefícios" },
                { src: mtwelveLogo, alt: "MTwelve" },
                { src: senseSportsLogo, alt: "Sense Sports" },
              ].map((client) => (
                <div
                  key={client.alt}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-border/50 bg-card/50 flex items-center justify-center opacity-60 hover:opacity-100 hover:border-neon/50 hover:shadow-[0_0_15px_rgba(0,255,128,0.1)] transition-all duration-300 cursor-default overflow-hidden"
                >
                  <img src={client.src} alt={client.alt} className="w-full h-full object-contain p-2" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            Pilares da <span className="text-neon">Transformação</span>
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-center mb-16 max-w-xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
          >
            A base tecnológica que sua empresa precisa para crescer.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((s, i) => (
              <motion.div
                key={s.title}
                className="p-8 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/50 hover:border-neon/50 hover:bg-card/60 transition-all duration-300 group shadow-sm hover:shadow-neon/5"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <div className="h-12 w-12 rounded-xl bg-background border border-border/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <s.icon
                    className="text-neon group-hover:drop-shadow-[0_0_8px_hsl(120,100%,50%,0.5)] transition-all"
                    size={24}
                  />
                </div>
                <h3 className="font-display text-lg font-semibold mb-3 text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais / Metodologia */}
      <section id="diferenciais" className="py-24 bg-card/20 border-y border-border/40 relative z-10">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Como Geramos <span className="text-neon">Valor</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {differentials.map((d, i) => (
              <motion.div
                key={d.title}
                className="p-8 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm relative overflow-hidden group hover:border-neon/40 transition-all duration-300"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
              >
                {/* Background Glow on Hover */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon/40 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10">
                  <div className="h-14 w-14 rounded-xl bg-card border border-border/50 flex items-center justify-center mb-6 group-hover:bg-neon/10 group-hover:border-neon/30 transition-colors">
                    <d.icon className="text-foreground group-hover:text-neon transition-colors" size={28} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground group-hover:text-neon transition-colors">
                    {d.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{d.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contato -> Diagnóstico */}
      <section id="diagnostico" className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            Diagnóstico de <span className="text-neon">Inteligência Operacional</span>
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-center mb-12 max-w-md mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
          >
            Pare de adivinhar onde está o problema. Nossa IA analisa o seu cenário e desenha a solução técnica
            imediatamente.
          </motion.p>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}>
            <AIDiagnosticForm />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/40 bg-background relative z-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={pevetechLogo} alt="Pevetech" className="h-12" />
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Pevetech. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
