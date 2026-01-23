import { useLanguage } from "../context/useLanguage";

const servicesContent = {
  en: {
    title: "Our Services",
    services: [
      {
        title: "Issue Reporting",
        desc: "AI-assisted categorization and tracking of local problems.",
      },
      {
        title: "Awareness Campaigns",
        desc: "Request and manage health, safety, and education programs.",
      },
      {
        title: "Social Services",
        desc: "Connect citizens with NGOs and government support services.",
      },
    ],
  },
  np: {
    title: "हामरो सेवाहरू",
    services: [
      {
        title: "समस्या रिपोर्टिङ",
        desc: "स्थानीय समस्याहरूको एआई-सहायता श्रेणीकरण र ट्र्याकिङ।",
      },
      {
        title: "जनचेतना अभियान",
        desc: "स्वास्थ्य, सुरक्षा र शिक्षा कार्यक्रमहरु अनुरोध र व्यवस्थापन गर्न।",
      },
      {
        title: "सामाजिक सेवाहरू",
        desc: "नागरिकहरूलाई एनजीओ र सरकारी सहायता सेवाहरूसँग जोडिनुहोस्।",
      },
    ],
  },
};

export default function Services() {
  const { language } = useLanguage();
  const content = servicesContent[language];

  return (
    <section id="services" className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="text-3xl font-bold text-center mb-12">{content.title}</h3>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {content.services.map((service, idx) => (
            <div key={idx} className="p-6">
              <h4 className="font-semibold text-lg mb-2">{service.title}</h4>
              <p className="text-sm text-gray-600">
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
