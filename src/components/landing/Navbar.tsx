import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Beaker, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import pevetechLogo from "@/assets/pevetech-logo.png";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#servicos", label: "Soluções" },
    { href: "#diferenciais", label: "Por que Nós" },
    { href: "#diagnostico", label: "Diagnóstico IA", highlight: true },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/30 shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between py-3 px-6">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <img src={pevetechLogo} alt="Pevetech" className="h-14 md:h-16" />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-all duration-300 relative group ${
                link.highlight
                  ? "text-neon hover:text-neon/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-neon group-hover:w-full transition-all duration-300" />
            </a>
          ))}
          <div className="h-5 w-px bg-border/50" />
          <Link
            to="/labs"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 group"
          >
            <Beaker size={14} className="text-neon group-hover:scale-110 transition-transform" />
            Pevetech Labs
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/30 overflow-hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-6">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-base font-medium ${link.highlight ? "text-neon" : "text-foreground"}`}
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/labs"
                onClick={() => setMobileOpen(false)}
                className="text-base font-medium text-foreground flex items-center gap-2"
              >
                <Beaker size={16} className="text-neon" />
                Pevetech Labs
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
