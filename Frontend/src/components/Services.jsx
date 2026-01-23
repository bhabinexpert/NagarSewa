import { useLanguage } from "../context/useLanguage";

const servicesContent = {
  en: {
    title: "Citizen Services",
    services: [
      {
        title: "Issue Reporting",
        desc: "Report road, waste, and safety issues with photo evidence and location tags.",
        image:
          "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80",
        alt: "Citizen reporting a community issue",
      },
      {
        title: "Water & Sanitation",
        desc: "Request clean water support, drainage fixes, and sanitation services.",
        image:
          "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80",
        alt: "Clean water and sanitation services",
      },
      {
        title: "Waste Management",
        desc: "Track garbage collection, dumpsite clearance, and recycling schedules.",
        image:
          "https://images.unsplash.com/photo-1488330890490-c291ecf62571?auto=format&fit=crop&w=800&q=80",
        alt: "Waste management and recycling",
      },
      {
        title: "Street Lighting",
        desc: "Report dark zones and request urgent street light maintenance.",
        image:
          "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=800&q=80",
        alt: "Street lighting at night",
      },
      {
        title: "Health & Safety Alerts",
        desc: "Receive verified public health notices and safety advisories.",
        image:
          "https://images.unsplash.com/photo-1584516150909-c43483ee7932?auto=format&fit=crop&w=800&q=80",
        alt: "Public health alerts",
      },
      {
        title: "Citizen Support",
        desc: "Connect with municipal offices and partner NGOs for assistance.",
        image:
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
        alt: "Citizen support and assistance",
      },
      {
        title: "Campaign Requests",
        desc: "Request community campaigns: anti-drug awareness, cleanliness drives, health camps, public safety, and social welfare programs.",
        image:
          "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80",
        alt: "Community campaign and awareness",
      },
    ],
  },
  np: {
    title: "नागरिक सेवाहरू",
    services: [
      {
        title: "समस्या रिपोर्टिङ",
        desc: "सडक, फोहोर र सुरक्षासम्बन्धी समस्या फोटो र स्थानसहित रिपोर्ट गर्नुहोस्।",
        image:
          "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80",
        alt: "समुदाय समस्या रिपोर्टिङ",
      },
      {
        title: "पानी तथा सरसफाइ",
        desc: "स्वच्छ पानी, ढल निकास र सरसफाइ सेवाका लागि अनुरोध गर्नुहोस्।",
        image:
          "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80",
        alt: "पानी र सरसफाइ सेवा",
      },
      {
        title: "फोहोर व्यवस्थापन",
        desc: "फोहोर संकलन, डम्पसाइट सफाइ र रिसाइकलिङ तालिका ट्र्याक गर्नुहोस्।",
        image:
          "https://images.unsplash.com/photo-1488330890490-c291ecf62571?auto=format&fit=crop&w=800&q=80",
        alt: "फोहोर व्यवस्थापन",
      },
      {
        title: "सडक बत्ती",
        desc: "अँध्यारा क्षेत्र रिपोर्ट गरी छिटो मर्मत अनुरोध गर्नुहोस्।",
        image:
          "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=800&q=80",
        alt: "राति सडक बत्ती",
      },
      {
        title: "स्वास्थ्य र सुरक्षा सूचना",
        desc: "प्रमाणित स्वास्थ्य सूचना र सुरक्षा सचेतना प्राप्त गर्नुहोस्।",
        image:
          "https://images.unsplash.com/photo-1584516150909-c43483ee7932?auto=format&fit=crop&w=800&q=80",
        alt: "स्वास्थ्य सूचना",
      },
      {
        title: "नागरिक सहायता",
        desc: "नगरपालिका कार्यालय र साझेदार संस्थासँग सहयोगका लागि जोडिनुहोस्।",
        image:
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
        alt: "नागरिक सहायता",
      },
      {
        title: "अभियान अनुरोध",
        desc: "सामुदायिक अभियान अनुरोध गर्नुहोस्: लागुऔषध विरुद्ध जागरण, सफाइ अभियान, स्वास्थ्य शिविर, सार्वजनिक सुरक्षा र सामाजिक कल्याण कार्यक्रम।",
        image:
          "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80",
        alt: "सामुदायिक अभियान र जागरण",
      },
    ],
  },
};

export default function Services() {
  const { language } = useLanguage();
  const content = servicesContent[language];

  return (
    <section id="services" className="py-20 bg-white w-full">
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="text-3xl font-bold text-center mb-4 text-emerald-900">{content.title}</h3>
        <p className="text-center text-emerald-700/80 mb-12 max-w-2xl mx-auto">
          {language === "en"
            ? "Access essential municipal services through your secure citizen account."
            : "आफ्नो सुरक्षित नागरिक खातामार्फत आवश्यक नगरपालिका सेवाहरू पहुँच गर्नुहोस्।"}
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.services.map((service, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden card-hover"
            >
              <img
                src={service.image}
                alt={service.alt}
                className="h-44 w-full object-cover"
                loading="lazy"
              />
              <div className="p-6">
                <h4 className="font-semibold text-lg mb-2 text-emerald-900">{service.title}</h4>
                <p className="text-sm text-gray-600">
                  {service.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}