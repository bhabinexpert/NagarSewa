import About from "../components/About";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Highlights from "../components/Highlights";
import Services from "../components/Services";

// ============================================================
// LANDING PAGE COMPONENT
// Main entry page for the NagarSewa application.
// Displays header, hero section, highlights, services, about, and footer.
// ============================================================

/**
 * Landing Component
 * The main landing/home page of the application.
 * Assembles all major sections of the public-facing website.
 * @returns {JSX.Element} The landing page layout
 */
function Landing() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Navigation Header */}
      <Header />
      
      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {/* Hero Banner Section */}
        <Hero />
        
        {/* Key Highlights Section */}
        <Highlights />
        
        {/* Services Overview Section */}
        <Services />
        
        {/* About Us Section */}
        <About />
      </main>
      
      {/* Page Footer */}
      <Footer />
    </div>
  );
}

export default Landing;
