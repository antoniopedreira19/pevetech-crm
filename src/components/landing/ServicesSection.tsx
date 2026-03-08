import { motion } from "framer-motion";
import { Workflow, Bot, BarChart3, Compass } from "lucide-react";

const pillars = [
  {
    icon: Workflow,
    title: "Hiperautomação",
    desc: "Eliminamos o erro humano. Conectamos seu ecossistema (ERP, CRM, Banco) para criar fluxos de trabalho à prova de falhas que operam 24/7.",
    gradient: "from-emerald-500/20 to-green-500/5",
  },
  {
    icon: Bot,
    title: "Inteligência Artificial",
    desc: "Não apenas chatbots. Implementamos Agentes Autônomos que raciocinam, tomam decisões e executam tarefas complexas de vendas e suporte.",
    gradient: "from-green-500/20 to-teal-500/5",
  },
  {
    icon: BarChart3,
    title: "Business Intelligence",
    desc: "Transformamos dados brutos em vantagem competitiva. Dashboards em tempo real que revelam onde está o lucro e onde está o desperdício.",
    gradient: "from-teal-500/20 to-cyan-500/5",
  },
  {
    icon: Compass,
    title: "Arquitetura de Escala",
    desc: "Governança de dados e infraestrutura robusta. Preparamos sua tecnologia para suportar 10x mais clientes sem quebrar a operação.",
    gradient: "from-cyan-500/20 to-emerald-500/5",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const ServicesSection = () => {
  return (
    <section id="servicos" className="py-32 relative z-10">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,100,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,100,0.015)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

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
            Infraestrutura
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Engenharia de{" "}
            <span className="text-neon glow-neon-text">Performance</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            A infraestrutura invisível que permite sua empresa crescer sem quebrar.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {pillars.map((s, i) => (
            <motion.div
              key={s.title}
              className="group relative p-8 md:p-10 rounded-2xl border border-border/30 bg-card/20 backdrop-blur-md hover:border-neon/30 transition-all duration-500 overflow-hidden"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i + 1}
              whileHover={{ y: -4 }}
            >
              {/* Hover glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
              <div className="absolute top-0 right-0 w-40 h-40 bg-neon/5 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative z-10">
                <div className="h-12 w-12 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center mb-6 group-hover:bg-neon/20 group-hover:scale-110 transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(0,255,128,0.15)]">
                  <s.icon className="text-neon" size={24} />
                </div>
                <h3 className="font-display text-xl font-bold mb-3 text-foreground group-hover:text-neon transition-colors duration-300">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
