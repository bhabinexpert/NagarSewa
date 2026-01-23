import { useNavigate } from "react-router-dom";
import { FaQuoteLeft } from "react-icons/fa";
import { useLanguage } from "../context/useLanguage";

const heroContent = {
  en: {
    title: "NagarSewa — Digital Public Service Platform",
    desc: "Create your citizen account to report issues, request municipal services, and receive trusted updates from your local government.",
    reportBtn: "Report an Issue",
    campaignBtn: "Request Campaign",
    proverb: "Together we make the city stronger.",
    proverbBy: "Citizen Voice for Local Authority",
  },
  np: {
    title: "नगरसेवा — डिजिटल सार्वजनिक सेवा प्लेटफर्म",
    desc: "नागरिक खाता बनाएर समस्या रिपोर्ट गर्नुहोस्, नगरपालिका सेवाहरू अनुरोध गर्नुहोस्, र स्थानीय सरकारबाट विश्वसनीय अपडेटहरू प्राप्त गर्नुहोस्।",
    reportBtn: "समस्या रिपोर्ट गर्नुहोस्",
    campaignBtn: "अभियान अनुरोध गर्नुहोस्",
    proverb: "एकतामा शक्ति हुन्छ।",
    proverbBy: "स्थानीय निकायका लागि नागरिकको आवाज",
  },
};

export default function Hero() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const content = heroContent[language];

  return (
    <section
      id="home"
      className="bg-linear-to-r from-emerald-700 via-teal-700 to-cyan-700 text-white w-full"
    >
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-white/15 px-5 py-2 backdrop-blur">
              <img
                src="/nagarsewa.jpg"
                alt="NagarSewa logo"
                className="h-9 w-9 rounded-full object-cover ring-2 ring-white/60"
              />
              <span className="text-sm font-semibold tracking-wide">NagarSewa</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
              {content.title}
            </h2>
            <p className="text-lg max-w-3xl mx-auto lg:mx-0 mb-10">
              {content.desc}
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <button
                onClick={() => navigate("/login")}
                className="bg-white text-emerald-800 px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-emerald-50 hover:scale-105 hover:shadow-lg"
              >
                {content.reportBtn}
              </button>
              <button
                onClick={() => navigate("/login")}
                className="border border-white px-8 py-3 rounded-xl transition-all duration-300 hover:bg-white/20 hover:scale-105"
              >
                {content.campaignBtn}
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white/10 backdrop-blur rounded-3xl p-6 border border-white/20 shadow-xl transition-transform duration-300 hover:scale-[1.02]">
              <div className="flex items-center gap-4 mb-5">
                <img
                  src="/nagarsewa.jpg"
                  alt="NagarSewa logo"
                  className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/60"
                />
                <div>
                  <p className="text-sm uppercase tracking-widest text-white/70">Citizen Voice</p>
                  <h3 className="text-2xl font-bold">NagarSewa</h3>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaQuoteLeft className="text-white/70 mt-1" />
                <div>
                  <p className="text-lg font-semibold leading-relaxed">{content.proverb}</p>
                  <p className="text-sm text-white/80 mt-3">{content.proverbBy}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
