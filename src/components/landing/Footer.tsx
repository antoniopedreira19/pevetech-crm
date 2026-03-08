import pevetechLogo from "@/assets/pevetech-logo.png";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border/20 bg-background relative z-10">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={pevetechLogo}
            alt="Pevetech"
            className="h-10 opacity-80 hover:opacity-100 transition-all duration-500"
          />
          <div className="h-6 w-px bg-border/30 hidden md:block" />
          <p className="text-[10px] text-muted-foreground/50 font-display uppercase tracking-[0.3em] hidden md:block">
            Intelligence Systems
          </p>
        </div>
        <p className="text-xs text-muted-foreground/40">
          © {new Date().getFullYear()} Pevetech. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
