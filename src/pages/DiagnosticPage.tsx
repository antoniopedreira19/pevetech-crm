import pevetechLogo from "@/assets/pevetech-logo.png";
import AIDiagnosticForm from "@/components/AIDiagnosticForm";

const DiagnosticPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Intense center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-neon/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Header - Logo only */}
      <header className="py-6 flex justify-center relative z-10">
        <img src={pevetechLogo} alt="Pevetech" className="h-16 md:h-20 opacity-90" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-3">
              Diagnóstico de{" "}
              <span className="text-neon">Inteligência Operacional</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Nossa IA analisa seu relato e desenha a solução técnica imediata.
            </p>
          </div>
          <AIDiagnosticForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center relative z-10">
        <p className="text-xs text-muted-foreground/50">© Pevetech 2026</p>
      </footer>
    </div>
  );
};

export default DiagnosticPage;
