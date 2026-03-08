import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ServicesSection from "@/components/landing/ServicesSection";
import DifferentialsSection from "@/components/landing/DifferentialsSection";
import DiagnosticSection from "@/components/landing/DiagnosticSection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <DifferentialsSection />
      <DiagnosticSection />
      <Footer />
    </div>
  );
};

export default Index;
