import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Beaker, 
  Terminal, 
  Bot, 
  Database,
  ExternalLink,
  Code2
} from "lucide-react";
import pevetechLogo from "@/assets/pevetech-logo.png";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Projetos do Laboratório
const labProjects = [
  {
    id: "eng-saas",
    title: "AI Pitch Generator (SaaS)",
    category: "Produto Interno",
    status: "Em Desenvolvimento",
    statusColor: "text-amber-500 border-amber-500/20 bg-amber-500/10",
    desc: "Plataforma SaaS voltada para o setor de engenharia. Utiliza IA generativa para construir apresentações técnicas e pitches de vendas completos a partir de inputs básicos.",
    icon: Bot,
    stack: ["Lovable", "Supabase", "OpenAI", "React"],
    link: "#"
  },
  {
    id: "recovery-agent",
    title: "Agente Autônomo de Recuperação",
    category: "Automação",
    status: "Beta Privado",
    statusColor: "text-emerald-500 border-emerald-500/20 bg-emerald-500/10",
    desc: "Workflow complexo para gestão de funil e carrinhos abandonados. O agente identifica a quebra de conversão e inicia follow-up imediato via WhatsApp, salvando o status em tempo real no banco de dados.",
    icon: Terminal,
    stack: ["n8n", "PostgreSQL", "WhatsApp API"],
    link: "#"
  },
  {
    id: "finance-parser",
    title: "DRE & Financial Parser",
    category: "Data Pipeline",
    status: "Pesquisa (R&D)",
    statusColor: "text-purple-500 border-purple-500/20 bg-purple-500/10",
    desc: "Sistema de ingestão de dados que lê, limpa e padroniza planilhas financeiras complexas de múltiplos CNPJs, injetando os dados estruturados diretamente em views do Supabase para o Power BI.",
    icon: Database,
    stack: ["Python", "Supabase", "Pandas", "Power BI"],
    link: "#"
  }
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const LabsPage = () => {
  return (
    <div className="min-h-screen bg-background selection:bg-neon/20 selection:text-neon">
      
      {/* Background Matrix/Grid Effect */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-neon/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/10">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft size={20} className="text-muted-foreground mr-2" />
            <img src={pevetechLogo} alt="Pevetech" className="h-10" />
            <div className="h-4 w-[1px] bg-border mx-2" />
            <span className="font-display font-semibold text-neon tracking-widest flex items-center gap-2">
              <Beaker size={16} /> LABS
            </span>
          </Link>
          <a href="mailto:contato@pevetech.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block">
            Seja um Beta Tester
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-16 z-10">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-sm mb-6">
              <Code2 size={16} className="text-neon" />
              <span className="text-muted-foreground">Pesquisa & Desenvolvimento</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight">
              Onde o futuro é <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon to-emerald-400">
                escrito em código.
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-10">
              O Pevetech Labs é a nossa divisão de inovação extrema. É aqui que testamos LLMs, construímos microsserviços e incubamos produtos SaaS internos antes de chegarem ao mercado.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pb-32 relative z-10">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {labProjects.map((project, i) => (
              <motion.div
                key={project.id}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={i + 1}
                className="group relative flex flex-col justify-between p-8 rounded-2xl bg-card/20 border border-border/50 backdrop-blur-sm hover:bg-card/40 hover:border-neon/30 transition-all duration-500 overflow-hidden"
              >
                {/* Efeito Hover Glow */}
                <div className="absolute top-0 right-0 p-32 bg-neon/5 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div>
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="h-12 w-12 rounded-xl bg-background border border-border flex items-center justify-center shadow-inner text-foreground group-hover:text-neon group-hover:border-neon/30 transition-colors">
                      <project.icon size={24} />
                    </div>
                    <Badge variant="outline" className={project.statusColor}>
                      {project.status}
                    </Badge>
                  </div>

                  <div className="relative z-10">
                    <p className="text-xs font-medium text-neon tracking-wider uppercase mb-2">
                      {project.category}
                    </p>
                    <h3 className="text-2xl font-bold mb-3">{project.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                      {project.desc}
                    </p>
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.stack.map(tech => (
                      <span key={tech} className="px-2.5 py-1 rounded-md bg-secondary/50 text-secondary-foreground text-[11px] font-mono border border-border/40">
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <Button variant="ghost" className="w-full justify-between group/btn hover:bg-neon hover:text-neon-foreground transition-all border border-border/50 hover:border-transparent">
                    Explorar Projeto
                    <ExternalLink size={16} className="opacity-50 group-hover/btn:opacity-100 transition-opacity" />
                  </Button>
                </div>
              </motion.div>
            ))}

            {/* Coming Soon Card */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={labProjects.length + 1}
              className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-border/40 bg-card/5 text-center min-h-[350px]"
            >
              <div className="h-12 w-12 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                <Beaker size={20} className="text-muted-foreground animate-pulse" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Novo Experimento</h3>
              <p className="text-sm text-muted-foreground max-w-[250px]">
                Nossos engenheiros estão destilando o próximo agente autônomo.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LabsPage;
