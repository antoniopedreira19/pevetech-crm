import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Workflow, Bot, BarChart3, Compass, ArrowRight, TrendingUp, LineChart, Beaker } from "lucide-react";
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
    title: "Hiperautomação",
    desc: "Eliminamos o erro humano. Conectamos seu ecossistema (ERP, CRM, Banco) para criar fluxos de trabalho à prova de falhas que operam 24/7.",
  },
  {
    icon: Bot,
    title: "Inteligência Artificial",
    desc: "Não apenas chatbots. Implementamos Agentes Autônomos que raciocinam, tomam decisões e executam tarefas complexas de vendas e suporte.",
  },
  {
    icon: BarChart3,
    title: "Business Intelligence",
    desc: "Transformamos dados brutos em vantagem competitiva. Dashboards em tempo real que revelam onde está o lucro e onde está o desperdício.",
  },
  {
    icon: Compass,
    title: "Arquitetura de Escala",
    desc: "Governança de dados e infraestrutura robusta. Preparamos sua tecnologia para suportar 10x mais clientes sem quebrar a operação.",
  },
];

const differentials = [
  {
    icon: TrendingUp,
    title: "Escalabilidade Infinita",
    desc: "Desacople seu crescimento do aumento de headcount. Nossa tecnologia absorve o impacto do volume, permitindo que você dobre de tamanho mantendo a equipe enxuta.",
  },
  {
    icon: LineChart,
    title: "ROI Imediato",
    desc: "Trocamos OPEX (custo fixo de pessoal) por eficiência tecnológica. Cada processo automatizado se traduz instantaneamente em margem de lucro líquida.",
  },
  {
    icon: BarChart3,
    title: "Soberania de Dados",
    desc: "Fim das planilhas descentralizadas. Centralizamos sua inteligência em um Data Warehouse proprietário, garantindo que você tenha controle total sobre a verdade dos seus números.",
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
              Soluções
            </a>
            <a
              href="#diferenciais"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Por que Nós
            </a>
            <a href="#diagnostico" className="text-sm font-medium text-neon hover:text-neon/80 transition-colors">
              Diagnóstico IA
            </a>
            {/* Link Pevetech Labs */}
            <Link
              to="/labs"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 group border-l border-border/50 pl-6 ml-2"
            >
              <Beaker size={14} className="text-neon group-hover:scale-110 transition-transform" />
              Pevetech Labs
            </Link>
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
              INTELLIGENCE SYSTEMS
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight max-w-5xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
          >
            Sua equipe opera.
            <br />
            <span className="text-neon glow-neon-text relative">
              Nossa IA escala.
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
            Não vendemos horas de desenvolvimento. Vendemos eficiência operacional. Transformamos o caos manual em uma
            máquina de lucro previsível e autônoma.
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
                className="w-full sm:w-auto bg-neon text-neon-foreground font-bold text-base px-8 hover:bg-neon/90 shadow-[0_0_20px_rgba(0,255,128,0.3)] transition-all hover:scale-105"
              >
                Gerar Diagnóstico Gratuito <ArrowRight className="ml-2" size={18} />
              </Button>
            </a>
            <a href="#diferenciais" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-border/50 text-foreground font-semibold text-base px-8 bg-background/20 hover:bg-muted hover:border-border hover:text-foreground transition-all backdrop-blur-sm"
              >
                Ver Tecnologia
              </Button>
            </a>
          </motion.div>

          {/* Social Proof */}
          <motion.div className="mt-24 w-full" initial="hidden" animate="visible" variants={fadeUp} custom={4}>
            <p className="text-[10px] font-display uppercase tracking-[0.3em] text-muted-foreground mb-8 opacity-70">
              Operações otimizadas pela Pevetech
            </p>
            <div className="flex items-center justify-center gap-8 md:gap-14 flex-wrap opacity-60 hover:opacity-100 transition-opacity duration-500">
              {[
                { src: grifoLogo, alt: "Grifo Engenharia" },
                { src: californiaLogo, alt: "California" },
                { src: vvBeneficiosLogo, alt: "VV Benefícios" },
                { src: mtwelveLogo, alt: "MTwelve" },
                { src: senseSportsLogo, alt: "Sense Sports" },
              ].map((client) => (
                <div
                  key={client.alt}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-border/30 bg-card/30 flex items-center justify-center hover:border-neon/30 hover:shadow-[0_0_15px_rgba(0,255,128,0.05)] transition-all duration-300 cursor-default overflow-hidden backdrop-blur-sm grayscale hover:grayscale-0"
                >
                  <img src={client.src} alt={client.alt} className="w-full h-full object-cover" />
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
            className="text-3xl md:text-5xl font-bold text-center mb-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            Engenharia de <span className="text-neon drop-shadow-[0_0_8px_rgba(0,255,128,0.5)]">Performance</span>
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto text-lg"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
          >
            A infraestrutura invisível que permite sua empresa crescer sem quebrar.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((s, i) => (
              <motion.div
                key={s.title}
                className="p-8 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/50 hover:border-neon/40 hover:bg-card/50 transition-all duration-300 group shadow-sm hover:shadow-[0_0_30px_rgba(0,255,128,0.05)]"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <div className="h-14 w-14 rounded-2xl bg-background border border-border/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:border-neon/20">
                  <s.icon
                    className="text-neon group-hover:drop-shadow-[0_0_8px_hsl(120,100%,50%,0.6)] transition-all"
                    size={28}
                  />
                </div>
                <h3 className="font-display text-xl font-bold mb-3 text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais / Metodologia */}
      <section id="diferenciais" className="py-24 bg-card/10 border-y border-border/40 relative z-10 overflow-hidden">
        {/* Background mesh subtle */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Por que a <span className="text-neon">Pevetech?</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Não aplicamos "hacks". Construímos ativos tecnológicos perenes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {differentials.map((d, i) => (
              <motion.div
                key={d.title}
                className="p-8 rounded-2xl border border-border/50 bg-background/40 backdrop-blur-md relative overflow-hidden group hover:border-neon/30 transition-all duration-300 hover:-translate-y-1"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
              >
                {/* Background Glow on Hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon/10 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <div className="h-12 w-12 rounded-lg bg-card border border-border/50 flex items-center justify-center mb-6 group-hover:text-neon transition-colors">
                    <d.icon className="text-foreground group-hover:text-neon transition-colors" size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-foreground group-hover:text-neon transition-colors">
                    {d.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{d.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contato -> Diagnóstico */}
      <section id="diagnostico" className="py-32 relative z-10">
        <div className="container mx-auto px-6">
          <motion.h2
            className="text-3xl md:text-5xl font-bold text-center mb-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            Diagnóstico de <span className="text-neon">Inteligência Operacional</span>
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-center mb-12 max-w-lg mx-auto text-lg"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
          >
            Pare de adivinhar onde está o problema. Nossa IA analisa o seu cenário e desenha a arquitetura da solução
            imediatamente.
          </motion.p>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}>
            <AIDiagnosticForm />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border/40 bg-background relative z-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src={pevetechLogo}
              alt="Pevetech"
              className="h-10 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            />
            <div className="h-8 w-[1px] bg-border/50 hidden md:block" />
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest hidden md:block">
              Intelligence Systems
            </p>
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
