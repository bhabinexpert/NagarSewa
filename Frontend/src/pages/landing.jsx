import About from "../components/About";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Highlights from "../components/Highlights";
import Services from "../components/Services";

const Landing = () => {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <Hero />
        <Highlights />
        <Services />
        <About />
      </main>
      <Footer />
    </div>
  );
};
export default Landing;
