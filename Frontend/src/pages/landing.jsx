import About from "../components/About";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Highlights from "../components/Highlights";
import Services from "../components/Services";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Hero />
      <Highlights />
      <Services />
      <About />
      <Footer />
    </div>
  );
};
export default Landing;
