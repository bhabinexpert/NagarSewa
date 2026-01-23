import { Link } from "react-router-dom";
import { useLanguage } from "../context/useLanguage";

const headerContent = {
  en: {
    home: "Home",
    issues: "Issues",
    services: "Services",
    about: "About",
    contact: "Contact",
    login: "Log In",
    signup: "Sign Up",
  },
  np: {
    home: "होम",
    issues: "समस्याहरू",
    services: "सेवाहरू",
    about: "बारेमा",
    contact: "संपर्क",
    login: "लगइन",
    signup: "साइन अप",
  },
};

export default function Header() {
  const { language, toggleLanguage } = useLanguage();
  const content = headerContent[language];

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-emerald-700">NagarSewa</h1>
        <nav className="flex items-center gap-6">
          <div className="space-x-6 text-sm font-medium hidden md:block">
            <a href="#home" className="hover:text-emerald-600">
              {content.home}
            </a>
            <a href="#issues" className="hover:text-emerald-600">
              {content.issues}
            </a>
            <a href="#services" className="hover:text-emerald-600">
              {content.services}
            </a>
            <a href="#about" className="hover:text-emerald-600">
              {content.about}
            </a>
            <a href="#contact" className="hover:text-emerald-600">
              {content.contact}
            </a>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium">
            <Link
              to="/login"
              className="px-3 py-2 text-emerald-700 hover:text-emerald-900"
            >
              {content.login}
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors"
            >
              {content.signup}
            </Link>
          </div>
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 transition-colors whitespace-nowrap"
          >
            {language === "en" ? "नेपाली" : "English"}
          </button>
        </nav>
      </div>
    </header>
  );
}
