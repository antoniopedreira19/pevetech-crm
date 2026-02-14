import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bot,
  BarChart3,
  ArrowRight,
  Zap,
  Cpu,
  CheckCircle2,
  Beaker,
  MessageCircle,
  BrainCircuit,
  Database,
  Lock,
  Network,
} from "lucide-react";
import pevetechLogo from "@/assets/pevetech-logo.png";
import { Button } from "@/components/ui/button";

// Assets dos clientes
import grifoLogo from "@/assets/clients/grifo.jpg";
import californiaLogo from "@/assets/clients/california.jpg";
import vvBeneficiosLogo from "@/assets/clients/vv-beneficios.png";
import mtwelveLogo from "@/assets/clients/mtwelve.png";
import senseSportsLogo from "@/assets/clients/sense-sports.jpg";

// --- Animações ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1], // Curva de Bezier "elegante"
    },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const Index = () => {
  return (
    <div className="min-h-screen bg-[#030303] text-foreground overflow-x-hidden selection:bg-neon/30 selection:text-neon font-sans">
      {/* --- Ambient Background --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-neon/5 blur-[150px] rounded-full opacity-40 animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/5 blur-[150px] rounded-full opacity-40" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* --- Navbar Glass --- */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20"
      >
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img src={pevetechLogo} alt="Pevetech" className="h-9 md:h-11" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#solucoes"
              className="text-sm font-medium text-muted-foreground hover:text-white transition-colors tracking-wide"
            >
              Soluções
            </a>
            <Link
              to="/labs"
              className="text-sm font-medium text-muted-foreground hover:text-neon transition-all flex items-center gap-2 group tracking-wide"
            >
              <Beaker size={14} className="group-hover:text-neon transition-colors" />
              Labs
            </Link>

            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <Link to="/diagnostico">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs hover:bg-white/5 text-muted-foreground hover:text-white"
                >
                  Diagnóstico IA
                </Button>
              </Link>
              <a href="https://wa.me/5571999999999" target="_blank" rel="noreferrer">
                <Button
                  size="sm"
                  className="bg-neon text-[#0a0a0a] hover:bg-neon/90 font-bold text-xs tracking-wide shadow-[0_0_15px_rgba(0,255,128,0.2)]"
                >
                  Falar com Especialista
                </Button>
              </a>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-36 pb-24 md:pt-52 md:pb-40 px-6 z-10">
        <div className="container mx-auto text-center relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            custom={0}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon/20 bg-neon/5 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon"></span>
              </span>
              <span className="text-neon text-[10px] md:text-xs font-mono font-bold tracking-[0.2em] uppercase">
                Inteligência Operacional
              </span>
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tighter leading-[1.05]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            custom={1}
          >
            Sua equipe opera. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40">
              Nossa IA{" "}
              <span className="text-neon inline-block drop-shadow-[0_0_15px_rgba(0,255,128,0.5)]">escala.</span>
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-light"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            custom={2}
          >
            Transformamos processos manuais em <span className="text-white font-medium">arquitetura de software</span>.
            A estratégia de um CTO para organizar sua casa e multiplicar seu lucro sem aumentar o time.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            custom={3}
          >
            <Link to="/diagnostico" className="w-full sm:w-auto group">
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-base bg-neon text-[#0a0a0a] hover:bg-neon/90 font-bold shadow-lg shadow-neon/10 transition-all hover:scale-[1.02] border border-transparent"
              >
                <BrainCircuit className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Iniciar Diagnóstico IA
              </Button>
            </Link>

            <a href="https://wa.me/5571999999999" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 text-base border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white backdrop-blur-sm transition-all"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Falar no WhatsApp
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* --- Social Proof (Monochrome & Clean) --- */}
      <div className="w-full border-y border-white/5 bg-black/40 backdrop-blur-md py-10 relative z-10">
        <div className="container mx-auto px-6">
          <p className="text-center text-[10px] font-mono text-muted-foreground uppercase tracking-[0.4em] mb-8 opacity-60">
            Trusted by the best
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale transition-all duration-700 hover:opacity-100 hover:grayscale-0">
            {[grifoLogo, californiaLogo, vvBeneficiosLogo, mtwelveLogo, senseSportsLogo].map((logo, idx) => (
              <img
                key={idx}
                src={logo}
                alt="Cliente Pevetech"
                className="h-7 md:h-9 object-contain mix-blend-screen brightness-150 contrast-125"
              />
            ))}
          </div>
        </div>
      </div>

      {/* --- The Problem (Split Layout) --- */}
      <section className="py-32 relative z-10 overflow-hidden">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6 tracking-tight leading-tight">
              O custo invisível da <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                Operação Manual.
              </span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Sua equipe não deveria ser paga para copiar e colar dados. Cada minuto gasto em tarefas repetitivas é um
              minuto roubado da estratégia e do crescimento.
            </motion.p>

            <motion.div variants={fadeInUp} className="space-y-4">
              {[
                { title: "Dados Silenciados", desc: "Informações presas em planilhas que não geram insights." },
                { title: "Talento Desperdiçado", desc: "Sêniors executando tarefas de estagiários." },
                { title: "Receita Imprevisível", desc: "Falta de controle sobre o pipeline e MRR." },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:border-red-500/30 transition-colors group"
                >
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Abstract Tech Visual */}
          <motion.div
            className="relative h-[500px] w-full bg-gradient-to-br from-[#0f0f0f] to-[#050505] rounded-3xl border border-white/10 overflow-hidden"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Grid Pattern inside box */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

            {/* Floating Elements mimicking dashboard */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] space-y-4">
              <div className="h-24 w-full bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4 flex items-center gap-4 animate-pulse-slow">
                <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                  <Lock size={20} />
                </div>
                <div className="space-y-2 w-full">
                  <div className="h-2 w-1/3 bg-white/20 rounded"></div>
                  <div className="h-2 w-2/3 bg-white/10 rounded"></div>
                </div>
              </div>

              <div className="h-32 w-full bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                <div className="flex justify-between items-center mb-4">
                  <div className="h-3 w-1/4 bg-white/20 rounded"></div>
                  <div className="h-2 w-10 bg-red-500/50 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-white/10 rounded"></div>
                  <div className="h-2 w-full bg-white/10 rounded"></div>
                  <div className="h-2 w-3/4 bg-white/10 rounded"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Solutions (Bento Grid) --- */}
      <section id="solucoes" className="py-32 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              variants={fadeInUp}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold mb-6 tracking-tight"
            >
              Engenharia de <span className="text-neon drop-shadow-[0_0_10px_rgba(0,255,128,0.5)]">Escala</span>.
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              variants={fadeInUp}
              viewport={{ once: true }}
              className="text-lg text-muted-foreground"
            >
              Sem soluções frágeis. Construímos uma infraestrutura de dados proprietária que se torna o maior ativo da
              sua empresa.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
            {/* Card 1: AI Agents (Wide) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden group hover:border-neon/30 transition-all duration-500"
            >
              <div className="absolute top-0 right-0 p-24 bg-neon/5 blur-[80px] rounded-full group-hover:bg-neon/10 transition-all" />
              <div className="relative z-10">
                <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-neon/20 group-hover:text-neon transition-colors">
                  <Bot size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Execução Autônoma 24/7</h3>
                <p className="text-muted-foreground text-lg mb-8 max-w-md group-hover:text-white/80 transition-colors">
                  Agentes inteligentes que qualificam leads, agendam reuniões e processam documentos com precisão
                  técnica e velocidade de máquina.
                </p>
                <div className="flex gap-3">
                  {["LLMs", "OpenAI", "n8n"].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-neon/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Card 2: BI */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500"
            >
              <div className="absolute bottom-0 left-0 p-16 bg-purple-500/5 blur-[60px] rounded-full group-hover:bg-purple-500/10 transition-all" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:text-purple-400 transition-colors">
                    <BarChart3 size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">BI & Dashboards</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Painéis de comando em tempo real. Saiba exatamente o seu LTV, CAC e MRR sem abrir uma única
                    planilha.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-xs font-mono text-purple-400">
                  <Database size={14} /> Data Warehouse
                </div>
              </div>
            </motion.div>

            {/* Card 3: Workflow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500"
            >
              <div className="absolute top-0 left-0 p-16 bg-amber-500/5 blur-[60px] rounded-full group-hover:bg-amber-500/10 transition-all" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:text-amber-400 transition-colors">
                    <Network size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">Integração Total</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Seu CRM fala com o ERP, que fala com o Banco. O dado flui sem atrito. Zero redundância de cadastro.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-xs font-mono text-amber-400">
                  <Zap size={14} /> API First
                </div>
              </div>
            </motion.div>

            {/* Card 4: CTO Service (Wide) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="md:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden group hover:border-white/30 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/10 group-hover:text-white transition-colors">
                  <Cpu size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">CTO as a Service</h3>
                <p className="text-muted-foreground text-lg mb-8 max-w-lg">
                  Não apenas executamos, nós arquitetamos. Atuamos como seu braço direito tecnológico para definir
                  stack, segurança e estratégia de longo prazo.
                </p>
                <div className="flex gap-6">
                  {["Governança", "Segurança", "Escalabilidade"].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm font-medium text-white/80">
                      <CheckCircle2 size={16} className="text-neon" /> {item}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- CTA Final --- */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-b from-neon/10 to-[#0a0a0a] border border-neon/20 rounded-[2.5rem] p-12 md:p-24 relative overflow-hidden"
          >
            {/* Animated Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,128,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,128,0.05)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0a0a_80%)]" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-tight">
                Pronto para <br />
                <span className="text-neon">parar de operar?</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-12">
                Não cobramos por hora, cobramos por eficiência. Vamos entender seu gargalo e desenhar a arquitetura
                ideal.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/diagnostico" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-14 px-10 text-lg border-neon/30 text-neon hover:bg-neon/10 backdrop-blur-md transition-all"
                  >
                    <BrainCircuit className="mr-2 h-5 w-5" /> Diagnóstico IA
                  </Button>
                </Link>
                <a href="https://wa.me/5571999999999" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-14 px-10 text-lg bg-neon text-[#0a0a0a] hover:bg-neon/90 font-bold shadow-[0_0_20px_rgba(0,255,128,0.3)] transition-all hover:-translate-y-1"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" /> Falar com Especialista
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-12 border-t border-white/5 bg-[#050505] text-center md:text-left">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img
              src={pevetechLogo}
              alt="Pevetech"
              className="h-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
            />
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
              © {new Date().getFullYear()} Pevetech Intelligence.
            </span>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground font-medium">
            <a href="#" className="hover:text-neon transition-colors">
              LinkedIn
            </a>
            <a href="#" className="hover:text-neon transition-colors">
              Instagram
            </a>
            <a href="#" className="hover:text-neon transition-colors">
              Privacidade
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
