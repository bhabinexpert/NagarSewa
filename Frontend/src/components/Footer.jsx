import { useLanguage } from "../context/useLanguage";

const footerContent = {
  en: {
    tagline: "Digital public services for safer, informed communities.",
    resources: "Resources",
    resourcesList: ["Privacy Policy", "Terms of Service", "Help Center"],
    contact: "Contact",
    email: "Email: support@nagarsewa.org",
    copyright: "© 2026 NagarSewa. All rights reserved.",
  },
  np: {
    tagline: "सुरक्षित र सूचित समुदायका लागि डिजिटल सार्वजनिक सेवाहरू।",
    resources: "संसाधनहरू",
    resourcesList: ["गोपनीयता नीति", "सेवा सर्तहरू", "सहायता केन्द्र"],
    contact: "संपर्क",
    email: "ईमेल: support@nagarsewa.org",
    copyright: "© 2026 नगरसेवा। सर्वाधिकार सुरक्षित।",
  },
};

export default function Footer() {
  const { language } = useLanguage();
  const content = footerContent[language];

  return (
    <footer id="contact" className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <h4 className="font-semibold text-white mb-2">NagarSewa</h4>
          <p className="text-sm">
            {content.tagline}
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-2">{content.resources}</h4>
          <ul className="text-sm space-y-2">
            {content.resourcesList.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-2">{content.contact}</h4>
          <p className="text-sm">{content.email}</p>
        </div>
      </div>
      <div className="text-center text-xs border-t border-gray-700 py-4">
        {content.copyright}
      </div>
    </footer>
  );
}
