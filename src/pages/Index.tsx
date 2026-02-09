import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Code, Server, Shield, Zap, Users, TrendingUp, ArrowRight, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactForm from "@/components/ContactForm";

const services = [
  { icon: Code, title: "Arquitetura de Software", desc: "Design de sistemas escaláveis e resilientes para seu negócio." },
  { icon: Server, title: "DevOps & Cloud", desc: "Infraestrutura como código, CI/CD e automação completa." },
  { icon: Shield, title: "Segurança", desc: "Auditoria, compliance e implementação de boas práticas de segurança." },
  { icon: Users, title: "Liderança Técnica", desc: "Gestão de times de engenharia e mentoria para devs." },
  { icon: TrendingUp, title: "Estratégia Tech", desc: "Roadmap tecnológico alinhado aos objetivos do negócio." },
  { icon: Zap, title: "Otimização", desc: "Performance, redução de custos e eficiência operacional." },
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
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          <Link to="/" className="flex items-center gap-2">
            <Terminal className="text-neon" size={24} />
            <span className="font-display text-lg font-bold text-foreground">PEVETECH</span>
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(120_100%_15%_/_0.15)_0%,_transparent_70%)]" />
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
            Liderança técnica<br />
            <span className="text-neon glow-neon-text">sob demanda.</span>
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
          >
            Estratégia, arquitetura e gestão de engenharia para empresas que precisam escalar sem contratar um C-Level full-time.
          </motion.p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <a href="#contato">
              <Button size="lg" className="gradient-neon text-accent-foreground font-semibold text-base px-8 hover:opacity-90">
                Fale com a gente <ArrowRight className="ml-2" size={18} />
              </Button>
            </a>
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
            O que <span className="text-neon">entregamos</span>
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-center mb-16 max-w-xl mx-auto"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
          >
            Cobertura completa para sua operação de tecnologia
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
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
            <Terminal className="text-neon" size={18} />
            <span className="font-display text-sm text-muted-foreground">PEVETECH</span>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Pevetech. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
