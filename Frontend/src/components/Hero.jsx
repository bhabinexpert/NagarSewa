import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/useLanguage";

const heroContent = {
  en: {
    title: "NagarSewa — Digital Public Service Platform",
    desc: "Create your citizen account to report issues, request municipal services, and receive trusted updates from your local government.",
    reportBtn: "Report an Issue",
    campaignBtn: "Request Campaign",
  },
  np: {
    title: "नगरसेवा — डिजिटल सार्वजनिक सेवा प्लेटफर्म",
    desc: "नागरिक खाता बनाएर समस्या रिपोर्ट गर्नुहोस्, नगरपालिका सेवाहरू अनुरोध गर्नुहोस्, र स्थानीय सरकारबाट विश्वसनीय अपडेटहरू प्राप्त गर्नुहोस्।",
    reportBtn: "समस्या रिपोर्ट गर्नुहोस्",
    campaignBtn: "अभियान अनुरोध गर्नुहोस्",
  },
};

export default function Hero() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const content = heroContent[language];

  return (
    <section
      id="home"
      className="bg-linear-to-r from-emerald-700 via-teal-700 to-cyan-700 text-white"
    >
      <div className="max-w-7xl mx-auto px-6 py-28 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
          {content.title}
        </h2>
        <p className="text-lg max-w-3xl mx-auto mb-10">
          {content.desc}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/login")}
            className="bg-white text-emerald-800 px-8 py-3 rounded-xl font-semibold"
          >
            {content.reportBtn}
          </button>
          <button
            onClick={() => navigate("/login")}
            className="border border-white px-8 py-3 rounded-xl"
          >
            {content.campaignBtn}
          </button>
        </div>
      </div>
    </section>
  );
}
