import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaListAlt,
  FaHandsHelping,
  FaInfoCircle,
  FaPhoneAlt,
  FaSignInAlt,
  FaUserPlus,
  FaBars,
  FaTimes,
} from "react-icons/fa";
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
    tagline: "Digital Public Service Platform",
  },
  np: {
    home: "होम",
    issues: "समस्याहरू",
    services: "सेवाहरू",
    about: "बारेमा",
    contact: "संपर्क",
    login: "लगइन",
    signup: "साइन अप",
    tagline: "डिजिटल सार्वजनिक सेवा प्लेटफर्म",
  },
};

export default function Header() {
  const { language, toggleLanguage } = useLanguage();
  const content = headerContent[language];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { key: "home", href: "#home", icon: <FaHome className="text-emerald-600" /> },
    { key: "issues", href: "#issues", icon: <FaListAlt className="text-emerald-600" /> },
    { key: "services", href: "#services", icon: <FaHandsHelping className="text-emerald-600" /> },
    { key: "about", href: "#about", icon: <FaInfoCircle className="text-emerald-600" /> },
    { key: "contact", href: "#contact", icon: <FaPhoneAlt className="text-emerald-600" /> },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-white/90 backdrop-blur border-b border-emerald-100 shadow-sm sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src="/nagarsewa.jpg"
            alt="NagarSewa logo"
            className="h-9 w-9 sm:h-11 sm:w-11 rounded-full object-cover ring-2 ring-emerald-200 shadow transition-transform duration-300 hover:scale-110"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-emerald-700">NagarSewa</h1>
            <p className="text-xs text-emerald-700/70 hidden sm:block">
              {content.tagline}
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-medium">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="flex items-center gap-2 px-3 py-1 rounded-full text-emerald-800 hover:bg-emerald-100 transition-all duration-200 hover:scale-105"
              >
                {item.icon}
                {content[item.key]}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Link
              to="/login"
              className="px-3 py-2 text-emerald-700 hover:text-emerald-900 flex items-center gap-2 transition-all duration-200 hover:scale-105"
            >
              <FaSignInAlt />
              {content.login}
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-all duration-200 flex items-center gap-2 hover:scale-105 hover:shadow-md"
            >
              <FaUserPlus />
              {content.signup}
            </Link>
          </div>
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 transition-all duration-200 whitespace-nowrap hover:scale-105 hover:shadow-md"
          >
            {language === "en" ? "नेपाली" : "English"}
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={toggleLanguage}
            className="px-2 py-1.5 bg-emerald-700 text-white text-xs font-medium rounded-lg hover:bg-emerald-800 transition-all duration-200"
          >
            {language === "en" ? "ने" : "EN"}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="w-6 h-6" />
            ) : (
              <FaBars className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-emerald-100 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3">
            {/* Navigation Links */}
            <div className="space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-800 hover:bg-emerald-50 transition-colors"
                >
                  {item.icon}
                  <span className="font-medium">{content[item.key]}</span>
                </a>
              ))}
            </div>

            {/* Divider */}
            <div className="my-3 border-t border-emerald-100"></div>

            {/* Auth Buttons */}
            <div className="space-y-2">
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 text-emerald-700 bg-emerald-50 rounded-lg font-medium hover:bg-emerald-100 transition-colors"
              >
                <FaSignInAlt />
                {content.login}
              </Link>
              <Link
                to="/signup"
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-emerald-700 text-white rounded-lg font-medium hover:bg-emerald-800 transition-colors"
              >
                <FaUserPlus />
                {content.signup}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
