import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Workflow, Bot, BarChart3, Compass, ArrowRight } from "lucide-react";
import pevetechLogo from "@/assets/pevetech-logo.png";
import grifoLogo from "@/assets/clients/grifo.jpg";
import californiaLogo from "@/assets/clients/california.jpg";
import vvBeneficiosLogo from "@/assets/clients/vv-beneficios.png";
import mtwelveLogo from "@/assets/clients/mtwelve.png";
import senseSportsLogo from "@/assets/clients/sense-sports.jpg";
import { Button } from "@/components/ui/button";
import ContactForm from "@/components/ContactForm";

const pillars = [
  { icon: Workflow, title: "Automação (n8n)", desc: "Elimine o trabalho manual repetitivo. Conectamos suas ferramentas para criar fluxos de trabalho que rodam sozinhos." },
  { icon: Bot, title: "Inteligência (IA)", desc: "Implementação de Agentes Autônomos e LLMs que entendem o contexto do seu negócio para vender e atender." },
  { icon: BarChart3, title: "Visão (Dashboards)", desc: "Transforme dados dispersos em decisão. Painéis de Business Intelligence integrados ao seu banco de dados." },
  { icon: Compass, title: "Estratégia (CTO)", desc: "Governança, escolha de stack e arquitetura de sistemas. A liderança técnica necessária para escalar." },
];

const cases = [
  { company: "Fintech Alpha", result: "Redução de 60% no tempo de deploy", area: "DevOps" },
  { company: "SaaS Beta", result: "Escalou de 1K para 100K usuários", area: "Arquitetura" },
  { company: "Startup Gamma", result: "Time técnico de 0 a 12 devs", area: "Liderança" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="container mx-auto flex items-center justify-between py-2 px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={pevetechLogo} alt="Pevetech" className="h-20" />
          </Link>
          <div className="flex items-center gap-4">
            <a href="#servicos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Serviços</a>
            <a href="#cases" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cases</a>
            <a href="#contato" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contato</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Aurora glow from bottom center */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,_hsl(120_100%_50%_/_0.12)_0%,_hsl(120_100%_30%_/_0.05)_40%,_transparent_70%)]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,_hsl(120_100%_50%_/_0.08)_0%,_transparent_70%)] blur-3xl" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="inline-block px-4 py-1.5 rounded-full border border-neon-dim text-neon text-xs font-display mb-6 tracking-wider">
              CTO AS A SERVICE
            </span>
          </motion.div>
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight"
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
          >
            Pare de Operar.<br />
            <span className="text-neon glow-neon-text">
              Comece a Escalar.
              <span className="inline-block w-[3px] h-[0.85em] bg-neon ml-1 align-baseline animate-pulse-neon" />
            </span>
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
          >
            Transforme rotinas manuais em automação inteligente. A estratégia de um CTO experiente para organizar sua casa e liberar seu tempo.
          </motion.p>
          <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4" initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <a href="#contato">
              <Button size="lg" className="gradient-neon text-accent-foreground font-semibold text-base px-8 hover:opacity-90">
                Agendar Diagnóstico <ArrowRight className="ml-2" size={18} />
              </Button>
            </a>
            <a href="#cases">
              <Button size="lg" variant="outline" className="border-neon-dim text-foreground font-semibold text-base px-8 hover:border-neon hover:text-neon transition-colors">
                Ver Cases de Sucesso
              </Button>
            </a>
          </motion.div>

          {/* Social Proof */}
          <motion.div className="mt-20" initial="hidden" animate="visible" variants={fadeUp} custom={4}>
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
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted/20 flex items-center justify-center opacity-50 hover:opacity-100 transition-all duration-300 cursor-default overflow-hidden"
                >
                  <img src={client.src} alt={client.alt} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className="py-24">
        <div className="container mx-auto px-6">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          >
            Pilares da <span className="text-neon">Transformação</span>
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-center mb-16 max-w-xl mx-auto"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
          >
            A base tecnológica que sua empresa precisa para crescer.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((s, i) => (
              <motion.div
                key={s.title}
                className="p-6 rounded-lg bg-card border border-border hover:border-neon-dim transition-colors group"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <s.icon className="text-neon mb-4 group-hover:drop-shadow-[0_0_8px_hsl(120,100%,50%,0.5)] transition-all" size={28} />
                <h3 className="font-display text-lg font-semibold mb-2 text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cases */}
      <section id="cases" className="py-24 bg-card/50">
        <div className="container mx-auto px-6">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          >
            Cases de <span className="text-neon">Sucesso</span>
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cases.map((c, i) => (
              <motion.div
                key={c.company}
                className="p-6 rounded-lg border border-border bg-background relative overflow-hidden"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <div className="absolute top-0 left-0 w-full h-0.5 gradient-neon" />
                <span className="text-xs font-display text-neon mb-2 block">{c.area}</span>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{c.company}</h3>
                <p className="text-muted-foreground">{c.result}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-24">
        <div className="container mx-auto px-6">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          >
            Vamos <span className="text-neon">conversar?</span>
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-center mb-12 max-w-md mx-auto"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
          >
            Conte sobre seu desafio e entraremos em contato
          </motion.p>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}>
            <ContactForm />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={pevetechLogo} alt="Pevetech" className="h-14" />
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Pevetech. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
